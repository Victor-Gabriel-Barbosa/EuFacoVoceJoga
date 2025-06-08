/**
 * Classe utilitária para compressão de imagens
 * Ajuda a reduzir o tamanho das imagens antes do upload para o Firestore
 */
class ImageCompressor {
  /**
   * Comprime uma imagem para um tamanho menor
   * @param {File} file - O arquivo de imagem a ser comprimido
   * @param {Object} options - Opções de compressão
   * @param {Number} options.maxSizeKB - Tamanho máximo em KB
   * @param {Number} options.quality - Qualidade da imagem (0-1)
   * @param {Number} options.maxWidth - Largura máxima em pixels
   * @param {Number} options.maxHeight - Altura máxima em pixels
   * @returns {Promise<File>} - Arquivo comprimido
   */
  static async compressImage(file, options = {}) {
    const {
      maxSizeKB = 750,
      quality = 0.8,
      maxWidth = 1200,
      maxHeight = 1200
    } = options;

    return new Promise((resolve, reject) => {
      // Cria um elemento de imagem
      const img = new Image();
      img.src = URL.createObjectURL(file);
      
      img.onload = () => {
        // Cria um canvas para desenhar a imagem redimensionada
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Redimensiona a imagem se for maior que o máximo permitido
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round(height * maxWidth / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round(width * maxHeight / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Desenha a imagem no canvas
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Converte o canvas para blob (arquivo)
        canvas.toBlob((blob) => {
          // Verifica se o arquivo é menor que o tamanho máximo
          const fileSizeKB = blob.size / 1024;
          console.log(`Compressed size: ${Math.round(fileSizeKB)}KB`);
          
          if (fileSizeKB > maxSizeKB && quality > 0.3) {
            // Se ainda estiver maior que o tamanho máximo, tenta comprimir mais
            URL.revokeObjectURL(img.src);
            const lowerQuality = Math.max(0.3, quality - 0.1);
            
            // Tenta novamente com qualidade menor
            this.compressImage(file, {
              ...options,
              quality: lowerQuality
            }).then(resolve).catch(reject);
          } else {
            // Converte o blob para File
            const newFile = new File([blob], file.name, {
              type: blob.type,
              lastModified: new Date().getTime()
            });
            
            URL.revokeObjectURL(img.src);
            resolve(newFile);
          }
        }, file.type, quality);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error('Erro ao carregar a imagem para compressão'));
      };
    });
  }

  /**
   * Comprime uma imagem apenas se necessário
   * @param {File} file - O arquivo de imagem
   * @param {Object} options - Opções de compressão
   * @returns {Promise<File>} - Arquivo original ou comprimido
   */
  static async compressIfNeeded(file, options = {}) {
    const { maxSizeKB = 750 } = options;
    
    // Verifica se o arquivo é uma imagem
    if (!file.type.startsWith('image/')) return file;
    
    // Verifica se o arquivo já é menor que o limite
    const fileSizeKB = file.size / 1024;
    if (fileSizeKB <= maxSizeKB) return file;
    
    // Comprime a imagem
    return this.compressImage(file, options);
  }
}

export default ImageCompressor;