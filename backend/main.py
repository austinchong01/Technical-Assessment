from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import logging
from helpers import detect_faces_in_image, grayscale, blur

app = Flask(__name__)
cors = CORS(app)

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route("/hello-world", methods=["GET"])
def hello_world():
    return jsonify({"Hello": "World"}), 200

@app.route("/detect-faces", methods=["POST"])
def detect_faces():
    try:
        data = request.get_json()
        image_data = data.get('image')  # Base64 string from frontend
        
        if not image_data:
            return jsonify({"error": "No image provided"}), 400
        
        detections = detect_faces_in_image(image_data)
        return jsonify({"detections": detections}), 200
    except Exception as e:
        logger.error(f"Error: {e}")
        return jsonify({"error": str(e)}), 500
    
@app.route("/grayscale-faces", methods=["POST"])
def grayscale_faces():
    try:
        data = request.get_json()
        image_data = data.get('image')
        detections = data.get('detections')
        
        if not image_data:
            return jsonify({"error": "No image provided"}), 400
        
        if not detections:
            return jsonify({"error": "No detections provided"}), 400
        
        modified_image = grayscale(image_data, detections)
        return jsonify({"image": modified_image}), 200
    except Exception as e:
        logger.error(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/blur-faces", methods=["POST"])
def blur_faces():
    try:
        data = request.get_json()
        image_data = data.get('image')
        detections = data.get('detections')
        
        if not image_data:
            return jsonify({"error": "No image provided"}), 400
        
        if not detections:
            return jsonify({"error": "No detections provided"}), 400
        
        modified_image = blur(image_data, detections)
        return jsonify({"image": modified_image}), 200
    except Exception as e:
        logger.error(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8080, debug=True, use_reloader=False)