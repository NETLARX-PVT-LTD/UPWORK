import os
import cv2
import json
import yt_dlp
import whisper
import boto3
import shutil
from pydub import AudioSegment
from math import ceil

# === CONFIG ===
VIDEO_URL = "https://www.youtube.com/watch?v=GgxoRS1qn7w"
VIDEO_ID = VIDEO_URL.split("v=")[-1]
SAFE_VIDEO_URL = VIDEO_URL.replace("://", "__").replace("/", "_").replace("?", "_").replace("=", "_")

ROOT_DIR = SAFE_VIDEO_URL
BASE_DIR = os.path.join(ROOT_DIR)
VIDEO_FILENAME = os.path.join(BASE_DIR, "video.mp4")
AUDIO_FILENAME = os.path.join(BASE_DIR, "audio.mp3")
CHUNKS_DIR = os.path.join(BASE_DIR, "chunks")
FRAMES_DIR = os.path.join(BASE_DIR, "VideoFrames")
TRANSCRIPT_FILE = os.path.join(BASE_DIR, "transcript_30s.json")
MAPPING_FILE = os.path.join(BASE_DIR, "transcript_to_frames.json")
CHUNK_DURATION_MS = 30 * 1000  # 30 seconds

# AWS S3 Config
AWS_ACCESS_KEY_ID = ""       # add your aws_access_key_id here 
AWS_SECRET_ACCESS_KEY = ""   # add your aws_secert_access_key here 
BUCKET_NAME = "afterlife-test"

def ensure_dirs():
    os.makedirs(BASE_DIR, exist_ok=True)
    os.makedirs(CHUNKS_DIR, exist_ok=True)
    os.makedirs(FRAMES_DIR, exist_ok=True)

# STEP 1: Download video and audio
def download_video_and_audio():
    print("⬇️ Downloading video and audio...")
    ydl_opts = {
        'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best',
        'outtmpl': VIDEO_FILENAME,
        'merge_output_format': 'mp4',
        'quiet': True
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([VIDEO_URL])

    ydl_audio_opts = {
        'format': 'bestaudio/best',
        'postprocessors': [{'key': 'FFmpegExtractAudio', 'preferredcodec': 'mp3'}],
        'outtmpl': AUDIO_FILENAME.replace('.mp3', ''),
        'quiet': True
    }
    with yt_dlp.YoutubeDL(ydl_audio_opts) as ydl:
        ydl.download([VIDEO_URL])

# STEP 2: Split audio
def split_audio():
    print("🔪 Splitting audio into chunks...")
    audio = AudioSegment.from_mp3(AUDIO_FILENAME)
    duration_ms = len(audio)
    num_chunks = ceil(duration_ms / CHUNK_DURATION_MS)

    chunk_paths = []
    for i in range(num_chunks):
        start = i * CHUNK_DURATION_MS
        end = min((i + 1) * CHUNK_DURATION_MS, duration_ms)
        chunk = audio[start:end]
        chunk_name = os.path.join(CHUNKS_DIR, f"chunk_{i}.mp3")
        chunk.export(chunk_name, format="mp3")
        chunk_paths.append((chunk_name, start // 1000, end // 1000))
    return chunk_paths

# STEP 3: Transcribe chunks
def transcribe_chunks(chunks):
    print("🧠 Transcribing each chunk...")
    model = whisper.load_model("base")
    results = []
    for path, start, end in chunks:
        print(f"🔤 Transcribing {start}-{end}s...")
        result = model.transcribe(path)
        results.append({
            "start_time": start,
            "end_time": end,
            "text": result["text"].strip()
        })
    with open(TRANSCRIPT_FILE, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    return results

# STEP 4: Extract frames with slot-based names
def extract_frames():
    print("🎞 Extracting video frames...")
    cap = cv2.VideoCapture(VIDEO_FILENAME)
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

        filename = os.path.join(
            FRAMES_DIR, f"File_slot_{slot_start}-{slot_end}_{frame_index:05d}.jpg"
        )
        cv2.imwrite(filename, frame)
        frame_index += 1
    cap.release()
    return fps

# STEP 5: Map transcript to frames
def map_transcript_to_frames(transcript, fps):
    print("🗺 Mapping transcript to frames...")
    total_frames = len(os.listdir(FRAMES_DIR))
    mapping = []
    for entry in transcript:
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

    with open(MAPPING_FILE, "w", encoding="utf-8") as f:
        json.dump(mapping, f, indent=2)
    print(f"✅ Mapping saved to {MAPPING_FILE}")

# STEP 6: Upload transcript and VideoFrames to S3
def upload_folder_to_s3(local_folder, bucket_name, s3_prefix):
    print("☁️ Uploading selected files to S3...")
    s3 = boto3.client(
        "s3",
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY
    )

    allowed_files = {"transcript_to_frames.json"}

    for root, dirs, files in os.walk(local_folder):
        for file in files:
            rel_path = os.path.relpath(os.path.join(root, file), local_folder)
            if rel_path.startswith("VideoFrames/") or file in allowed_files:
                s3_key = os.path.join(s3_prefix, rel_path).replace("\\", "/")
                try:
                    s3.upload_file(os.path.join(root, file), bucket_name, s3_key)
                    print(f"✅ Uploaded: s3://{bucket_name}/{s3_key}")
                except Exception as e:
                    print(f"❌ Failed to upload {s3_key}: {e}")

# STEP 7: Cleanup
def cleanup():
    print("🧹 Cleaning up video/audio/chunks...")
    try:
        os.remove(VIDEO_FILENAME)
        os.remove(AUDIO_FILENAME)
        shutil.rmtree(CHUNKS_DIR)
    except Exception as e:
        print(f"⚠️ Cleanup warning: {e}")

# MAIN
def main():
    ensure_dirs()
    download_video_and_audio()
    chunks = split_audio()
    transcript = transcribe_chunks(chunks)
    fps = extract_frames()
    map_transcript_to_frames(transcript, fps)
    cleanup()
    upload_folder_to_s3(BASE_DIR, BUCKET_NAME, SAFE_VIDEO_URL)

if __name__ == "__main__":
    main()
