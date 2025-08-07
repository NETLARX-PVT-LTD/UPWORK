import os
import cv2
import json
import yt_dlp
import whisper
import boto3
import shutil
import multiprocessing
from tqdm import tqdm
from pydub import AudioSegment
from math import ceil
from ultralytics import YOLO

# AWS S3 Config
AWS_ACCESS_KEY_ID = "YOUR_AWS_ACCESS_KEY_ID"
AWS_SECRET_ACCESS_KEY = "YOUR_AWS_SECRET_ACCESS_KEY"
BUCKET_NAME = "afterlife-test"

CHUNK_DURATION_MS = 30 * 1000  # 30 seconds
yolo_model = YOLO("yolov8n.pt")  # Load YOLOv8-nano

def process_slot(args):
    slot_index, video_filename, fps, total_seconds, frames_dir = args
    start_sec = slot_index * 30
    end_sec = min((slot_index + 1) * 30, total_seconds)
    start_frame = start_sec * fps
    end_frame = end_sec * fps

    cap = cv2.VideoCapture(video_filename)
    cap.set(cv2.CAP_PROP_POS_FRAMES, start_frame)

    for frame_number in range(start_frame, end_frame):
        ret, frame = cap.read()
        if not ret:
            break

        results = yolo_model.predict(source=frame, conf=0.3, verbose=False)[0]
        has_person = any(int(box.cls) == 0 for box in results.boxes)  # Class 0 is 'person'

        if not has_person:
            slot_folder = os.path.join(frames_dir, f"slot_{start_sec}-{end_sec}")
            os.makedirs(slot_folder, exist_ok=True)
            filename = f"frame_{frame_number:05d}.jpg"
            filepath = os.path.join(slot_folder, filename)
            cv2.imwrite(filepath, frame)

            cap.release()
            return {
                "slot": f"{start_sec}-{end_sec}",
                "frame_number": frame_number,
                "filename": os.path.join(f"slot_{start_sec}-{end_sec}", filename),
                "time_sec": frame_number // fps
            }

    cap.release()
    return None


def extract_slot_representative_frames_parallel(video_filename, frames_dir):
    cap = cv2.VideoCapture(video_filename)
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    total_seconds = int(total_frames / fps)
    total_slots = ceil(total_seconds / 30)
    cap.release()

    print(f"🎞 FPS: {fps}, Total Frames: {total_frames}, Duration: {total_seconds}s, Slots: {total_slots}")

    slots = [(i, video_filename, fps, total_seconds, frames_dir) for i in range(total_slots)]

    results = []
    with multiprocessing.Pool(processes=min(4, os.cpu_count())) as pool:
        with tqdm(total=total_slots, desc="🔄 Processing slots", unit="slot") as pbar:
            for r in pool.imap_unordered(process_slot, slots):
                if r is not None:
                    results.append(r)
                pbar.update()

    return results


def process_video_from_youtube(video_url):
    video_id = video_url.split("v=")[-1]
    safe_url = video_url.replace("://", "__").replace("/", "_").replace("?", "_").replace("=", "_")

    root_dir = safe_url
    base_dir = os.path.join(root_dir)
    video_filename = os.path.join(base_dir, "video.mp4")
    audio_filename = os.path.join(base_dir, "audio.mp3")
    chunks_dir = os.path.join(base_dir, "chunks")
    frames_dir = os.path.join(base_dir, "VideoFrames")
    transcript_file = os.path.join(base_dir, "transcript_30s.json")
    mapping_file = os.path.join(base_dir, "transcript_to_frames.json")

    os.makedirs(base_dir, exist_ok=True)
    os.makedirs(chunks_dir, exist_ok=True)
    os.makedirs(frames_dir, exist_ok=True)

    print("⬇️ Downloading video...")
    ydl_opts = {
        'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best',
        'outtmpl': video_filename,
        'merge_output_format': 'mp4',
        'quiet': True
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([video_url])

    print("⬇️ Downloading audio...")
    ydl_audio_opts = {
        'format': 'bestaudio/best',
        'postprocessors': [{'key': 'FFmpegExtractAudio', 'preferredcodec': 'mp3'}],
        'outtmpl': audio_filename.replace('.mp3', ''),
        'quiet': True
    }
    with yt_dlp.YoutubeDL(ydl_audio_opts) as ydl:
        ydl.download([video_url])

    print("🔪 Splitting audio into 30-second chunks...")
    audio = AudioSegment.from_mp3(audio_filename)
    duration_ms = len(audio)
    num_chunks = ceil(duration_ms / CHUNK_DURATION_MS)

    chunk_paths = []
    for i in range(num_chunks):
        start = i * CHUNK_DURATION_MS
        end = min((i + 1) * CHUNK_DURATION_MS, duration_ms)
        chunk = audio[start:end]
        chunk_name = os.path.join(chunks_dir, f"chunk_{i}.mp3")
        chunk.export(chunk_name, format="mp3")
        chunk_paths.append((chunk_name, start // 1000, end // 1000))

    print("🧠 Transcribing chunks with Whisper...")
    model = whisper.load_model("base")
    results = []
    for path, start, end in chunk_paths:
        print(f"🔤 Transcribing {start}-{end}s...")
        result = model.transcribe(path)
        results.append({
            "start_time": start,
            "end_time": end,
            "text": result["text"].strip()
        })

    with open(transcript_file, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    print(f"✅ Transcript saved to {transcript_file}")

    print("🎞 Extracting one non-human frame per 30s slot (parallel)...")
    valid_frames = extract_slot_representative_frames_parallel(video_filename, frames_dir)
    print(f"✅ Saved {len(valid_frames)} frames.")

    print("🗺 Mapping transcript to saved clean frames...")
    mapping = []
    for entry in results:
        start_sec = entry['start_time']
        end_sec = entry['end_time']
        slot_label = f"{start_sec}-{end_sec}"
        frame_entry = next((vf for vf in valid_frames if vf["slot"] == slot_label), None)

        mapping.append({
            "start_time": start_sec,
            "end_time": end_sec,
            "text": entry['text'],
            "frame": frame_entry["filename"] if frame_entry else None
        })

    with open(mapping_file, "w", encoding="utf-8") as f:
        json.dump(mapping, f, indent=2)
    print(f"✅ Mapping saved to {mapping_file}")

    print("🧹 Cleaning up intermediate files...")
    try:
        os.remove(video_filename)
        os.remove(audio_filename)
        shutil.rmtree(chunks_dir)
    except Exception as e:
        print(f"⚠️ Cleanup warning: {e}")

    print("☁️ Uploading transcript mapping and frames to S3...")
    s3 = boto3.client(
        "s3",
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY
    )

    for file_path in [mapping_file, transcript_file]:
        if os.path.exists(file_path):
            s3_key = f"{safe_url}/{os.path.basename(file_path)}"
            try:
                s3.upload_file(file_path, BUCKET_NAME, s3_key)
                print(f"✅ Uploaded: s3://{BUCKET_NAME}/{s3_key}")
            except Exception as e:
                print(f"❌ Failed to upload {s3_key}: {e}")

    for root, dirs, files in os.walk(frames_dir):
        for file in files:
            local_path = os.path.join(root, file)
            relative_path = os.path.relpath(local_path, base_dir).replace("\\", "/")
            s3_key = f"{safe_url}/{relative_path}"
            try:
                s3.upload_file(local_path, BUCKET_NAME, s3_key)
                print(f"✅ Uploaded: s3://{BUCKET_NAME}/{s3_key}")
            except Exception as e:
                print(f"❌ Failed to upload {s3_key}: {e}")

    print("🧹 Final cleanup: removing VideoFrames folder...")
    try:
        shutil.rmtree(frames_dir)
        print("✅ VideoFrames folder removed from local system.")
    except Exception as e:
        print(f"⚠️ Could not remove VideoFrames folder: {e}")


def main():
    video_url = input("🔗 Enter YouTube video URL: ").strip()
    process_video_from_youtube(video_url)


if __name__ == "__main__":
    multiprocessing.set_start_method("spawn")
    main()
