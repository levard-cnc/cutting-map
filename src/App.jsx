import { useEffect, useMemo, useState } from "react";
import { loadLines, loadPairs, loadSizes } from "./data/loaders";
import { selectFinalTemplate } from "./utils/sizeSelector";
import { findPlacement } from "./utils/placement";
import Controls from "./components/Controls.jsx";
import CanvasSheet from "./components/CanvasSheet.jsx";
import "./styles.css";

const SHEET_W = 2070; // мм
const SHEET_H = 2800; // мм

export default function App() {
    const [basic, setBasic] = useState([]);
    const [sub, setSub] = useState([]);
    const [finals, setFinals] = useState([]);
    const [sizes, setSizes] = useState([]);

    const [details, setDetails] = useState([]);

    // ТЕКУЩИЕ ПАРАМЕТРЫ ИЗ CONTROLS
    const [pending, setPending] = useState({
        basic: "",
        sub: "",
        final: "",
        width: 0,
        height: 0,
        glass: false,
        diag: false,
        vert: false,
        horiz: false,
        knife: 12
    });

    useEffect(() => {
        loadLines("basic.txt").then(setBasic);
        loadPairs("subbasic.txt").then(setSub);
        loadPairs("paintings.txt").then(setFinals);
        loadSizes("sizes.txt").then(setSizes);
    }, []);

    const autoFinal = useMemo(() => {
        if (!pending.sub || !pending.width || !pending.height) return "";
        return selectFinalTemplate({
            subTemplate: pending.sub,
            width: pending.width,
            height: pending.height,
            glass: pending.glass,
            sizes
        });
    }, [pending.sub, pending.width, pending.height, pending.glass, sizes]);

    function placeDetail(clickXMm, clickYMm) {
        if (!pending.width || !pending.height) return;

        const cutterW = pending.knife || 0;
        const fullW = pending.width + cutterW;
        const fullH = pending.height + cutterW;

        const pos = findPlacement(clickXMm, clickYMm, fullW, fullH, details, SHEET_W, SHEET_H);
        if (!pos) return;

        const finalTemplate = pending.final || autoFinal;

        setDetails(prev => [
            ...prev,
            {
                ...pending,
                final: finalTemplate,
                x1: pos.x,
                y1: pos.y,
                x2: pos.x + fullW,
                y2: pos.y + fullH,
                cx1: pos.x + cutterW / 2,
                cy1: pos.y + cutterW / 2,
                cx2: pos.x + fullW - cutterW / 2,
                cy2: pos.y + fullH - cutterW / 2,
                fullW,
                fullH
            }
        ]);
    }

    return (
        <div className="app">
            <Controls
                basic={basic}
                sub={sub}
                finals={finals}
                autoFinal={autoFinal}
                pending={pending}
                setPending={setPending}
                details={details}
                setDetails={setDetails}
            />

            <CanvasSheet
                sheetW={SHEET_W}
                sheetH={SHEET_H}
                pending={pending}
                details={details}
                onPlace={placeDetail}
            />
        </div>
    );
}