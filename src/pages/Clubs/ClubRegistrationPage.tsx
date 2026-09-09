import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { compressImage } from '../../utils/imageCompressor';

export const ClubRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const { addTeam } = useApp();

  const [name, setName] = useState('');
  const [shieldUrl, setShieldUrl] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdSuccess, setCreatedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 250, 250, 0.7);
        setPreview(compressed);
        setShieldUrl(compressed);
      } catch (err) {
        console.warn('Erro ao comprimir imagem, usando original:', err);
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setPreview(result);
          setShieldUrl(result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await addTeam(name.trim(), shieldUrl || preview || undefined);
      setCreatedSuccess(true);
      setTimeout(() => {
        navigate('/clubes');
      }, 1000);
    } catch (err: any) {
      console.error('Erro ao salvar clube:', err);
      setErrorMessage('Erro ao salvar clube no banco de dados. Tente novamente.');
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex flex-col relative w-full pt-4 pb-24 bg-slate-50 min-h-screen px-4">
      <div className="flex flex-col w-full space-y-4 max-w-lg mx-auto">

        {/* Header Nav */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            aria-label="Voltar"
            className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-transform active:scale-90 shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-900 border border-slate-200 text-xs font-bold uppercase tracking-wider">
            Cadastro de Equipe
          </span>
          <div className="w-10" />
        </div>

        {/* Header Titles */}
        <div>
          <h1 className="text-[22px] font-extrabold text-slate-900 tracking-tight">
            Criar Nova Equipe
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Cadastre o nome e o escudo da equipe para utilizar nas partidas de futebol society.
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">

          {/* Field 1: Nome da Equipe */}
          <div className="flex flex-col gap-1.5 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
            <label className="text-xs text-slate-600 uppercase font-bold tracking-wider">
              Nome da Equipe *
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[20px]">
                shield
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Resenha FC, Amigos do Zico"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 text-slate-900 font-bold text-sm focus:outline-none focus:border-slate-900 border border-slate-200 transition-colors placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Field 2: Imagem / Escudo */}
          <div className="flex flex-col gap-3 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
            <label className="text-xs text-slate-600 uppercase font-bold tracking-wider">
              Imagem / Escudo da Equipe
            </label>

            <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-slate-50 border-2 border-dashed border-slate-300 hover:border-slate-900 transition-colors cursor-pointer relative overflow-hidden">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />

              {preview || shieldUrl ? (
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-900 shadow-md mb-2">
                  <img src={preview || shieldUrl} alt="Preview do Escudo" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-900 mb-2 shadow-sm">
                  <span className="material-symbols-outlined text-[32px]">upload_file</span>
                </div>
              )}

              <span className="text-xs font-bold text-slate-900">
                {preview ? 'Trocar Imagem do Escudo' : 'Clique ou arraste a imagem do escudo aqui'}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5">PNG, JPG ou SVG</span>
            </div>

            {/* Optional Image URL Input */}
            <div className="pt-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">
                Ou cole a URL da imagem:
              </span>
              <input
                type="url"
                value={shieldUrl}
                onChange={(e) => {
                  setShieldUrl(e.target.value);
                  setPreview(e.target.value);
                }}
                placeholder="https://exemplo.com/escudo.png"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 text-slate-900 text-xs focus:outline-none focus:border-slate-900 border border-slate-200 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Toast / Success Feedback */}
          {createdSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-sm flex items-center justify-center gap-2 shadow-sm">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              Equipe criada com sucesso! Redirecionando...
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold text-sm flex items-center justify-center gap-2 shadow-sm">
              <span className="material-symbols-outlined text-[20px]">error</span>
              {errorMessage}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!name.trim() || isSubmitting}
            className={`w-full py-4 rounded-2xl font-extrabold text-base flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 ${
              name.trim() && !isSubmitting
                ? 'bg-slate-900 text-white hover:bg-black cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">
              {isSubmitting ? 'sync' : 'add_circle'}
            </span>
            {isSubmitting ? 'Salvando...' : 'Confirmar Criação'}
          </button>
        </form>

      </div>
    </main>
  );
};

export default ClubRegistrationPage;
