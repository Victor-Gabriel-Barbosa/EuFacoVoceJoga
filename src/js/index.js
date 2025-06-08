import { app } from './firebase-config.js';
import Navbar from '../components/navbar.js';
import FirebaseService from './firebase-service.js';
import ToastManager from './toast-manager.js';
import { formatDate, truncateText, showLoader, hideLoader } from './utils.js';
import { createCriteriaRating, displayCriteriaRatings, GAME_CRITERIA } from './criteria-rating.js';

// Variáveis globais
let ratingModal;
let ratingCriteriaContainer;
let ratingModalTitle;
let currentGameForRating = null;

// Inicializa a navbar
function initializeNavbar() {
  const navbar = new Navbar();
  document.getElementById('navbar-container').appendChild(navbar.getElement());
  navbar.setActive('index.html');
}

// Carrega o ranking dos jogos
async function loadTopGames() {
  const gamesContainer = document.getElementById('games-ranking');
  
  showLoader(gamesContainer);
  
  try {
    // Busca os jogos ordenados por avaliação
    window.allGames = await FirebaseService.getAllGames();
    
    // Limpa o container
    gamesContainer.innerHTML = '';
    
    // Exibe apenas os top 3 jogos ou todos se forem menos que 3
    const topGames = window.allGames.slice(0, Math.min(3, window.allGames.length));
    
    if (topGames.length === 0) {
      gamesContainer.innerHTML = `
        <div class="col-12 text-center py-5">
          <div class="alert alert-info">
            <i class="fas fa-info-circle me-2"></i>Ainda não há jogos cadastrados. Seja o primeiro a cadastrar!
          </div>
        </div>
      `;
      return;
    }
    
    // Cria cards para cada jogo
    topGames.forEach((game, index) => {
      const col = document.createElement('div');
      col.className = 'col-md-4 mb-4';
      
      // Determina qual medalha exibir (apenas para os 3 primeiros)
      let medalIcon = '';
      let medalClass = '';
      
      if (index === 0) {
        medalIcon = '<i class="fas fa-medal text-warning me-1"></i>';
        medalClass = 'border-warning';
      } else if (index === 1) {
        medalIcon = '<i class="fas fa-medal text-secondary me-1"></i>';
        medalClass = 'border-secondary';
      } else if (index === 2) {
        medalIcon = '<i class="fas fa-medal text-danger me-1"></i>';
        medalClass = 'border-danger';
      }
      
      // Cria o card do jogo
      col.innerHTML = `
        <div class="card h-100 game-card ${medalClass} ${index === 0 ? 'border-3' : ''}">
          <div class="position-relative">
            <img src="${game.imageUrl || 'src/images/game-placeholder.jpg'}" class="card-img-top game-cover" alt="${game.name}">
            <div class="position-absolute top-0 end-0 p-2">
              <span class="badge bg-dark">${medalIcon}${index + 1}º</span>
            </div>
          </div>
          <div class="card-body">
            <h5 class="card-title">${game.name}</h5>
            <h6 class="card-subtitle mb-2 text-muted">${game.developer}</h6>
            <p class="card-text">${truncateText(game.description, 100)}</p>            <div class="mb-3">
              <div class="d-flex justify-content-between align-items-center">
                <div class="rating-display">
                  <span class="badge badge-rating">
                    <i class="fas fa-star me-1"></i>${game.averageRating.toFixed(1)}
                  </span>
                  <small class="text-muted ms-2">(${game.ratingCount} avaliação${game.ratingCount !== 1 ? 'ões' : ''})</small>
                </div>
                <button class="btn btn-sm btn-outline-primary rate-game-btn" data-game-id="${game.id}">
                  <i class="fas fa-star me-1"></i>Avaliar
                </button>
              </div>
              <div class="criteria-ratings-container"></div>
            </div>
            <a href="detalhes.html?id=${game.id}" class="btn btn-sm btn-primary">
              <i class="fas fa-info-circle me-1"></i>Ver Detalhes
            </a>
            <a href="${game.gameUrl}" target="_blank" class="btn btn-sm btn-outline-primary ms-1">
              <i class="fas fa-gamepad me-1"></i>Jogar
            </a>
          </div>
          <div class="card-footer text-muted small">
            Cadastrado em: ${formatDate(game.createdAt)}
          </div>
        </div>      `;
      
      gamesContainer.appendChild(col);
      
      // Adiciona as avaliações por critério se existirem (usando DOM em vez de outerHTML)
      if (game.criteriaRatings) {
        const criteriaRatingsElement = displayCriteriaRatings(game.criteriaRatings);
        if (criteriaRatingsElement) {
          const criteriaContainer = col.querySelector('.criteria-ratings-container');
          if (criteriaContainer) {
            criteriaContainer.appendChild(criteriaRatingsElement);
          }
        }
      }
    });
  } catch (error) {
    console.error('Erro ao carregar jogos:', error);
    ToastManager.error('Erro ao carregar jogos. Tente novamente mais tarde.');
    
    gamesContainer.innerHTML = `
      <div class="col-12 text-center">
        <div class="alert alert-danger">
          <i class="fas fa-exclamation-triangle me-2"></i>Erro ao carregar jogos. Tente novamente mais tarde.
        </div>
      </div>
    `;
  }
}

// Carrega o jogo para avaliação
async function loadGameForRating(gameId) {
  try {
    // Se os jogos não foram carregados ainda, busca todos os jogos
    if (!window.allGames) {
      window.allGames = await FirebaseService.getAllGames();
    }
    
    // Encontra o jogo pelo ID
    const game = window.allGames.find(g => g.id === gameId);
    
    if (game) {
      // Verifica se o usuário não é o proprietário do jogo
      const currentUser = FirebaseService.getCurrentUser();
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
    } else {
      ToastManager.error('Jogo não encontrado. Tente recarregar a página.');
    }
  } catch (error) {
    console.error('Erro ao buscar jogo para avaliação:', error);
    ToastManager.error('Erro ao buscar jogo. Tente novamente mais tarde.');
  }
}

// Manipula eventos de avaliação de jogos por critérios
function handleCriteriaRating(e) {
  const { gameId, ratings, averageRating } = e.detail;
  
  FirebaseService.rateCriteriaGame(gameId, ratings)
    .then(result => {
      // Atualiza a classificação do jogo na lista local e recarrega a página
      ToastManager.success('Obrigado pela sua avaliação detalhada!');
      
      // Fecha o modal após 1.5 segundos para o usuário ver a mensagem de agradecimento
      setTimeout(() => {
        ratingModal.hide();
        
        // Recarrega a página para mostrar as novas avaliações
        loadTopGames();
      }, 1500);
    })
    .catch(error => {
      console.error('Erro ao avaliar jogo por critérios:', error);
      ToastManager.error('Erro ao registrar avaliação. Tente novamente.');
    });
}

// Manipula cliques nos botões de avaliação
function handleRatingButtonClick(e) {
  if (e.target.closest('.rate-game-btn')) {
    const btn = e.target.closest('.rate-game-btn');
    const gameId = btn.dataset.gameId;
    
    // Verifica se o usuário está logado
    const currentUser = FirebaseService.getCurrentUser();
    if (!currentUser) {
      ToastManager.warning('Você precisa estar logado para avaliar este jogo.');
      return;
    }
    
    // Carrega o jogo para avaliação
    loadGameForRating(gameId);
  }
}

// Inicializa os elementos do modal
function initializeModal() {
  ratingModal = new bootstrap.Modal(document.getElementById('ratingModal'));
  ratingCriteriaContainer = document.getElementById('rating-criteria-container');
  ratingModalTitle = document.getElementById('ratingModalLabel');
}

// Inicializa todos os event listeners
function initializeEventListeners() {
  // Carrega os jogos quando a página for carregada
  document.addEventListener('DOMContentLoaded', () => {
    initializeModal();
    loadTopGames();
  });
  
  // Manipula eventos de avaliação de jogos
  document.addEventListener('rate-game-criteria', handleCriteriaRating);
  
  // Evento de clique nos botões de avaliação
  document.addEventListener('click', handleRatingButtonClick);
}

// Inicializa a aplicação
function init() {
  initializeNavbar();
  initializeEventListeners();
}

// Inicia a aplicação
init();
