"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export type DiceType = 4 | 6 | 8 | 10 | 12 | 20;
export interface DiceResult {
  dice: DiceType;
  count: number;
  rolls: number[];
  total: number;
}

interface DiceRollerProps {
  embedded?: boolean;
  onRoll?: (result: DiceResult) => void;
  defaultDice?: DiceType;
  defaultCount?: number;
}

const DICE_TYPES: DiceType[] = [4, 6, 8, 10, 12, 20];

function rollDie(sides: DiceType): number {
  return Math.floor(Math.random() * sides) + 1;
}

export default function DiceRoller({
  embedded,
  onRoll,
  defaultDice = 6,
  defaultCount = 1,
}: DiceRollerProps) {
  const [open, setOpen] = useState(false);
  const [selectedDice, setSelectedDice] = useState<DiceType>(defaultDice);
  const [count, setCount] = useState(defaultCount);
  const [result, setResult] = useState<DiceResult | null>(null);
  const [rolling, setRolling] = useState(false);
  const [displayNumbers, setDisplayNumbers] = useState<number[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    setSelectedDice(defaultDice);
  }, [defaultDice]);

  useEffect(() => {
    setCount(defaultCount);
  }, [defaultCount]);

  const doRoll = useCallback(() => {
    if (rolling) return;
    setRolling(true);
    setResult(null);

    const finalRolls = Array.from({ length: count }, () => rollDie(selectedDice));
    let ticks = 0;
    const maxTicks = 6;

    intervalRef.current = setInterval(() => {
      ticks++;
      setDisplayNumbers(
        Array.from({ length: count }, () => rollDie(selectedDice)),
      );
      if (ticks >= maxTicks) {
        clearInterval(intervalRef.current);
        const total = finalRolls.reduce((a, b) => a + b, 0);
        const res: DiceResult = {
          dice: selectedDice,
          count,
          rolls: finalRolls,
          total,
        };
        setResult(res);
        setDisplayNumbers(finalRolls);
        setRolling(false);
        onRoll?.(res);
      }
    }, 50);
  }, [count, selectedDice, rolling, onRoll]);

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  const panel = (
    <div className="dice-panel">
      <div className="dice-type-row">
        {DICE_TYPES.map((d) => (
          <button
            key={d}
            className={`dice-btn${selectedDice === d ? " selected" : ""}`}
            onClick={() => setSelectedDice(d)}
          >
            d{d}
          </button>
        ))}
      </div>
      <div className="dice-count-row">
        <button
          className="dice-count-btn"
          onClick={() => setCount((c) => Math.max(1, c - 1))}
          disabled={count <= 1}
        >
          -
        </button>
        <span className="dice-count-value">{count}</span>
        <button
          className="dice-count-btn"
          onClick={() => setCount((c) => Math.min(10, c + 1))}
          disabled={count >= 10}
        >
          +
        </button>
      </div>
      <button className="dice-roll-btn" onClick={doRoll} disabled={rolling}>
        Rolar
      </button>
      {(rolling || result) && (
        <div className="dice-result">
          <div className={`dice-result-total${!rolling ? " landed" : ""}`}>
            {rolling
              ? displayNumbers.reduce((a, b) => a + b, 0)
              : result?.total}
          </div>
          <div className="dice-result-breakdown">
            {(rolling ? displayNumbers : result?.rolls ?? []).map((v, i) => (
              <span
                key={i}
                className={`dice-result-die${!rolling ? " landed" : ""}`}
              >
                {v}
              </span>
            ))}
            {!rolling && result && result.count > 1 && (
              <span className="dice-result-eq">= {result.total}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (embedded) return panel;

  return (
    <>
      <button
        className={`dice-fab${open ? " open" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-label="Dice roller"
      >
        {"\uD83C\uDFB2"}
      </button>
      {open && <div className="dice-fab-panel">{panel}</div>}
    </>
  );
}
