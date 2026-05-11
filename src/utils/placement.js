const SHEET_W = 2800;
const SHEET_H = 2070;

export function placeDetail(details, w, h) {
  let x = 0, y = 0;
  for (const d of details) {
    x = Math.max(x, d.x2);
  }
  if (x + w > SHEET_W) {
    x = 0;
    y = Math.max(...details.map(d => d.y2), 0);
  }
  return {
    x1: x,
    y1: y,
    x2: x + w,
    y2: y + h
  };
}