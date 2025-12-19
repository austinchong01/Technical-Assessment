import logging
import cv2
import numpy as np
import base64
import uuid

face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
# body_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_fullbody.xml')

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def decode_base64_image(base64_image: str) -> np.ndarray:
    if ',' in base64_image:
        base64_image = base64_image.split(',')[1]
    image_bytes = base64.b64decode(base64_image)
    image_array = np.frombuffer(image_bytes, dtype=np.uint8)
    return cv2.imdecode(image_array, cv2.IMREAD_COLOR)

def encode_image_to_base64(image: np.ndarray) -> str:
    _, buffer = cv2.imencode('.jpeg', image, [cv2.IMWRITE_JPEG_QUALITY, 90])
    return f"data:image/jpeg;base64,{base64.b64encode(buffer).decode('utf-8')}"



def detect_faces_in_image(base64_image: str) -> list:
    image = decode_base64_image(base64_image)
    
    # Convert to grayscale and detect faces
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(120, 120))
    
    # Format results to match frontend FaceDetection interface
    detections = []
    for (x, y, w, h) in faces:
        detections.append({
            "id": str(uuid.uuid4())[:8],
            "x": int(x),
            "y": int(y),
            "width": int(w),
            "height": int(h),
            "confidence": 1,  # Haar cascade doesn't provide confidence=
        })
    
    logger.info(f"Detected {len(detections)} faces")
    return detections

def blur(base64_image: str, detections: list) -> str:
    image = decode_base64_image(base64_image)
    
    # Save the original face regions first
    face_regions = []
    for detection in detections:
        x = detection['x']
        y = detection['y']
        w = detection['width']
        h = detection['height']
        face_regions.append((x, y, w, h, image[y:y+h, x:x+w].copy()))
    
    # Blur the entire image
    blurred = cv2.GaussianBlur(image, (51, 51), 0)
    
    # Restore the original (sharp) face regions
    for (x, y, w, h, face) in face_regions:
        blurred[y:y+h, x:x+w] = face
    
    logger.info(f"Applied blur except for {len(detections)} face regions")
    return encode_image_to_base64(blurred)

def grayscale(base64_image: str, detections: list) -> str:
    image = decode_base64_image(base64_image)
    
    # Save the original face regions first
    face_regions = []
    for detection in detections:
        x = detection['x']
        y = detection['y']
        w = detection['width']
        h = detection['height']
        face_regions.append((x, y, w, h, image[y:y+h, x:x+w].copy()))
    
    # Convert entire image to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    gray_bgr = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)
    
    # Restore the original color face regions
    for (x, y, w, h, face) in face_regions:
        gray_bgr[y:y+h, x:x+w] = face
    
    logger.info(f"Applied grayscale except for {len(detections)} face regions")
    return encode_image_to_base64(gray_bgr)