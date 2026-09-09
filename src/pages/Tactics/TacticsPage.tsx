import React, { useState, DragEvent, useEffect, useRef, useCallback } from 'react';

interface FormationPlayer {
  id: string;
  name: string;
  isGoalkeeper?: boolean;
}

const DEFAULT_FORMATIONS: Record<string, { label: string; own: FormationPlayer[][] }> = {
  '2-3-1': {
    label: '7 Society (2-3-1)',
    own: [
      [{ id: 'f-231-1', name: 'Pivô (Ataque)' }],
      [
        { id: 'f-231-2', name: 'Ala Esq' },
        { id: 'f-231-3', name: 'Meia Central' },
        { id: 'f-231-4', name: 'Ala Dir' },
      ],
      [
        { id: 'f-231-5', name: 'Zagueiro Esq' },
        { id: 'f-231-6', name: 'Zagueiro Dir' },
      ],
      [{ id: 'f-231-7', name: 'Goleiro', isGoalkeeper: true }],
    ],
  },
  '3-2-1': {
    label: '7 Society (3-2-1)',
    own: [
      [{ id: 'f-321-1', name: 'Pivô (CA)' }],
      [
        { id: 'f-321-2', name: 'Meia Esq' },
        { id: 'f-321-3', name: 'Meia Dir' },
      ],
      [
        { id: 'f-321-4', name: 'Ala Esq' },
        { id: 'f-321-5', name: 'Fixo Central' },
        { id: 'f-321-6', name: 'Ala Dir' },
      ],
      [{ id: 'f-321-7', name: 'Goleiro', isGoalkeeper: true }],
    ],
  },
  '1-3-2': {
    label: '7 Society (1-3-2)',
    own: [
      [
        { id: 'f-132-1', name: 'Ponta Esq' },
        { id: 'f-132-2', name: 'Ponta Dir' },
      ],
      [
        { id: 'f-132-3', name: 'Meia Esq' },
        { id: 'f-132-4', name: 'Meio-Campo' },
        { id: 'f-132-5', name: 'Meia Dir' },
      ],
      [{ id: 'f-132-6', name: 'Zagueiro Fixo' }],
      [{ id: 'f-132-7', name: 'Goleiro', isGoalkeeper: true }],
    ],
  },
};

const OPPONENT_ROWS: FormationPlayer[][] = [
  [{ id: 'opp-1', name: 'Goleiro Adv', isGoalkeeper: true }],
  [{ id: 'opp-2', name: 'Def. Esq' }, { id: 'opp-3', name: 'Def. Dir' }],
  [{ id: 'opp-4', name: 'Meia Esq' }, { id: 'opp-5', name: 'Meia Central' }, { id: 'opp-6', name: 'Meia Dir' }],
  [{ id: 'opp-7', name: 'Atacante' }],
];

type FormationKey = keyof typeof DEFAULT_FORMATIONS;

type DragData = {
  fromRow: number;
  fromIndex: number;
  player: FormationPlayer;
} | null;

const LS_KEY = (key: string) => `tactics_formation_v2_${key}`;

export const TacticsPage: React.FC = () => {
  const [formationKey, setFormationKey] = useState<FormationKey>('2-3-1');

  const getInitialFormation = useCallback((key: FormationKey) => {
    try {
      const saved = localStorage.getItem(LS_KEY(key));
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return { ...DEFAULT_FORMATIONS[key], own: parsed };
        }
      }
    } catch { /* ignore */ }
    return DEFAULT_FORMATIONS[key];
  }, []);

  const [formation, setFormation] = useState(() => getInitialFormation('2-3-1'));
  const [dragData, setDragData] = useState<DragData>(null);
  const [dragOver, setDragOver] = useState<{ row: number; index: number } | null>(null);
  const touchDragRef = useRef<{ fromRow: number; fromIndex: number; player: FormationPlayer; currentTarget: HTMLElement | null } | null>(null);

  useEffect(() => {
    const newF = getInitialFormation(formationKey);
    setFormation(newF);
    setDragData(null);
    setDragOver(null);
  }, [formationKey, getInitialFormation]);

  const persistFormation = useCallback((key: FormationKey, ownRows: FormationPlayer[][]) => {
    try {
      localStorage.setItem(LS_KEY(key), JSON.stringify(ownRows));
    } catch { /* ignore */ }
  }, []);

  const handleResetFormation = () => {
    const defaultF = DEFAULT_FORMATIONS[formationKey];
    setFormation(defaultF);
    persistFormation(formationKey, defaultF.own);
  };

  const handleDragStart = (e: DragEvent, row: number, index: number, player: FormationPlayer) => {
    setDragData({ fromRow: row, fromIndex: index, player });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: DragEvent, row: number, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver({ row, index });
  };

  const handleDragLeave = () => {
    setDragOver(null);
  };

  const handleDrop = (e: DragEvent, toRow: number, toIndex: number) => {
    e.preventDefault();
    if (!dragData) return;

    const newFormation = formation.own.map((row: FormationPlayer[]) =>
      row.map((player: FormationPlayer) => ({ ...player }))
    );

    const temp = newFormation[toRow][toIndex];
    newFormation[toRow][toIndex] = dragData.player;
    newFormation[dragData.fromRow][dragData.fromIndex] = temp;

    const updated = { ...formation, own: newFormation };
    setFormation(updated);
    persistFormation(formationKey, newFormation);
    setDragData(null);
    setDragOver(null);
  };

  const handleDragEnd = () => {
    setDragData(null);
    setDragOver(null);
  };

  const handleTouchStart = (row: number, index: number, player: FormationPlayer, e: React.TouchEvent) => {
    const target = e.currentTarget as HTMLElement;
    touchDragRef.current = { fromRow: row, fromIndex: index, player, currentTarget: target };
    setDragData({ fromRow: row, fromIndex: index, player });
    target.classList.add('scale-125', 'z-50', 'shadow-2xl');
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchDragRef.current) return;
    const touch = e.touches[0];
    const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
    const dropTarget = elements.find((el) => el.hasAttribute('data-droppable'));
    if (dropTarget) {
      const row = parseInt(dropTarget.getAttribute('data-row') || '0', 10);
      const index = parseInt(dropTarget.getAttribute('data-index') || '0', 10);
      setDragOver({ row, index });
    } else {
      setDragOver(null);
    }
  };

  const handleTouchEnd = () => {
    if (!touchDragRef.current) return;

    if (dragData && dragOver) {
      const toRow = dragOver.row;
      const toIndex = dragOver.index;
      const newFormation = formation.own.map((row: FormationPlayer[]) =>
        row.map((p: FormationPlayer) => ({ ...p }))
      );

      const temp = newFormation[toRow][toIndex];
      newFormation[toRow][toIndex] = dragData.player;
      newFormation[dragData.fromRow][dragData.fromIndex] = temp;

      const updated = { ...formation, own: newFormation };
      setFormation(updated);
      persistFormation(formationKey, newFormation);
    }

    if (touchDragRef.current.currentTarget) {
      touchDragRef.current.currentTarget.classList.remove('scale-125', 'z-50', 'shadow-2xl');
    }
    touchDragRef.current = null;
    setDragData(null);
    setDragOver(null);
  };

  const handleFormationChange = (key: FormationKey) => {
    setFormationKey(key);
  };

  const PlayerNode: React.FC<{
    label: string;
    isGoalkeeper?: boolean;
    isOpponent?: boolean;
    draggable?: boolean;
    onDragStart?: (e: DragEvent) => void;
    onTouchStart?: (e: React.TouchEvent) => void;
    isDragOver?: boolean;
  }> = ({
    label,
    isGoalkeeper = false,
    isOpponent = false,
    draggable = true,
    onDragStart,
    onTouchStart,
    isDragOver = false,
  }) => (
    <div
      className={`flex flex-col items-center gap-0.5 ${
        isDragOver ? 'scale-125' : ''
      } transition-transform duration-150 select-none`}
    >
      <div
        draggable={draggable}
        onDragStart={onDragStart}
        onTouchStart={onTouchStart}
        onDragEnd={handleDragEnd}
        className={`w-10 h-10 rounded-full font-extrabold flex items-center justify-center text-xs shadow-lg transition-all cursor-grab active:cursor-grabbing active:scale-110
          ${isDragOver ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-emerald-900 scale-125' : ''}
          ${
            isOpponent
              ? 'bg-slate-800 ring-2 ring-slate-600 text-white'
              : isGoalkeeper
              ? 'bg-amber-500 ring-2 ring-amber-300 text-white'
              : 'bg-slate-900 ring-2 ring-white text-white'
          }`}
      >
        <span
          className="material-symbols-outlined text-[18px]"
          style={{ fontVariationSettings: '"FILL" 1' }}
        >
          person
        </span>
      </div>
      <span
        className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded max-w-[64px] text-center leading-tight truncate shadow-sm
          ${isOpponent ? 'text-slate-200 bg-slate-900/90' : 'text-white bg-black/80'}`}
      >
        {label}
      </span>
    </div>
  );

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 p-4 pb-20 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] text-slate-700 uppercase font-extrabold tracking-wider block">
            Prancheta Digital
          </span>
          <h1 className="text-[20px] font-extrabold text-slate-900 tracking-tight">
            Quadro Tático &amp; Escalação
          </h1>
        </div>
        <button
          onClick={handleResetFormation}
          title="Resetar Posições"
          className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs text-slate-900 font-bold shadow-sm hover:bg-slate-100 flex items-center gap-1 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">restart_alt</span>
          <span>Resetar</span>
        </button>
      </div>

      {/* Tactical Pitch — Society 7v7 */}
      <div
        className="relative w-full rounded-3xl border-2 border-emerald-800 shadow-xl overflow-hidden touch-none select-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, #15803d 0%, #166534 60%, #14532d 100%)',
          minHeight: '440px',
        }}
      >
        {/* SVG Campo */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 320 440"
          preserveAspectRatio="none"
        >
          {/* Linhas de campo */}
          <rect x="20" y="20" width="280" height="400" rx="6" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
          <line x1="20" y1="220" x2="300" y2="220" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
          <circle cx="160" cy="220" r="42" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
          <circle cx="160" cy="220" r="3.5" fill="rgba(255,255,255,0.5)" />
          <rect x="80" y="20" width="160" height="55" rx="4" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
          <rect x="115" y="20" width="90" height="28" rx="3" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          <rect x="80" y="365" width="160" height="55" rx="4" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
          <rect x="115" y="392" width="90" height="28" rx="3" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        </svg>

        {/* Conteúdo dentro do campo */}
        <div className="relative z-10 flex flex-col justify-between h-full py-5 px-2" style={{ minHeight: '440px' }}>

          {/* ADVERSÁRIOS (topo) */}
          <div className="flex flex-col gap-3">
            {OPPONENT_ROWS.map((row, ri) => (
              <div key={ri} className="flex justify-around px-4">
                {row.map((player) => (
                  <PlayerNode key={player.id} label={player.name} isOpponent isGoalkeeper={player.isGoalkeeper} />
                ))}
              </div>
            ))}
          </div>

          {/* Separador visual centro */}
          <div className="h-px bg-white/0 my-1" />

          {/* TIME PRÓPRIO (baixo) */}
          <div className="flex flex-col gap-3">
            {formation.own.map((row, ri) => (
              <div key={ri} className="flex justify-around px-4">
                {row.map((player: FormationPlayer, pi: number) => (
                  <div
                    key={player.id || `${ri}-${pi}`}
                    data-droppable="true"
                    data-row={ri}
                    data-index={pi}
                    onDragOver={(e) => handleDragOver(e, ri, pi)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, ri, pi)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    className={`transition-transform duration-150 p-1 rounded-xl cursor-grab active:cursor-grabbing ${
                      dragOver?.row === ri && dragOver?.index === pi ? 'bg-amber-400/20 ring-2 ring-amber-400 scale-110' : ''
                    }`}
                  >
                    <PlayerNode
                      label={player.name}
                      isGoalkeeper={player.isGoalkeeper}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, ri, pi, player)}
                      onTouchStart={(e) => handleTouchStart(ri, pi, player, e)}
                      isDragOver={dragOver?.row === ri && dragOver?.index === pi}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Seleção de Formação */}
      <div>
        <h2 className="text-sm font-bold text-slate-900 mb-2">Esquema Tático</h2>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(DEFAULT_FORMATIONS) as FormationKey[]).map((key) => (
            <button
              key={key}
              onClick={() => handleFormationChange(key)}
              className={`p-2.5 rounded-xl text-center text-xs font-bold transition-all active:scale-95 border ${
                formationKey === key
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {DEFAULT_FORMATIONS[key].label.replace('7 Society ', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Legenda */}
      <div className="flex items-center gap-4 px-1">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full bg-slate-900 border border-white" />
          <span className="text-xs text-slate-600 font-bold">Seu time</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full bg-slate-800 border border-slate-600" />
          <span className="text-xs text-slate-600 font-bold">Adversário</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full bg-amber-500 border border-amber-300" />
          <span className="text-xs text-slate-600 font-bold">Goleiro</span>
        </div>
      </div>

      {/* Dica de uso */}
      <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-center gap-2 shadow-sm">
        <span className="material-symbols-outlined text-[18px] text-slate-900">drag_click</span>
        <p className="text-xs text-slate-700 text-center font-bold">
          Arraste e solte qualquer jogador do seu time para reposicioná-lo livremente em campo.
        </p>
      </div>
    </div>
  );
};

export default TacticsPage;
