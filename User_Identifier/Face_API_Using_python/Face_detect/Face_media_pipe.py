import cv2
import mediapipe as mp

# Initialize MediaPipe Face Detection
mp_face_detection = mp.solutions.face_detection
mp_drawing = mp.solutions.drawing_utils

# Load your image
image_path = r'C:\python\Image\human.jpg'  # Raw string (r'...') avoids backslash issues
image = cv2.imread(image_path)

# Debug print (optional)
print("Image shape:" if image is not None else "Image not found")

# Safety check
if image is None:
    print(f"❌ Error: Image not found at path {image_path}")
    exit()

# Convert image to RGB (MediaPipe uses RGB)
image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

# Face Detection using MediaPipe
with mp_face_detection.FaceDetection(min_detection_confidence=0.5) as face_detection:
    results = face_detection.process(image_rgb)

    # Draw detections on the original BGR image
    if results.detections:
        for detection in results.detections:
            mp_drawing.draw_detection(image, detection)
    else:
        print("⚠️ No face detected.")

# Show the output image
cv2.imshow('Face Detection Result', image)
cv2.waitKey(0)
cv2.destroyAllWindows()
