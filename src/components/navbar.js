// Componente Navbar para o site Eu Faço Você Joga

class Navbar {
  constructor() {
    this.navbarElement = document.createElement('nav');
    this.init();
    this.setupResponsiveBehavior();
  }

  init() {
    this.navbarElement.className = 'navbar navbar-expand-lg navbar-dark bg-dark fixed-top';
    this.navbarElement.innerHTML = `
      <div class="container">
        <a class="navbar-brand d-flex align-items-center" href="index.html">
          <i class="fas fa-gamepad me-2 text-primary"></i>
          Eu Faço Você Joga!
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
                <i class="fas fa-plus-circle me-1"></i> Cadastrar Jogo
              </a>
            </li>
            <li class="nav-item mx-md-1">
              <a class="nav-link rounded-pill px-3" href="jogos.html">
                <i class="fas fa-list me-1"></i> Ver Jogos
              </a>
            </li>
          </ul>
        </div>
      </div>
    `;
    
    // Adicionar estilos inline para o placeholder da navbar
    const style = document.createElement('style');
    style.textContent = `
      body {
        padding-top: 56px; /* Altura da navbar */
      }
      @media (min-width: 992px) {
        body {
          padding-top: 60px;
        }
      }
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
}

export default Navbar;