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

### 4. Configure AWS Credentials
*Open the script file (youtube_to_30s_transcript.py) and scroll to the top. Add your AWS credentials here:

*AWS_ACCESS_KEY_ID = "your_aws_access_key_id"
*AWS_SECRET_ACCESS_KEY = "your_aws_secret_access_key"

### 5.  Run the Script

```bash
python youtube_to_30s_transcript.py
```

---

##  Output

* `frames/`: All extracted video frames
* `transcript_to_frames.json`: Mapped transcript with corresponding frames

