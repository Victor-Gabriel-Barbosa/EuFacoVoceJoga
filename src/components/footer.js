// Componente Footer para o site Eu Faço Você Joga

class Footer {
  constructor() {
    this.footerElement = document.createElement('footer');
    this.init();
  }

  init() {
    this.footerElement.innerHTML = `
      <div class="container">
        <div class="row">
          <div class="col-md-6">
            <h3 class="h5 mb-3">Eu Faço Você Joga!</h3>
            <p>A maior competição de jogos indie do Brasil</p>
            <p class="mb-0">&copy; 2025 - Todos os direitos reservados</p>
          </div>
          <div class="col-md-6 text-md-end mt-4 mt-md-0">
            <ul class="list-inline mb-0">
              <li class="list-inline-item">
                <a href="#" class="text-white text-decoration-none">
                  <i class="fab fa-twitter fa-lg"></i>
                </a>
              </li>
              <li class="list-inline-item ms-3">
                <a href="#" class="text-white text-decoration-none">
                  <i class="fab fa-facebook fa-lg"></i>
                </a>
              </li>
              <li class="list-inline-item ms-3">
                <a href="#" class="text-white text-decoration-none">
                  <i class="fab fa-instagram fa-lg"></i>
                </a>
              </li>
              <li class="list-inline-item ms-3">
                <a href="#" class="text-white text-decoration-none">
                  <i class="fab fa-discord fa-lg"></i>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  // Método para obter o elemento footer
  getElement() {
    return this.footerElement;
  }
}

export default Footer;
