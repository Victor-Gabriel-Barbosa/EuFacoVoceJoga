import Navbar from '../components/navbar.js';
import Footer from '../components/footer.js';
import FirebaseService from './firebase-service.js';
import ToastManager from './toast-manager.js';
import { formatDate, truncateText, showLoader, hideLoader } from './utils.js';
import { createCriteriaRating, displayCriteriaRatings, GAME_CRITERIA } from './criteria-rating.js';

// Inicializa a navbar
const navbar = new Navbar();
document.getElementById('navbar-container').appendChild(navbar.getElement());
navbar.setActive('games.html');

// Inicializa o footer
const footer = new Footer();
document.getElementById('footer-container').appendChild(footer.getElement());

// Elementos da página
const gamesList = document.getElementById('games-list');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');
const pagination = document.getElementById('pagination');
const ratingModal = new bootstrap.Modal(document.getElementById('ratingModal'));
const ratingCriteriaContainer = document.getElementById('rating-criteria-container');
const ratingModalTitle = document.getElementById('ratingModalLabel');

// Estado da aplicação
let allGames = [];
let filteredGames = [];
let currentPage = 1;
const gamesPerPage = 9;
let currentGameForRating = null;

// Carrega os jogos
async function loadGames() {
  showLoader(gamesList);
  
  try {
    // Busca os jogos do Firestore
    allGames = await FirebaseService.getAllGames();
    
    // Define os jogos filtrados iniciais
    filteredGames = [...allGames];
    
    // Aplica a ordenação inicial
    applySort();
    
    // Exibe os jogos
    displayGames();
  } catch (error) {
    console.error('Erro ao carregar jogos:', error);
    ToastManager.error('Erro ao carregar jogos. Tente novamente mais tarde.');
    
    gamesList.innerHTML = `
      <div class="col-12 text-center">
        <div class="alert alert-danger">
          <i class="fas fa-exclamation-triangle me-2"></i>Erro ao carregar jogos. Tente novamente mais tarde.
        </div>
      </div>
    `;
  }
}

// Exibe os jogos com paginação
function displayGames() {
  // Limpa o container
  gamesList.innerHTML = '';
  
  if (filteredGames.length === 0) {
    gamesList.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="alert alert-info">
          <i class="fas fa-info-circle me-2"></i>Nenhum jogo encontrado. Tente refinar sua busca.
        </div>
      </div>
    `;
    pagination.innerHTML = '';
    return;
  }
  
  // Calcula o intervalo para a página atual
  const startIndex = (currentPage - 1) * gamesPerPage;
  const endIndex = Math.min(startIndex + gamesPerPage, filteredGames.length);
  const gamesForPage = filteredGames.slice(startIndex, endIndex);
  
  // Cria os cards para cada jogo
  gamesForPage.forEach(game => {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4 mb-4';
    
    // Cria o card do jogo
    col.innerHTML = `
      <div class="card h-100 game-card">
        <div class="position-relative">
          <img src="${game.imageUrl || 'src/images/game-placeholder.jpg'}" class="card-img-top game-cover" alt="${game.name}">
          <div class="position-absolute top-0 end-0 p-2">
            <span class="badge badge-rating">
              <i class="fas fa-star me-1"></i>${game.averageRating.toFixed(1)}
            </span>
          </div>
        </div>
        <div class="card-body">
          <h5 class="card-title">${game.name}</h5>
          <h6 class="card-subtitle mb-2 text-muted">${game.developer}</h6>
          <p class="card-text">${truncateText(game.description, 100)}</p>
          <div class="d-flex justify-content-between mb-2">
            <button class="btn btn-sm btn-outline-primary rate-game-btn" data-game-id="${game.id}">
              <i class="fas fa-star me-1"></i>Avaliar
            </button>
            <span class="text-muted small align-self-center">${game.ratingCount} avaliação${game.ratingCount !== 1 ? 'ões' : ''}</span>
          </div>
          <div class="d-flex justify-content-between">
            <a href="details.html?id=${game.id}" class="btn btn-sm btn-primary">
              <i class="fas fa-info-circle me-1"></i>Detalhes
            </a>
            <div>
              <a href="${game.gameUrl}" target="_blank" class="btn btn-sm btn-outline-primary">
                <i class="fas fa-gamepad me-1"></i>Jogar
              </a>
            </div>
          </div>
        </div>
        <div class="card-footer text-muted small">
          <span>Cadastrado em: ${formatDate(game.createdAt)}</span>
        </div>
      </div>
    `;
    
    gamesList.appendChild(col);
  });
  
  // Atualiza a paginação
  updatePagination();
}

// Atualiza a paginação
function updatePagination() {
  // Limpa a paginação
  pagination.innerHTML = '';
  
  // Calcula o número total de páginas
  const totalPages = Math.ceil(filteredGames.length / gamesPerPage);
  
  if (totalPages <= 1) {
    return; // Não exibe paginação se tiver apenas uma página
  }
  
  // Cria a navegação de paginação
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Paginação de jogos');
  
  const ul = document.createElement('ul');
  ul.className = 'pagination';
  
  // Botão de página anterior
  const prevLi = document.createElement('li');
  prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
  
  const prevLink = document.createElement('a');
  prevLink.className = 'page-link';
  prevLink.href = '#';
  prevLink.setAttribute('aria-label', 'Anterior');
  prevLink.innerHTML = '<span aria-hidden="true">&laquo;</span>';
  
  prevLink.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentPage > 1) {
      currentPage--;
      displayGames();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
  
  prevLi.appendChild(prevLink);
  ul.appendChild(prevLi);
  
  // Números de página
  for (let i = 1; i <= totalPages; i++) {
    const pageLi = document.createElement('li');
    pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`;
    
    const pageLink = document.createElement('a');
    pageLink.className = 'page-link';
    pageLink.href = '#';
    pageLink.textContent = i;
    
    pageLink.addEventListener('click', (e) => {
      e.preventDefault();
      currentPage = i;
      displayGames();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    pageLi.appendChild(pageLink);
    ul.appendChild(pageLi);
  }
  
  // Botão de próxima página
  const nextLi = document.createElement('li');
  nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
  
  const nextLink = document.createElement('a');
  nextLink.className = 'page-link';
  nextLink.href = '#';
  nextLink.setAttribute('aria-label', 'Próxima');
  nextLink.innerHTML = '<span aria-hidden="true">&raquo;</span>';
  
  nextLink.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentPage < totalPages) {
      currentPage++;
      displayGames();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
  
  nextLi.appendChild(nextLink);
  ul.appendChild(nextLi);
  
  nav.appendChild(ul);
  pagination.appendChild(nav);
}

// Filtra os jogos com base na busca
function filterGames() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  
  filteredGames = allGames.filter(game => {
    const nameMatch = game.name.toLowerCase().includes(searchTerm);
    const developerMatch = game.developer.toLowerCase().includes(searchTerm);
    const descriptionMatch = game.description.toLowerCase().includes(searchTerm);
    
    return nameMatch || developerMatch || descriptionMatch;
  });
  
  // Reseta para a primeira página
  currentPage = 1;
  
  // Aplica a ordenação atual
  applySort();
  
  // Atualiza a exibição
  displayGames();
}

// Aplica a ordenação selecionada
function applySort() {
  const sortBy = sortSelect.value;
  
  switch (sortBy) {
    case 'rating':
      filteredGames.sort((a, b) => b.averageRating - a.averageRating);
      break;
    case 'recent':
      filteredGames.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.seconds - a.createdAt.seconds;
      });
      break;
    case 'name':
      filteredGames.sort((a, b) => a.name.localeCompare(b.name));
      break;
  }
}

// Manipula eventos de avaliação de jogos
document.addEventListener('rate-game-criteria', async (e) => {
  const { gameId, ratings, averageRating } = e.detail;
  
  try {
    // Envia a avaliação por critérios para o servidor
    const result = await FirebaseService.rateCriteriaGame(gameId, ratings);
    
    // Atualiza a classificação do jogo na lista local
    const gameIndex = allGames.findIndex(game => game.id === gameId);
    if (gameIndex !== -1) {
      allGames[gameIndex].averageRating = result.averageRating;
      allGames[gameIndex].criteriaRatings = result.criteriaRatings;
      allGames[gameIndex].ratingCount = result.ratingCount;
      
      // Atualiza a visualização
      const gameInFiltered = filteredGames.findIndex(game => game.id === gameId);
      if (gameInFiltered !== -1) {
        filteredGames[gameInFiltered].averageRating = result.averageRating;
        filteredGames[gameInFiltered].criteriaRatings = result.criteriaRatings;
        filteredGames[gameInFiltered].ratingCount = result.ratingCount;
      }
    }
    
    // Exibe mensagem de sucesso
    ToastManager.success('Obrigado pela sua avaliação detalhada!');
    
    // Fecha o modal após 1.5 segundos para o usuário ver a mensagem de agradecimento
    setTimeout(() => {
      ratingModal.hide();
    }, 1500);
    
    // Recarrega os jogos para atualizar a ordenação
    if (sortSelect.value === 'rating') {
      applySort();
      displayGames();
    } else {
      // Apenas atualiza a página atual para refletir a nova avaliação
      displayGames();
    }
  } catch (error) {
    console.error('Erro ao avaliar jogo por critérios:', error);
    ToastManager.error('Erro ao registrar avaliação. Tente novamente.');
  }
});

// Evento de clique nos botões de avaliação
document.addEventListener('click', function(e) {
  if (e.target.closest('.rate-game-btn')) {
    const btn = e.target.closest('.rate-game-btn');
    const gameId = btn.dataset.gameId;
    
    // Verifica se o usuário está logado
    const currentUser = FirebaseService.getCurrentUser();
    if (!currentUser) {
      ToastManager.warning('Você precisa estar logado para avaliar este jogo.');
      return;
    }
    
    // Encontra o jogo para avaliação
    const game = allGames.find(g => g.id === gameId);
    if (game) {
      // Verifica se o usuário não é o proprietário do jogo
      if (currentUser.uid === game.userId) {
        ToastManager.info('Você não pode avaliar seu próprio jogo.');
        return;
      }
      
      // Atualiza o título do modal
      ratingModalTitle.textContent = `Avaliar: ${game.name}`;
      
      // Limpa o container
      ratingCriteriaContainer.innerHTML = '';
      
      // Define o jogo atual para avaliação
      currentGameForRating = game;
      
      // Cria e adiciona o formulário de avaliação
      const criteriaForm = createCriteriaRating(game.id, game.criteriaRatings);
      ratingCriteriaContainer.appendChild(criteriaForm);
      
      // Exibe o modal
      ratingModal.show();
    }
  }
});

// Eventos
searchInput.addEventListener('input', filterGames);
sortSelect.addEventListener('change', () => {
  applySort();
  displayGames();
});

// Carrega os jogos quando a página for carregada
document.addEventListener('DOMContentLoaded', loadGames);
