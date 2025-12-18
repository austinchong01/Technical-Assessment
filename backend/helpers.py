import logging
import cv2
import numpy as np
import base64
import uuid

face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
# body_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_fullbody.xml')

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def detect_faces_in_image(base64_image: str) -> list:
    # Remove data URL prefix (e.g., "data:image/jpeg;base64,")
    if ',' in base64_image:
        base64_image = base64_image.split(',')[1]
    
    # Decode base64 to image
    image_bytes = base64.b64decode(base64_image)
    image_array = np.frombuffer(image_bytes, dtype=np.uint8)
    image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
    
    # Convert to grayscale and detect faces
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)
    
    # Format results to match frontend FaceDetection interface
    detections = []
    for (x, y, w, h) in faces:
        detections.append({
            "id": str(uuid.uuid4())[:8],
            "x": int(x),
            "y": int(y),
            "width": int(w),
            "height": int(h),
            "confidence": 0.95,  # Haar cascade doesn't provide confidence, so we use a placeholder
        })
    
    logger.info(f"Detected {len(detections)} faces")
    return detections