'use client'

// Whiteboard.tsx
import React, { useRef, useState, useEffect, MouseEvent } from 'react';

const Whiteboard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawing, setDrawing] = useState<boolean>(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [color, setColor] = useState<string>('black');
  const [lineWidth, setLineWidth] = useState<number>(2);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Set the background color to white
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setContext(ctx);
      }
    }
  }, []);

  const startDrawing = (e: MouseEvent<HTMLCanvasElement>) => {
    if (context) {
      setDrawing(true);
      draw(e);
    }
  };

  const endDrawing = () => {
    if (context) {
      setDrawing(false);
      context.beginPath(); // This is necessary to prevent lines from connecting
    }
  };

  const draw = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!drawing || !context) return;

    const { offsetX, offsetY } = e.nativeEvent;
    context.lineWidth = lineWidth;
    context.lineCap = 'round';
    context.strokeStyle = color;

    context.lineTo(offsetX, offsetY);
    context.stroke();
    context.beginPath();
    context.moveTo(offsetX, offsetY);
  };

  const clearCanvas = () => {
    if (context) {
      context.clearRect(0, 0, canvasRef.current?.width || 0, canvasRef.current?.height || 0);
      context.fillStyle = 'white';
      context.fillRect(0, 0, canvasRef.current?.width || 0, canvasRef.current?.height || 0);
    }
  };

  const saveDrawing = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataURL = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = 'drawing.png';
      link.click();
    }
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={900}
        height={600}
        style={{ border: '1px solid black', backgroundColor: 'white' }}
        onMouseDown={startDrawing}
        onMouseUp={endDrawing}
        onMouseMove={draw}
      />
      <div>
        <label>Color: </label>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
        <label>Brush Size: </label>
        <input
          type="number"
          min="1"
          max="10"
          value={lineWidth}
          onChange={(e) => setLineWidth(Number(e.target.value))}
        />
        <button onClick={clearCanvas}>Clear</button>
        <button onClick={saveDrawing}>Save</button>
      </div>
    </div>
  );
};

export default Whiteboard;
