import { useLayoutEffect, useRef } from "react";

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

        // детали
        details.forEach(d => {
            ctx.strokeRect(
                d.x1 / scaleRef.current,
                d.y1 / scaleRef.current,
                d.width / scaleRef.current,
                d.height / scaleRef.current
            );
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

        const xMm = Math.round(xPx * scale);
        const yMm = Math.round(yPx * scale);

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