import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAccessCode } from '../../context/AccessCodeContext';
import { Team } from '../../types';
import { compressImage } from '../../utils/imageCompressor';

export const ClubsPage: React.FC = () => {
  const navigate = useNavigate();
  const { teams, updateTeam, deleteTeam } = useApp();
  const { isUnlocked, requestAction } = useAccessCode();

  // Edit Team State
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editName, setEditName] = useState('');
  const [editShieldUrl, setEditShieldUrl] = useState('');
  const [editShieldPreview, setEditShieldPreview] = useState<string | null>(null);
  const [isCompressingShield, setIsCompressingShield] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const editShieldInputRef = useRef<HTMLInputElement>(null);

  // Delete Team State
  const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null);

  const handleOpenEdit = (team: Team) => {
    setEditingTeam(team);
    setEditName(team.name);
    setEditShieldUrl(team.shieldUrl || '');
    setEditShieldPreview(team.shieldUrl || null);
  };

  const handleShieldFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsCompressingShield(true);
        const compressed = await compressImage(file, 250, 250, 0.75);
        setEditShieldPreview(compressed);
        setEditShieldUrl(compressed);
      } catch (err) {
        console.warn('Erro ao comprimir escudo:', err);
      } finally {
        setIsCompressingShield(false);
      }
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam || !editName.trim() || isSavingEdit) return;

    requestAction(async () => {
      setIsSavingEdit(true);
      try {
        await updateTeam(editingTeam.id, {
          name: editName.trim(),
          shieldUrl: editShieldUrl.trim() || editingTeam.shieldUrl || 'https://i.imgur.com/2dRX6Mh.png',
        });

        setEditingTeam(null);
        setEditShieldPreview(null);
      } catch (err) {
        console.error('Erro ao salvar clube:', err);
        alert('Erro ao atualizar clube. Tente novamente.');
      } finally {
        setIsSavingEdit(false);
      }
    });
  };

  const handleConfirmDelete = () => {
    if (deletingTeamId) {
      requestAction(() => {
        deleteTeam(deletingTeamId);
        setDeletingTeamId(null);
      });
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 p-4 pb-20 space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] text-[#e63946] uppercase font-bold tracking-wider block">
            Futebol Society 7v7
          </span>
          <h1 className="text-[20px] font-extrabold text-slate-900 tracking-tight">
            Gestão de Equipes
          </h1>
        </div>
        <button
          onClick={() => requestAction(() => navigate('/clubes/novo'))}
          title={isUnlocked ? 'Nova Equipe' : 'Acesso restrito: Nova Equipe'}
          className="px-4 py-2.5 rounded-xl bg-[#e63946] text-white font-bold text-xs flex items-center gap-1.5 shadow-md hover:bg-rose-700 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">
            {isUnlocked ? 'add' : 'lock'}
          </span>
          <span>Nova Equipe</span>
          {!isUnlocked && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-300 ml-0.5" />
          )}
        </button>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 gap-4">
        {teams.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center shadow-sm flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-[#e63946]">
              <span className="material-symbols-outlined text-[24px]">shield</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Nenhuma equipe cadastrada</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">Cadastre os clubes participantes para organizar confrontos e gerenciar elencos.</p>
            </div>
            <button
              onClick={() => requestAction(() => navigate('/clubes/novo'))}
              title={isUnlocked ? 'Nova Equipe' : 'Acesso restrito: Nova Equipe'}
              className="px-4 py-2 rounded-xl bg-[#e63946] text-white font-bold text-xs shadow-sm hover:bg-rose-700 transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">
                {isUnlocked ? 'add' : 'lock'}
              </span>
              <span>+ Nova Equipe</span>
            </button>
          </div>
        ) : (
          teams.map((team) => (
            <div
              key={team.id}
              onClick={() => navigate(`/clube/${team.id}`)}
              className="p-4 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm hover:border-[#e63946]/50 transition-colors cursor-pointer active:scale-[0.99]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shadow-sm overflow-hidden shrink-0">
                    {team.shieldUrl ? (
                      <img src={team.shieldUrl} alt={team.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-[#e63946] text-[32px]">shield</span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{team.name}</h2>
                    <p className="text-xs text-slate-600 font-medium">Modalidade Futebol Society 7v7</p>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-bold">
                      Equipe Ativa
                    </span>
                  </div>
                </div>

                {/* Edit & Delete Actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      requestAction(() => handleOpenEdit(team));
                    }}
                    title={isUnlocked ? "Editar Equipe" : "Acesso restrito: Editar Equipe"}
                    className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors shadow-sm relative"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                    {!isUnlocked && (
                      <span className="material-symbols-outlined text-[11px] absolute -top-1 -right-1 bg-amber-500 text-white rounded-full p-0.5 shadow-sm">
                        lock
                      </span>
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      requestAction(() => setDeletingTeamId(team.id));
                    }}
                    title={isUnlocked ? "Excluir Equipe" : "Acesso restrito: Excluir Equipe"}
                    className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 flex items-center justify-center text-rose-600 transition-colors shadow-sm relative"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                    {!isUnlocked && (
                      <span className="material-symbols-outlined text-[11px] absolute -top-1 -right-1 bg-amber-500 text-white rounded-full p-0.5 shadow-sm">
                        lock
                      </span>
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <span className="text-xl font-extrabold text-slate-900 block">
                    {team.players.length}
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Atletas</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <span className="text-xl font-extrabold text-emerald-600 block">
                    {team.wins ?? 0}
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Vitórias</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <span className="text-xl font-extrabold text-amber-500 block">
                    {team.draws ?? 0}
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Empates</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <span className="text-xl font-extrabold text-rose-500 block">
                    {team.losses ?? 0}
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Derrotas</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Editar Equipe */}
      {editingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-rose-50 text-[#e63946] flex items-center justify-center border border-rose-100">
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </span>
                <h3 className="text-base font-bold text-slate-900">Editar Equipe</h3>
              </div>
              <button
                onClick={() => setEditingTeam(null)}
                className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Nome da Equipe *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-sm focus:outline-none focus:border-[#e63946]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Escudo da Equipe</label>

                {/* Upload Zone */}
                <div
                  className="relative flex flex-col items-center justify-center p-5 rounded-xl bg-slate-50 border-2 border-dashed border-slate-300 hover:border-[#e63946] transition-colors cursor-pointer group"
                  onClick={() => editShieldInputRef.current?.click()}
                >
                  <input
                    ref={editShieldInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleShieldFileChange}
                  />
                  {editShieldPreview || editShieldUrl ? (
                    <>
                      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#e63946] shadow-md mb-2">
                        <img
                          src={editShieldPreview || editShieldUrl}
                          alt="Escudo"
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-700">Clique para trocar o escudo</span>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[#e63946] mb-2 shadow-sm">
                        <span className="material-symbols-outlined text-[24px]">upload_file</span>
                      </div>
                      <span className="text-xs font-bold text-slate-900">Clique para carregar o escudo</span>
                      <span className="text-[10px] text-slate-500 mt-0.5">PNG, JPG ou SVG</span>
                    </>
                  )}
                </div>

                {/* URL Fallback */}
                <div className="mt-2">
                  <span className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Ou cole a URL da imagem:</span>
                  <input
                    type="url"
                    value={editShieldUrl.startsWith('data:') ? '' : editShieldUrl}
                    onChange={(e) => {
                      setEditShieldUrl(e.target.value);
                      setEditShieldPreview(null);
                    }}
                    placeholder="https://exemplo.com/escudo.png"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-[#e63946] placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => { setEditingTeam(null); setEditShieldPreview(null); }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium text-xs hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#e63946] text-white font-bold text-xs shadow hover:bg-rose-700"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar Exclusão Equipe */}
      {deletingTeamId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-xl p-5 text-center space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
              <span className="material-symbols-outlined text-[24px]">delete</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Excluir Equipe?</h3>
              <p className="text-xs text-slate-600 mt-1">Esta ação removerá a equipe permanentemente do sistema.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDeletingTeamId(null)}
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

export default ClubsPage;
