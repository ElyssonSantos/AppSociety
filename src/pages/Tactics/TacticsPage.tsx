import React, { useState, useEffect, useRef, useCallback } from 'react';

export interface TacticalPiece {
  id: string;
  label: string;
  team: 'own' | 'opp'; // own = Meu Time (Azul), opp = Adversário (Vermelho)
  isGoalkeeper?: boolean;
  x: number; // 0 a 100 (%)
  y: number; // 0 a 100 (%)
}

const PRESET_FORMATIONS: Record<string, { label: string; pieces: TacticalPiece[] }> = {
  '2-3-1': {
    label: '7 Society (2-3-1)',
    pieces: [
      // Meu Time (Azul)
      { id: 'o-gk', label: 'Goleiro', team: 'own', isGoalkeeper: true, x: 50, y: 88 },
      { id: 'o-z1', label: 'Zag Esq', team: 'own', x: 32, y: 76 },
      { id: 'o-z2', label: 'Zag Dir', team: 'own', x: 68, y: 76 },
      { id: 'o-a1', label: 'Ala Esq', team: 'own', x: 18, y: 60 },
      { id: 'o-m1', label: 'Meia Cent', team: 'own', x: 50, y: 64 },
      { id: 'o-a2', label: 'Ala Dir', team: 'own', x: 82, y: 60 },
      { id: 'o-p1', label: 'Pivô', team: 'own', x: 50, y: 50 },

      // Adversário (Vermelho)
      { id: 'x-gk', label: 'Goleiro Adv', team: 'opp', isGoalkeeper: true, x: 50, y: 12 },
      { id: 'x-z1', label: 'Zag Esq', team: 'opp', x: 32, y: 24 },
      { id: 'x-z2', label: 'Zag Dir', team: 'opp', x: 68, y: 24 },
      { id: 'x-a1', label: 'Ala Esq', team: 'opp', x: 18, y: 38 },
      { id: 'x-m1', label: 'Meia Cent', team: 'opp', x: 50, y: 34 },
      { id: 'x-a2', label: 'Ala Dir', team: 'opp', x: 82, y: 38 },
      { id: 'x-p1', label: 'Atacante', team: 'opp', x: 50, y: 46 },
    ],
  },
  '3-2-1': {
    label: '7 Society (3-2-1)',
    pieces: [
      // Meu Time (Azul)
      { id: 'o-gk', label: 'Goleiro', team: 'own', isGoalkeeper: true, x: 50, y: 88 },
      { id: 'o-z1', label: 'Ala Esq', team: 'own', x: 22, y: 76 },
      { id: 'o-z2', label: 'Fixo Cent', team: 'own', x: 50, y: 78 },
      { id: 'o-z3', label: 'Ala Dir', team: 'own', x: 78, y: 76 },
      { id: 'o-m1', label: 'Meia Esq', team: 'own', x: 35, y: 62 },
      { id: 'o-m2', label: 'Meia Dir', team: 'own', x: 65, y: 62 },
      { id: 'o-p1', label: 'Pivô', team: 'own', x: 50, y: 50 },

      // Adversário (Vermelho)
      { id: 'x-gk', label: 'Goleiro Adv', team: 'opp', isGoalkeeper: true, x: 50, y: 12 },
      { id: 'x-z1', label: 'Ala Esq', team: 'opp', x: 22, y: 24 },
      { id: 'x-z2', label: 'Fixo Cent', team: 'opp', x: 50, y: 22 },
      { id: 'x-z3', label: 'Ala Dir', team: 'opp', x: 78, y: 24 },
      { id: 'x-m1', label: 'Meia Esq', team: 'opp', x: 35, y: 38 },
      { id: 'x-m2', label: 'Meia Dir', team: 'opp', x: 65, y: 38 },
      { id: 'x-p1', label: 'Atacante', team: 'opp', x: 50, y: 46 },
    ],
  },
  '1-3-2': {
    label: '7 Society (1-3-2)',
    pieces: [
      // Meu Time (Azul)
      { id: 'o-gk', label: 'Goleiro', team: 'own', isGoalkeeper: true, x: 50, y: 88 },
      { id: 'o-z1', label: 'Fixo Único', team: 'own', x: 50, y: 78 },
      { id: 'o-m1', label: 'Meia Esq', team: 'own', x: 20, y: 64 },
      { id: 'o-m2', label: 'Meio-Campo', team: 'own', x: 50, y: 66 },
      { id: 'o-m3', label: 'Meia Dir', team: 'own', x: 80, y: 64 },
      { id: 'o-p1', label: 'Ponta Esq', team: 'own', x: 35, y: 50 },
      { id: 'o-p2', label: 'Ponta Dir', team: 'own', x: 65, y: 50 },

      // Adversário (Vermelho)
      { id: 'x-gk', label: 'Goleiro Adv', team: 'opp', isGoalkeeper: true, x: 50, y: 12 },
      { id: 'x-z1', label: 'Fixo Único', team: 'opp', x: 50, y: 22 },
      { id: 'x-m1', label: 'Meia Esq', team: 'opp', x: 20, y: 36 },
      { id: 'x-m2', label: 'Meio-Campo', team: 'opp', x: 50, y: 34 },
      { id: 'x-m3', label: 'Meia Dir', team: 'opp', x: 80, y: 36 },
      { id: 'x-p1', label: 'Ponta Esq', team: 'opp', x: 35, y: 46 },
      { id: 'x-p2', label: 'Ponta Dir', team: 'opp', x: 65, y: 46 },
    ],
  },
};

type FormationKey = keyof typeof PRESET_FORMATIONS;

// Chave 100% local do dispositivo no localStorage
const LS_TACTICS_DEVICE_KEY = 'mopafut_tactics_custom_device_positions_v3';

export const TacticsPage: React.FC = () => {
  const [formationKey, setFormationKey] = useState<FormationKey>('2-3-1');
  const pitchRef = useRef<HTMLDivElement>(null);

  // Carrega posições salvas localmente no aparelho do usuário
  const loadSavedPieces = useCallback((): TacticalPiece[] => {
    try {
      const saved = localStorage.getItem(LS_TACTICS_DEVICE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch { /* ignore */ }
    return PRESET_FORMATIONS['2-3-1'].pieces;
  }, []);

  const [pieces, setPieces] = useState<TacticalPiece[]>(loadSavedPieces);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // Menu de contexto para alterar papel do jogador
  const [contextMenu, setContextMenu] = useState<{
    piece: TacticalPiece;
    x: number;
    y: number;
  } | null>(null);

  // Persiste posições estritamente no localStorage local do dispositivo
  const savePiecesToLS = useCallback((currentPieces: TacticalPiece[]) => {
    try {
      localStorage.setItem(LS_TACTICS_DEVICE_KEY, JSON.stringify(currentPieces));
    } catch { /* ignore */ }
  }, []);

  const handleFormationChange = (key: FormationKey) => {
    setFormationKey(key);
    const newPieces = PRESET_FORMATIONS[key].pieces;
    setPieces(newPieces);
    savePiecesToLS(newPieces);
  };

  const handleReset = () => {
    const defaultPieces = PRESET_FORMATIONS[formationKey].pieces;
    setPieces(defaultPieces);
    savePiecesToLS(defaultPieces);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Arraste Livre 2D via Pointer Events (Touch & Mouse)
  // ─────────────────────────────────────────────────────────────────────────
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, pieceId: string) => {
    e.stopPropagation();
    setContextMenu(null);
    setDraggingId(pieceId);
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingId || !pitchRef.current) return;

    const rect = pitchRef.current.getBoundingClientRect();
    const rawX = ((e.clientX - rect.left) / rect.width) * 100;
    const rawY = ((e.clientY - rect.top) / rect.height) * 100;

    // Garante que o boneco não saia das bordas do campo
    const clampedX = Math.max(5, Math.min(95, rawX));
    const clampedY = Math.max(5, Math.min(95, rawY));

    setPieces((prev) => {
      const next = prev.map((p) => (p.id === draggingId ? { ...p, x: clampedX, y: clampedY } : p));
      return next;
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (draggingId) {
      setDraggingId(null);
      savePiecesToLS(pieces);
      try {
        (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
      } catch { /* ignore */ }
    }
  };

  const handlePieceClick = (e: React.MouseEvent<HTMLDivElement>, piece: TacticalPiece) => {
    e.stopPropagation();
    setContextMenu({ piece, x: e.clientX, y: e.clientY });
  };

  const handleToggleGoalkeeper = (pieceId: string) => {
    setPieces((prev) => {
      const next = prev.map((p) =>
        p.id === pieceId ? { ...p, isGoalkeeper: !p.isGoalkeeper } : p
      );
      savePiecesToLS(next);
      return next;
    });
    setContextMenu(null);
  };

  useEffect(() => {
    if (!contextMenu) return;
    const handler = () => setContextMenu(null);
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [contextMenu]);

  return (
    <div
      className="flex flex-col w-full min-h-screen bg-slate-50 p-4 pb-20 space-y-4 select-none"
      onClick={() => setContextMenu(null)}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] text-slate-700 uppercase font-extrabold tracking-wider block">
            Prancheta Digital Privada
          </span>
          <h1 className="text-[20px] font-extrabold text-slate-900 tracking-tight">
            Quadro Tático Interativo
          </h1>
        </div>
        <button
          onClick={handleReset}
          title="Resetar posições aos padrões"
          className="bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs text-slate-900 font-bold shadow-sm hover:bg-slate-100 flex items-center gap-1.5 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">restart_alt</span>
          <span>Resetar</span>
        </button>
      </div>

      {/* Campo Tático — Arraste Livre 2D Expandido Verticalmente (880px) */}
      <div
        ref={pitchRef}
        onPointerMove={handlePointerMove}
        className="relative w-full rounded-3xl border-2 border-emerald-800 shadow-2xl overflow-hidden touch-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, #15803d 0%, #166534 60%, #14532d 100%)',
          minHeight: '880px',
          touchAction: 'none',
        }}
      >
        {/* SVG Desenho do Campo Futebol Society */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 320 880"
          preserveAspectRatio="none"
        >
          {/* Bordas e Linhas */}
          <rect x="15" y="15" width="290" height="850" rx="12" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.8" />
          {/* Linha de Meio Campo */}
          <line x1="15" y1="440" x2="305" y2="440" stroke="rgba(255,255,255,0.35)" strokeWidth="1.8" />
          {/* Círculo Central */}
          <circle cx="160" cy="440" r="55" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.8" />
          <circle cx="160" cy="440" r="4" fill="rgba(255,255,255,0.6)" />

          {/* Área Superior (Adversário) */}
          <rect x="75" y="15" width="170" height="120" rx="8" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
          <rect x="115" y="15" width="90" height="50" rx="4" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" />

          {/* Área Inferior (Meu Time) */}
          <rect x="75" y="745" width="170" height="120" rx="8" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
          <rect x="115" y="815" width="90" height="50" rx="4" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" />
        </svg>

        {/* Peças / Bonecos Posicionados em 2D Livre */}
        {pieces.map((piece) => {
          const isOwnTeam = piece.team === 'own';
          const isGoalkeeper = piece.isGoalkeeper;
          const isBeingDragged = draggingId === piece.id;

          // Cores solicitadas: Azul (Meu Time), Vermelho (Adversário), Amarelo/Dourado (Goleiro)
          let bgColorClass = 'bg-[#e63946] border border-rose-300 shadow-rose-900/40 text-white'; // Adversário (Vermelho)
          if (isGoalkeeper) {
            bgColorClass = 'bg-amber-500 border border-amber-200 shadow-amber-900/40 text-white'; // Goleiro (Amarelo/Dourado)
          } else if (isOwnTeam) {
            bgColorClass = 'bg-blue-600 border border-blue-300 shadow-blue-900/40 text-white'; // Meu Time (Azul)
          }

          return (
            <div
              key={piece.id}
              onPointerDown={(e) => handlePointerDown(e, piece.id)}
              onPointerUp={handlePointerUp}
              onClick={(e) => handlePieceClick(e, piece)}
              style={{
                top: `${piece.y}%`,
                left: `${piece.x}%`,
                transform: 'translate(-50%, -50%)',
                touchAction: 'none',
                cursor: isBeingDragged ? 'grabbing' : 'grab',
              }}
              className={`absolute z-20 flex flex-col items-center gap-1 transition-transform duration-75 select-none ${
                isBeingDragged ? 'scale-125 z-30 opacity-90' : 'hover:scale-110 active:scale-95'
              }`}
            >
              {/* Ícone do Jogador / Boneco */}
              <div
                className={`w-11 h-11 rounded-full font-black flex items-center justify-center text-xs shadow-xl transition-all ${bgColorClass} ${
                  isBeingDragged ? 'ring-4 ring-white ring-offset-2 ring-offset-emerald-900 scale-110' : ''
                }`}
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  {isGoalkeeper ? 'sports_handball' : 'person'}
                </span>
              </div>

              {/* Rótulo da Posição / Jogador */}
              <span
                className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full max-w-[75px] text-center leading-tight truncate shadow-md ${
                  isOwnTeam
                    ? 'bg-slate-900/90 text-white border border-blue-400/40'
                    : 'bg-black/90 text-rose-200 border border-rose-400/40'
                }`}
              >
                {piece.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Menu de Contexto (Ao Clicar no Boneco) */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden min-w-[190px] p-1"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-2 border-b border-slate-100 bg-slate-50 rounded-t-xl">
            <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">
              {contextMenu.piece.label}
            </span>
            <span className="text-[11px] font-bold text-slate-800">
              {contextMenu.piece.team === 'own' ? 'Meu Time (Azul)' : 'Adversário (Vermelho)'}
            </span>
          </div>
          <button
            onClick={() => handleToggleGoalkeeper(contextMenu.piece.id)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] text-amber-500">
              {contextMenu.piece.isGoalkeeper ? 'person' : 'sports_handball'}
            </span>
            <span>
              {contextMenu.piece.isGoalkeeper ? 'Remover como Goleiro' : 'Definir como Goleiro'}
            </span>
          </button>
        </div>
      )}

      {/* Seleção de Esquema Tático Padrão */}
      <div>
        <h2 className="text-sm font-bold text-slate-900 mb-2">Esquemas Táticos Padrão</h2>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(PRESET_FORMATIONS) as FormationKey[]).map((key) => (
            <button
              key={key}
              onClick={() => handleFormationChange(key)}
              className={`p-2.5 rounded-xl text-center text-xs font-bold transition-all active:scale-95 border ${
                formationKey === key
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {PRESET_FORMATIONS[key].label.replace('7 Society ', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Legenda de Cores */}
      <div className="flex items-center justify-around px-2 py-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-600 border border-blue-300 shadow-sm" />
          <span className="text-xs text-slate-700 font-extrabold">Meu Time (Azul)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#e63946] border border-rose-300 shadow-sm" />
          <span className="text-xs text-slate-700 font-extrabold">Adversário (Vermelho)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-amber-500 border border-amber-200 shadow-sm" />
          <span className="text-xs text-slate-700 font-extrabold">Goleiro (Dourado)</span>
        </div>
      </div>

      {/* Dica Informativa de Privacidade Local */}
      <div className="p-3.5 rounded-2xl bg-slate-900 text-white flex items-center justify-center gap-2.5 shadow-md">
        <span className="material-symbols-outlined text-amber-400 text-[20px]">touch_app</span>
        <p className="text-xs text-white text-center font-bold">
          Arraste qualquer boneco pelo campo! As táticas são privadas e salvas apenas no seu aparelho.
        </p>
      </div>
    </div>
  );
};

export default TacticsPage;
