export default function Sheet({ details }) {
  const scale = 0.25;

  return (
    <div className="sheet">
      <div className="sheet-inner">
        {details.map((d, i) => (
          <div
            key={i}
            className="detail"
            style={{
              left: d.x1 * scale,
              bottom: d.y1 * scale,
              width: d.w * scale,
              height: d.h * scale
            }}
          >
            {d.w}×{d.h}
          </div>
        ))}
      </div>
    </div>
  );
}