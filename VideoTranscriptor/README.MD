# YouTube 30s Transcript Mapper

This script downloads a YouTube video, splits its audio into 30-second chunks, transcribes each chunk using OpenAI Whisper, extracts all video frames, and maps each 30-second transcript to the corresponding video frames.

---

## 🧑‍💻 Developer Setup Instructions

### 1. 📌 Prerequisites

* ✅ **Python**
* ✅ **pip** (Python package manager)

Check versions:

```bash
python --version
pip --version
```

If not installed:

* [Install Python](https://www.python.org/downloads/) and ensure "Add Python to PATH" is checked during installation.

### 2. Install FFmpeg (Required by `whisper`, `pydub`)

#### Windows:

* Download from: [https://ffmpeg.org/download.html](https://ffmpeg.org/download.html)
* Extract the ZIP
* Add the `bin` directory (inside the extracted folder) to the **System PATH** environment variable


### 3. Install Python Dependencies

```bash
pip install -r requirements.txt
```

---

### 4.  Run the Script

```bash
python youtube_to_30s_transcript.py
```

---

##  Output

* `audio.mp3`: Extracted audio from the YouTube video
* `chunks/`: Folder containing 30-second audio clips
* `frames/`: All extracted video frames
* `transcript_30s.json`: Transcripts per 30-second chunk
* `transcript_to_frames.json`: Mapped transcript with corresponding frames

