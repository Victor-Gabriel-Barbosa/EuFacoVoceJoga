import Navbar from '../components/navbar.js';
import Footer from '../components/footer.js';
import FirebaseService from './firebase-service.js';
import ToastManager from './toast-manager.js';

// Inicializa a navbar
const navbar = new Navbar();
document.getElementById('navbar-container').appendChild(navbar.getElement());
navbar.setActive('register.html');

// Inicializa o footer
const footer = new Footer();
document.getElementById('footer-container').appendChild(footer.getElement());

// Elementos do formulário
const gameForm = document.getElementById('game-form');
const gameName = document.getElementById('game-name');
const gameDeveloper = document.getElementById('game-developer');
const gameDescription = document.getElementById('game-description');
const gameUrl = document.getElementById('game-url');
const gameImage = document.getElementById('game-image');
const submitBtn = document.getElementById('submit-btn');
const formFeedback = document.getElementById('form-feedback');
const gameFormContainer = document.getElementById('game-form-container');
const loginRequiredAlert = document.getElementById('login-required-alert');
const loginButton = document.getElementById('login-button');

// Elementos de preview
const previewContainer = document.getElementById('game-preview-container');
const previewImage = document.getElementById('preview-image');
const previewName = document.getElementById('preview-name');
const previewDeveloper = document.getElementById('preview-developer');
const previewDescription = document.getElementById('preview-description');
const previewUrlBtn = document.getElementById('preview-url-btn');

// Verifica o estado de login quando a página carrega
document.addEventListener('DOMContentLoaded', checkLoginState);

// Verificar se o usuário está logado
function checkLoginState() {
  FirebaseService.onAuthStateChanged((user) => {
    if (user) {
      // Usuário está logado, mostra o formulário
      loginRequiredAlert.classList.add('d-none');
      gameFormContainer.classList.remove('d-none');
    } else {
      // Usuário não está logado, mostra alerta
      loginRequiredAlert.classList.remove('d-none');
      gameFormContainer.classList.add('d-none');
    }
  });
}

// Botão de login
loginButton.addEventListener('click', async () => {
  try {
    await FirebaseService.loginWithGoogle();
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    ToastManager.error('Não foi possível fazer login. Tente novamente mais tarde.');
  }
});

// Função para atualizar o preview com os dados do formulário
function updatePreview() {
  // Atualiza o preview com os dados do formulário, mesmo que incompletos
  previewName.textContent = gameName.value.trim() || 'Nome do Jogo';
  previewDeveloper.textContent = gameDeveloper.value.trim() || 'Desenvolvedor';
  previewDescription.textContent = gameDescription.value.trim() || 'Descrição do jogo aparecerá aqui.';
  
  // Atualiza o link do jogo
  if (gameUrl.value.trim()) {
    previewUrlBtn.href = gameUrl.value.trim();
    previewUrlBtn.classList.remove('disabled');
  } else {
    previewUrlBtn.href = '#';
    previewUrlBtn.classList.add('disabled');
  }
  
  // Atualiza a imagem de capa
  if (gameImage.files && gameImage.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      previewImage.src = e.target.result;
    };
    reader.readAsDataURL(gameImage.files[0]);
  }
  
  // Adiciona uma leve animação para destacar as mudanças
  previewContainer.classList.add('preview-update');
  setTimeout(() => {
    previewContainer.classList.remove('preview-update');
  }, 500);
}

// Inicializa o preview com os dados padrão
window.addEventListener('DOMContentLoaded', () => {
  updatePreview();
});

// Atualiza o preview quando o usuário selecionar uma imagem
gameImage.addEventListener('change', updatePreview);

// Atualiza o preview quando o usuário modificar qualquer campo
[gameName, gameDeveloper, gameDescription, gameUrl].forEach(field => {
  field.addEventListener('input', function() {
    clearTimeout(field.debounceTimer);
    field.debounceTimer = setTimeout(() => {
      updatePreview();
    }, 300); // Pequeno delay para evitar muitas atualizações durante digitação rápida
  });
});

// Manipula o envio do formulário
gameForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Valida o formulário
  if (!gameForm.checkValidity()) {
    e.stopPropagation();
    gameForm.classList.add('was-validated');
    return;
  }
  
  // Desabilita o botão de envio
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Enviando...';
  
  // Prepara os dados do jogo
  const gameData = {
    name: gameName.value.trim(),
    developer: gameDeveloper.value.trim(),
    description: gameDescription.value.trim(),
    gameUrl: gameUrl.value.trim()
  };
  
  // Arquivo de imagem
  const imageFile = gameImage.files[0];
  
  try {
    // Adiciona o jogo ao Firestore
    const gameId = await FirebaseService.addGame(gameData);
    
    // Faz upload da imagem
    if (imageFile) await FirebaseService.uploadGameImage(imageFile, gameId);
    
    // Exibe mensagem de sucesso
    ToastManager.success('Jogo cadastrado com sucesso!');
    
    // Limpa o formulário
    gameForm.reset();
    gameForm.classList.remove('was-validated');
    
    // Exibe mensagem de sucesso no formulário
    formFeedback.innerHTML = `
      <div class="alert alert-success">
        <i class="fas fa-check-circle me-2"></i>Jogo cadastrado com sucesso! 
        <a href="details.html?id=${gameId}" class="alert-link">Ver detalhes do jogo</a> ou 
        <a href="games.html" class="alert-link">ver todos os jogos</a>.
      </div>
    `;
    formFeedback.classList.remove('d-none');
    
    // Scroll para o topo do formulário
    window.scrollTo({ top: formFeedback.offsetTop, behavior: 'smooth' });
  } catch (error) {
    console.error('Erro ao cadastrar jogo:', error);
    
    // Exibe mensagem de erro
    ToastManager.error('Erro ao cadastrar o jogo. Por favor, tente novamente.');
    
    // Exibe mensagem de erro no formulário
    formFeedback.innerHTML = `
      <div class="alert alert-danger">
        <i class="fas fa-exclamation-triangle me-2"></i>Erro ao cadastrar o jogo. Por favor, tente novamente.
      </div>
    `;
    formFeedback.classList.remove('d-none');
  } finally {
    // Reabilita o botão de envio
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-save me-1"></i>Cadastrar Jogo';
  }
});