export function saveCutFile(details, filename) {
  const content = details.map((d, i) =>
    [
      i,
      d.knife,
      d.basic,
      d.sub,
      d.final,
      d.thermo ? "THERMO" : "ORIGINAL",
      d.diag ? "V" : "X",
      d.vert ? "V" : "X",
      d.horiz ? "V" : "X",
      d.w,
      d.h,
      d.x1,
      d.y1,
      d.x2,
      d.y2,
      d.cx1,
      d.cy1,
      d.cx2,
      d.cy2
    ].join(";") + ";"
  ).join("\n");

  const blob = new Blob([content], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}