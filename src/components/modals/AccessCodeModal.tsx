import React, { useState, useEffect, useRef } from 'react';
import { useAccessCode } from '../../context/AccessCodeContext';

export const AccessCodeModal: React.FC = () => {
  const { isModalOpen, closeModal, unlock } = useAccessCode();
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Foca no input sempre que a modal abrir e limpa os estados
  useEffect(() => {
    if (isModalOpen) {
      setCode('');
      setErrorMessage('');
      setSuccessMessage('');
      setShowPassword(false);
      setLoading(false);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isModalOpen]);

  // Tecla ESC para fechar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, closeModal]);

  if (!isModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || loading) return;

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    const res = await unlock(code);

    if (res.success) {
      setSuccessMessage('Acesso autorizado! Liberando ações...');
      setLoading(false);
      // O unlock() já fecha a modal e executa a ação pendente
    } else {
      setErrorMessage(res.message || 'Código incorreto. Tente novamente.');
      setLoading(false);
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="access-code-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-sm bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 relative overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Faixa decorativa superior */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#e63946] via-rose-500 to-amber-500" />

        {/* Botão Fechar no canto superior */}
        <button
          onClick={closeModal}
          type="button"
          aria-label="Fechar"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        {/* Ícone de Cadeado */}
        <div className="flex flex-col items-center text-center mt-2">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#e63946] shadow-inner mb-3">
            <span className="material-symbols-outlined text-[30px]">lock</span>
          </div>

          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#e63946] bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100 mb-1">
            Área Administrativa
          </span>

          <h2 id="access-code-title" className="text-lg font-black text-slate-900 tracking-tight">
            Código de Acesso
          </h2>

          <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
            O site está em modo público de visualização. Para criar, editar ou excluir registros nesta sessão, informe o código de acesso.
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Código de Liberação
            </label>

            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-slate-400 text-[20px] pointer-events-none">
                key
              </span>

              <input
                ref={inputRef}
                type={showPassword ? 'text' : 'password'}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                disabled={loading}
                placeholder="Digite o código..."
                autoComplete="current-password"
                className={`w-full pl-11 pr-11 py-3 rounded-xl bg-slate-50 border text-slate-900 font-bold text-sm focus:outline-none transition-colors ${
                  errorMessage
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                    : 'border-slate-300 focus:border-slate-900 focus:bg-white'
                }`}
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors"
                title={showPassword ? 'Ocultar código' : 'Mostrar código'}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Mensagem de Erro */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
              <span className="material-symbols-outlined text-[18px] text-rose-600 shrink-0">
                error
              </span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Mensagem de Sucesso */}
          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
              <span className="material-symbols-outlined text-[18px] text-emerald-600 shrink-0">
                check_circle
              </span>
              <span>{successMessage}</span>
            </div>
          )}

          {/* Aviso informativo de sessão */}
          <div className="flex items-center gap-1.5 text-[10px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="material-symbols-outlined text-[15px] text-amber-500 shrink-0">
              info
            </span>
            <span>
              O desbloqueio permanece ativo apenas nesta aba/página. Ao recarregar, o site volta a ficar bloqueado.
            </span>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={closeModal}
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Validando...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">lock_open</span>
                  <span>Desbloquear</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccessCodeModal;
