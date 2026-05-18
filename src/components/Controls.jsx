import { useState } from "react";
import { saveCutFile } from "../utils/fileIO";

export default function Controls({
                                   basic,
                                   sub,
                                   finals,
                                   autoFinal,
                                   pending,
                                   setPending,
                                   details,
                                   setDetails
                                 }) {
  const [filename, setFilename] = useState("cut.txt");
  const [addDate, setAddDate] = useState(false);

  function set(field, value) {
    setPending(prev => ({ ...prev, [field]: value }));
  }

  function undoLast() {
    setDetails(details.slice(0, -1));
  }

  function resetAll() {
    if (window.confirm("Сбросить весь раскрой?")) {
      setDetails([]);
    }
  }

  function saveFile() {
    let name = filename;
    if (addDate) {
      const d = new Date().toISOString().replace(/[:.]/g, "-");
      name = `${d}_${filename}`;
    }
    saveCutFile(details, name);
  }

  function loadFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const lines = reader.result.split(/\r?\n/).filter(Boolean);
      const loaded = lines.map(line => {
        const p = line.split(";");
        return {
          knife: Number(p[1]),
          basic: p[2],
          sub: p[3],
          final: p[4],
          thermo: p[5] === "THERMO",
          diag: p[6] === "V",
          vert: p[7] === "V",
          horiz: p[8] === "V",
          width: Number(p[9]),
          height: Number(p[10]),
          x1: Number(p[11]),
          y1: Number(p[12]),
          x2: Number(p[13]),
          y2: Number(p[14]),
          cx1: Number(p[15]),
          cy1: Number(p[16]),
          cx2: Number(p[17]),
          cy2: Number(p[18])
        };
      });
      setDetails(loaded);
    };
    reader.readAsText(file);
  }

  function sendToProcessing() {
    window.location.href =
        "mailto:cnc_auto_coder_diploma_levanyan@gmail.com" +
        "?subject=Раскрой" +
        "&body=Пожалуйста, прикрепите файл раскроя.";
  }

  return (
      <div className="controls">
        <h3>Раскрой листа</h3>

        <div className="group">
          <div className="group-title">Шаблоны</div>

          <label>Базовый шаблон</label>
          <select value={pending.basic} onChange={e => set("basic", e.target.value)}>
            <option value="">—</option>
            {basic.map(b => (
                <option key={b} value={b}>{b}</option>
            ))}
          </select>

          <label>Производный шаблон</label>
          <select value={pending.sub} onChange={e => set("sub", e.target.value)}>
            <option value="">—</option>
            {sub.filter(s => s.from === pending.basic).map((s, i) => (
                <option key={i} value={s.to}>{s.to}</option>
            ))}
          </select>

          <label>Конечный шаблон</label>
          <select value={pending.final || autoFinal} onChange={e => set("final", e.target.value)}>
            <option value=""></option>
            {finals.filter(f => f.from === pending.sub).map((f, i) => (
                <option key={i} value={f.to}>{f.to}</option>
            ))}
          </select>
        </div>

        <div className="group">
          <div className="group-title">Термошвы</div>
          <label><input type="checkbox" checked={pending.diag} onChange={e => set("diag", e.target.checked)} /> Диагональный</label>
          <label><input type="checkbox" checked={pending.vert} onChange={e => set("vert", e.target.checked)} /> Вертикальный</label>
          <label><input type="checkbox" checked={pending.horiz} onChange={e => set("horiz", e.target.checked)} /> Горизонтальный</label>
        </div>

        <div className="group">
          <div className="group-title">Размеры</div>

          <label>Ширина, мм</label>
          <input type="number" value={pending.width || ""} onChange={e => setPending(p => ({ ...p, width: Number(e.target.value), final: "" }))} />

          <label>Длина, мм</label>
          <input type="number" value={pending.height || ""} onChange={e => setPending(p => ({ ...p, height: Number(e.target.value), final: "" }))} />

          <label className="checkbox">
            <input type="checkbox" checked={pending.glass} onChange={e => setPending(p => ({ ...p, glass: e.target.checked, final: "" }))} />
            Фасад "под стекло"
          </label>

          <label>Диаметр ножа</label>
          <select value={pending.knife} onChange={e => set("knife", Number(e.target.value))}>
            <option value={12}>12</option>
            <option value={8}>8</option>
            <option value={6}>6</option>
          </select>

          <button onClick={() => setPending(p => ({ ...p, width: p.height, height: p.width, final: "" }))}>
            Поменять Ш↔В
          </button>
        </div>

        <div className="group">
          <div className="group-title">Список деталей</div>
          <div className="list">
            {details.map((d, i) => (
                <div key={i} className="list-item">
                  {d.final} ({d.width}x{d.height}) ({d.x1},{d.y1})-({d.x2},{d.y2})
                </div>
            ))}
          </div>

          <button onClick={undoLast}>Отменить</button>
          <button onClick={resetAll}>Сброс раскроя</button>
        </div>

        <div className="group">
          <label className="checkbox">
            <input type="checkbox" checked={addDate} onChange={e => setAddDate(e.target.checked)} />
            Добавить дату и время
          </label>

          <input value={filename} onChange={e => setFilename(e.target.value)} />

          <button onClick={saveFile}>Сохранить</button>

          <label>
            Загрузить
            <input type="file" accept=".txt" onChange={loadFile} hidden />
          </label>
        </div>

        <button className="full" onClick={sendToProcessing}>
          Отправить на обработку
        </button>
      </div>
  );
}