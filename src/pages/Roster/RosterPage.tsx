import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAccessCode } from '../../context/AccessCodeContext';
import { Player, SOCIETY_POSITIONS, SocietyPosition } from '../../types';
import { RankingList } from '../../components/ranking/RankingList';
import { compressImage } from '../../utils/imageCompressor';

type RosterTab = 'atletas' | 'ranking';

export const RosterPage: React.FC = () => {
  const navigate = useNavigate();
  const { players, teams, updatePlayer, deletePlayer } = useApp();
  const { isUnlocked, requestAction } = useAccessCode();
  const [activeTab, setActiveTab] = useState<RosterTab>('atletas');
  const [searchTerm, setSearchTerm] = useState('');

  // States for Editing Player Modal
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [editName, setEditName] = useState('');
  const [editTeamId, setEditTeamId] = useState<string>('');
  const [editNumber, setEditNumber] = useState<number>(10);
  const [editPosition, setEditPosition] = useState<string>('Pivô');
  const [editPhotoUrl, setEditPhotoUrl] = useState<string>('');
  const [editPhotoPreview, setEditPhotoPreview] = useState<string | null>(null);
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const editPhotoInputRef = useRef<HTMLInputElement>(null);

  // States for Deleting Confirmation Modal
  const [deletingPlayerId, setDeletingPlayerId] = useState<string | null>(null);

  const filtered = players.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenEdit = (e: React.MouseEvent, player: Player) => {
    e.stopPropagation();
    setEditingPlayer(player);
    setEditName(player.name);
    setEditTeamId(player.teamId || '');
    setEditNumber(player.number || 10);
    setEditPosition(player.position || 'Pivô');
    setEditPhotoUrl(player.photoUrl || '');
    setEditPhotoPreview(player.photoUrl || null);
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
        console.warn('Erro ao comprimir imagem:', err);
      } finally {
        setIsCompressingPhoto(false);
      }
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlayer || !editName.trim() || isSavingEdit) return;

    setIsSavingEdit(true);
    try {
      await updatePlayer(editingPlayer.id, {
        name: editName.trim(),
        teamId: editTeamId ? editTeamId : undefined,
        number: Number(editNumber) || 10,
        position: editPosition,
        photoUrl: editPhotoUrl.trim() || editingPlayer.photoUrl || 'https://i.imgur.com/vnYcevV.png',
      });

      setEditingPlayer(null);
      setEditPhotoPreview(null);
    } catch (err) {
      console.error('Erro ao salvar atleta:', err);
      alert('Erro ao atualizar dados do atleta. Tente novamente.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleOpenDelete = (e: React.MouseEvent, playerId: string) => {
    e.stopPropagation();
    setDeletingPlayerId(playerId);
  };

  const handleConfirmDelete = () => {
    if (deletingPlayerId) {
      deletePlayer(deletingPlayerId);
      setDeletingPlayerId(null);
    }
  };

  return (
    <div data-section="Gestão de Elencos e Ranking" className="flex flex-col w-full min-h-screen bg-slate-50 p-4 pb-20 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div>
          <span className="text-[11px] text-[#e63946] uppercase font-extrabold tracking-wider block">
            Futebol Society 7v7
          </span>
          <h1 className="text-[22px] font-black text-slate-900 tracking-tight">
            Elenco &amp; Ranking
          </h1>
        </div>
        <button
          onClick={() => requestAction(() => navigate('/jogador/novo'))}
          title={isUnlocked ? 'Cadastrar Atleta' : 'Acesso restrito: Cadastrar Atleta'}
          className="px-4 py-2.5 rounded-xl bg-[#e63946] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-500/20 hover:bg-rose-700 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">
            {isUnlocked ? 'person_add' : 'lock'}
          </span>
          <span>Atleta</span>
          {!isUnlocked && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-300 ml-0.5" />
          )}
        </button>
      </div>

      {/* Main Tabs */}
      <div className="flex bg-white rounded-xl p-1 border border-slate-200 shadow-sm mb-2">
        <button
          onClick={() => setActiveTab('atletas')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'atletas' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">groups</span>
          Atletas ({players.length})
        </button>
        <button
          onClick={() => setActiveTab('ranking')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'ranking' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">emoji_events</span>
          Ranking Global
        </button>
      </div>

      {activeTab === 'atletas' ? (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Exclusivamente Todos os Atletas Banner */}
          <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#e63946] text-[20px]">groups</span>
              <span className="text-sm font-bold text-slate-900">Todos os Atletas</span>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              {players.length} Atletas
            </span>
          </div>

          {/* Search Input */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar atleta por nome ou posição..."
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e63946] transition-colors text-sm shadow-sm"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <span className="material-symbols-outlined text-[24px]">person_off</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {searchTerm ? `Nenhum atleta encontrado para "${searchTerm}"` : 'Nenhum atleta cadastrado'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  {searchTerm ? 'Tente buscar por outro nome ou posição.' : 'Cadastre os jogadores do seu time para acompanhar estatísticas e escalar partidas.'}
                </p>
              </div>
              {!searchTerm && (
                <button
                  onClick={() => requestAction(() => navigate('/jogador/novo'))}
                  title={isUnlocked ? 'Cadastrar Atleta' : 'Acesso restrito: Cadastrar Atleta'}
                  className="px-4 py-2 rounded-xl bg-[#e63946] text-white font-bold text-xs shadow-sm hover:bg-rose-700 transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isUnlocked ? 'add' : 'lock'}
                  </span>
                  <span>Cadastrar Atleta</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.map((player) => {
                const playerTeam = teams.find((t) => t.id === player.teamId);

                return (
                  <div
                    key={player.id}
                    onClick={() => navigate(`/jogador/${player.id}`)}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-sm hover:border-[#e63946]/50 hover:bg-rose-50/20 transition-all active:scale-[0.99] cursor-pointer text-left w-full relative group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                        <img
                          src={player.photoUrl}
                          alt={player.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://i.imgur.com/vnYcevV.png';
                          }}
                        />
                        <span className="absolute bottom-0 right-0 bg-[#e63946] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                          {player.number}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-slate-900 truncate">
                          {player.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#e63946] font-bold">
                            {player.position}
                          </span>
                          {playerTeam && (
                            <span className="text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full text-slate-600 font-semibold truncate max-w-[100px]">
                              {playerTeam.name}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                          <span>{player.goals ?? 0} Gols</span>
                          <span>•</span>
                          <span>{player.assists ?? 0} Ast</span>
                        </div>
                      </div>
                    </div>

                    {/* Edit & Delete Action Buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          requestAction(() => handleOpenEdit(e, player));
                        }}
                        title={isUnlocked ? 'Editar Atleta' : 'Acesso restrito: Editar Atleta'}
                        className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors relative"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {isUnlocked ? 'edit' : 'lock'}
                        </span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          requestAction(() => handleOpenDelete(e, player.id));
                        }}
                        title={isUnlocked ? 'Excluir Atleta' : 'Acesso restrito: Excluir Atleta'}
                        className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 flex items-center justify-center text-rose-600 transition-colors relative"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {isUnlocked ? 'delete' : 'lock'}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <RankingList />
      )}

      {/* Modal Editar Atleta */}
      {editingPlayer && (
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
                onClick={() => setEditingPlayer(null)}
                className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600"
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
                  {isCompressingPhoto ? 'Otimizando imagem...' : 'Clique para carregar do dispositivo'}
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
                  onClick={() => { setEditingPlayer(null); setEditPhotoPreview(null); }}
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

      {/* Modal Confirmar Exclusão Atleta */}
      {deletingPlayerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-xl p-5 text-center space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
              <span className="material-symbols-outlined text-[24px]">delete</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Excluir Atleta?</h3>
              <p className="text-xs text-slate-600 mt-1">Esta ação removerá o atleta permanentemente do sistema.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDeletingPlayerId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium text-xs hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 shadow"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RosterPage;
