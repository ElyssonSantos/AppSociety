import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { SOCIETY_POSITIONS, SocietyPosition } from '../../types';

export const PlayerRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const { teams, addPlayer } = useApp();

  const [name, setName] = useState('');
  const [shirtNumber, setShirtNumber] = useState<number>(10);
  const [position, setPosition] = useState<SocietyPosition>('Pivô');
  const [selectedTeamId, setSelectedTeamId] = useState<string>(teams[0]?.id || '');
  const [photoUrl, setPhotoUrl] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        setPhotoUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addPlayer({
      name: name.trim(),
      number: shirtNumber,
      position,
      teamId: selectedTeamId || undefined,
      photoUrl: photoUrl || preview || undefined,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      navigate('/elencos');
    }, 1200);
  };

  return (
    <main className="flex flex-col relative w-full pt-4 pb-24 bg-slate-50 min-h-screen px-4">
      <div className="flex flex-col w-full space-y-4 max-w-lg mx-auto">

        {/* Top Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            aria-label="Voltar"
            className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-transform active:scale-90 shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <span className="px-3 py-1 rounded-full bg-rose-50 text-[#e63946] border border-rose-100 text-xs font-bold uppercase tracking-wider">
            Futebol Society 7v7
          </span>
          <div className="w-10" />
        </div>

        {/* Titles */}
        <div>
          <h1 className="text-[22px] text-slate-900 font-extrabold tracking-tight">
            Cadastro de Atleta
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Adicione novos jogadores e vincule-os diretamente a uma equipe do futebol society.
          </p>
        </div>

        {/* Form Container */}
        <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>

          {/* Section 1: Photo Upload */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-col items-center text-center relative overflow-hidden shadow-sm">
            <div className="relative group cursor-pointer mb-2">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-slate-200 flex flex-col items-center justify-center text-slate-600 relative shadow-inner overflow-hidden">
                {preview || photoUrl ? (
                  <img src={preview || photoUrl} alt="Foto do atleta" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-[32px] text-[#e63946] mb-1">add_a_photo</span>
                    <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Carregar</span>
                  </div>
                )}
              </div>
            </div>
            <span className="text-xs font-bold text-slate-900">Clique para carregar/alterar a foto do atleta</span>
          </div>

          {/* Section 2: Vínculo de Equipe */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2">
            <label className="block text-xs text-slate-600 uppercase font-bold tracking-wider">
              Vínculo com a Equipe *
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[#e63946] text-[20px]">
                shield
              </span>
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full pl-10 pr-8 py-3 rounded-xl bg-slate-50 text-slate-900 font-bold text-sm focus:outline-none focus:border-[#e63946] border border-slate-200 appearance-none transition-colors"
              >
                <option value="">-- Sem Equipe (Avulso) --</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 text-slate-400 text-[20px] pointer-events-none">
                unfold_more
              </span>
            </div>
          </div>

          {/* Section 3: Dados Pessoais & Posição 7v7 */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-4">
            
            {/* Nome Completo */}
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-slate-600 uppercase font-bold tracking-wider">
                Nome do Atleta *
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[18px]">
                  person
                </span>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Gabriel Silva"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 text-slate-900 font-bold text-sm focus:outline-none focus:border-[#e63946] border border-slate-200 transition-colors"
                />
              </div>
            </div>

            {/* Camisa & Posição 7v7 */}
            <div className="grid grid-cols-5 gap-3">
              <div className="col-span-2 flex flex-col space-y-1">
                <label className="text-xs text-slate-600 uppercase font-bold tracking-wider">
                  Nº Camisa
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-[#e63946] text-[18px]">
                    pin
                  </span>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={shirtNumber}
                    onChange={(e) => setShirtNumber(Number(e.target.value))}
                    className="w-full pl-9 pr-2 py-2.5 rounded-xl bg-slate-50 text-slate-900 font-bold text-sm focus:outline-none focus:border-[#e63946] border border-slate-200"
                  />
                </div>
              </div>

              {/* Posições Estritas do Futebol Society 7v7 */}
              <div className="col-span-3 flex flex-col space-y-1">
                <label className="text-xs text-slate-600 uppercase font-bold tracking-wider">
                  Posição (Society 7v7) *
                </label>
                <div className="relative flex items-center">
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value as SocietyPosition)}
                    className="w-full pl-3 pr-8 py-2.5 rounded-xl bg-slate-50 text-slate-900 font-bold text-xs focus:outline-none focus:border-[#e63946] border border-slate-200 appearance-none"
                  >
                    {SOCIETY_POSITIONS.map((pos) => (
                      <option key={pos} value={pos}>
                        {pos}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 text-slate-400 text-[18px] pointer-events-none">
                    unfold_more
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Success Toast */}
          {savedSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-sm flex items-center justify-center gap-2 animate-pulse shadow-sm">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              Atleta cadastrado com sucesso!
            </div>
          )}

          {/* Primary CTA Submit Button */}
          <button
            type="submit"
            disabled={!name.trim()}
            className={`w-full py-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 ${
              name.trim()
                ? 'bg-[#e63946] text-white hover:bg-rose-700 cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            Salvar e Cadastrar Atleta
          </button>
        </form>
      </div>
    </main>
  );
};

export default PlayerRegistrationPage;
