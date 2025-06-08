// Componente Navbar para o site Eu Faço Você Joga
import FirebaseService from '../js/firebase-service.js';

class Navbar {
  constructor() {
    this.navbarElement = document.createElement('nav');
    this.init();
    this.setupResponsiveBehavior();
    this.setupAuthListeners();
  }

  init() {
    this.navbarElement.className = 'navbar navbar-expand-lg navbar-dark bg-dark fixed-top';
    this.navbarElement.innerHTML = `
      <div class="container">        
        <a class="navbar-brand d-flex align-items-center" href="index.html">
          <i class="fas fa-gamepad me-2 text-primary"></i>
          <span class="d-inline d-md-none">EFVJ</span>
          <span class="d-none d-md-inline">Eu Faço Você Joga!</span>
        </a>
        <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" 
          aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item mx-md-1">
              <a class="nav-link rounded-pill px-3" href="index.html">
                <i class="fas fa-home me-1"></i> Início
              </a>
            </li>
            <li class="nav-item mx-md-1">
              <a class="nav-link rounded-pill px-3" href="cadastro.html">
                <i class="bi bi-dpad me-1"></i> Cadastrar Jogo
              </a>
            </li>
            <li class="nav-item mx-md-1">
              <a class="nav-link rounded-pill px-3" href="jogos.html">
                <i class="bi bi-controller me-1"></i> Ver Jogos
              </a>
            </li>            
            <li class="nav-item mx-md-1 auth-section">
              <!-- Conteúdo de autenticação será inserido aqui dinamicamente -->
              <button class="btn btn-primary rounded-pill login-btn">
                <img src="https://img.icons8.com/?size=512&id=17949&format=png" class="me-1" width="24" height="24">
               Entrar com Google
              </button>
              <div class="user-profile d-none">
                <div class="dropdown">
                  <button class="btn dropdown-toggle profile-button" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                    <img src="" alt="Foto de perfil" class="profile-pic rounded-circle me-1" width="24" height="24">
                    <span class="user-name"></span>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                    <li><a class="dropdown-item user-email" href="#"><i class="fas fa-envelope me-1"></i> <span></span></a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item logout-btn" href="#"><i class="fas fa-sign-out-alt me-1"></i> Sair</a></li>
                  </ul>
                </div>
              </div>
            </li>
            <!-- ========================================= -->
            <!-- BOTÃO MODO DESENVOLVEDOR - REMOVER EM PRODUÇÃO -->
            <!-- ========================================= -->
            <li class="nav-item dev-mode-section d-none">
              <button class="btn btn-sm btn-outline-warning rounded-pill dev-toggle-btn" title="Modo Desenvolvedor">
                <i class="fas fa-code"></i>
              </button>
            </li>
            <!-- ========================================= -->
                  <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                    <li><a class="dropdown-item user-email" href="#"><i class="fas fa-envelope me-1"></i> <span></span></a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item logout-btn" href="#"><i class="fas fa-sign-out-alt me-1"></i> Sair</a></li>
                  </ul>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    `;
    
    // Adicionar estilos inline para o placeholder da navbar
    const style = document.createElement('style');
    style.textContent = `
      body {
        padding-top: 46px; /* Reduzido: altura da navbar */
      }
      @media (min-width: 992px) {
        body {
          padding-top: 50px; /* Reduzido para telas maiores */
        }
      }
      /* ===========================================
         ESTILOS MODO DESENVOLVEDOR - REMOVER EM PRODUÇÃO
         =========================================== */
      .dev-mode-indicator {
        position: fixed;
        top: 60px;
        right: 10px;
        background: linear-gradient(45deg, #ffc107, #fd7e14);
        color: #000;
        padding: 5px 10px;
        border-radius: 15px;
        font-size: 11px;
        font-weight: bold;
        z-index: 1050;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        animation: pulse 2s infinite;
      }
      
      @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.7; }
        100% { opacity: 1; }
      }
      
      .dev-toggle-btn {
        transition: all 0.3s ease;
      }
      
      .dev-toggle-btn:hover {
        transform: scale(1.1);
      }
      /* =========================================== */
    `;
    document.head.appendChild(style);
  }
  
  // Configura comportamento responsivo da navbar
  setupResponsiveBehavior() {
    // Aguarda DOM ser carregado para definir eventos
    document.addEventListener('DOMContentLoaded', () => {
      // Fecha menu ao clicar em link (mobile)
      const navLinks = this.navbarElement.querySelectorAll('.nav-link');
      const navbarCollapse = this.navbarElement.querySelector('.navbar-collapse');
      
      if (navbarCollapse) {
        try {
          const bsCollapse = new bootstrap.Collapse(navbarCollapse, {toggle: false});
          
          navLinks.forEach(link => {
            link.addEventListener('click', () => {
              // Em dispositivos móveis, fecha o menu ao clicar em um link
              if (window.innerWidth < 992 && navbarCollapse.classList.contains('show')) {
                bsCollapse.hide();
              }
            });
          });
        } catch (e) {
          console.warn('Bootstrap navbar collapse não inicializado:', e);
        }
      }
      
      // Efeito de transparência ao rolar a página (apenas em telas grandes)
      if (window.innerWidth >= 992) {
        const handleScroll = () => {
          if (window.scrollY > 50) {
            this.navbarElement.classList.add('bg-dark');
            this.navbarElement.classList.remove('bg-transparent');
          } else {
            if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
              this.navbarElement.classList.add('bg-transparent');
              this.navbarElement.classList.remove('bg-dark');
            }
          }
        };
        
        window.addEventListener('scroll', handleScroll);
        
        // Verifica na carga inicial se estamos na página inicial
        if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
          this.navbarElement.classList.add('bg-transparent');
          this.navbarElement.classList.remove('bg-dark');
          handleScroll(); // Verifica posição inicial
        }
      }
    });
  }

  // Método para atualizar a navegação ativa
  setActive(pageName) {
    const links = this.navbarElement.querySelectorAll('.nav-link');
    links.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      
      // Verifica se o link corresponde à página atual
      // Compara tanto o nome exato quanto o início do nome com parâmetros
      if (href === pageName || 
          (pageName.includes('?') && pageName.startsWith(href)) ||
          (pageName === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }
  // Método para obter o elemento navbar
  getElement() {
    return this.navbarElement;
  }

  // Configurar ouvintes para autenticação
  setupAuthListeners() {
    document.addEventListener('DOMContentLoaded', () => {
      const loginBtn = this.navbarElement.querySelector('.login-btn');
      const logoutBtn = this.navbarElement.querySelector('.logout-btn');
      const userProfile = this.navbarElement.querySelector('.user-profile');
      
      // Monitorar estado de autenticação
      FirebaseService.onAuthStateChanged((user) => {
        if (user) {
          // Usuário está logado
          loginBtn.classList.add('d-none');
          userProfile.classList.remove('d-none');
          
          // Atualizar informações do usuário
          const profilePic = this.navbarElement.querySelector('.profile-pic');
          const userName = this.navbarElement.querySelector('.user-name');
          const userEmail = this.navbarElement.querySelector('.user-email span');
          
          profilePic.src = user.photoURL || 'src/images/avatar-placeholder.jpg';
          userName.textContent = user.displayName || 'Usuário';
          userEmail.textContent = user.email || '';
          
          // Disparar evento de login bem-sucedido
          const event = new CustomEvent('user-logged-in', { detail: user });
          document.dispatchEvent(event);
        } else {
          // Usuário não está logado
          loginBtn.classList.remove('d-none');
          userProfile.classList.add('d-none');
          
          // Disparar evento de logout
          const event = new CustomEvent('user-logged-out');
          document.dispatchEvent(event);
        }
      });
      
      // Evento de clique no botão de login
      loginBtn.addEventListener('click', async () => {
        try {
          await FirebaseService.loginWithGoogle();
        } catch (error) {
          console.error('Erro ao fazer login:', error);
          alert('Não foi possível fazer login. Tente novamente mais tarde.');
        }
      });
        // Evento de clique no botão de logout
      logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          await FirebaseService.logout();
        } catch (error) {
          console.error('Erro ao fazer logout:', error);
          alert('Não foi possível fazer logout. Tente novamente mais tarde.');
        }
      });      
      // ===========================================
      // MODO DESENVOLVEDOR - REMOVER EM PRODUÇÃO
      // ===========================================
      const devModeSection = this.navbarElement.querySelector('.dev-mode-section');
      const devToggleBtn = this.navbarElement.querySelector('.dev-toggle-btn');
      
      // Função para criar/remover indicador visual
      const toggleDevIndicator = (show) => {
        const existingIndicator = document.getElementById('dev-mode-indicator');
        if (existingIndicator) {
          existingIndicator.remove();
        }
        
        if (show) {
          const indicator = document.createElement('div');
          indicator.id = 'dev-mode-indicator';
          indicator.className = 'dev-mode-indicator';
          indicator.innerHTML = '🔧 MODO DEV';
          document.body.appendChild(indicator);
        }
      };
      
      // Verifica se está em modo desenvolvedor e mostra o botão
      if (FirebaseService.isDevMode && FirebaseService.isDevMode()) {
        devModeSection.classList.remove('d-none');
        devToggleBtn.classList.add('btn-warning');
        devToggleBtn.classList.remove('btn-outline-warning');
        devToggleBtn.innerHTML = '<i class="fas fa-code"></i> DEV';
        toggleDevIndicator(true);
      } else if (FirebaseService.isDevMode) {
        devModeSection.classList.remove('d-none');
        toggleDevIndicator(false);
      }
      
      // Evento de clique no botão de modo desenvolvedor
      if (devToggleBtn) {
        devToggleBtn.addEventListener('click', () => {
          if (FirebaseService.toggleDevMode && FirebaseService.toggleDevMode()) {
            // Modo ativado
            devToggleBtn.classList.add('btn-warning');
            devToggleBtn.classList.remove('btn-outline-warning');
            devToggleBtn.innerHTML = '<i class="fas fa-code"></i> DEV';
            toggleDevIndicator(true);
            console.log('Modo desenvolvedor ATIVADO');
          } else if (FirebaseService.toggleDevMode) {
            // Modo desativado
            devToggleBtn.classList.remove('btn-warning');
            devToggleBtn.classList.add('btn-outline-warning');
            devToggleBtn.innerHTML = '<i class="fas fa-code"></i>';
            toggleDevIndicator(false);
            console.log('Modo desenvolvedor DESATIVADO');
          }
        });
      }
      // ===========================================
    });
  }
}

export default Navbar;