// Utilitários para o site Eu Faço Você Joga

// Formata a data em formato legível
export function formatDate(timestamp) {
  if (!timestamp || !timestamp.toDate) return 'Data indisponível';
  
  const date = timestamp.toDate();
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

// Cria elemento de estrelas para avaliação
export function createRatingStars(averageRating, ratingCount, gameId, isInteractive = false) {
  const starsContainer = document.createElement('div');
  starsContainer.className = 'd-flex align-items-center';
  
  // Container para as estrelas
  const stars = document.createElement('div');
  stars.className = 'rating-stars';
  
  if (isInteractive) {
    stars.classList.add('interactive-stars');
    stars.dataset.gameId = gameId;
    stars.innerHTML = generateEmptyStars();
    
    // Adiciona interatividade
    for (let i = 1; i <= 5; i++) {
      const star = stars.querySelector(`[data-rating="${i}"]`);
      
      // Hover
      star.addEventListener('mouseenter', () => {
        for (let j = 1; j <= 5; j++) {
          const s = stars.querySelector(`[data-rating="${j}"]`);
          if (j <= i) {
            s.classList.remove('far');
            s.classList.add('fas');
          } else {
            s.classList.remove('fas');
            s.classList.add('far');
          }
        }
      });
      
      // Mouseleave
      star.addEventListener('mouseleave', () => {
        resetStars(stars, 0);
      });
      
      // Click
      star.addEventListener('click', async (e) => {
        e.preventDefault();
        const rating = parseInt(star.dataset.rating);
        
        // Dispara evento customizado para avaliação
        const rateEvent = new CustomEvent('rate-game', {
          detail: {
            gameId,
            rating
          }
        });
        document.dispatchEvent(rateEvent);
      });
    }
  } else stars.innerHTML = generateFilledStars(averageRating); // Exibe estrelas estáticas
  
  starsContainer.appendChild(stars);
  
  // Exibe a contagem de avaliações, se houver
  if (ratingCount !== undefined && !isInteractive) {
    const count = document.createElement('span');
    count.className = 'ms-2 text-muted small';
    count.textContent = `(${ratingCount} avaliação${ratingCount !== 1 ? 'ões' : ''})`;
    starsContainer.appendChild(count);
  }
  
  return starsContainer;
}

// Gera código HTML para estrelas vazias interativas
function generateEmptyStars() {
  let starsHtml = '';
  for (let i = 1; i <= 5; i++) starsHtml += `<i class="far fa-star me-1" data-rating="${i}"></i>`;
  return starsHtml;
}

// Gera código HTML para estrelas preenchidas com base na avaliação
function generateFilledStars(rating) {
  let starsHtml = '';
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  
  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) starsHtml += '<i class="fas fa-star me-1"></i>';
    else if (i === fullStars + 1 && halfStar) starsHtml += '<i class="fas fa-star-half-alt me-1"></i>';
    else starsHtml += '<i class="far fa-star me-1"></i>';
  }
  
  return starsHtml;
}

// Reseta as estrelas para o estado inicial
function resetStars(starsContainer, currentRating = 0) {
  for (let i = 1; i <= 5; i++) {
    const star = starsContainer.querySelector(`[data-rating="${i}"]`);
    if (i <= currentRating) {
      star.classList.remove('far');
      star.classList.add('fas');
    } else {
      star.classList.remove('fas');
      star.classList.add('far');
    }
  }
}

// Trunca texto longo com reticências
export function truncateText(text, maxLength) {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

// Validação simples de formulário
export function validateForm(formData, requiredFields) {
  const errors = [];
  
  for (const field of requiredFields) {
    if (!formData[field] || formData[field].trim() === '') errors.push(`O campo ${field} é obrigatório.`);
  }
  
  return errors;
}

// Exibe loader durante carregamento
export function showLoader(container) {
  container.innerHTML = `
    <div class="loading-container">
      <span class="loader"></span>
    </div>
  `;
}

// Remove loader
export function hideLoader(container) {
  const loader = container.querySelector('.loading-container');
  if (loader) loader.remove();
}