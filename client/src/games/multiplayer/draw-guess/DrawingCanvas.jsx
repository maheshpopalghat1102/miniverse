
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const DrawingCanvas = ({
  color = "#000000",
  brushSize = 7,
  isEraser = false,
  disabled = false,
  onStroke,
  onCanvasChange,
  incomingStrokes = [],
  clearSignal = 0,
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef(null);
  const strokesRef = useRef([]);
  const redoRef = useRef([]);

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const getCanvasContext = useCallback(() => {
    const canvas = canvasRef.current;
    return canvas?.getContext("2d") || null;
  }, []);

  const updateHistoryControls = useCallback(() => {
    setCanUndo(strokesRef.current.length > 0);
    setCanRedo(redoRef.current.length > 0);
  }, []);

  const getPoint = useCallback((event) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();

    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    };
  }, []);

  const drawLine = useCallback((ctx, stroke) => {
    if (!ctx || !stroke?.points?.length) return;

    const points = stroke.points;

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    ctx.globalCompositeOperation = stroke.erase
      ? "destination-out"
      : "source-over";

    if (points.length === 1) {
      ctx.beginPath();
      ctx.arc(
        points[0].x,
        points[0].y,
        stroke.size / 2,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = stroke.color;
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);

      for (let i = 1; i < points.length; i += 1) {
        ctx.lineTo(points[i].x, points[i].y);
      }

      ctx.stroke();
    }

    ctx.restore();
  }, []);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = getCanvasContext();

    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    strokesRef.current.forEach((stroke) => {
      drawLine(ctx, stroke);
    });
  }, [drawLine, getCanvasContext]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (!canvas || !container) return;

    const previousImage = canvas.toDataURL();

    const width = Math.max(1, Math.floor(container.clientWidth));
    const height = 420;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    // Preserve the previous drawing when resizing.
    if (strokesRef.current.length === 0 && previousImage) {
      const image = new Image();
      image.onload = () => {
        ctx.drawImage(image, 0, 0, width, height);
      };
      image.src = previousImage;
    } else {
      redrawCanvas();
    }
  }, [redrawCanvas]);

  useEffect(() => {
    resizeCanvas();

    const observer = new ResizeObserver(resizeCanvas);

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [resizeCanvas]);

  const beginStroke = (event) => {
    if (disabled || drawingRef.current) return;

    event.preventDefault();

    const point = getPoint(event);
    if (!point) return;

    drawingRef.current = true;
    lastPointRef.current = point;

    const stroke = {
      color: isEraser ? "#000000" : color,
      size: brushSize,
      erase: isEraser,
      points: [point],
    };

    strokesRef.current.push(stroke);
    redoRef.current = [];

    const ctx = getCanvasContext();
    drawLine(ctx, stroke);
    updateHistoryControls();

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture may not be available in every environment.
    }
  };

  const moveStroke = (event) => {
    if (!drawingRef.current || disabled) return;

    event.preventDefault();

    const point = getPoint(event);
    const stroke = strokesRef.current[strokesRef.current.length - 1];

    if (!point || !stroke) return;

    const previousPoint = lastPointRef.current;

    stroke.points.push(point);

    const ctx = getCanvasContext();

    if (ctx && previousPoint) {
      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size;
      ctx.globalCompositeOperation = stroke.erase
        ? "destination-out"
        : "source-over";

      ctx.beginPath();
      ctx.moveTo(previousPoint.x, previousPoint.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
      ctx.restore();
    }

    lastPointRef.current = point;
  };

  const endStroke = (event) => {
    if (!drawingRef.current) return;

    drawingRef.current = false;
    lastPointRef.current = null;

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Pointer capture may already have been released.
    }

    const stroke = strokesRef.current[strokesRef.current.length - 1];

    if (stroke) {
      onStroke?.(stroke);
      onCanvasChange?.(strokesRef.current);
    }
  };

  const undo = () => {
    if (!strokesRef.current.length || disabled) return;

    redoRef.current.push(strokesRef.current.pop());

    redrawCanvas();
    updateHistoryControls();
    onCanvasChange?.(strokesRef.current);
  };

  const redo = () => {
    if (!redoRef.current.length || disabled) return;

    strokesRef.current.push(redoRef.current.pop());

    redrawCanvas();
    updateHistoryControls();
    onCanvasChange?.(strokesRef.current);
  };

  const clear = () => {
    if (disabled) return;

    strokesRef.current = [];
    redoRef.current = [];

    redrawCanvas();
    updateHistoryControls();
    onCanvasChange?.([]);
  };

  useEffect(() => {
    if (clearSignal > 0) {
      clear();
    }
    // clear is intentionally triggered by the external signal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearSignal]);

  useEffect(() => {
    if (!Array.isArray(incomingStrokes)) return;

    strokesRef.current = incomingStrokes;
    redoRef.current = [];

    redrawCanvas();
    updateHistoryControls();
  }, [incomingStrokes, redrawCanvas, updateHistoryControls]);

  return (
    <div className="dg-canvas-container" ref={containerRef}>
      <canvas
        ref={canvasRef}
        className={[
          "dg-canvas",
          disabled ? "dg-canvas-disabled" : "",
        ].join(" ")}
        onPointerDown={beginStroke}
        onPointerMove={moveStroke}
        onPointerUp={endStroke}
        onPointerCancel={endStroke}
        onLostPointerCapture={endStroke}
        style={{
          touchAction: disabled ? "auto" : "none",
        }}
      />

      <div className="dg-canvas-controls">
        <button
          type="button"
          onClick={undo}
          disabled={disabled || !canUndo}
        >
          ↶ Undo
        </button>

        <button
          type="button"
          onClick={redo}
          disabled={disabled || !canRedo}
        >
          ↷ Redo
        </button>

        <button
          type="button"
          onClick={clear}
          disabled={disabled || !canUndo}
        >
          Clear drawing
        </button>
      </div>
    </div>
  );
};

export default DrawingCanvas;
