// Utilitário para gerenciar mensagens de notificação (toasts)

class ToastManager {
  constructor() {
    this.createToastContainer();
  }

  // Cria o container de toasts se não existir
  createToastContainer() {
    if (!document.querySelector('.toast-container')) {
      const toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }
  }

  // Exibe uma mensagem toast
  showToast(message, type = 'success', duration = 3000) {
    // Tipos disponíveis: success, error, warning, info
    const toastContainer = document.querySelector('.toast-container');
    
    // Cria o elemento toast
    const toast = document.createElement('div');
    toast.className = `toast show bg-${type === 'error' ? 'danger' : type} text-white`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    // Define o conteúdo do toast
    toast.innerHTML = `
      <div class="toast-header bg-${type === 'error' ? 'danger' : type} text-white">
        <i class="fas ${this.getIconForType(type)} me-2"></i>
        <strong class="me-auto">${this.getTitleForType(type)}</strong>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">
        ${message}
      </div>
    `;
    
    // Adiciona o toast ao container
    toastContainer.appendChild(toast);
    
    // Remove o toast após o tempo especificado
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, duration);
    
    // Adiciona o evento de clique para fechar o toast
    const closeButton = toast.querySelector('.btn-close');
    closeButton.addEventListener('click', () => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 300);
    });
  }

  // Retorna o ícone apropriado para o tipo de toast
  getIconForType(type) {
    switch (type) {
      case 'success': return 'fa-check-circle';
      case 'error': return 'fa-times-circle';
      case 'warning': return 'fa-exclamation-triangle';
      case 'info': return 'fa-info-circle';
      default: return 'fa-bell';
    }
  }

  // Retorna o título apropriado para o tipo de toast
  getTitleForType(type) {
    switch (type) {
      case 'success': return 'Sucesso';
      case 'error': return 'Erro';
      case 'warning': return 'Atenção';
      case 'info': return 'Informação';
      default: return 'Notificação';
    }
  }

  // Aliases para os diferentes tipos de toast
  success(message, duration) {
    this.showToast(message, 'success', duration);
  }

  error(message, duration) {
    this.showToast(message, 'error', duration);
  }

  warning(message, duration) {
    this.showToast(message, 'warning', duration);
  }

  info(message, duration) {
    this.showToast(message, 'info', duration);
  }
}

export default new ToastManager();
