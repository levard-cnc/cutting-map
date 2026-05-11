import { useRef, useEffect } from "react";

const SCALE = 2; // 1 мм = 2 px

export default function CanvasSheet({ details, pending, onPlace }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // существующие детали
    details.forEach(d => {
      ctx.strokeRect(
        d.x1 * SCALE,
        d.y1 * SCALE,
        d.width * SCALE,
        d.height * SCALE
      );
    });
  }, [details]);

  function handleClick(e) {
    if (!pending) return;

    const rect = ref.current.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / SCALE);
    const y = Math.round((e.clientY - rect.top) / SCALE);

    onPlace(x, y);
  }

  return (
    <canvas
      ref={ref}
      width={800}
      height={600}
      onClick={handleClick}
      style={{ background: "#fff", border: "1px solid #888" }}
    />
  );
}