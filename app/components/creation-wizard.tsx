"use client";

import { useState, useCallback } from "react";
import {
  BIRTHSIGNS,
  COAT_COLORS,
  COAT_PATTERNS,
  PHYSICAL_DETAILS,
  BACKGROUNDS,
  WEAPONS,
  type BackgroundEntry,
} from "../data/mausritter-tables";

interface InventorySlot {
  item: string;
  dots: boolean[];
}

export interface WizardResult {
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
  inventory: InventorySlot[];
}

interface CreationWizardProps {
  onComplete: (data: WizardResult) => void;
  onCancel: () => void;
}

type AttrKey = "str" | "dex" | "wil";
const ATTR_KEYS: AttrKey[] = ["str", "dex", "wil"];

interface AttrRoll {
  dice: number[];
  value: number;
}

function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

function sumHighestTwo(dice: number[]): number {
  const sorted = [...dice].sort((a, b) => b - a);
  return sorted[0] + sorted[1];
}

export default function CreationWizard({
  onComplete,
  onCancel,
}: CreationWizardProps) {
  const [step, setStep] = useState(1);
  const [hasProgress, setHasProgress] = useState(false);

  const [attrRolls, setAttrRolls] = useState<Record<AttrKey, AttrRoll | null>>(
    { str: null, dex: null, wil: null },
  );
  const [swapMode, setSwapMode] = useState(false);
  const [swapFirst, setSwapFirst] = useState<AttrKey | null>(null);

  const [hpRoll, setHpRoll] = useState<number | null>(null);
  const [pipsRoll, setPipsRoll] = useState<number | null>(null);

  const [selectedWeapon, setSelectedWeapon] = useState<number | null>(null);
  const [bonusBg, setBonusBg] = useState<BackgroundEntry | null>(null);
  const [bonusChoice, setBonusChoice] = useState<"A" | "B" | null>(null);

  const [birthsignRoll, setBirthsignRoll] = useState<number | null>(null);
  const [coatColorRoll, setCoatColorRoll] = useState<number | null>(null);
  const [coatPatternRoll, setCoatPatternRoll] = useState<number | null>(null);
  const [lookRoll, setLookRoll] = useState<[number, number] | null>(null);
  const [charName, setCharName] = useState("");

  const [birthsignOverride, setBirthsignOverride] = useState("");
  const [coatOverride, setCoatOverride] = useState("");
  const [lookOverride, setLookOverride] = useState("");
  const [dispositionOverride, setDispositionOverride] = useState("");

  const allAttrsRolled =
    attrRolls.str !== null &&
    attrRolls.dex !== null &&
    attrRolls.wil !== null;

  const handleCancel = useCallback(() => {
    if (hasProgress) {
      if (
        window.confirm(
          "Cancelar criação? Os dados rolados serão perdidos.",
        )
      ) {
        onCancel();
      }
    } else {
      onCancel();
    }
  }, [hasProgress, onCancel]);

  function rollAttr(attr: AttrKey) {
    const dice = [rollDie(6), rollDie(6), rollDie(6)];
    setAttrRolls((prev) => ({
      ...prev,
      [attr]: { dice, value: sumHighestTwo(dice) },
    }));
    setHasProgress(true);
  }

  function handleSwapTap(attr: AttrKey) {
    if (!swapMode) return;
    if (swapFirst === null) {
      setSwapFirst(attr);
    } else if (swapFirst === attr) {
      setSwapFirst(null);
    } else {
      setAttrRolls((prev) => ({
        ...prev,
        [swapFirst]: prev[attr],
        [attr]: prev[swapFirst],
      }));
      setSwapMode(false);
      setSwapFirst(null);
    }
  }

  const background =
    hpRoll !== null && pipsRoll !== null
      ? BACKGROUNDS[hpRoll - 1][pipsRoll - 1]
      : null;

  const highestAttr = allAttrsRolled
    ? Math.max(
        attrRolls.str!.value,
        attrRolls.dex!.value,
        attrRolls.wil!.value,
      )
    : 0;

  const needsBonus = highestAttr <= 9;
  const needsBothBonus = highestAttr <= 7;

  function canProceedStep3(): boolean {
    if (selectedWeapon === null) return false;
    if (needsBonus && bonusBg === null) return false;
    if (needsBonus && !needsBothBonus && bonusChoice === null) return false;
    return true;
  }

  function handleComplete() {
    if (
      !allAttrsRolled ||
      hpRoll === null ||
      pipsRoll === null ||
      !charName.trim()
    )
      return;

    const birthsign =
      birthsignOverride ||
      (birthsignRoll !== null ? BIRTHSIGNS[birthsignRoll - 1].sign : "");
    const disposition =
      dispositionOverride ||
      (birthsignRoll !== null
        ? `${BIRTHSIGNS[birthsignRoll - 1].dispositionPositive} / ${BIRTHSIGNS[birthsignRoll - 1].dispositionNegative}`
        : "");
    const coat =
      coatOverride ||
      (coatColorRoll !== null && coatPatternRoll !== null
        ? `${COAT_COLORS[coatColorRoll - 1]} ${COAT_PATTERNS[coatPatternRoll - 1]}`
        : "");
    const look =
      lookOverride ||
      (lookRoll !== null
        ? PHYSICAL_DETAILS[`${lookRoll[0]}${lookRoll[1]}`] || ""
        : "");

    const weapon = selectedWeapon !== null ? WEAPONS[selectedWeapon] : null;
    const inventory: InventorySlot[] = Array.from({ length: 8 }, () => ({
      item: "",
      dots: [false, false, false],
    }));

    if (weapon) {
      inventory[0] = {
        item: `${weapon.name} (${weapon.damage})`,
        dots: [false, false, false],
      };
      if (weapon.slots.length > 1) {
        inventory[2] = {
          item: `${weapon.name} (2nd slot)`,
          dots: [false, false, false],
        };
      }
    }

    const itemsToPlace: string[] = [];
    if (background) {
      itemsToPlace.push(background.itemA);
      itemsToPlace.push(background.itemB);
    }
    itemsToPlace.push("Torches");
    itemsToPlace.push("Rations");

    if (needsBonus && bonusBg) {
      if (needsBothBonus) {
        itemsToPlace.push(bonusBg.itemA);
        itemsToPlace.push(bonusBg.itemB);
      } else if (bonusChoice === "A") {
        itemsToPlace.push(bonusBg.itemA);
      } else if (bonusChoice === "B") {
        itemsToPlace.push(bonusBg.itemB);
      }
    }

    let slotIdx = 0;
    for (const item of itemsToPlace) {
      while (slotIdx < 8 && inventory[slotIdx].item !== "") slotIdx++;
      if (slotIdx < 8) {
        inventory[slotIdx] = { item, dots: [false, false, false] };
        slotIdx++;
      }
    }

    onComplete({
      name: charName.trim(),
      background: background?.name || "",
      birthsign,
      disposition,
      coat,
      look,
      strMax: String(attrRolls.str!.value),
      strCur: String(attrRolls.str!.value),
      dexMax: String(attrRolls.dex!.value),
      dexCur: String(attrRolls.dex!.value),
      wilMax: String(attrRolls.wil!.value),
      wilCur: String(attrRolls.wil!.value),
      hpMax: String(hpRoll),
      hpCur: String(hpRoll),
      pips: String(pipsRoll),
      inventory,
    });
  }

  return (
    <div className="wizard-overlay">
      <div className="wizard-header">
        <button className="wizard-close" onClick={handleCancel}>
          {"\u2715"}
        </button>
        <div className="wizard-title">Criar Personagem</div>
        <div className="wizard-steps">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`wizard-step-dot${step === s ? " active" : ""}${step > s ? " done" : ""}`}
            />
          ))}
        </div>
      </div>

      <div className="wizard-body">
        {step === 1 && (
          <div className="wizard-step-content">
            <h2 className="wizard-step-title">Atributos</h2>
            <p className="wizard-step-desc">
              Role 3d6 para cada atributo. Os 2 maiores dados são somados.
            </p>

            <div className="wizard-attr-cards">
              {ATTR_KEYS.map((attr) => {
                const roll = attrRolls[attr];
                const isSwapTarget = swapMode && swapFirst === attr;
                return (
                  <div
                    key={attr}
                    className={`wizard-card wizard-attr-card${isSwapTarget ? " swap-selected" : ""}${swapMode ? " swappable" : ""}`}
                    onClick={() => handleSwapTap(attr)}
                  >
                    <div className="wizard-attr-name">{attr.toUpperCase()}</div>
                    {roll ? (
                      <>
                        <div className="wizard-dice-display">
                          {[...roll.dice]
                            .map((val, idx) => ({ val, idx }))
                            .sort((a, b) => b.val - a.val)
                            .map((d, rank) => (
                              <span
                                key={d.idx}
                                className={`wizard-die${rank < 2 ? " kept" : " dropped"}`}
                              >
                                {d.val}
                              </span>
                            ))}
                        </div>
                        <div className="wizard-attr-value">{roll.value}</div>
                        <button
                          className="wizard-reroll-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            rollAttr(attr);
                          }}
                        >
                          Rolar Novamente
                        </button>
                      </>
                    ) : (
                      <button
                        className="wizard-roll-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          rollAttr(attr);
                        }}
                      >
                        Rolar 3d6
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {allAttrsRolled && (
              <div className="wizard-swap-area">
                {!swapMode ? (
                  <button
                    className="wizard-swap-btn"
                    onClick={() => setSwapMode(true)}
                  >
                    Trocar Valores
                  </button>
                ) : (
                  <p className="wizard-swap-hint">
                    Toque em dois atributos para trocar seus valores
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="wizard-step-content">
            <h2 className="wizard-step-title">HP, Pips e Antecedente</h2>
            <p className="wizard-step-desc">
              Role d6 para HP e d6 para Pips. O resultado determina seu
              antecedente.
            </p>

            <div className="wizard-hp-pips-row">
              <div className="wizard-card wizard-roll-card">
                <div className="wizard-attr-name">HP</div>
                {hpRoll !== null ? (
                  <>
                    <div className="wizard-attr-value">{hpRoll}</div>
                    <button
                      className="wizard-reroll-btn"
                      onClick={() => {
                        setHpRoll(rollDie(6));
                        setHasProgress(true);
                      }}
                    >
                      Rolar Novamente
                    </button>
                  </>
                ) : (
                  <button
                    className="wizard-roll-btn"
                    onClick={() => {
                      setHpRoll(rollDie(6));
                      setHasProgress(true);
                    }}
                  >
                    Rolar d6
                  </button>
                )}
              </div>
              <div className="wizard-card wizard-roll-card">
                <div className="wizard-attr-name">PIPS</div>
                {pipsRoll !== null ? (
                  <>
                    <div className="wizard-attr-value">{pipsRoll}</div>
                    <button
                      className="wizard-reroll-btn"
                      onClick={() => {
                        setPipsRoll(rollDie(6));
                        setHasProgress(true);
                      }}
                    >
                      Rolar Novamente
                    </button>
                  </>
                ) : (
                  <button
                    className="wizard-roll-btn"
                    onClick={() => {
                      setPipsRoll(rollDie(6));
                      setHasProgress(true);
                    }}
                  >
                    Rolar d6
                  </button>
                )}
              </div>
            </div>

            {background && (
              <div className="wizard-background-result">
                <div className="wizard-bg-name">{background.name}</div>
                <div className="wizard-bg-items">
                  <span className="wizard-bg-item">
                    Item A: {background.itemA}
                  </span>
                  <span className="wizard-bg-item">
                    Item B: {background.itemB}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="wizard-step-content">
            <h2 className="wizard-step-title">Equipamento Inicial</h2>
            <p className="wizard-step-desc">
              Escolha sua arma e veja seus itens iniciais.
            </p>

            <div className="wizard-equip-auto">
              <div className="wizard-equip-label">Itens Automáticos:</div>
              <div className="wizard-equip-list">
                <span>Torches</span>
                <span>Rations</span>
                {background && <span>{background.itemA}</span>}
                {background && <span>{background.itemB}</span>}
              </div>
            </div>

            <div className="wizard-equip-label" style={{ marginTop: 16 }}>
              Arma:
            </div>
            <div className="wizard-weapon-grid">
              {WEAPONS.map((w, i) => (
                <div
                  key={i}
                  className={`wizard-card wizard-weapon-card${selectedWeapon === i ? " selected" : ""}`}
                  onClick={() => setSelectedWeapon(i)}
                >
                  <div className="wizard-weapon-name">{w.name}</div>
                  <div className="wizard-weapon-damage">{w.damage}</div>
                  <div className="wizard-weapon-slots">
                    {w.slots.length} slot{w.slots.length > 1 ? "s" : ""}
                  </div>
                </div>
              ))}
            </div>

            {needsBonus && (
              <div className="wizard-bonus-section">
                <div className="wizard-equip-label" style={{ marginTop: 16 }}>
                  Itens Bônus (maior atributo: {highestAttr})
                </div>
                {!bonusBg ? (
                  <button
                    className="wizard-roll-btn"
                    onClick={() => {
                      const hp = rollDie(6);
                      const pips = rollDie(6);
                      setBonusBg(BACKGROUNDS[hp - 1][pips - 1]);
                    }}
                  >
                    Rolar Antecedente Bônus
                  </button>
                ) : (
                  <div className="wizard-background-result">
                    <div className="wizard-bg-name">{bonusBg.name}</div>
                    {needsBothBonus ? (
                      <div className="wizard-bg-items">
                        <span className="wizard-bg-item">
                          Item A: {bonusBg.itemA}
                        </span>
                        <span className="wizard-bg-item">
                          Item B: {bonusBg.itemB}
                        </span>
                        <div className="wizard-bonus-note">
                          Você recebe ambos os itens!
                        </div>
                      </div>
                    ) : (
                      <div className="wizard-bg-items">
                        <div
                          className={`wizard-card wizard-bonus-pick${bonusChoice === "A" ? " selected" : ""}`}
                          onClick={() => setBonusChoice("A")}
                        >
                          {bonusBg.itemA}
                        </div>
                        <div
                          className={`wizard-card wizard-bonus-pick${bonusChoice === "B" ? " selected" : ""}`}
                          onClick={() => setBonusChoice("B")}
                        >
                          {bonusBg.itemB}
                        </div>
                        <div className="wizard-bonus-note">
                          Escolha um item
                        </div>
                      </div>
                    )}
                    <button
                      className="wizard-reroll-btn"
                      onClick={() => {
                        const hp = rollDie(6);
                        const pips = rollDie(6);
                        setBonusBg(BACKGROUNDS[hp - 1][pips - 1]);
                        setBonusChoice(null);
                      }}
                      style={{ marginTop: 8 }}
                    >
                      Rolar Novamente
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="wizard-step-content">
            <h2 className="wizard-step-title">Detalhes</h2>
            <p className="wizard-step-desc">
              Role ou preencha os detalhes do seu personagem.
            </p>

            <div className="wizard-detail-row">
              <div className="wizard-detail-label">Signo</div>
              <div className="wizard-detail-content">
                {birthsignRoll !== null && (
                  <div className="wizard-detail-result">
                    <span>{BIRTHSIGNS[birthsignRoll - 1].sign}</span>
                    <span className="wizard-detail-sub">
                      {BIRTHSIGNS[birthsignRoll - 1].dispositionPositive} /{" "}
                      {BIRTHSIGNS[birthsignRoll - 1].dispositionNegative}
                    </span>
                  </div>
                )}
                <div className="wizard-detail-actions">
                  <button
                    className="wizard-roll-btn-sm"
                    onClick={() => {
                      setBirthsignRoll(rollDie(6));
                      setHasProgress(true);
                    }}
                  >
                    {birthsignRoll !== null ? "Rolar" : "Rolar d6"}
                  </button>
                  <input
                    type="text"
                    placeholder="Ou digite..."
                    value={birthsignOverride}
                    onChange={(e) => setBirthsignOverride(e.target.value)}
                    className="wizard-detail-input"
                  />
                </div>
                {birthsignRoll !== null && (
                  <input
                    type="text"
                    placeholder="Disposição (override)"
                    value={dispositionOverride}
                    onChange={(e) => setDispositionOverride(e.target.value)}
                    className="wizard-detail-input"
                    style={{ marginTop: 4 }}
                  />
                )}
              </div>
            </div>

            <div className="wizard-detail-row">
              <div className="wizard-detail-label">Pelagem</div>
              <div className="wizard-detail-content">
                {coatColorRoll !== null && coatPatternRoll !== null && (
                  <div className="wizard-detail-result">
                    <span>
                      {COAT_COLORS[coatColorRoll - 1]}{" "}
                      {COAT_PATTERNS[coatPatternRoll - 1]}
                    </span>
                  </div>
                )}
                <div className="wizard-detail-actions">
                  <button
                    className="wizard-roll-btn-sm"
                    onClick={() => {
                      setCoatColorRoll(rollDie(6));
                      setCoatPatternRoll(rollDie(6));
                      setHasProgress(true);
                    }}
                  >
                    {coatColorRoll !== null ? "Rolar" : "Rolar 2d6"}
                  </button>
                  <input
                    type="text"
                    placeholder="Ou digite..."
                    value={coatOverride}
                    onChange={(e) => setCoatOverride(e.target.value)}
                    className="wizard-detail-input"
                  />
                </div>
              </div>
            </div>

            <div className="wizard-detail-row">
              <div className="wizard-detail-label">Aparência</div>
              <div className="wizard-detail-content">
                {lookRoll !== null && (
                  <div className="wizard-detail-result">
                    <span>
                      {PHYSICAL_DETAILS[`${lookRoll[0]}${lookRoll[1]}`] ||
                        `${lookRoll[0]}${lookRoll[1]}`}
                    </span>
                  </div>
                )}
                <div className="wizard-detail-actions">
                  <button
                    className="wizard-roll-btn-sm"
                    onClick={() => {
                      setLookRoll([rollDie(6), rollDie(6)]);
                      setHasProgress(true);
                    }}
                  >
                    {lookRoll !== null ? "Rolar" : "Rolar d66"}
                  </button>
                  <input
                    type="text"
                    placeholder="Ou digite..."
                    value={lookOverride}
                    onChange={(e) => setLookOverride(e.target.value)}
                    className="wizard-detail-input"
                  />
                </div>
              </div>
            </div>

            <div className="wizard-detail-row" style={{ borderBottom: "none" }}>
              <div className="wizard-detail-label">Nome</div>
              <div className="wizard-detail-content">
                <input
                  type="text"
                  placeholder="Nome do personagem"
                  value={charName}
                  onChange={(e) => {
                    setCharName(e.target.value);
                    setHasProgress(true);
                  }}
                  className="wizard-name-input"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="wizard-nav">
        {step > 1 && (
          <button
            className="wizard-nav-btn secondary"
            onClick={() => setStep((s) => s - 1)}
          >
            Voltar
          </button>
        )}
        {step < 4 ? (
          <button
            className="wizard-nav-btn"
            disabled={
              (step === 1 && !allAttrsRolled) ||
              (step === 2 && (hpRoll === null || pipsRoll === null)) ||
              (step === 3 && !canProceedStep3())
            }
            onClick={() => setStep((s) => s + 1)}
          >
            Prosseguir
          </button>
        ) : (
          <button
            className="wizard-nav-btn"
            disabled={!charName.trim()}
            onClick={handleComplete}
          >
            Criar Personagem
          </button>
        )}
      </div>
    </div>
  );
}
