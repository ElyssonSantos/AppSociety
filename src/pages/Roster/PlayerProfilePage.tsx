import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAccessCode } from '../../context/AccessCodeContext';
import { SOCIETY_POSITIONS, SocietyPosition } from '../../types';
import { compressImage } from '../../utils/imageCompressor';

const PlayerProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { players, teams, matchHistory, updatePlayer } = useApp();
  const { isUnlocked, requestAction } = useAccessCode();

  const [editingRating, setEditingRating] = useState(false);
  const [ratingInput, setRatingInput] = useState('');

  // States for Edit Player Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editNumber, setEditNumber] = useState(10);
  const [editPosition, setEditPosition] = useState<SocietyPosition>('Pivô');
  const [editTeamId, setEditTeamId] = useState('');
  const [editPhotoUrl, setEditPhotoUrl] = useState('');
  const [editPhotoPreview, setEditPhotoPreview] = useState<string | null>(null);
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const editPhotoInputRef = useRef<HTMLInputElement>(null);

  // Encontrar o jogador pelo ID
  const player = players.find((p) => p.id === id);

  if (!player) {
    return (
      <main className="flex flex-col relative w-full pt-16 pb-24 bg-slate-50 min-h-screen px-4 justify-center items-center">
        <span className="text-slate-600 font-medium">Jogador não encontrado</span>
        <button onClick={() => navigate(-1)} className="mt-4 text-[#e63946] font-bold">Voltar</button>
      </main>
    );
  }

  // Clube do atleta
  const playerTeam = teams.find((t) => t.id === player.teamId);
  const clubName = playerTeam?.name || 'Sem Clube';

  // Contar partidas jogadas pelo time do atleta no histórico real
  const teamMatchesPlayed = playerTeam
    ? matchHistory.filter((m) => {
        const home = m.homeTeam.toLowerCase().trim();
        const away = m.awayTeam.toLowerCase().trim();
        const teamLower = playerTeam.name.toLowerCase().trim();
        return home === teamLower || away === teamLower;
      }).length
    : (player.matches ?? 0);

  const currentRating = player.rating || player.form || 0;

  const handleOpenEditModal = () => {
    setEditName(player.name);
    setEditNumber(player.number || 10);
    setEditPosition((player.position as SocietyPosition) || 'Pivô');
    setEditTeamId(player.teamId || '');
    setEditPhotoUrl(player.photoUrl || '');
    setEditPhotoPreview(player.photoUrl || null);
    setIsEditModalOpen(true);
  };

  const handleEditPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsCompressingPhoto(true);
        const compressed = await compressImage(file, 250, 250, 0.75);
        setEditPhotoPreview(compressed);
        setEditPhotoUrl(compressed);
      } catch (err) {
        console.warn('Erro ao comprimir foto:', err);
      } finally {
        setIsCompressingPhoto(false);
      }
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || isSavingEdit) return;

    setIsSavingEdit(true);
    try {
      await updatePlayer(player.id, {
        name: editName.trim(),
        number: Number(editNumber) || 10,
        position: editPosition,
        teamId: editTeamId ? editTeamId : undefined,
        photoUrl: editPhotoUrl.trim() || player.photoUrl || 'https://i.imgur.com/vnYcevV.png',
      });
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Erro ao salvar atleta:', err);
      alert('Erro ao atualizar atleta. Tente novamente.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleSaveRating = async () => {
    requestAction(async () => {
      const val = parseFloat(ratingInput);
      if (!isNaN(val) && val >= 0 && val <= 10) {
        await updatePlayer(player.id, { rating: parseFloat(val.toFixed(1)) });
      }
      setEditingRating(false);
      setRatingInput('');
    });
  };

  return (
    <main className="flex flex-col relative w-full pt-4 pb-24 bg-slate-50 min-h-screen px-4">
      <div className="flex flex-col w-full space-y-4 max-w-lg mx-auto">
        {/* Sub-Header contextual de navegação rápida */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            aria-label="Voltar"
            className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-transform active:scale-90 shadow-sm"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Em Forma
            </span>
            <button
              onClick={() => requestAction(() => handleOpenEditModal())}
              title={isUnlocked ? 'Editar Atleta' : 'Acesso restrito: Editar Atleta'}
              aria-label="Editar Atleta"
              className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-transform active:scale-90 shadow-sm"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">
                {isUnlocked ? 'edit' : 'lock'}
              </span>
            </button>
            <button aria-label="Compartilhar Perfil" className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-transform active:scale-90 shadow-sm" type="button">
              <span className="material-symbols-outlined text-[20px]">share</span>
            </button>
          </div>
        </div>

        {/* Hero Card: Perfil do Atleta */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5 shadow-lg flex flex-col justify-end min-h-[175px] text-white">
          <div className="relative z-10 flex items-center gap-4">
            {/* Imagem do Jogador */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center shadow-lg border-2 border-slate-700">
                <img
                  className="w-full h-full object-cover object-top"
                  src={player.photoUrl || "https://i.imgur.com/vnYcevV.png"}
                  alt={player.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://i.imgur.com/vnYcevV.png';
                  }}
                />
              </div>
              <span className="absolute bottom-0 right-0 bg-[#e63946] text-white text-xs font-extrabold px-1.5 py-0.5 rounded-full shadow">
                #{player.number}
              </span>
            </div>

            {/* Dados Nominais e Posição */}
            <div className="flex flex-col min-w-0 flex-1">
              <h2 className="text-[20px] font-extrabold text-white tracking-tight uppercase truncate">{player.name}</h2>
              <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs mt-0.5">
                <span className="material-symbols-outlined text-[16px]">military_tech</span>
                <span>Futebol Society 7v7</span>
              </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="inline-flex items-center gap-1 bg-white/10 text-white/90 text-xs font-semibold px-2.5 py-1 rounded-lg backdrop-blur-sm">
                  <span className="material-symbols-outlined text-[13px]">sports</span> {player.position}
                </span>
                {/* Clube do atleta em vez de pé de chute */}
                <span className="inline-flex items-center gap-1 bg-white/10 text-amber-300 text-xs font-semibold px-2.5 py-1 rounded-lg backdrop-blur-sm">
                  <span className="material-symbols-outlined text-[13px]">shield</span>
                  <span className="truncate max-w-[90px]">{clubName}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Resumo dos Jogos */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#e63946] text-[20px]">query_stats</span>
              <h3 className="text-sm font-bold text-slate-900">Resumo dos Jogos</h3>
            </div>
            <div className="flex items-center gap-1 bg-white border border-slate-200 px-3 py-1 rounded-full text-slate-700 text-xs font-bold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#e63946]"></span>
              <span>GERAL</span>
            </div>
          </div>

          {/* Grid 2x2 de Métricas Principais */}
          <div className="grid grid-cols-2 gap-3">
            {/* Card: Gols */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-col justify-between relative overflow-hidden shadow-sm">
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-[11px] uppercase font-bold tracking-wider">Gols Marcados</span>
                <span className="material-symbols-outlined text-[18px] text-emerald-500">sports_soccer</span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-slate-900 leading-none">{player.goals ?? 0}</span>
              </div>
              <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, ((player.goals ?? 0) / Math.max(1, teamMatchesPlayed)) * 100 * 2)}%` }}></div>
              </div>
            </div>

            {/* Card: Assistências */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-col justify-between relative overflow-hidden shadow-sm">
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-[11px] uppercase font-bold tracking-wider">Assistências</span>
                <span className="material-symbols-outlined text-[18px] text-amber-500">handshake</span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-slate-900 leading-none">{player.assists ?? 0}</span>
              </div>
              <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min(100, ((player.assists ?? 0) / Math.max(1, teamMatchesPlayed)) * 100 * 2)}%` }}></div>
              </div>
            </div>

            {/* Card: Partidas pelo Time */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-col justify-between relative overflow-hidden shadow-sm">
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-[11px] uppercase font-bold tracking-wider">Partidas do Time</span>
                <span className="material-symbols-outlined text-[18px] text-slate-400">stadium</span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-slate-900 leading-none">{teamMatchesPlayed}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
                <span className="truncate max-w-[90px] text-slate-500">{playerTeam ? playerTeam.name : '—'}</span>
                <span className="text-emerald-600 font-bold">
                  {teamMatchesPlayed > 0 ? `${playerTeam?.played ?? teamMatchesPlayed} disp.` : 'Sem dados'}
                </span>
              </div>
            </div>

            {/* Card: Nota Média (Rating) — com edição inline */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-col justify-between relative overflow-hidden shadow-sm">
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-[11px] uppercase font-bold tracking-wider">Nota Média</span>
                <button
                  type="button"
                  onClick={() => {
                    requestAction(() => {
                      setRatingInput(String(currentRating));
                      setEditingRating(true);
                    });
                  }}
                  aria-label="Editar nota média"
                  title={isUnlocked ? 'Editar nota média' : 'Acesso restrito: Editar nota média'}
                  className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px] text-amber-400">
                    {isUnlocked ? 'edit' : 'lock'}
                  </span>
                </button>
              </div>

              {editingRating ? (
                <div className="mt-2 flex items-center gap-1.5">
                  <input
                    type="number"
                    min={0}
                    max={10}
                    step={0.1}
                    value={ratingInput}
                    onChange={(e) => setRatingInput(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-slate-900 text-sm font-bold focus:outline-none focus:border-[#e63946]"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleSaveRating}
                    className="shrink-0 w-8 h-8 rounded-lg bg-[#e63946] text-white flex items-center justify-center hover:bg-rose-700 transition-colors active:scale-90"
                  >
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditingRating(false); setRatingInput(''); }}
                    className="shrink-0 w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors active:scale-90"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              ) : (
                <>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-3xl font-extrabold text-[#e63946] leading-none">
                      {currentRating > 0 ? currentRating.toFixed(1) : '—'}
                    </span>
                    {currentRating >= 8 && (
                      <span className="text-[10px] font-bold bg-rose-50 text-[#e63946] border border-rose-100 px-1.5 py-0.5 rounded">Top 1%</span>
                    )}
                  </div>
                  <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#e63946] h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (currentRating / 10) * 100)}%` }}
                    ></div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Editar Atleta */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-rose-50 text-[#e63946] flex items-center justify-center border border-rose-100">
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </span>
                <h3 className="text-base font-bold text-slate-900">Editar Atleta</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-300 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-4 space-y-3">
              {/* Photo Upload */}
              <div className="flex flex-col items-center">
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2 self-start">Foto do Atleta</label>
                <div
                  className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-dashed border-slate-300 hover:border-[#e63946] cursor-pointer transition-colors bg-slate-50 group shadow-sm"
                  onClick={() => editPhotoInputRef.current?.click()}
                >
                  <img
                    src={editPhotoPreview || editPhotoUrl || 'https://i.imgur.com/vnYcevV.png'}
                    alt="Foto"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://i.imgur.com/vnYcevV.png'; }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="material-symbols-outlined text-white text-[22px]">add_a_photo</span>
                  </div>
                  {isCompressingPhoto && (
                    <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-[20px] animate-spin">progress_activity</span>
                    </div>
                  )}
                </div>
                <input
                  ref={editPhotoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleEditPhotoChange}
                />
                <span className="text-[10px] text-slate-500 mt-1">
                  {isCompressingPhoto ? 'Otimizando imagem...' : 'Clique na foto para alterar do dispositivo'}
                </span>

                <div className="w-full mt-2">
                  <input
                    type="text"
                    value={editPhotoUrl.startsWith('data:image') ? '' : editPhotoUrl}
                    onChange={(e) => {
                      setEditPhotoUrl(e.target.value);
                      setEditPhotoPreview(e.target.value || null);
                    }}
                    placeholder="Ou cole o link direto da imagem (opcional)"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs focus:outline-none focus:border-[#e63946]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Nome do Atleta *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-sm focus:outline-none focus:border-[#e63946]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Posição (7v7)</label>
                  <select
                    value={editPosition}
                    onChange={(e) => setEditPosition(e.target.value as SocietyPosition)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-[#e63946]"
                  >
                    {SOCIETY_POSITIONS.map((pos) => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Nº Camisa</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={editNumber}
                    onChange={(e) => setEditNumber(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-[#e63946]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Equipe Vinculada</label>
                <select
                  value={editTeamId}
                  onChange={(e) => setEditTeamId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-[#e63946]"
                >
                  <option value="">-- Sem Equipe (Avulso) --</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  disabled={isSavingEdit}
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium text-xs hover:bg-slate-100 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit || isCompressingPhoto}
                  className="flex-1 py-2.5 rounded-xl bg-[#e63946] text-white font-bold text-xs shadow hover:bg-rose-700 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isSavingEdit ? (
                    <>
                      <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <span>Salvar Alterações</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default PlayerProfilePage;
