import React, { useRef, useState } from "react";
import VideoPlayer from "./components/VideoPlayer";
import FaceDetectionOverlay from "./components/FaceDetectionOverlay";
import { videoUrl } from "./consts";

export interface FaceDetection {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  label?: string;
}

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [detections, setDetections] = useState<FaceDetection[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);

  const detectFaces = async () => {
    const video = videoRef.current;
    if (!video) return;

    // Capture frame
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 450;
    canvas.getContext("2d")?.drawImage(video, 0, 0, 800, 450);
    const frameData = canvas.toDataURL("image/jpeg", 0.8);

    // Send to backend
    setIsDetecting(true);
    try {
      const res = await fetch("http://127.0.0.1:8080/detect-faces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: frameData }),
      });
      const data = await res.json();
      setDetections(data.detections || []);
    } catch (error) {
      console.error("Detection failed:", error);
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <div className="container">
      <div style={{ textAlign: "center" }}>
        <div className="video-container">
          <VideoPlayer ref={videoRef} src={videoUrl} />
          <FaceDetectionOverlay detections={detections} videoRef={videoRef} />
        </div>
        <div style={{ marginTop: "20px" }}>
          <button
            onClick={detectFaces}
            className="btn btn-primary"
            disabled={isDetecting}
          >
            {isDetecting ? "Detecting..." : "Detect Faces"}
          </button>
        </div>
        {detections.length > 0 && (
          <pre style={{ marginTop: "20px", textAlign: "left" }}>
            {JSON.stringify(detections, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};

export default App;
