import { useEffect, useState } from "react";
import { loadLines, loadPairs, loadSizes } from "./data/loaders";
import { selectFinalTemplate } from "./utils/sizeSelector";
import Controls from "./components/Controls";
import CanvasSheet from "./components/CanvasSheet.jsx";
import "./styles.css";

export default function App() {
  const [basic, setBasic] = useState([]);
  const [sub, setSub] = useState([]);
  const [finals, setFinals] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [details, setDetails] = useState([]);

  // параметры выбранного фасада (НО ЕЩЁ НЕ РАЗМЕЩЁННОГО)
  const [pending, setPending] = useState(null);

  useEffect(() => {
    loadLines("basic.txt").then(setBasic);
    loadPairs("subbasic.txt").then(setSub);
    loadPairs("paintings.txt").then(setFinals);
    loadSizes("sizes.txt").then(setSizes);
  }, []);

  function placeDetailAt(x, y) {
    if (!pending) return;

    const autoFinal = selectFinalTemplate({
      subTemplate: pending.sub,
      width: pending.width,
      height: pending.height,
      glass: pending.glass,
      sizes
    });

    setDetails([
      ...details,
      {
        ...pending,
        final: pending.final || autoFinal,
        x1: x,
        y1: y,
        x2: x + pending.width,
        y2: y + pending.height,
        cx1: x,
        cy1: y,
        cx2: x + pending.width,
        cy2: y + pending.height
      }
    ]);

    setPending(null); // сбрасываем после размещения
  }

  return (
    <div className="app">
      <Controls
        basic={basic}
        sub={sub}
        finals={finals}
        onParamsChange={setPending}
        details={details}
        setDetails={setDetails}
      />
      <CanvasSheet
        details={details}
        pending={pending}
        onPlace={placeDetailAt}
      />
    </div>
  );
}