/**
 * Utilitário de sanitização de dados para o Firebase Firestore.
 * 
 * O Firestore rejeita qualquer gravação (setDoc ou updateDoc) se algum campo ou
 * elemento aninhado em array/objeto for `undefined`, gerando o erro fatal:
 * "FirebaseError: Function ... called with invalid data. Unsupported field value: undefined"
 * 
 * Esta função percorre recursivamente estruturas de dados e:
 * 1. Remove chaves cujo valor é `undefined`.
 * 2. Converte `undefined` dentro de arrays para `null`.
 * 3. Preserva instâncias especiais do Firestore (Timestamp, FieldValue, etc).
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as unknown as T;
  }

  if (Array.isArray(data)) {
    return data.map((item) =>
      item === undefined ? null : sanitizeForFirestore(item)
    ) as unknown as T;
  }

  if (typeof data === 'object') {
    // Preserva instâncias especiais do Firestore (Timestamp, FieldValue / increment, etc.)
    if (data.constructor && data.constructor.name !== 'Object') {
      return data;
    }

    const clean: Record<string, any> = {};
    for (const [key, value] of Object.entries(data as Record<string, any>)) {
      if (value !== undefined) {
        clean[key] = sanitizeForFirestore(value);
      }
    }
    return clean as T;
  }

  return data;
}
