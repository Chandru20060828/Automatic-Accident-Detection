import cv2
import numpy as np
import time
import requests
import os

# ---------------- CONFIG ----------------
THRESHOLD_COUNT = 45000
BACKEND_URL = "http://localhost:5000/api/accidents"
SAVE_DIR = "../detected_frames"
VIDEO_FILE = "../test_videos/sample_accident.mp4"  # change path if needed
AUTO_INJECT = True
AUTO_INJECT_AFTER = 8
# ----------------------------------------

os.makedirs(SAVE_DIR, exist_ok=True)

cap = cv2.VideoCapture(VIDEO_FILE)  # replace with 0 for live webcam

ret, prev = cap.read()
if not ret:
    print("Failed to open video/camera.")
    exit()

prev_gray = cv2.cvtColor(prev, cv2.COLOR_BGR2GRAY)
prev_gray = cv2.GaussianBlur(prev_gray, (5,5), 0)

start_time = time.time()
injected = False

while True:
    ret, frame = cap.read()
    if not ret:
        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
        continue

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    gray = cv2.GaussianBlur(gray, (5,5), 0)
    diff = cv2.absdiff(prev_gray, gray)
    _, thresh = cv2.threshold(diff, 25, 255, cv2.THRESH_BINARY)
    count = cv2.countNonZero(thresh)

    # Auto-inject synthetic accident
    if AUTO_INJECT and not injected and (time.time() - start_time) > AUTO_INJECT_AFTER:
        overlay = frame.copy()
        h, w = frame.shape[:2]
        cv2.rectangle(overlay, (int(w*0.1), int(h*0.1)), (int(w*0.9), int(h*0.9)), (255,255,255), -1)
        frame = cv2.addWeighted(frame, 0.6, overlay, 0.4, 0)
        injected = True

    if count > THRESHOLD_COUNT:
        ts = time.strftime("%Y-%m-%d %H:%M:%S")
        lat = 12.9716
        lon = 77.5946
        payload = {"timestamp": ts, "lat": lat, "lon": lon, "speed": None}

        # Send POST to backend
        try:
            requests.post("http://localhost:5000/api/accidents", json=payload, timeout=3)
        except Exception as e:
            print("Backend POST failed:", e)

        injected = False
        time.sleep(1)

    cv2.putText(frame, f"DiffCount: {count}", (10,30), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0,0,255), 2)
    cv2.imshow("Accident Detection", frame)
    prev_gray = gray.copy()

    key = cv2.waitKey(1) & 0xFF
    if key == 27:  # ESC
        break

cap.release()
cv2.destroyAllWindows()
