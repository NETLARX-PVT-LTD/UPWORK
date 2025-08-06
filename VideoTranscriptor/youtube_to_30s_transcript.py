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
from collections import defaultdict
import mediapipe as mp

# AWS S3 Config
AWS_ACCESS_KEY_ID = "YOUR_AWS_ACCESS_KEY_ID"
AWS_SECRET_ACCESS_KEY = "YOUR_AWS_SECRET_ACCESS_KEY"
BUCKET_NAME = "afterlife-test"

CHUNK_DURATION_MS = 30 * 1000  # 30 seconds


def calculate_sharpness(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    lap = cv2.Laplacian(gray, cv2.CV_64F)
    return lap.var()


def process_batch(args):
    sec, video_filename, fps = args
    cap = cv2.VideoCapture(video_filename)
    cap.set(cv2.CAP_PROP_POS_FRAMES, sec * fps)

    mp_pose = mp.solutions.pose
    pose_detector = mp_pose.Pose(static_image_mode=True, min_detection_confidence=0.5)
    haar = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

    best_frame = None
    best_sharpness = 0
    best_frame_index = -1
    best_frame_img = None
    candidates = []

    for i in range(fps):
        ret, frame = cap.read()
        if not ret:
            break
        frame_index = sec * fps + i

        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        pose_result = pose_detector.process(rgb)
        if pose_result.pose_landmarks:
            continue

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = haar.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4)
        if len(faces) > 0:
            continue

        sharpness = calculate_sharpness(frame)
        candidates.append({"frame_index": frame_index, "sharpness": sharpness})

        if sharpness > best_sharpness:
            best_sharpness = sharpness
            best_frame = frame
            best_frame_index = frame_index
            best_frame_img = frame

    cap.release()
    pose_detector.close()

    if best_frame_img is not None:
        slot_start = (sec // 30) * 30
        slot_end = slot_start + 30
        filename = f"File_slot_{slot_start}-{slot_end}_{best_frame_index:05d}.jpg"
        return {
            "sec": sec,
            "filename": filename,
            "frame_index": best_frame_index,
            "sharpness": best_sharpness,
            "frame_img": best_frame_img,
            "candidates": candidates
        }
    else:
        return {
            "sec": sec,
            "filename": None,
            "candidates": candidates
        }


def extract_clean_frames_parallel(video_filename, frames_dir):
    cap = cv2.VideoCapture(video_filename)
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    total_seconds = int(total_frames / fps)
    cap.release()

    print(f"📊 FPS: {fps}, Total Frames: {total_frames}, Duration: {total_seconds}s")

    frame_debug_info = {}
    valid_frames = []
    batches = [(sec, video_filename, fps) for sec in range(total_seconds)]

    print("🧠 Processing all seconds in parallel (streaming mode)...")

    results = []
    with multiprocessing.Pool(processes=min(4, os.cpu_count())) as pool:
        with tqdm(total=len(batches), desc="🔄 Processing seconds", unit="sec") as pbar:
            def collect_result(result):
                results.append(result)
                pbar.update()

            for batch in batches:
                pool.apply_async(process_batch, args=(batch,), callback=collect_result)

            pool.close()
            pool.join()

    for result in results:
        sec = result["sec"]
        frame_debug_info[sec] = {
            "selected_frame": {
                "filename": result.get("filename"),
                "frame_index": result.get("frame_index"),
                "sharpness": result.get("sharpness")
            },
            "candidates": result["candidates"]
        }

        if result["filename"] and result["frame_img"] is not None:
            save_path = os.path.join(frames_dir, result["filename"])
            cv2.imwrite(save_path, result["frame_img"])
            valid_frames.append({
                "filename": result["filename"],
                "frame_index": result["frame_index"],
                "time_sec": sec
            })

    return valid_frames, frame_debug_info


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
    debug_file = os.path.join(base_dir, "frame_selection_debug.json")

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

    print("🎞 Extracting sharpest human-free frame per second...")
    valid_frames, frame_debug_info = extract_clean_frames_parallel(video_filename, frames_dir)

    with open(debug_file, "w", encoding="utf-8") as f:
        json.dump(frame_debug_info, f, indent=2)
    print(f"📋 Frame selection debug info saved to {debug_file}")
    print(f"✅ Saved {len(valid_frames)} sharpest frames without visible humans.")

    print("🗺 Mapping transcript to saved clean frames...")
    mapping = []
    for entry in results:
        start_sec = entry['start_time']
        end_sec = entry['end_time']
        matched_frames = [
            vf["filename"]
            for vf in valid_frames
            if start_sec <= vf["time_sec"] <= end_sec
        ]
        mapping.append({
            "start_time": start_sec,
            "end_time": end_sec,
            "text": entry['text'],
            "frames": matched_frames
        })

    with open(mapping_file, "w", encoding="utf-8") as f:
        json.dump(mapping, f, indent=2)
    print(f"✅ Mapping saved to {mapping_file}")

    print("🧹 Cleaning up...")
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

    if os.path.exists(mapping_file):
        s3_key = f"{safe_url}/{os.path.basename(mapping_file)}"
        try:
            s3.upload_file(mapping_file, BUCKET_NAME, s3_key)
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
