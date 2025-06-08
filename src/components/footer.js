// Componente Footer para o site Eu Faço Você Joga

class Footer {  constructor() {
    this.footerElement = document.createElement('footer');
    this.currentYear = new Date().getFullYear();
    this.scrollToTopHandler = null;
    this.init();
  }

  init() {
    this.footerElement.innerHTML = `
      <div class="container">
        <div class="row">
          <!-- Coluna Principal -->
          <div class="col-lg-4 col-md-6 mb-4">
            <div class="footer-brand">
              <h3 class="h5 mb-3">🎮 Eu Faço Você Joga!</h3>
              <p class="footer-description">
                A maior e mais inovadora competição de jogos indie da UFU - MC. 
                Descobrindo talentos e conectando desenvolvedores com gamers apaixonados.
              </p>
              <div class="footer-badges">
                <span class="footer-badge">🏆 Oficial</span>
                <span class="footer-badge">🇧🇷 Brasil</span>
                <span class="footer-badge">🎯 2025</span>
              </div>
            </div>
          </div>

          <!-- Links Úteis -->
          <div class="col-lg-2 col-md-6 mb-4">
            <div class="footer-links">
              <h5>Navegação</h5>
              <a href="index.html" class="footer-link">🏠 Início</a>
              <a href="jogos.html" class="footer-link">🎮 Jogos</a>
              <a href="cadastro.html" class="footer-link">📝 Cadastro</a>
              <a href="#sobre" class="footer-link">ℹ️ Sobre</a>
            </div>
          </div>

          <!-- Competição -->
          <div class="col-lg-2 col-md-6 mb-4">
            <div class="footer-links">
              <h5>Competição</h5>
              <a href="#regras" class="footer-link">📋 Regras</a>
              <a href="#premios" class="footer-link">🏆 Prêmios</a>
              <a href="#cronograma" class="footer-link">📅 Cronograma</a>
              <a href="#ranking" class="footer-link">📊 Ranking</a>
            </div>
          </div>

          <!-- Suporte -->
          <div class="col-lg-2 col-md-6 mb-4">
            <div class="footer-links">
              <h5>Suporte</h5>
              <a href="#faq" class="footer-link">❓ FAQ</a>
              <a href="#contato" class="footer-link">📧 Contato</a>
              <a href="#ajuda" class="footer-link">🆘 Ajuda</a>
              <a href="#termos" class="footer-link">📄 Termos</a>
            </div>
          </div>

          <!-- Redes Sociais -->
          <div class="col-lg-2 col-md-12 mb-4">
            <div class="footer-links">
              <h5>Conecte-se</h5>
              <div class="social-links">
                <a href="https://twitter.com/eufacovocejoga" target="_blank" rel="noopener" class="social-link twitter" title="Twitter">
                  <i class="fab fa-twitter"></i>
                </a>
                <a href="https://facebook.com/eufacovocejoga" target="_blank" rel="noopener" class="social-link facebook" title="Facebook">
                  <i class="fab fa-facebook"></i>
                </a>
                <a href="https://instagram.com/eufacovocejoga" target="_blank" rel="noopener" class="social-link instagram" title="Instagram">
                  <i class="fab fa-instagram"></i>
                </a>
                <a href="https://discord.gg/eufacovocejoga" target="_blank" rel="noopener" class="social-link discord" title="Discord">
                  <i class="fab fa-discord"></i>
                </a>
                <a href="https://youtube.com/@eufacovocejoga" target="_blank" rel="noopener" class="social-link youtube" title="YouTube">
                  <i class="fab fa-youtube"></i>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div class="footer-divider"></div>

        <div class="row align-items-center">
          <div class="col-md-6">
            <p class="footer-copyright mb-2 mb-md-0">
              &copy; ${this.currentYear} Eu Faço Você Joga! - Todos os direitos reservados
            </p>
          </div>
          <div class="col-md-6 text-md-end">
            <small>
              Feito com ❤️ para a comunidade indie da UFU
            </small>
          </div>
        </div>
      </div>

      <!-- Botão Scroll to Top -->
      <button class="scroll-to-top" id="scrollToTop" title="Voltar ao topo">
        <i class="fas fa-chevron-up"></i>
      </button>    `;

    this.addEventListeners();
    this.initScrollToTop();
  }
  initScrollToTop() {
    // Criar handler reutilizável
    this.scrollToTopHandler = () => {
      const scrollButton = this.footerElement.querySelector('#scrollToTop');
      if (scrollButton) {
        if (window.pageYOffset > 300) {
          scrollButton.classList.add('visible');
        } else {
          scrollButton.classList.remove('visible');
        }
      }
    };

    // Adicionar evento de scroll para mostrar/ocultar o botão
    window.addEventListener('scroll', this.scrollToTopHandler);
    
    // Verificar posição inicial
    this.scrollToTopHandler();
  }
  addEventListeners() {
    // Event listener para todos os cliques no footer
    this.footerElement.addEventListener('click', (e) => {
      const target = e.target.closest('a, button');
      
      if (!target) return;

      // Scroll to top functionality
      if (target.id === 'scrollToTop' || target.closest('#scrollToTop')) {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
        return;
      }

      // Links internos (smooth scroll)
      if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const targetId = target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
        return;
      }
    });

    // Analytics para links sociais
    this.footerElement.addEventListener('click', (e) => {
      const socialLink = e.target.closest('.social-link');
      if (socialLink) {
        const platform = socialLink.classList[1]; // segunda classe é a plataforma
        this.trackSocialClick(platform);
      }
    });
  }

  trackSocialClick(platform) {
    // Rastrear cliques nas redes sociais (pode integrar com Google Analytics)
    console.log(`Social click: ${platform}`);
    
    // Se houver Google Analytics configurado
    if (typeof gtag !== 'undefined') {
      gtag('event', 'social_click', {
        'platform': platform,
        'page_location': window.location.href
      });
    }
  }

  // Método para atualizar ano dinamicamente
  updateYear() {
    const currentYear = new Date().getFullYear();
    const copyrightElement = this.footerElement.querySelector('.footer-copyright');
    if (copyrightElement && currentYear !== this.currentYear) {
      this.currentYear = currentYear;
      copyrightElement.textContent = `© ${this.currentYear} Eu Faço Você Joga! - Todos os direitos reservados`;
    }
  }

  // Método para adicionar notificação de newsletter
  addNewsletterSection() {
    const newsletterHTML = `
      <div class="col-lg-4 col-md-6 mb-4">
        <div class="footer-links">
          <h5>📧 Newsletter</h5>
          <p class="footer-description">Receba as últimas novidades da competição!</p>
          <form class="newsletter-form" id="newsletterForm">
            <div class="input-group mb-2">
              <input type="email" class="form-control" placeholder="Seu e-mail" required>
              <button class="btn btn-primary" type="submit">
                <i class="fas fa-paper-plane"></i>
              </button>
            </div>
            <small class="text-muted">Não fazemos spam. Prometido! 🤝</small>
          </form>
        </div>
      </div>
    `;
    
    // Adicionar antes da última coluna
    const lastCol = this.footerElement.querySelector('.row .col-lg-2:last-child');
    if (lastCol) {
      lastCol.insertAdjacentHTML('beforebegin', newsletterHTML);
    }
  }
  // Método para obter o elemento footer
  getElement() {
    return this.footerElement;
  }

  // Método para anexar o footer ao DOM e ativar funcionalidades
  appendTo(parentElement) {
    parentElement.appendChild(this.footerElement);
    // Garantir que o scroll handler funcione após anexar ao DOM
    setTimeout(() => {
      this.scrollToTopHandler();
    }, 100);
  }
  // Método para destruir event listeners (cleanup)
  destroy() {
    if (this.scrollToTopHandler) {
      window.removeEventListener('scroll', this.scrollToTopHandler);
    }
  }
}

export default Footer;
