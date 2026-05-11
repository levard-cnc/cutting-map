export function selectFinalTemplate({
  subTemplate,
  width,
  height,
  glass,
  sizes
}) {
  const minSize = Math.min(width, height);

  let candidates = sizes.filter(s =>
    s.sub === subTemplate &&
    minSize >= s.min &&
    minSize <= s.max
  );

  if (glass) {
    const glassOnes = candidates.filter(c => c.glass);
    if (glassOnes.length) return glassOnes[0].final;
  }

  candidates = candidates.filter(c => !c.glass);
  return candidates.length ? candidates[0].final : "";
}