import { useEffect, useState } from "react";
import { loadLines, loadPairs, loadSizes } from "./data/loaders";
import { selectFinalTemplate } from "./utils/sizeSelector";
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

    function placeDetail(xMm, yMm) {
        if (!pending.width || !pending.height) return;

        const finalTemplate =
            pending.final ||
            selectFinalTemplate({
                subTemplate: pending.sub,
                width: pending.width,
                height: pending.height,
                glass: pending.glass,
                sizes
            });

        setDetails(prev => [
            ...prev,
            {
                ...pending,
                final: finalTemplate,
                x1: xMm,
                y1: yMm,
                x2: xMm + pending.width,
                y2: yMm + pending.height,
                cx1: xMm,
                cy1: yMm,
                cx2: xMm + pending.width,
                cy2: yMm + pending.height
            }
        ]);
    }

    return (
        <div className="app">
            <Controls
                basic={basic}
                sub={sub}
                finals={finals}
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