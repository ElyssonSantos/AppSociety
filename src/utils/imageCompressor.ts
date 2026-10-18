/**
 * Utilitário para comprimir e redimensionar imagens para Data URLs leves (10KB - 40KB),
 * garantindo compatibilidade total com o limite estrito de 1MB por documento do Firebase Firestore.
 */
export const compressImage = (
  fileOrUrl: File | Blob | string,
  maxWidth: number = 300,
  maxHeight: number = 300,
  quality: number = 0.75
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Se já for uma URL externa (http:// ou https://), retorna diretamente
    if (typeof fileOrUrl === 'string') {
      if (fileOrUrl.startsWith('http://') || fileOrUrl.startsWith('https://')) {
        resolve(fileOrUrl);
        return;
      }
      // Se já for uma Data URL pequena (menos de 50KB), retorna diretamente
      if (fileOrUrl.startsWith('data:image/') && fileOrUrl.length < 50000) {
        resolve(fileOrUrl);
        return;
      }
    }

    const processDataUrl = (dataUrl: string) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);

          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (!ctx) {
            resolve(dataUrl);
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Tenta exportar em WebP (menor tamanho e suporte a transparência)
          let compressed = canvas.toDataURL('image/webp', quality);
          if (!compressed.startsWith('data:image/webp')) {
            // Fallback para JPEG
            compressed = canvas.toDataURL('image/jpeg', quality);
          }

          resolve(compressed);
        } catch (err) {
          console.warn('Erro no processamento canvas da imagem:', err);
          resolve(dataUrl.length < 500000 ? dataUrl : 'https://i.imgur.com/vnYcevV.png');
        }
      };

      img.onerror = (err) => {
        console.warn('Erro ao carregar imagem para compressão:', err);
        resolve(typeof fileOrUrl === 'string' ? fileOrUrl : 'https://i.imgur.com/vnYcevV.png');
      };

      img.src = dataUrl;
    };

    if (typeof fileOrUrl === 'string') {
      processDataUrl(fileOrUrl);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (!result) {
          resolve('https://i.imgur.com/vnYcevV.png');
          return;
        }
        processDataUrl(result);
      };
      reader.onerror = (err) => {
        console.warn('Erro FileReader:', err);
        reject(err);
      };
      reader.readAsDataURL(fileOrUrl);
    }
  });
};
