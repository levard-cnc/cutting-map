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
  return lines.map(l => {
    const rest = l.substring(60);
    const m = rest.match(/\s*(\d+)\s+(\d+)(True|False)/);
    return {
      sub: l.substring(0, 30).trim(),
      final: l.substring(30, 60).trim(),
      min: m ? Number(m[1]) : 0,
      max: m ? Number(m[2]) : 0,
      glass: m ? m[3] === "True" : false
    };
  });
}