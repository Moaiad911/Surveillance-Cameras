import { useEffect, useRef, useState } from "react";
import {
  Play,
  Square,
  Maximize,
  Minimize,
  WifiOff,
  Loader,
  Camera,
} from "lucide-react";

interface Props {
  cameraId: string;
  cameraName: string;
  streamURL?: string;
  resolution?: string;
  frameRate?: number;
  status?: string;
}

/** Returns true for /dev/videoN (Linux) or a bare number like "0" (macOS) */
const isLocalDevice = (url: string) =>
  /^\/dev\/video\d+$/.test(url.trim()) || /^\d+$/.test(url.trim());

const WSStreamPlayer = ({
  cameraId,
  cameraName,
  streamURL,
  resolution,
  status,
}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const [streamStatus, setStreamStatus] = useState<
    "idle" | "loading" | "live" | "error"
  >("idle");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState("");
  const [fps, setFps] = useState(0);

  // WebSocket FPS counters
  const frameCountRef = useRef(0);
  const lastFpsUpdate = useRef(Date.now());

  // Browser-cam FPS counters
  const rafFrameCount = useRef(0);
  const rafLastSecond = useRef(Date.now());

  const browserCam = !!streamURL && isLocalDevice(streamURL);

  // ─── Token helper ────────────────────────────────────────────────────────────
  const getToken = () => {
    const stored = localStorage.getItem("auth-storage");
    if (!stored) return "";
    try {
      return JSON.parse(stored)?.state?.token || "";
    } catch {
      return "";
    }
  };

  // ─── Browser getUserMedia mode ───────────────────────────────────────────────
  const startFpsRaf = () => {
    rafFrameCount.current = 0;
    rafLastSecond.current = Date.now();

    const tick = () => {
      rafFrameCount.current++;
      const now = Date.now();
      if (now - rafLastSecond.current >= 1000) {
        setFps(rafFrameCount.current);
        rafFrameCount.current = 0;
        rafLastSecond.current = now;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const stopFpsRaf = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setFps(0);
  };

  const startBrowserStream = async () => {
    setStreamStatus("loading");
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStreamStatus("live");
      startFpsRaf();
    } catch (err: unknown) {
      const msg =
        err instanceof DOMException
          ? err.name === "NotAllowedError"
            ? "Camera permission denied — allow access in your browser and retry."
            : err.name === "NotFoundError"
              ? "No webcam found on this device."
              : err.message
          : "Could not access webcam.";
      setError(msg);
      setStreamStatus("error");
    }
  };

  const stopBrowserStream = () => {
    stopFpsRaf();
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStreamStatus("idle");
  };

  // ─── WebSocket / ffmpeg mode ─────────────────────────────────────────────────
  const startWSStream = () => {
    setStreamStatus("loading");
    setError("");

    const token = getToken();
    const wsUrl = `${
      window.location.protocol === "https:" ? "wss" : "ws"
    }://${window.location.hostname === "localhost" ? "localhost:5000" : window.location.host}/ws/stream?token=${token}&cameraId=${cameraId}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    ws.binaryType = "arraybuffer";

    ws.onopen = () => {
      setStreamStatus("live");
    };

    ws.onmessage = (event) => {
      const blob = new Blob([event.data], { type: "image/jpeg" });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);

        frameCountRef.current++;
        const now = Date.now();
        if (now - lastFpsUpdate.current >= 1000) {
          setFps(frameCountRef.current);
          frameCountRef.current = 0;
          lastFpsUpdate.current = now;
        }
      };
      img.src = url;
    };

    ws.onerror = () => {
      setError("WebSocket connection failed");
      setStreamStatus("error");
    };

    ws.onclose = () => {
      setStreamStatus((prev) => (prev === "live" ? "idle" : prev));
    };
  };

  const stopWSStream = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setStreamStatus("idle");
    setFps(0);
  };

  // ─── Unified start / stop ────────────────────────────────────────────────────
  const startStream = () => {
    if (browserCam) {
      startBrowserStream();
    } else {
      startWSStream();
    }
  };

  const stopStream = () => {
    if (browserCam) {
      stopBrowserStream();
    } else {
      stopWSStream();
    }
  };

  // ─── Fullscreen ──────────────────────────────────────────────────────────────
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Cleanup on unmount / cameraId change
  useEffect(() => {
    return () => {
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraId]);

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          {streamStatus === "live" ? (
            <>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-400 text-sm font-medium">● LIVE</span>
              <span className="text-slate-500 text-xs ml-2">{fps} fps</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-slate-400" />
              <span className="text-slate-400 text-sm">Offline</span>
            </>
          )}
        </div>

        <span className="text-white text-sm font-medium">{cameraName}</span>

        <div className="flex items-center space-x-2">
          {streamStatus !== "live" ? (
            <button
              onClick={startStream}
              disabled={streamStatus === "loading"}
              className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors disabled:opacity-50"
            >
              {streamStatus === "loading" ? (
                <Loader className="w-3 h-3 animate-spin" />
              ) : browserCam ? (
                <Camera className="w-3 h-3" />
              ) : (
                <Play className="w-3 h-3" />
              )}
              <span>
                {streamStatus === "loading"
                  ? "Connecting…"
                  : browserCam
                    ? "Open Webcam"
                    : "Start Live"}
              </span>
            </button>
          ) : (
            <button
              onClick={stopStream}
              className="flex items-center space-x-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
            >
              <Square className="w-3 h-3" />
              <span>Stop</span>
            </button>
          )}

          <button
            onClick={toggleFullscreen}
            className="p-1.5 bg-slate-600 hover:bg-slate-500 rounded transition-colors"
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4 text-white" />
            ) : (
              <Maximize className="w-4 h-4 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Video area */}
      <div
        ref={containerRef}
        className="relative bg-black"
        style={{ aspectRatio: "16/9" }}
      >
        {/* Idle overlay */}
        {streamStatus === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
            {browserCam ? (
              <Camera className="w-16 h-16 mb-4" />
            ) : (
              <WifiOff className="w-16 h-16 mb-4" />
            )}
            <p className="text-sm">
              {browserCam
                ? 'Click "Open Webcam" to start your camera'
                : 'Click "Start Live" to begin streaming'}
            </p>
          </div>
        )}

        {/* Loading overlay */}
        {streamStatus === "loading" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-blue-400">
            <Loader className="w-16 h-16 mb-4 animate-spin" />
            <p className="text-sm">
              {browserCam ? "Requesting camera access…" : "Connecting…"}
            </p>
          </div>
        )}

        {/* Error overlay */}
        {streamStatus === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400 px-6 text-center">
            <WifiOff className="w-16 h-16 mb-4" />
            <p className="text-sm mb-3">{error}</p>
            <button
              onClick={startStream}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {/* Browser webcam — native <video> element */}
        {browserCam && (
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            style={{ display: streamStatus === "live" ? "block" : "none" }}
            muted
            playsInline
          />
        )}

        {/* WebSocket stream — canvas */}
        {!browserCam && (
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain"
            style={{ display: streamStatus === "live" ? "block" : "none" }}
          />
        )}

        {/* Status badge */}
        {status && (
          <div className="absolute top-4 left-4">
            <span
              className={`px-3 py-1 rounded text-sm font-medium text-white ${
                status === "Active"
                  ? "bg-green-500"
                  : status === "Inactive"
                    ? "bg-gray-500"
                    : "bg-yellow-500"
              }`}
            >
              {status}
            </span>
          </div>
        )}
      </div>

      {/* Info bar */}
      {streamStatus === "live" && (
        <div className="px-4 py-2 bg-slate-900/50 flex items-center space-x-4 text-xs text-slate-400">
          <span>📹 {resolution || "1280x720"}</span>
          <span>🎬 {fps} FPS</span>
          <span>
            {browserCam ? "🖥️ Browser Webcam" : "🔴 WebSocket Stream"}
          </span>
        </div>
      )}
    </div>
  );
};

export default WSStreamPlayer;
