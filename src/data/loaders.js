export async function loadLines(path) {
  const res = await fetch(path);
  const text = await res.text();
  return text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
}

export async function loadPairs(path) {
  const lines = await loadLines(path);
  const result = [];
  for (let i = 0; i < lines.length; i += 2) {
    result.push({ from: lines[i], to: lines[i + 1] });
  }
  return result;
}

export async function loadSizes(path) {
  const lines = await loadLines(path);
  return lines.map(l => ({
    sub: l.substring(0, 30).trim(),
    final: l.substring(30, 60).trim(),
    min: Number(l.substring(60, 65)),
    max: Number(l.substring(65, 71)),
    glass: l.substring(71).includes("True")
  }));
}