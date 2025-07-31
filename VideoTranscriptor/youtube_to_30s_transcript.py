import os
import cv2
import json
import yt_dlp
import whisper
from pydub import AudioSegment
from math import ceil

# === CONFIG ===
VIDEO_URL = "https://www.youtube.com/watch?v=GgxoRS1qn7w"
VIDEO_ID = VIDEO_URL.split("v=")[-1]
VIDEO_FILENAME = "video.mp4"
AUDIO_FILENAME = "audio.mp3"
CHUNKS_DIR = "chunks"
OUTPUT_DIR = "youtubeurl"
FRAMES_DIR = os.path.join("youtubeurl", "VideoFrames")
TRANSCRIPT_FILE = os.path.join("youtubeurl", "transcript_30s.json")
MAPPING_FILE = os.path.join("youtubeurl", "transcript_to_frames.json")
CHUNK_DURATION_MS = 30 * 1000  # 30 seconds

# === STEP 1: Download video and extract audio ===
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
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3'
        }],
        'outtmpl': AUDIO_FILENAME.replace('.mp3', ''),
        'quiet': True
    }
    with yt_dlp.YoutubeDL(ydl_audio_opts) as ydl:
        ydl.download([VIDEO_URL])

# === STEP 2: Split audio into 30s chunks ===
def split_audio():
    print("🔪 Splitting audio into chunks...")
    audio = AudioSegment.from_mp3(AUDIO_FILENAME)
    duration_ms = len(audio)
    num_chunks = ceil(duration_ms / CHUNK_DURATION_MS)

    os.makedirs(CHUNKS_DIR, exist_ok=True)
    chunk_paths = []
    for i in range(num_chunks):
        start = i * CHUNK_DURATION_MS
        end = min((i + 1) * CHUNK_DURATION_MS, duration_ms)
        chunk = audio[start:end]
        chunk_name = os.path.join(CHUNKS_DIR, f"chunk_{i}.mp3")
        chunk.export(chunk_name, format="mp3")
        chunk_paths.append((chunk_name, start // 1000, end // 1000))
    return chunk_paths

# === STEP 3: Transcribe audio chunks ===
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

# === STEP 4: Extract video frames ===
def extract_frames():
    print("🎞 Extracting video frames...")
    os.makedirs(FRAMES_DIR, exist_ok=True)
    cap = cv2.VideoCapture(VIDEO_FILENAME)
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    print(f"📊 FPS: {fps}, Total Frames: {total_frames}")

    frame_index = 0
    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            break
        filename = os.path.join(FRAMES_DIR, f"frame_{frame_index:05d}.jpg")
        cv2.imwrite(filename, frame)
        frame_index += 1
    cap.release()
    return fps, frame_index

# === STEP 5: Map transcript to frames ===
def map_transcript_to_frames(transcript, fps):
    print("🗺 Mapping transcript to frames...")
    total_frames = len(os.listdir(FRAMES_DIR))
    mapping = []
    for entry in transcript:
        start_sec = entry['start_time']
        end_sec = entry['end_time']
        start_frame = int(start_sec * fps)
        end_frame = int(end_sec * fps)

        matched_frames = [
            f"frame_{i:05d}.jpg"
            for i in range(start_frame, min(end_frame + 1, total_frames))
        ]
        mapping.append({
            "start_time": start_sec,
            "end_time": end_sec,
            "text": entry['text'],
            "frames": matched_frames
        })

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    with open(MAPPING_FILE, "w", encoding="utf-8") as f:
        json.dump(mapping, f, indent=2)
    print(f"✅ Mapping saved to {MAPPING_FILE}")

# === MAIN EXECUTION ===
def main():
    if not os.path.exists(VIDEO_FILENAME):
        download_video_and_audio()

    chunks = split_audio()
    transcript = transcribe_chunks(chunks)
    fps, _ = extract_frames()
    map_transcript_to_frames(transcript, fps)

if __name__ == "__main__":
    main()
