import { useLayoutEffect, useRef } from "react";

/**
 * Отрисовка надписи по центру фасада (аналог outfasadetitle_new).
 *
 * Приоритет стратегий (шрифт 18→12):
 *  1. Горизонтально, одна строка — максимально возможный шрифт 18..12
 *  2. Вертикально, одна строка   — максимально возможный шрифт 18..12
 *  3. Горизонтально, перенос строк (W / × / H) — шрифт 18..12
 *  4. Вертикально, перенос строк — шрифт 18..12
 *  5. Fallback: уменьшаем шрифт ниже 12 до тех пор, пока текст не влезет
 */
function drawFacadeTitle(ctx, d, rx, ry, rw, rh, _scale) {
    const FONT_FAMILY = "Courier, monospace";
    const MAX_FONT = 18;
    const MIN_FONT = 12;
    const ABS_MIN  = 6;

    const sizeStr = `${d.width}×${d.height}`;
    const lines   = [`${d.width}`, "×", `${d.height}`];

    ctx.fillStyle    = "#333";
    ctx.textBaseline = "middle";
    ctx.textAlign    = "center";

    /** Вспомогательная: измерить текст при заданном размере шрифта */
    function measure(text, fs) {
        ctx.font = `${fs}px ${FONT_FAMILY}`;
        return ctx.measureText(text).width;
    }
    function lh(fs) { return fs * 1.25; }

    // --- 1. Горизонтально, одна строка, шрифт 18→12 ---
    for (let fs = MAX_FONT; fs >= MIN_FONT; fs--) {
        const tw = measure(sizeStr, fs);
        if (tw <= rw && lh(fs) <= rh) {
            ctx.font = `${fs}px ${FONT_FAMILY}`;
            ctx.fillText(sizeStr, rx + rw / 2, ry + rh / 2);
            return;
        }
    }

    // --- 2. Вертикально, одна строка, шрифт 18→12 ---
    for (let fs = MAX_FONT; fs >= MIN_FONT; fs--) {
        const tw = measure(sizeStr, fs);
        if (tw <= rh && lh(fs) <= rw) {
            ctx.font = `${fs}px ${FONT_FAMILY}`;
            ctx.save();
            ctx.translate(rx + rw / 2, ry + rh / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.fillText(sizeStr, 0, 0);
            ctx.restore();
            return;
        }
    }

    // --- 3. Горизонтально, перенос строк, шрифт 18→12 ---
    for (let fs = MAX_FONT; fs >= MIN_FONT; fs--) {
        const maxW = Math.max(...lines.map(l => measure(l, fs)));
        const totH = lines.length * lh(fs);
        if (maxW <= rw && totH <= rh) {
            ctx.font = `${fs}px ${FONT_FAMILY}`;
            const step = lh(fs);
            const startY = ry + (rh - totH) / 2 + step / 2;
            lines.forEach((line, i) => {
                ctx.fillText(line, rx + rw / 2, startY + i * step);
            });
            return;
        }
    }

    // --- 4. Вертикально, перенос строк, шрифт 18→12 ---
    for (let fs = MAX_FONT; fs >= MIN_FONT; fs--) {
        const maxW = Math.max(...lines.map(l => measure(l, fs)));
        const totH = lines.length * lh(fs);
        if (maxW <= rh && totH <= rw) {
            ctx.font = `${fs}px ${FONT_FAMILY}`;
            ctx.save();
            ctx.translate(rx + rw / 2, ry + rh / 2);
            ctx.rotate(-Math.PI / 2);
            const step = lh(fs);
            const startY = -(totH - step) / 2;
            lines.forEach((line, i) => {
                ctx.fillText(line, 0, startY + i * step);
            });
            ctx.restore();
            return;
        }
    }

    // --- 5. Fallback: уменьшаем шрифт ниже 12 ---
    for (let fs = MIN_FONT - 1; fs >= ABS_MIN; fs--) {
        const tw = measure(sizeStr, fs);
        if (tw <= rw && lh(fs) <= rh) {
            ctx.font = `${fs}px ${FONT_FAMILY}`;
            ctx.fillText(sizeStr, rx + rw / 2, ry + rh / 2);
            return;
        }
        if (tw <= rh && lh(fs) <= rw) {
            ctx.font = `${fs}px ${FONT_FAMILY}`;
            ctx.save();
            ctx.translate(rx + rw / 2, ry + rh / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.fillText(sizeStr, 0, 0);
            ctx.restore();
            return;
        }
    }

    // Совсем крохотный фасад — минимальный шрифт
    ctx.font = `${ABS_MIN}px ${FONT_FAMILY}`;
    ctx.fillText(sizeStr, rx + rw / 2, ry + rh / 2);
}

export default function CanvasSheet({
                                        sheetW,
                                        sheetH,
                                        pending,
                                        details,
                                        onPlace
                                    }) {
    const canvasRef = useRef(null);
    const scaleRef = useRef(1);

    function resizeAndRedraw() {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const vw = window.innerWidth * 0.8;
        const vh = window.innerHeight * 0.8;

        const sheetRatio = sheetW / sheetH;

        let drawW, drawH;

        if (vw / vh > sheetRatio) {
            drawH = vh;
            drawW = drawH * sheetRatio;
        } else {
            drawW = vw;
            drawH = drawW / sheetRatio;
        }

        drawW = Math.round(drawW);
        drawH = Math.round(drawH);

        // ВАЖНО: размеры canvas ДО отрисовки
        canvas.width = drawW;
        canvas.height = drawH;

        // стабильный масштаб
        scaleRef.current = sheetW / drawW;

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, drawW, drawH);

        ctx.strokeStyle = "#000";
        ctx.lineWidth = 1;

        // рамка листа
        ctx.strokeRect(0, 0, drawW, drawH);

        // детали (Y инвертирован: 0,0 — нижний левый угол)
        details.forEach(d => {
            const scale = scaleRef.current;

            // Пересчёт Y: экранный Y = (sheetH - логический Y) / scale
            const ex1 = d.x1 / scale;
            const ey1 = (sheetH - d.y2) / scale;
            const ew  = (d.x2 - d.x1) / scale;
            const eh  = (d.y2 - d.y1) / scale;

            // Внешний прямоугольник (полный размер с учётом реза) — красный
            ctx.strokeStyle = "#e00";
            ctx.lineWidth = 1;
            ctx.strokeRect(ex1, ey1, ew, eh);

            // Внутренний прямоугольник (чистый размер фасада) — зелёный
            const icx1 = d.cx1 / scale;
            const icy1 = (sheetH - d.cy2) / scale;
            const icw  = (d.cx2 - d.cx1) / scale;
            const ich  = (d.cy2 - d.cy1) / scale;
            ctx.strokeStyle = "#0a0";
            ctx.strokeRect(icx1, icy1, icw, ich);

            // --- Надпись по центру фасада (аналог outfasadetitle_new) ---
            drawFacadeTitle(ctx, d, icx1, icy1, icw, ich, scale);
        });
    }

    // useLayoutEffect — КЛЮЧЕВО
    useLayoutEffect(() => {
        resizeAndRedraw();
        window.addEventListener("resize", resizeAndRedraw);
        return () => window.removeEventListener("resize", resizeAndRedraw);
    }, [details]);

    function handleClick(e) {
        if (!pending.width || !pending.height) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();

        const xPx = e.clientX - rect.left;
        const yPx = e.clientY - rect.top;

        const scale = scaleRef.current;

        // Координаты клика в мм, Y инвертирован (0,0 — нижний левый угол)
        const xMm = Math.round(xPx * scale);
        const yMm = Math.round((canvas.height - yPx) * scale);

        onPlace(xMm, yMm);
    }

    return (
        <div>
            <div> { pending.width } </div>
            <div> { pending.height } </div>
            <div
                style={{
                    width: "80vw",
                    height: "80vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                }}
            >
                <canvas
                    ref={canvasRef}
                    onClick={handleClick}
                    style={{
                        border: "1px solid #444",
                        background: "#fff"
                    }}
                />
            </div>
        </div>
    );
}