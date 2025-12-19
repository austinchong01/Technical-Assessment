import React, { useRef, useState, useCallback } from "react";
import VideoPlayer from "./components/VideoPlayer";
import FaceDetectionOverlay from "./components/FaceDetectionOverlay";
import DetectionStats from "./components/DetectionStats";
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [detections, setDetections] = useState<FaceDetection[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [processingTime, setProcessingTime] = useState(0);
  const isRunningRef = useRef(false);

  const processGrayFrame = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.paused || video.ended) return;

    // Capture frame
    const captureCanvas = document.createElement("canvas");
    captureCanvas.width = 800;
    captureCanvas.height = 450;
    captureCanvas.getContext("2d")?.drawImage(video, 0, 0, 800, 450);
    const frameData = captureCanvas.toDataURL("image/jpeg", 0.8);

    const startTime = performance.now();

    try {
      // Detect faces
      const detectRes = await fetch("http://127.0.0.1:8080/detect-faces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: frameData }),
      });
      const detectData = await detectRes.json();
      const faceDetections = detectData.detections || [];
      setDetections(faceDetections);

      // apply grayscale
      if (faceDetections.length > 0) {
        const effectRes = await fetch("http://127.0.0.1:8080/grayscale-faces", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: frameData,
            detections: faceDetections,
          }),
        });
        const effectData = await effectRes.json();

        // draw modified image
        const img = new Image();
        img.onload = () => {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            canvas.width = 800;
            canvas.height = 450;
            ctx.drawImage(img, 0, 0, 800, 450);
          }
        };
        img.src = effectData.image;
      }

      const endTime = performance.now();
      setProcessingTime(Math.round(endTime - startTime));
    } catch (error) {
      console.error("Detection failed:", error);
    }

    // Continue loop if still running
    if (isRunningRef.current) {
      requestAnimationFrame(processGrayFrame);
    }
  }, []);

  const processBlurFrame = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.paused || video.ended) return;

    // Capture frame
    const captureCanvas = document.createElement("canvas");
    captureCanvas.width = 800;
    captureCanvas.height = 450;
    captureCanvas.getContext("2d")?.drawImage(video, 0, 0, 800, 450);
    const frameData = captureCanvas.toDataURL("image/jpeg", 0.8);

    const startTime = performance.now();

    try {
      // Detect faces
      const detectRes = await fetch("http://127.0.0.1:8080/detect-faces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: frameData }),
      });
      const detectData = await detectRes.json();
      const faceDetections = detectData.detections || [];
      setDetections(faceDetections);

      // Apply blur
      if (faceDetections.length > 0) {
        const effectRes = await fetch("http://127.0.0.1:8080/blur-faces", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: frameData,
            detections: faceDetections,
          }),
        });
        const effectData = await effectRes.json();

        // draw modified image
        const img = new Image();
        img.onload = () => {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            canvas.width = 800;
            canvas.height = 450;
            ctx.drawImage(img, 0, 0, 800, 450);
          }
        };
        img.src = effectData.image;
      }

      const endTime = performance.now();
      setProcessingTime(Math.round(endTime - startTime));
    } catch (error) {
      console.error("Detection failed:", error);
    }

    // Continue loop if still running
    if (isRunningRef.current) {
      requestAnimationFrame(processBlurFrame);
    }
  }, []);

  const startGray = () => {
    const video = videoRef.current;
    if (!video) return;

    // Start if video is paused
    if (video.paused) {
      video.play();
    }

    setIsRunning(true);
    isRunningRef.current = true;
    processGrayFrame();
  };

  const startBlur = () => {
    const video = videoRef.current;
    if (!video) return;

    // Start if video is paused
    if (video.paused) {
      video.play();
    }

    setIsRunning(true);
    isRunningRef.current = true;
    processBlurFrame();
  };

  const stopDetection = () => {
    setIsRunning(false);
    isRunningRef.current = false;
    setDetections([]);

    // Clear the canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
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
          {isRunning ? (<FaceDetectionOverlay detections={detections} videoRef={videoRef} />) : (<></>)}
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
            <div style={{display: "flex", gap: "10px"}}>
              <button onClick={startGray} className="btn btn-primary">
                Grayscale
              </button>
              <button onClick={startBlur} className="btn btn-primary">
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
