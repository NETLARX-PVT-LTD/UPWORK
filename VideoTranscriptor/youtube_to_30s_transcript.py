import os
import cv2
import json
import yt_dlp
import whisper
import boto3
import shutil
from pydub import AudioSegment
from math import ceil

# AWS S3 Config
AWS_ACCESS_KEY_ID = ""       # add your aws_access_key_id here
AWS_SECRET_ACCESS_KEY = ""   # add your aws_secret_access_key here
BUCKET_NAME = "afterlife-test"

CHUNK_DURATION_MS = 30 * 1000  # 30 seconds


def process_video_from_youtube(video_url):
    # === Setup paths based on input URL ===
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

    # === Directory Setup ===
    os.makedirs(base_dir, exist_ok=True)
    os.makedirs(chunks_dir, exist_ok=True)
    os.makedirs(frames_dir, exist_ok=True)

    # === Download Video and Audio ===
    print("⬇️ Downloading video and audio...")
    ydl_opts = {
        'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best',
        'outtmpl': video_filename,
        'merge_output_format': 'mp4',
        'quiet': True
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([video_url])

    ydl_audio_opts = {
        'format': 'bestaudio/best',
        'postprocessors': [{'key': 'FFmpegExtractAudio', 'preferredcodec': 'mp3'}],
        'outtmpl': audio_filename.replace('.mp3', ''),
        'quiet': True
    }
    with yt_dlp.YoutubeDL(ydl_audio_opts) as ydl:
        ydl.download([video_url])

    # === Split Audio ===
    print("🔪 Splitting audio into chunks...")
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

    # === Transcribe Chunks ===
    print("🧠 Transcribing each chunk...")
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

    # === Extract Frames ===
    print("🎞 Extracting video frames...")
    cap = cv2.VideoCapture(video_filename)
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    print(f"📊 FPS: {fps}, Total Frames: {total_frames}")

    frame_index = 0
    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            break
        time_sec = int(frame_index / fps)
        slot_start = (time_sec // 30) * 30
        slot_end = slot_start + 30
        filename = os.path.join(frames_dir, f"File_slot_{slot_start}-{slot_end}_{frame_index:05d}.jpg")
        cv2.imwrite(filename, frame)
        frame_index += 1
    cap.release()

    # === Map Transcript to Frames ===
    print("🗺 Mapping transcript to frames...")
    total_frames = len(os.listdir(frames_dir))
    mapping = []
    for entry in results:
        start_sec = entry['start_time']
        end_sec = entry['end_time']
        start_frame = int(start_sec * fps)
        end_frame = int(end_sec * fps)

        matched_frames = []
        for i in range(start_frame, min(end_frame + 1, total_frames)):
            time_sec = int(i / fps)
            slot_start = (time_sec // 30) * 30
            slot_end = slot_start + 30
            matched_frames.append(f"File_slot_{slot_start}-{slot_end}_{i:05d}.jpg")

        mapping.append({
            "start_time": start_sec,
            "end_time": end_sec,
            "text": entry['text'],
            "frames": matched_frames
        })

    with open(mapping_file, "w", encoding="utf-8") as f:

        json.dump(mapping, f, indent=2)
    print(f"✅ Mapping saved to {mapping_file}")

    # === Cleanup ===
    print("🧹 Cleaning up video/audio/chunks...")
    try:
        os.remove(video_filename)
        os.remove(audio_filename)
        shutil.rmtree(chunks_dir)
    except Exception as e:
        print(f"⚠️ Cleanup warning: {e}")

    # === Upload to S3 ===
    print("☁️ Uploading selected files to S3...")
    s3 = boto3.client(
        "s3",
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY
    )

    allowed_files = {"transcript_to_frames.json"}
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            rel_path = os.path.relpath(os.path.join(root, file), base_dir)
            if rel_path.startswith("VideoFrames/") or file in allowed_files:
                s3_key = os.path.join(safe_url, rel_path).replace("\\", "/")
                try:
                    s3.upload_file(os.path.join(root, file), BUCKET_NAME, s3_key)
                    print(f"✅ Uploaded: s3://{BUCKET_NAME}/{s3_key}")
                except Exception as e:
                    print(f"❌ Failed to upload {s3_key}: {e}")


def main():
    video_url = input("🔗 Enter YouTube video URL: ").strip()
    process_video_from_youtube(video_url)


if __name__ == "__main__":
    main()
