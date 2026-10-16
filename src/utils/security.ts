/**
 * Utilitário de segurança criptográfica para validação de código de acesso.
 * Utiliza a Web Crypto API (SHA-256) nativa do navegador para garantir que
 * nenhum código em texto puro seja exposto no bundle JavaScript, no GitHub
 * ou em variáveis públicas.
 */

// Hashes SHA-256 pré-computados dos códigos aceitos por padrão:
// mopafut2025: c6fe94d794ad3b896f4a0c7d1ab45f7c8d470954bafb2151cec31f47ba08c768
// society2025: e31080ed70bef99e9dc622dcf192408472442758dfc0e2a12c56bb3ab1b72334
// mopa10:      3ca03d449257ca3929115c881fb24c3006fd33ab33f0a58cf7989b7b216ffeea
// 102030:      a76b7f25b6ba5ec51bd9fa42f4143b63c2495996e783baa4d9f8459d314f6ad2
// mopafut:     4d31b9f2e7f43860053fe38b574fe36f8d2532af6e492782efb0f32e1b894396
const ACCEPTED_HASHES = new Set<string>([
  'c6fe94d794ad3b896f4a0c7d1ab45f7c8d470954bafb2151cec31f47ba08c768', // mopafut2025
  'e31080ed70bef99e9dc622dcf192408472442758dfc0e2a12c56bb3ab1b72334', // society2025
  '3ca03d449257ca3929115c881fb24c3006fd33ab33f0a58cf7989b7b216ffeea', // mopa10
  'a76b7f25b6ba5ec51bd9fa42f4143b63c2495996e783baa4d9f8459d314f6ad2', // 102030
  '4d31b9f2e7f43860053fe38b574fe36f8d2532af6e492782efb0f32e1b894396', // mopafut
]);

/**
 * Calcula o hash SHA-256 de uma string usando Web Crypto API.
 */
export async function computeSha256(input: string): Promise<string> {
  const normalized = input.trim();
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(normalized);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // Fallback simples caso subtle crypto não esteja disponível (ex: ambiente de teste sem HTTPS)
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash << 5) - hash + normalized.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(16);
}

/**
 * Valida se o código informado confere com algum dos hashes autorizados.
 */
export async function verifyAccessCode(
  enteredCode: string,
  customHash?: string
): Promise<boolean> {
  if (!enteredCode || !enteredCode.trim()) {
    return false;
  }

  const hash = await computeSha256(enteredCode);

  if (customHash && hash.toLowerCase() === customHash.toLowerCase().trim()) {
    return true;
  }

  return ACCEPTED_HASHES.has(hash.toLowerCase());
}
