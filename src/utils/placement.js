/**
 * Логика размещения фасадов на листе раскроя.
 * Адаптировано из CNC_Coder (Unit1.pas — getlowxy / matrixsum / MyMouseDown).
 *
 * Координаты: (0,0) = нижний левый угол, X вправо, Y вверх.
 * Фасад «притягивается» к (0,0) — сканируем от клика влево и вниз,
 * чтобы деталь упёрлась левой и/или нижней гранью в край листа
 * или в существующие фасады.
 */

/** Прямоугольник (x,y,w,h) пересекается с каким-либо фасадом? */
function hasCollision(x, y, w, h, details) {
  return details.some(d =>
    x < d.x2 && x + w > d.x1 &&
    y < d.y2 && y + h > d.y1
  );
}

/** Прямоугольник помещается в границы листа? */
function fitsInSheet(x, y, w, h, sheetW, sheetH) {
  return x >= 0 && y >= 0 && x + w <= sheetW && y + h <= sheetH;
}

/** Позиция валидна: помещается в лист и не пересекается с фасадами */
function isValid(x, y, w, h, details, sheetW, sheetH) {
  return fitsInSheet(x, y, w, h, sheetW, sheetH) &&
         !hasCollision(x, y, w, h, details);
}

/**
 * Сканирование вдоль оси к 0 (аналог попиксельного сканирования в getlowxy).
 *
 * Из точки scanFrom двигаемся к 0 по оси. Находим ближайшую верхнюю/правую
 * границу занятого интервала, которая ≤ scanFrom, или возвращаем 0.
 *
 * fixedCoord — точка на перпендикулярной оси (одна строка/столбец),
 * как в оригинальном Pascal-сканировании по пиксельной матрице.
 */
function snapToward0(scanFrom, fixedCoord, axis, details) {
  let intervals;
  if (axis === 'y') {
    intervals = details
      .filter(d => fixedCoord >= d.x1 && fixedCoord < d.x2)
      .map(d => [d.y1, d.y2]);
  } else {
    intervals = details
      .filter(d => fixedCoord >= d.y1 && fixedCoord < d.y2)
      .map(d => [d.x1, d.x2]);
  }

  intervals.sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const [s, e] of intervals) {
    if (merged.length && s <= merged[merged.length - 1][1]) {
      merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], e);
    } else {
      merged.push([s, e]);
    }
  }

  let snap = 0;
  for (const [s, e] of merged) {
    if (e <= scanFrom) snap = e;
  }
  return snap;
}

/**
 * Найти позицию для размещения фасада.
 *
 * Из исходной позиции (клик) выполняем два поиска:
 *  А) «влево-вниз» — X влево до упора, затем Y вниз до упора
 *  Б) «вниз-влево» — Y вниз до упора, затем X влево до упора
 *
 * Из двух позиций выбираем лучшую: ту, у которой хотя бы одна координата
 * меньше (при равенстве — меньшая сумма x+y).
 *
 * Найденная позиция становится исходной для следующей итерации.
 * Итерации продолжаются, пока хотя бы одна координата уменьшается.
 *
 * Fallback: перебор кандидатов по рёбрам фасадов (наименьшая x+y).
 */
export function findPlacement(clickX, clickY, fullW, fullH, details, sheetW, sheetH) {
  const clickOccupied = details.some(d =>
    clickX >= d.x1 && clickX < d.x2 &&
    clickY >= d.y1 && clickY < d.y2
  );
  if (clickOccupied) return null;

  let curX = clickX;
  let curY = clickY;
  let best = null;

  for (let iter = 0; iter < 100; iter++) {
    let posA = null; // «влево-вниз»
    let posB = null; // «вниз-влево»

    // А) «влево-вниз» — сначала X влево, затем Y вниз по столбцу snapX
    {
      const sx = snapToward0(curX, curY, 'x', details);
      const sy = snapToward0(curY, sx, 'y', details);
      if (isValid(sx, sy, fullW, fullH, details, sheetW, sheetH)) {
        posA = { x: sx, y: sy };
      }
    }

    // Б) «вниз-влево» — сначала Y вниз, затем X влево по строке snapY
    {
      const sy = snapToward0(curY, curX, 'y', details);
      const sx = snapToward0(curX, sy, 'x', details);
      if (isValid(sx, sy, fullW, fullH, details, sheetW, sheetH)) {
        posB = { x: sx, y: sy };
      }
    }

    // Выбираем лучшую: та, у которой хотя бы одна координата меньше
    let chosen = null;
    if (posA && posB) {
      const aSum = posA.x + posA.y;
      const bSum = posB.x + posB.y;
      chosen = (aSum <= bSum) ? posA : posB;
    } else {
      chosen = posA || posB;
    }

    if (!chosen) break;

    best = chosen;

    // Продолжаем только если хотя бы одна координата уменьшилась
    if (chosen.x >= curX && chosen.y >= curY) break;
    curX = chosen.x;
    curY = chosen.y;
  }

  if (best) return best;

  // Fallback: перебор кандидатных позиций по рёбрам фасадов
  const xs = new Set([0]);
  const ys = new Set([0]);
  for (const d of details) {
    xs.add(d.x2);
    ys.add(d.y2);
  }

  let fallbackSum = Infinity;
  for (const cx of xs) {
    if (cx > clickX) continue;
    for (const cy of ys) {
      if (cy > clickY) continue;
      if (!isValid(cx, cy, fullW, fullH, details, sheetW, sheetH)) continue;
      const sum = cx + cy;
      if (sum < fallbackSum) {
        fallbackSum = sum;
        best = { x: cx, y: cy };
      }
    }
  }

  return best;
}