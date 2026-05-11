import { useRef, useEffect } from "react";

const SCALE = 2; // 1 мм = 2 пикселя

export default function LayoutCanvas({ activeDetail }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // очистка
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!activeDetail) return;

    const { x, y, width, height } = activeDetail;

    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;

    ctx.strokeRect(
      x,
      y,
      width * SCALE,
      height * SCALE
    );
  }, [activeDetail]);

  function handleClick(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // передаём координаты клика
    if (activeDetail?.onPlace) {
      activeDetail.onPlace(x, y);
    }
  }

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      onClick={handleClick}
      style={{
        border: "1px solid #888",
        background: "#fff"
      }}
    />
  );
}