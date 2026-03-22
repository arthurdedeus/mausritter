"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const PORTRAITS = ["\uD83D\uDC2D", "\uD83D\uDC00", "\uD83D\uDDE1\uFE0F", "\uD83E\uDDC0", "\uD83C\uDFF0", "\uD83C\uDF3E", "\uD83C\uDF44", "\u2694\uFE0F", "\uD83D\uDEE1\uFE0F", "\uD83D\uDC3E"];
const SLOT_LABELS = ["Main Paw", "Body", "Off Paw", "Body", "Pack 1", "Pack 2", "Pack 3", "Pack 4"];

interface InventorySlot {
  item: string;
  dots: boolean[];
}

interface SheetData {
  name: string;
  background: string;
  birthsign: string;
  disposition: string;
  coat: string;
  look: string;
  strMax: string;
  strCur: string;
  dexMax: string;
  dexCur: string;
  wilMax: string;
  wilCur: string;
  hpCur: string;
  hpMax: string;
  pips: string;
  level: string;
  xp: string;
  grit: string;
  notes: string;
  inventory: InventorySlot[];
  conditions: string[];
  banked: string[];
  portraitIdx: number;
}

function createDefaultData(): SheetData {
  return {
    name: "",
    background: "",
    birthsign: "",
    disposition: "",
    coat: "",
    look: "",
    strMax: "10",
    strCur: "10",
    dexMax: "10",
    dexCur: "10",
    wilMax: "10",
    wilCur: "10",
    hpCur: "4",
    hpMax: "4",
    pips: "0",
    level: "1",
    xp: "0",
    grit: "0",
    notes: "",
    inventory: SLOT_LABELS.map(() => ({ item: "", dots: [false, false, false] })),
    conditions: [],
    banked: [],
    portraitIdx: 0,
  };
}

function storageKey(name: string): string {
  const slug = (name || "mouse").toLowerCase().replace(/\s+/g, "_");
  return `mausritter_${slug}`;
}

export default function CharacterSheet() {
  const [data, setData] = useState<SheetData>(createDefaultData);
  const [toast, setToast] = useState("");
  const [loaded, setLoaded] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    try {
      const lastKey =
        localStorage.getItem("mausritter_last") ?? sessionStorage.getItem("mausritter_last");
      if (lastKey) {
        const raw = localStorage.getItem(lastKey) ?? sessionStorage.getItem(lastKey);
        if (raw) setData({ ...createDefaultData(), ...JSON.parse(raw) });
      }
    } catch {
      /* empty */
    }
    setLoaded(true);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  }, []);

  const persistSilently = useCallback((sheetData: SheetData) => {
    const key = storageKey(sheetData.name);
    try {
      localStorage.setItem(key, JSON.stringify(sheetData));
      localStorage.setItem("mausritter_last", key);
    } catch {
      try {
        sessionStorage.setItem(key, JSON.stringify(sheetData));
        sessionStorage.setItem("mausritter_last", key);
      } catch {
        /* empty */
      }
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => persistSilently(data), 2000);
    return () => clearTimeout(autoSaveTimer.current);
  }, [data, loaded, persistSilently]);

  function update<K extends keyof SheetData>(field: K, value: SheetData[K]) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  function updateInventoryItem(index: number, item: string) {
    setData((prev) => {
      const inventory = [...prev.inventory];
      inventory[index] = { ...inventory[index], item };
      return { ...prev, inventory };
    });
  }

  function toggleDot(slotIndex: number, dotIndex: number) {
    setData((prev) => {
      const inventory = [...prev.inventory];
      const dots = [...inventory[slotIndex].dots];
      dots[dotIndex] = !dots[dotIndex];
      inventory[slotIndex] = { ...inventory[slotIndex], dots };
      return { ...prev, inventory };
    });
  }

  function addCondition() {
    setData((prev) => ({ ...prev, conditions: [...prev.conditions, ""] }));
  }

  function updateCondition(index: number, value: string) {
    setData((prev) => {
      const conditions = [...prev.conditions];
      conditions[index] = value;
      return { ...prev, conditions };
    });
  }

  function removeCondition(index: number) {
    setData((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index),
    }));
  }

  function addBankedItem() {
    setData((prev) => ({ ...prev, banked: [...prev.banked, ""] }));
  }

  function updateBankedItem(index: number, value: string) {
    setData((prev) => {
      const banked = [...prev.banked];
      banked[index] = value;
      return { ...prev, banked };
    });
  }

  function removeBankedItem(index: number) {
    setData((prev) => ({
      ...prev,
      banked: prev.banked.filter((_, i) => i !== index),
    }));
  }

  function save() {
    persistSilently(data);
    showToast("Ficha salva \u2713");
  }

  function clearSheet() {
    if (window.confirm("Limpar toda a ficha? Isso n\u00e3o pode ser desfeito.")) {
      setData(createDefaultData());
      showToast("Ficha limpa");
    }
  }

  const hpCur = parseInt(data.hpCur) || 0;
  const hpMax = parseInt(data.hpMax) || 1;
  const hpPct = Math.max(0, Math.min(100, (hpCur / hpMax) * 100));

  if (!loaded) return null;

  const attrs = [
    { name: "STR", max: data.strMax, cur: data.strCur, maxKey: "strMax" as const, curKey: "strCur" as const },
    { name: "DEX", max: data.dexMax, cur: data.dexCur, maxKey: "dexMax" as const, curKey: "dexCur" as const },
    { name: "WIL", max: data.wilMax, cur: data.wilCur, maxKey: "wilMax" as const, curKey: "wilCur" as const },
  ];

  return (
    <>
      <div className="sheet">
        <div className="header">
          <h1>Mausritter</h1>
          <div className="subtitle">Ficha de Personagem</div>
        </div>

        {/* Identity */}
        <div className="section">
          <div className="section-title">Identidade</div>
          <div className="portrait-area">
            <div
              className="portrait-box"
              onClick={() => update("portraitIdx", (data.portraitIdx + 1) % PORTRAITS.length)}
              title="Toque para mudar retrato"
            >
              <span className="placeholder">{PORTRAITS[data.portraitIdx]}</span>
            </div>
            <div className="portrait-details">
              <div className="field">
                <label>Nome</label>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Ex: Hazel Oakwhisker"
                />
              </div>
              <div className="field">
                <label>Background</label>
                <input
                  type="text"
                  value={data.background}
                  onChange={(e) => update("background", e.target.value)}
                  placeholder="Ex: Apothecary's apprentice"
                />
              </div>
            </div>
          </div>
          <div className="identity-grid" style={{ marginTop: 8 }}>
            <div className="field">
              <label>Signo</label>
              <input
                type="text"
                value={data.birthsign}
                onChange={(e) => update("birthsign", e.target.value)}
                placeholder="Ex: Acorn"
              />
            </div>
            <div className="field">
              <label>Disposição</label>
              <input
                type="text"
                value={data.disposition}
                onChange={(e) => update("disposition", e.target.value)}
                placeholder="Ex: Inquisitive"
              />
            </div>
            <div className="field">
              <label>Pelagem</label>
              <input
                type="text"
                value={data.coat}
                onChange={(e) => update("coat", e.target.value)}
                placeholder="Ex: Tan brindle"
              />
            </div>
            <div className="field">
              <label>Aparência</label>
              <input
                type="text"
                value={data.look}
                onChange={(e) => update("look", e.target.value)}
                placeholder="Ex: Scarred body"
              />
            </div>
          </div>
        </div>

        <div className="ornament">{"\u00b7 \u00b7 \u00b7"}</div>

        {/* Attributes */}
        <div className="section">
          <div className="section-title">Atributos</div>
          <div className="attributes-row">
            {attrs.map((attr) => (
              <div className="attr-card" key={attr.name}>
                <div className="attr-name">{attr.name}</div>
                <div className="attr-values">
                  <div className="max-val">
                    <label>Max</label>
                    <input
                      type="number"
                      value={attr.max}
                      onChange={(e) => update(attr.maxKey, e.target.value)}
                      min={1}
                      max={18}
                    />
                  </div>
                  <div className="cur-val">
                    <label>Atual</label>
                    <input
                      type="number"
                      value={attr.cur}
                      onChange={(e) => update(attr.curKey, e.target.value)}
                      min={0}
                      max={18}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hp-section">
            <div className="hp-header">
              <div className="attr-name">HP</div>
              <div className="hp-inputs">
                <div style={{ textAlign: "center" }}>
                  <label>Atual</label>
                  <input
                    type="number"
                    value={data.hpCur}
                    onChange={(e) => update("hpCur", e.target.value)}
                    min={0}
                    max={18}
                  />
                </div>
                <span className="separator">/</span>
                <div style={{ textAlign: "center" }}>
                  <label>Max</label>
                  <input
                    type="number"
                    value={data.hpMax}
                    onChange={(e) => update("hpMax", e.target.value)}
                    min={1}
                    max={18}
                  />
                </div>
              </div>
            </div>
            <div className="hp-bar-track">
              <div
                className={`hp-bar-fill${hpPct <= 30 ? " danger" : ""}`}
                style={{ width: `${hpPct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="ornament">{"\u00b7 \u00b7 \u00b7"}</div>

        {/* Inventory */}
        <div className="section">
          <div className="section-title">Inventário</div>
          <div className="carried-labels">
            <span className="carried-label">
              <strong>Paw:</strong> Pronto para uso
            </span>
            <span className="carried-label">
              <strong>Body:</strong> Rápido de pegar
            </span>
            <span className="carried-label">
              <strong>Pack:</strong> Demora para pegar
            </span>
          </div>
          <div className="inventory-grid">
            {data.inventory.map((slot, i) => (
              <div className="inv-slot" key={i}>
                <div className="inv-slot-label">{SLOT_LABELS[i]}</div>
                <input
                  type="text"
                  value={slot.item}
                  onChange={(e) => updateInventoryItem(i, e.target.value)}
                  placeholder="—"
                />
                <div className="usage-dots">
                  {slot.dots.map((filled, j) => (
                    <div
                      key={j}
                      className={`usage-dot${filled ? " filled" : ""}`}
                      onClick={() => toggleDot(i, j)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pips-row">
            <label>Pips</label>
            <input
              type="number"
              value={data.pips}
              onChange={(e) => update("pips", e.target.value)}
              min={0}
            />
            <span className="pip-note">/ 250 = 1 XP</span>
          </div>
        </div>

        <div className="ornament">{"\u00b7 \u00b7 \u00b7"}</div>

        {/* Progress */}
        <div className="section">
          <div className="section-title">Progresso</div>
          <div className="progress-grid">
            <div className="progress-card">
              <label>Level</label>
              <input
                type="number"
                value={data.level}
                onChange={(e) => update("level", e.target.value)}
                min={1}
                max={10}
              />
            </div>
            <div className="progress-card">
              <label>XP</label>
              <input
                type="number"
                value={data.xp}
                onChange={(e) => update("xp", e.target.value)}
                min={0}
              />
              <div className="progress-note">Tesouro recuperado</div>
            </div>
            <div className="progress-card">
              <label>Grit</label>
              <input
                type="number"
                value={data.grit}
                onChange={(e) => update("grit", e.target.value)}
                min={0}
                max={3}
              />
              <div className="progress-note">Ignora condições</div>
            </div>
          </div>
        </div>

        <div className="ornament">{"\u00b7 \u00b7 \u00b7"}</div>

        {/* Conditions */}
        <div className="section">
          <div className="section-title">Condições</div>
          <div className="conditions-list">
            {data.conditions.map((cond, i) => (
              <div className="condition-slot" key={i}>
                <button className="remove-btn" onClick={() => removeCondition(i)}>
                  {"✕"}
                </button>
                <input
                  type="text"
                  value={cond}
                  onChange={(e) => updateCondition(i, e.target.value)}
                  placeholder="Ex: Exhausted, Frightened, Injured..."
                />
              </div>
            ))}
          </div>
          <button className="add-btn" onClick={addCondition} style={{ marginTop: 8 }}>
            + Adicionar Condição
          </button>
        </div>

        <div className="ornament">{"\u00b7 \u00b7 \u00b7"}</div>

        {/* Banked Items */}
        <div className="section">
          <div className="section-title">Itens Guardados</div>
          <div className="banked-list">
            {data.banked.map((item, i) => (
              <div className="banked-item" key={i}>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateBankedItem(i, e.target.value)}
                  placeholder="Item guardado..."
                />
                <button className="remove-btn" onClick={() => removeBankedItem(i)}>
                  {"✕"}
                </button>
              </div>
            ))}
          </div>
          <button className="add-btn" onClick={addBankedItem} style={{ marginTop: 8 }}>
            + Adicionar Item
          </button>
        </div>

        <div className="ornament">{"\u00b7 \u00b7 \u00b7"}</div>

        {/* Notes */}
        <div className="section">
          <div className="section-title">Anotações</div>
          <textarea
            value={data.notes}
            onChange={(e) => update("notes", e.target.value)}
            placeholder="Anotações de sessão, NPCs, locais..."
          />
        </div>
      </div>

      <div className={`toast${toast ? " show" : ""}`}>{toast}</div>

      <div className="footer-actions">
        <button className="secondary" onClick={clearSheet}>
          Limpar
        </button>
        <button onClick={save}>Salvar</button>
      </div>
    </>
  );
}
