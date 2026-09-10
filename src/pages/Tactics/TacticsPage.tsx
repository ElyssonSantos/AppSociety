import React, { useState, useEffect, useRef, useCallback } from 'react';

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

/** Dados carregados durante o arraste via Pointer Events */
interface DragState {
  fromRow: number;
  fromIndex: number;
  player: FormationPlayer;
  pointerId: number;
}

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
  /** Índice de destino do hover durante o arraste { row, index } */
  const [dragOver, setDragOver] = useState<{ row: number; index: number } | null>(null);
  /** Estado ativo de arraste */
  const dragStateRef = useRef<DragState | null>(null);
  /** Menu de contexto para definir goleiro */
  const [contextMenu, setContextMenu] = useState<{
    row: number;
    index: number;
    player: FormationPlayer;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    const newF = getInitialFormation(formationKey);
    setFormation(newF);
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

  const handleFormationChange = (key: FormationKey) => {
    setFormationKey(key);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Drag & Drop via Pointer Events
  // Funciona nativamente em desktop (mouse) e mobile (touch/stylus)
  // sem precisar de biblioteca externa.
  //
  // Fluxo:
  //   onPointerDown → captura ponteiro (setPointerCapture) → inicia dragStateRef
  //   onPointerMove → detecta alvo via elementFromPoint → atualiza dragOver
  //   onPointerUp   → conclui swap ou cancela
  // ─────────────────────────────────────────────────────────────────────────

  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    row: number,
    index: number,
    player: FormationPlayer
  ) => {
    // Captura o ponteiro para continuar recebendo eventos mesmo fora do elemento
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    dragStateRef.current = { fromRow: row, fromIndex: index, player, pointerId: e.pointerId };
    // Fecha menu de contexto ao iniciar arraste
    setContextMenu(null);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStateRef.current) return;
    // Lê o elemento sob o ponto atual do ponteiro
    // releasePointerCapture temporariamente para usar elementFromPoint
    const target = e.currentTarget as HTMLDivElement;
    target.releasePointerCapture(e.pointerId);
    const el = document.elementFromPoint(e.clientX, e.clientY);
    target.setPointerCapture(e.pointerId);

    if (!el) {
      setDragOver(null);
      return;
    }

    // Busca o ancestral com data-droppable
    const droppable = el.closest('[data-droppable]') as HTMLElement | null;
    if (droppable) {
      const row = parseInt(droppable.dataset.row ?? '0', 10);
      const index = parseInt(droppable.dataset.index ?? '0', 10);
      setDragOver({ row, index });
    } else {
      setDragOver(null);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStateRef.current) return;

    if (dragOver !== null) {
      const { fromRow, fromIndex } = dragStateRef.current;
      const { row: toRow, index: toIndex } = dragOver;

      if (fromRow !== toRow || fromIndex !== toIndex) {
        const newFormation = formation.own.map((r: FormationPlayer[]) =>
          r.map((p: FormationPlayer) => ({ ...p }))
        );
        const temp = newFormation[toRow][toIndex];
        newFormation[toRow][toIndex] = { ...dragStateRef.current.player };
        newFormation[fromRow][fromIndex] = temp;

        setFormation((prev) => ({ ...prev, own: newFormation }));
        persistFormation(formationKey, newFormation);
      }
    }

    dragStateRef.current = null;
    setDragOver(null);
    (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    dragStateRef.current = null;
    setDragOver(null);
    try {
      (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
    } catch { /* ignore */ }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Clique simples no ícone do jogador → abre menu de contexto "Definir Goleiro"
  // ─────────────────────────────────────────────────────────────────────────
  const handlePlayerClick = (
    e: React.MouseEvent<HTMLDivElement>,
    row: number,
    index: number,
    player: FormationPlayer
  ) => {
    e.stopPropagation();
    // Calcula posição do menu próximo ao clique
    setContextMenu({ row, index, player, x: e.clientX, y: e.clientY });
  };

  const handleSetGoalkeeper = (row: number, index: number) => {
    const newFormation = formation.own.map((r: FormationPlayer[]) =>
      r.map((p: FormationPlayer) => ({ ...p, isGoalkeeper: false }))
    );
    newFormation[row][index] = {
      ...newFormation[row][index],
      isGoalkeeper: true,
    };
    setFormation((prev) => ({ ...prev, own: newFormation }));
    persistFormation(formationKey, newFormation);
    setContextMenu(null);
  };

  const handleRemoveGoalkeeper = (row: number, index: number) => {
    const newFormation = formation.own.map((r: FormationPlayer[]) =>
      r.map((p: FormationPlayer) => ({ ...p }))
    );
    newFormation[row][index] = {
      ...newFormation[row][index],
      isGoalkeeper: false,
    };
    setFormation((prev) => ({ ...prev, own: newFormation }));
    persistFormation(formationKey, newFormation);
    setContextMenu(null);
  };

  // Fecha menu ao clicar fora
  useEffect(() => {
    if (!contextMenu) return;
    const handler = () => setContextMenu(null);
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [contextMenu]);

  // ─────────────────────────────────────────────────────────────────────────
  // Sub-componente de nó de jogador (estático, sem lógica de drag)
  // ─────────────────────────────────────────────────────────────────────────
  const PlayerNode: React.FC<{
    label: string;
    isGoalkeeper?: boolean;
    isOpponent?: boolean;
    isDragOver?: boolean;
    isDragging?: boolean;
  }> = ({ label, isGoalkeeper = false, isOpponent = false, isDragOver = false, isDragging = false }) => (
    <div
      className={`flex flex-col items-center gap-0.5 transition-transform duration-150 select-none
        ${isDragOver ? 'scale-125' : ''}
        ${isDragging ? 'opacity-50' : ''}
      `}
    >
      <div
        className={`w-10 h-10 rounded-full font-extrabold flex items-center justify-center text-xs shadow-lg transition-all
          ${isDragOver ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-emerald-900 scale-110' : ''}
          ${
            isOpponent
              ? 'bg-slate-800 ring-2 ring-slate-600 text-white'
              : isGoalkeeper
              ? 'bg-amber-500 ring-2 ring-amber-300 text-white'
              : 'bg-slate-900 ring-2 ring-white text-white'
          }
        `}
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
    <div
      className="flex flex-col w-full min-h-screen bg-slate-50 p-4 pb-20 space-y-4"
      onClick={() => setContextMenu(null)}
    >
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
        className="relative w-full rounded-3xl border-2 border-emerald-800 shadow-xl overflow-hidden select-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, #15803d 0%, #166534 60%, #14532d 100%)',
          minHeight: '440px',
          // touch-action: none no container garante que o scroll da página
          // não interfira no arraste dos jogadores em dispositivos móveis
          touchAction: 'none',
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

          {/* ADVERSÁRIOS (topo) — não arrastáveis */}
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

          {/* TIME PRÓPRIO (baixo) — arrastável via Pointer Events */}
          <div className="flex flex-col gap-3">
            {formation.own.map((row, ri) => (
              <div key={ri} className="flex justify-around px-4">
                {row.map((player: FormationPlayer, pi: number) => {
                  const isDragOver = dragOver?.row === ri && dragOver?.index === pi;
                  const isDragging =
                    dragStateRef.current?.fromRow === ri && dragStateRef.current?.fromIndex === pi;

                  return (
                    <div
                      key={player.id || `${ri}-${pi}`}
                      data-droppable="true"
                      data-row={ri}
                      data-index={pi}
                      // Pointer Events para drag & drop robusto em desktop e mobile
                      onPointerDown={(e) => handlePointerDown(e, ri, pi, player)}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      onPointerCancel={handlePointerCancel}
                      // Clique simples → menu de definir goleiro
                      onClick={(e) => handlePlayerClick(e, ri, pi, player)}
                      // touch-action: none no elemento evita que o scroll do celular
                      // cancele o arraste ao tentar mover o jogador
                      style={{ touchAction: 'none', cursor: 'grab' }}
                      className={`transition-transform duration-150 p-1 rounded-xl ${
                        isDragOver ? 'bg-amber-400/20 ring-2 ring-amber-400 scale-110' : ''
                      }`}
                    >
                      <PlayerNode
                        label={player.name}
                        isGoalkeeper={player.isGoalkeeper}
                        isDragOver={isDragOver}
                        isDragging={isDragging}
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Menu de Contexto — Definir / Remover Goleiro */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden min-w-[180px]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-2 border-b border-slate-100 bg-slate-50">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              {contextMenu.player.name}
            </span>
          </div>
          {contextMenu.player.isGoalkeeper ? (
            <button
              onClick={() => handleRemoveGoalkeeper(contextMenu.row, contextMenu.index)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              Remover como Goleiro
            </button>
          ) : (
            <button
              onClick={() => handleSetGoalkeeper(contextMenu.row, contextMenu.index)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-amber-700 hover:bg-amber-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
              </svg>
              Definir como Goleiro
            </button>
          )}
        </div>
      )}

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
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5 text-slate-900 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
        </svg>
        <p className="text-xs text-slate-700 text-center font-bold">
          Arraste para reposicionar. Toque no jogador para definir como Goleiro.
        </p>
      </div>
    </div>
  );
};

export default TacticsPage;
