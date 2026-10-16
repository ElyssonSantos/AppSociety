import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';
import { verifyAccessCode } from '../utils/security';

interface AccessCodeContextType {
  isUnlocked: boolean;
  isModalOpen: boolean;
  openModal: (onSuccess?: () => void) => void;
  closeModal: () => void;
  unlock: (code: string) => Promise<{ success: boolean; message?: string }>;
  lock: () => void;
  requestAction: (action: () => void | Promise<void>) => void;
}

const AccessCodeContext = createContext<AccessCodeContextType | undefined>(undefined);

export const AccessCodeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // ATENÇÃO: Conforme especificado, o estado fica ESTRITAMENTE em memória React.
  // Nenhum valor é salvo em localStorage, sessionStorage, cookies ou indexDB.
  // Qualquer reload ou reabertura restaura para false (bloqueado).
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Callback a ser executado caso o usuário desbloqueie com sucesso após tentar uma ação
  const pendingActionRef = useRef<(() => void | Promise<void>) | null>(null);

  const openModal = (onSuccess?: () => void) => {
    if (onSuccess) {
      pendingActionRef.current = onSuccess;
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    pendingActionRef.current = null;
  };

  const lock = () => {
    setIsUnlocked(false);
    pendingActionRef.current = null;
  };

  const unlock = async (code: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const isValid = await verifyAccessCode(code);
      if (isValid) {
        setIsUnlocked(true);
        setIsModalOpen(false);

        // Se havia uma ação que disparou a solicitação de desbloqueio, executa-a agora
        if (pendingActionRef.current) {
          const action = pendingActionRef.current;
          pendingActionRef.current = null;
          try {
            await action();
          } catch (err) {
            console.error('Erro ao executar ação pendente pós-desbloqueio:', err);
          }
        }

        return { success: true };
      } else {
        return { success: false, message: 'Código de acesso incorreto. Verifique e tente novamente.' };
      }
    } catch (err: any) {
      return { success: false, message: 'Erro ao validar código. Tente novamente.' };
    }
  };

  /**
   * Envolve qualquer ação mutável (criar, editar, deletar).
   * Se desbloqueado, executa imediatamente.
   * Se bloqueado, abre a modal de código e agenda a execução para logo após o desbloqueio.
   */
  const requestAction = (action: () => void | Promise<void>) => {
    if (isUnlocked) {
      action();
    } else {
      pendingActionRef.current = action;
      setIsModalOpen(true);
    }
  };

  return (
    <AccessCodeContext.Provider
      value={{
        isUnlocked,
        isModalOpen,
        openModal,
        closeModal,
        unlock,
        lock,
        requestAction,
      }}
    >
      {children}
    </AccessCodeContext.Provider>
  );
};

export const useAccessCode = (): AccessCodeContextType => {
  const context = useContext(AccessCodeContext);
  if (!context) {
    throw new Error('useAccessCode deve ser usado dentro de um AccessCodeProvider');
  }
  return context;
};
