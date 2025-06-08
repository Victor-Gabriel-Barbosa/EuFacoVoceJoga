import Navbar from '../components/navbar.js';
import Footer from '../components/footer.js';
import FirebaseService from './firebase-service.js';
import ToastManager from './toast-manager.js';
import { formatDate, showLoader, hideLoader } from './utils.js';
import { createCriteriaRating, displayCriteriaRatings, GAME_CRITERIA } from './criteria-rating.js';

// Inicializa a navbar
const navbar = new Navbar();
document.getElementById('navbar-container').appendChild(navbar.getElement());

// Inicializa o footer
const footer = new Footer();
document.getElementById('footer-container').appendChild(footer.getElement());

// Elementos da página
const gameDetailsContainer = document.getElementById('game-details');

// Modais
const editModal = new bootstrap.Modal(document.getElementById('editModal'));
const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));

// Campos do formulário de edição
const editForm = document.getElementById('edit-form');
const editGameName = document.getElementById('edit-game-name');
const editGameDeveloper = document.getElementById('edit-game-developer');
const editGameDescription = document.getElementById('edit-game-description');
const editGameUrl = document.getElementById('edit-game-url');
const editGameImage = document.getElementById('edit-game-image');
const saveEditBtn = document.getElementById('save-edit-btn');

// Campos da modal de exclusão
const deleteGameNameSpan = document.getElementById('delete-game-name');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

// Estado da aplicação
let currentGame = null;
let gameId = null;

// Obtém o ID do jogo da URL
function getGameIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
}

// Verifica se o usuário atual é o criador do jogo para mostrar/esconder botões de edição e exclusão
function checkUserPermissions(game) {
  const editBtn = document.getElementById('edit-btn');
  const deleteBtn = document.getElementById('delete-btn');
  
  // Esconde os botões por padrão
  editBtn.classList.add('d-none');
  deleteBtn.classList.add('d-none');
  
  const currentUser = FirebaseService.getCurrentUser();
  
  // Se o usuário estiver logado e for o criador do jogo, mostra os botões
  if (currentUser && game.userId === currentUser.uid) {
    editBtn.classList.remove('d-none');
    deleteBtn.classList.remove('d-none');
  }
}

// Carrega os detalhes do jogo
async function loadGameDetails() {
  // Obtém o ID do jogo da URL
  gameId = getGameIdFromUrl();
  
  if (!gameId) {
    gameDetailsContainer.innerHTML = `
      <div class="alert alert-danger">
        <i class="fas fa-exclamation-triangle me-2"></i>ID do jogo não fornecido. Por favor, volte e selecione um jogo.
      </div>
      <div class="text-center">
        <a href="games.html" class="btn btn-primary">Ver Lista de Jogos</a>
      </div>
    `;
    return;
  }
  
  showLoader(gameDetailsContainer);
  
  try {
    // Busca os detalhes do jogo
    currentGame = await FirebaseService.getGameById(gameId);
    
    if (!currentGame) {
      gameDetailsContainer.innerHTML = `
        <div class="alert alert-warning">
          <i class="fas fa-exclamation-triangle me-2"></i>Jogo não encontrado. Ele pode ter sido removido.
        </div>
        <div class="text-center">
          <a href="games.html" class="btn btn-primary">Ver Lista de Jogos</a>
        </div>
      `;
      return;
    }        
    
    // Atualiza o título da página
    document.title = `${currentGame.name} - Eu Faço Você Joga!`;
    
    // Exibe os detalhes do jogo
    displayGameDetails();
    
    // Verifica permissões do usuário para edição/exclusão
    checkUserPermissions(currentGame);
  } catch (error) {
    console.error('Erro ao carregar detalhes do jogo:', error);
    ToastManager.error('Erro ao carregar detalhes do jogo. Tente novamente mais tarde.');
    
    gameDetailsContainer.innerHTML = `
      <div class="alert alert-danger">
        <i class="fas fa-exclamation-triangle me-2"></i>Erro ao carregar detalhes do jogo. Tente novamente mais tarde.
      </div>
      <div class="text-center">
        <a href="games.html" class="btn btn-primary">Voltar para Lista de Jogos</a>
      </div>
    `;
  }
}

// Exibe os detalhes do jogo
function displayGameDetails() {
  const game = currentGame;
  
  // Preenche os detalhes do jogo
  gameDetailsContainer.innerHTML = `
    <div class="row">
      <div class="col-lg-8">
        <!-- Cabeçalho com ações -->
        <div class="d-flex justify-content-between align-items-start flex-wrap mb-4">
          <div>
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb">
                <li class="breadcrumb-item"><a href="index.html">Início</a></li>
                <li class="breadcrumb-item"><a href="games.html">Jogos</a></li>
                <li class="breadcrumb-item active" aria-current="page">${game.name}</li>
              </ol>
            </nav>
            <h1 class="display-6 mb-1">${game.name}</h1>
            <p class="text-muted">Desenvolvido por <strong>${game.developer}</strong></p>
          </div>
          <div class="d-flex mt-2 mt-md-0">
            <button class="btn btn-outline-primary me-2" id="edit-btn">
              <i class="fas fa-edit me-1"></i>Editar
            </button>
            <button class="btn btn-outline-danger" id="delete-btn">
              <i class="fas fa-trash-alt me-1"></i>Excluir
            </button>
          </div>
        </div>
        
        <!-- Imagem do jogo -->
        <div class="mb-4">
          <img src="${game.imageUrl || 'src/images/game-placeholder.jpg'}" class="img-fluid rounded" alt="${game.name}">
        </div>
          
        <!-- Avaliação -->
        <div class="card mb-4">
          <div class="card-body">
            <h3 class="h5 mb-3">Avaliação</h3>
            <div class="d-flex align-items-center">
              <div class="me-3">
                <span class="display-4 fw-bold">${game.averageRating.toFixed(1)}</span>
                <span class="text-muted">/ 10</span>
              </div>
              <div>
                <div class="progress" style="height: 10px; width: 150px;">
                  <div class="progress-bar" role="progressbar" 
                    style="width: ${(game.averageRating / 10) * 100}%;" 
                    aria-valuenow="${game.averageRating}" 
                    aria-valuemin="0" 
                    aria-valuemax="10">
                  </div>
                </div>
                <p class="text-muted mb-0 mt-1">${game.ratingCount} avaliação${game.ratingCount !== 1 ? 'ões' : ''}</p>
              </div>
            </div>
            
            <div id="criteria-ratings-display" class="mt-4">
              <!-- Avaliações por critério serão exibidas aqui -->
            </div>
            
            <hr class="my-3">
            
            <div>
              <h5 class="mb-3">Avalie este jogo:</h5>
              <div id="criteria-rating-form"></div>
            </div>
          </div>
        </div>
        
        <!-- Descrição -->
        <div class="card mb-4">
          <div class="card-body">
            <h3 class="h5 mb-3">Sobre o Jogo</h3>
            <p>${game.description.replace(/\n/g, '<br>')}</p>
          </div>
        </div>
      </div>
      
      <div class="col-lg-4">
        <!-- Informações e ações -->
        <div class="card mb-4">
          <div class="card-body">
            <h3 class="h5 mb-3">Informações</h3>
            <ul class="list-group list-group-flush">
              <li class="list-group-item d-flex justify-content-between align-items-start px-0">
                <div class="ms-2 me-auto">
                  <div class="fw-bold">Data de Cadastro</div>
                  ${formatDate(game.createdAt)}
                </div>
              </li>
              
              <li class="list-group-item d-flex justify-content-between align-items-start px-0">
                <div class="ms-2 me-auto">
                  <div class="fw-bold">Última Atualização</div>
                  ${formatDate(game.updatedAt)}
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        <!-- Link para jogar -->
        <div class="card mb-4">
          <div class="card-body text-center">
            <h3 class="h5 mb-3">Jogar Agora</h3>
            <a href="${game.gameUrl}" target="_blank" class="btn btn-primary btn-lg w-100">
              <i class="fas fa-gamepad me-2"></i>Jogar / Download
            </a>
            <p class="text-muted mt-2 small">
              <i class="fas fa-external-link-alt me-1"></i>Você será redirecionado para o site do jogo
            </p>
          </div>
        </div>
        
        <!-- Compartilhar -->
        <div class="card mb-4">
          <div class="card-body">
            <h3 class="h5 mb-3">Compartilhar</h3>
            <div class="d-flex justify-content-between">
              <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}" target="_blank" class="btn btn-outline-primary">
                <i class="fab fa-facebook-f"></i>
              </a>
              <a href="https://twitter.com/intent/tweet?text=Confira este jogo: ${encodeURIComponent(game.name)}&url=${encodeURIComponent(window.location.href)}" target="_blank" class="btn btn-outline-primary">
                <i class="fab fa-twitter"></i>
              </a>
              <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(`Confira este jogo: ${game.name} - ${window.location.href}`)}" target="_blank" class="btn btn-outline-primary">
                <i class="fab fa-whatsapp"></i>
              </a>
              <a href="mailto:?subject=${encodeURIComponent(`Confira este jogo: ${game.name}`)}&body=${encodeURIComponent(`Olá,\n\nAchei que você poderia gostar deste jogo: ${game.name}\n\nConfira aqui: ${window.location.href}`)}" class="btn btn-outline-primary">
                <i class="fas fa-envelope"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
    
  // Adiciona as avaliações por critério
  const criteriaRatingsDisplay = document.getElementById('criteria-ratings-display');
  if (criteriaRatingsDisplay && game.criteriaRatings) {
    const criteriaDisplay = displayCriteriaRatings(game.criteriaRatings);
    if (criteriaDisplay) criteriaRatingsDisplay.appendChild(criteriaDisplay);
  }
    
  // Adiciona o formulário de avaliação por critérios
  const criteriaRatingForm = document.getElementById('criteria-rating-form');
  if (criteriaRatingForm) {
    // Verifica se o usuário está logado
    const currentUser = FirebaseService.getCurrentUser();
    
    if (currentUser) {
      // Verifica se o usuário não é o proprietário do jogo (não pode avaliar o próprio jogo)
      if (currentUser.uid === game.userId) {
        criteriaRatingForm.innerHTML = `
          <div class="alert alert-info">
            <i class="fas fa-info-circle me-2"></i>Você não pode avaliar seu próprio jogo.
          </div>
        `;
      } else {
        const criteriaForm = createCriteriaRating(game.id, game.criteriaRatings);
        criteriaRatingForm.appendChild(criteriaForm);
      }
    } else {
      // Usuário não está logado, mostra mensagem para fazer login
      criteriaRatingForm.innerHTML = `
        <div class="alert alert-warning">
          <i class="fas fa-exclamation-triangle me-2"></i>
          <strong>Atenção!</strong> Você precisa estar logado para avaliar este jogo.
          <button id="rating-login-button" class="btn btn-primary btn-sm ms-3">
            <i class="fab fa-google me-1"></i> Entrar com Google
          </button>
        </div>
      `;
      
      // Adiciona evento de clique ao botão de login
      setTimeout(() => {
        const ratingLoginButton = document.getElementById('rating-login-button');
        if (ratingLoginButton) {
          ratingLoginButton.addEventListener('click', async () => {
            try {
              await FirebaseService.loginWithGoogle();
              // Após login bem-sucedido, recarrega a página
              loadGameDetails();
            } catch (error) {
              console.error('Erro ao fazer login:', error);
              ToastManager.error('Não foi possível fazer login. Tente novamente mais tarde.');
            }
          });
        }
      }, 100);
    }
  }
  
  // Adiciona os eventos para os botões de edição e exclusão
  const editBtn = document.getElementById('edit-btn');
  const deleteBtn = document.getElementById('delete-btn');
  
  if (editBtn) editBtn.addEventListener('click', openEditModal);
  
  if (deleteBtn) deleteBtn.addEventListener('click', openDeleteModal);
  
  // Verifica permissões do usuário
  checkUserPermissions(game);
}

// Abre o modal de edição
function openEditModal() {
  if (!currentGame) return;
  
  // Preenche o formulário com os dados atuais
  editGameName.value = currentGame.name;
  editGameDeveloper.value = currentGame.developer;
  editGameDescription.value = currentGame.description;
  editGameUrl.value = currentGame.gameUrl;
  
  // Limpa o campo de imagem
  editGameImage.value = '';
  
  // Exibe o modal
  editModal.show();
}

// Abre o modal de exclusão
function openDeleteModal() {
  if (!currentGame) return;
  
  // Preenche o nome do jogo na confirmação
  deleteGameNameSpan.textContent = currentGame.name;
  
  // Exibe o modal
  deleteModal.show();
}

// Salva as alterações no jogo
async function saveGameChanges() {
  // Valida o formulário
  if (!editForm.checkValidity()) {
    editForm.classList.add('was-validated');
    return;
  }
  
  // Desabilita o botão de salvar
  saveEditBtn.disabled = true;
  saveEditBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Salvando...';
  
  try {
    // Prepara os dados atualizados
    const updatedData = {
      name: editGameName.value.trim(),
      developer: editGameDeveloper.value.trim(),
      description: editGameDescription.value.trim(),
      gameUrl: editGameUrl.value.trim()
    };
      
    // Atualiza o jogo no Firestore
    await FirebaseService.updateGame(gameId, updatedData);
    
    // Verifica se há uma nova imagem
    const imageFile = editGameImage.files[0];
    if (imageFile) {
      // Exibe uma mensagem de espera se a imagem for grande
      if (imageFile.size > 500 * 1024) ToastManager.info('A imagem é grande e pode levar alguns segundos para ser processada...'); // Mais de 500KB
      await FirebaseService.uploadGameImage(imageFile, gameId);
    }
    
    // Exibe mensagem de sucesso
    ToastManager.success('Jogo atualizado com sucesso!');
    
    // Fecha o modal
    editModal.hide();
    
    // Recarrega os detalhes do jogo
    await loadGameDetails();
  } catch (error) {
    console.error('Erro ao atualizar jogo:', error);
    ToastManager.error('Erro ao atualizar o jogo. Tente novamente.');
  } finally {
    // Reabilita o botão de salvar
    saveEditBtn.disabled = false;
    saveEditBtn.innerHTML = '<i class="fas fa-save me-1"></i>Salvar Alterações';
    
    // Limpa a validação
    editForm.classList.remove('was-validated');
  }
}

// Exclui o jogo
async function deleteGame() {
  // Desabilita o botão de exclusão
  confirmDeleteBtn.disabled = true;
  confirmDeleteBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Excluindo...';
  
  try {
    // Exclui o jogo do Firestore
    await FirebaseService.deleteGame(gameId);
    
    // Exibe mensagem de sucesso
    ToastManager.success('Jogo excluído com sucesso!');
    
    // Fecha o modal
    deleteModal.hide();
    
    // Redireciona para a lista de jogos
    window.location.href = 'games.html';
  } catch (error) {
    console.error('Erro ao excluir jogo:', error);
    ToastManager.error('Erro ao excluir o jogo. Tente novamente.');
    
    // Reabilita o botão de exclusão
    confirmDeleteBtn.disabled = false;
    confirmDeleteBtn.innerHTML = '<i class="fas fa-trash-alt me-1"></i>Excluir Jogo';
  }
}

// Manipula eventos de avaliação de jogos
document.addEventListener('rate-game-criteria', async (e) => {
  const { gameId, ratings } = e.detail;
  
  try {
    // Envia a avaliação por critérios para o servidor
    const result = await FirebaseService.rateCriteriaGame(gameId, ratings);
    
    // Atualiza os dados do jogo atual
    if (currentGame && currentGame.id === gameId) {
      currentGame.averageRating = result.averageRating;
      currentGame.criteriaRatings = result.criteriaRatings;
      currentGame.ratingCount = result.ratingCount;
      
      // Atualiza a exibição
      displayGameDetails();
    }
    
    // Exibe mensagem de sucesso
    ToastManager.success('Obrigado pela sua avaliação detalhada!');
  } catch (error) {
    console.error('Erro ao avaliar jogo por critérios:', error);
    ToastManager.error('Erro ao registrar avaliação. Tente novamente.');
  }
});

// Eventos
document.addEventListener('DOMContentLoaded', loadGameDetails);

// Evento para salvar as alterações
if (saveEditBtn) saveEditBtn.addEventListener('click', saveGameChanges);

// Evento para confirmar a exclusão
if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', deleteGame);