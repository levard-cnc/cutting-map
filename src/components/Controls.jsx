import { useState } from "react";
import { saveCutFile } from "../utils/fileIO";

export default function Controls({
  basic,
  sub,
  finals,
  onAdd,
  details,
  setDetails
}) {
  const [basicTpl, setBasicTpl] = useState("");
  const [subTpl, setSubTpl] = useState("");
  const [finalTpl, setFinalTpl] = useState("");

  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");

  const [glass, setGlass] = useState(false);

  const [diag, setDiag] = useState(false);
  const [vert, setVert] = useState(false);
  const [horiz, setHoriz] = useState(false);

  const [knife, setKnife] = useState("12");

  const [filename, setFilename] = useState("cut.txt");
  const [addDate, setAddDate] = useState(false);

  function validate() {
    if (!basicTpl || !subTpl) {
      alert("Выберите шаблоны");
      return false;
    }
    if (width <= 0 || height <= 0) {
      alert("Некорректные размеры");
      return false;
    }
    return true;
  }

  function addDetail() {
    if (!validate()) return;

    onAdd({
      basic: basicTpl,
      sub: subTpl,
      final: finalTpl,
      width: Number(width),
      height: Number(height),
      glass,
      diag,
      vert,
      horiz,
      knife: Number(knife),
      thermo: diag || vert || horiz
    });
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
          w: Number(p[9]),
          h: Number(p[10]),
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
        <select value={basicTpl} onChange={e => setBasicTpl(e.target.value)}>
          <option value="">—</option>
          {basic.map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>

        <label>Производный шаблон</label>
        <select value={subTpl} onChange={e => setSubTpl(e.target.value)}>
          <option value="">—</option>
          {sub.filter(s => s.from === basicTpl).map((s, i) => (
            <option key={i} value={s.to}>{s.to}</option>
          ))}
        </select>

        <label>Конечный шаблон</label>
        <select value={finalTpl} onChange={e => setFinalTpl(e.target.value)}>
          <option value="">Авто</option>
          {finals.filter(f => f.from === subTpl).map((f, i) => (
            <option key={i} value={f.to}>{f.to}</option>
          ))}
        </select>
      </div>

      <div className="group">
        <div className="group-title">Термошвы</div>
        <label><input type="checkbox" checked={diag} onChange={e => setDiag(e.target.checked)} /> Диагональный</label>
        <label><input type="checkbox" checked={vert} onChange={e => setVert(e.target.checked)} /> Вертикальный</label>
        <label><input type="checkbox" checked={horiz} onChange={e => setHoriz(e.target.checked)} /> Горизонтальный</label>
      </div>

      <div className="group">
        <div className="group-title">Размеры</div>

        <label>Ширина, мм</label>
        <input type="number" value={width} onChange={e => setWidth(e.target.value)} />

        <label>Длина, мм</label>
        <input type="number" value={height} onChange={e => setHeight(e.target.value)} />

        <label className="checkbox">
          <input type="checkbox" checked={glass} onChange={e => setGlass(e.target.checked)} />
          Фасад "под стекло"
        </label>

        <label>Диаметр ножа</label>
        <select value={knife} onChange={e => setKnife(e.target.value)}>
          <option value="12">12</option>
          <option value="8">8</option>
          <option value="6">6</option>
        </select>

        <button className="full" onClick={addDetail}>Добавить</button>
      </div>

      <div className="group">
        <div className="group-title">Список деталей</div>
        <div className="list">
          {details.map((d, i) => (
            <div key={i} className="list-item">
              {i}: {d.w}×{d.h} ({d.final})
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

        <input
          value={filename}
          onChange={e => setFilename(e.target.value)}
          placeholder="Имя файла"
        />

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