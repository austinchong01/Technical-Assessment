import React, { useRef, useState, useCallback } from "react";
import VideoPlayer from "./components/VideoPlayer";
import FaceDetectionOverlay from "./components/FaceDetectionOverlay";
import DetectionStats from "./components/DetectionStats";
import { videoUrl } from "./consts";
import {
  EffectType,
  captureFrame,
  detectFaces,
  applyEffect,
  drawToCanvas,
  clearCanvas,
} from "./helper";

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [detections, setDetections] = useState<FaceDetection[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [processingTime, setProcessingTime] = useState(0);
  const isRunningRef = useRef(false);
  const effectRef = useRef<EffectType>("grayscale");

  const processFrame = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.paused || video.ended) return;

    const startTime = performance.now();

    try {
      const frameData = captureFrame(video);
      const faceDetections = await detectFaces(frameData);
      setDetections(faceDetections);

      if (faceDetections.length > 0) {
        const processedImage = await applyEffect(
          frameData,
          faceDetections,
          effectRef.current
        );
        drawToCanvas(canvas, processedImage);
      }

      setProcessingTime(Math.round(performance.now() - startTime));
    } catch (error) {
      console.error("Detection failed:", error);
    }

    if (isRunningRef.current) {
      requestAnimationFrame(processFrame);
    }
  }, []);

  const startDetection = (effect: EffectType) => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
    }

    effectRef.current = effect;
    setIsRunning(true);
    isRunningRef.current = true;
    processFrame();
  };

  const stopDetection = () => {
    setIsRunning(false);
    isRunningRef.current = false;
    setDetections([]);

    if (canvasRef.current) {
      clearCanvas(canvasRef.current);
    }
  };

  return (
    <div className="container">
      <div style={{ textAlign: "center" }}>
        <div className="video-container">
          <VideoPlayer ref={videoRef} src={videoUrl} />
          <canvas
            ref={canvasRef}
            className="processed-frame-canvas"
            style={{
              display: isRunning ? "block" : "none",
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
          />
          {isRunning && (
            <FaceDetectionOverlay detections={detections} videoRef={videoRef} />
          )}
        </div>
        <div
          style={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          {!isRunning ? (
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => startDetection("grayscale")}
                className="btn btn-primary"
              >
                Grayscale
              </button>
              <button
                onClick={() => startDetection("blur")}
                className="btn btn-primary"
              >
                Blur
              </button>
            </div>
          ) : (
            <button onClick={stopDetection} className="btn btn-secondary">
              Stop Detection
            </button>
          )}
        </div>
        <DetectionStats
          detections={detections}
          processingTime={processingTime}
          isDetecting={isRunning}
        />
      </div>
    </div>
  );
};

export default App;
