// Sistema de avaliação por critérios para jogos

// Critérios de avaliação
export const GAME_CRITERIA = {
  sound: { 
    name: 'Som', 
    description: 'Áudio e trilha sonora',
    icon: 'fa-volume-high'
  },
  creativity: { 
    name: 'Criatividade', 
    description: 'Criatividade e inovação',
    icon: 'fa-lightbulb'
  },
  gameplay: { 
    name: 'Jogabilidade', 
    description: 'Jogabilidade e Mecânica',
    icon: 'fa-gamepad'
  },
  design: { 
    name: 'Design', 
    description: 'Design de mundo e personagens',
    icon: 'fa-palette'
  },
  story: { 
    name: 'História', 
    description: 'História e Narrativa (Construção de mundo)',
    icon: 'fa-book'
  },
  bugs: { 
    name: 'Análise de Bugs', 
    description: 'Presença de bugs e problemas técnicos',
    icon: 'fa-bug'
  },
  interactivity: { 
    name: 'Interatividade', 
    description: 'Interatividade com o mundo',
    icon: 'fa-hand-pointer'
  }
};

// Função auxiliar para obter a classe CSS baseada no valor do slider
function getValueClass(value) {
  value = parseInt(value);
  let baseClass = 'criteria-value badge ms-2 ';
  
  // Define a cor baseada no valor
  if (value <= 3) {
    return baseClass + 'bg-danger';
  } else if (value <= 5) {
    return baseClass + 'bg-warning text-dark';
  } else if (value <= 7) {
    return baseClass + 'bg-info';
  } else {
    return baseClass + 'bg-success';
  }
}

// Cria elemento HTML para avaliação por critérios
export function createCriteriaRating(gameId, currentRatings = {}) {
  const container = document.createElement('div');
  container.className = 'criteria-rating mb-3 p-3';
  container.dataset.gameId = gameId;
  
  // Pequena instrução
  const instruction = document.createElement('p');
  instruction.className = 'text-muted small mb-3';
  instruction.innerHTML = 'Deslize os controles para avaliar cada critério de 1 a 10.';
  container.appendChild(instruction);
  
  // Cria os critérios em uma grade para telas maiores
  const criteriaGrid = document.createElement('div');
  criteriaGrid.className = 'row';
  
  // Cria os critérios
  Object.entries(GAME_CRITERIA).forEach(([key, criteria]) => {
    const criteriaCol = document.createElement('div');
    criteriaCol.className = 'col-md-6 mb-3';
    
    const criteriaRow = document.createElement('div');
    criteriaRow.className = 'criteria-row';
    
    // Ícone e nome do critério
    const criteriaLabel = document.createElement('div');
    criteriaLabel.className = 'criteria-label d-flex align-items-center mb-2';
    criteriaLabel.innerHTML = `
      <i class="fas ${criteria.icon} me-2 text-primary"></i>
      <span title="${criteria.description}">${criteria.name}</span>
      <i class="fas fa-info-circle ms-1 text-muted" 
         title="${criteria.description}" 
         data-bs-toggle="tooltip" 
         data-bs-placement="top"></i>
    `;
    criteriaRow.appendChild(criteriaLabel);
      // Container para o slider e valor
    const sliderContainer = document.createElement('div');
    sliderContainer.className = 'criteria-slider-container d-flex align-items-center';
    
    // Slider para avaliação
    const sliderDiv = document.createElement('div');
    sliderDiv.className = 'flex-grow-1 me-2 position-relative';
    
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.className = 'form-range';
    slider.min = '1';
    slider.max = '10';
    slider.step = '1';
    slider.value = currentRatings[key] || '5';
    slider.dataset.criteria = key;
    
    // Adiciona um marcador para o valor médio (5)
    const midMarker = document.createElement('small');
    midMarker.className = 'position-absolute text-muted';
    midMarker.style.left = '45%';
    midMarker.style.bottom = '0';
    midMarker.style.fontSize = '10px';
    midMarker.textContent = '5';
    
    sliderDiv.appendChild(slider);
    sliderDiv.appendChild(midMarker);
    
    const valueDisplay = document.createElement('span');
    valueDisplay.className = 'criteria-value badge bg-primary';
    valueDisplay.style.minWidth = '32px';
    valueDisplay.style.textAlign = 'center';
    valueDisplay.textContent = slider.value;
      // Atualiza o valor exibido quando o slider é movido
    slider.addEventListener('input', () => {
      valueDisplay.textContent = slider.value;
      // Atualiza a classe do badge baseado no valor
      valueDisplay.className = getValueClass(slider.value);
    });
    
    // Define a classe inicial baseada no valor
    valueDisplay.className = getValueClass(slider.value);
    
    sliderContainer.appendChild(sliderDiv);
    sliderContainer.appendChild(valueDisplay);
    criteriaRow.appendChild(sliderContainer);
    
    criteriaCol.appendChild(criteriaRow);
    criteriaGrid.appendChild(criteriaCol);
  });
  
  container.appendChild(criteriaGrid);
  
  // Botão para enviar avaliação
  const submitButton = document.createElement('button');
  submitButton.className = 'btn btn-primary mt-2 d-block mx-auto';
  submitButton.innerHTML = '<i class="fas fa-paper-plane me-1"></i> Enviar avaliação';
  submitButton.addEventListener('click', () => {
    const ratings = {};
    
    // Coleta as avaliações de todos os critérios
    container.querySelectorAll('input[data-criteria]').forEach(input => {
      ratings[input.dataset.criteria] = parseInt(input.value);
    });
    
    // Calcula a média das avaliações
    const values = Object.values(ratings);
    const average = values.reduce((sum, value) => sum + value, 0) / values.length;
    
    // Dispara evento de avaliação
    const rateEvent = new CustomEvent('rate-game-criteria', {
      detail: {
        gameId,
        ratings,
        averageRating: average
      }
    });
    document.dispatchEvent(rateEvent);
    
    // Desativa o formulário após envio
    container.querySelectorAll('input, button').forEach(el => {
      el.disabled = true;
    });
      // Adiciona mensagem de agradecimento
    const thankYou = document.createElement('div');
    thankYou.className = 'alert alert-success mt-3 p-2 text-center';
    thankYou.innerHTML = '<i class="fas fa-check-circle me-1"></i> Obrigado pela sua avaliação! Sua opinião é muito importante.';
    container.appendChild(thankYou);
    
    // Em um modal, podemos rolar para a mensagem de agradecimento
    thankYou.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  
  // Cria um div centralizado para o botão
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'text-center mt-3';
  buttonContainer.appendChild(submitButton);
  
  container.appendChild(buttonContainer);
  return container;
}

// Exibe as avaliações por critérios (somente leitura)
export function displayCriteriaRatings(criteriaRatings) {
  if (!criteriaRatings) return null;
  
  const container = document.createElement('div');
  container.className = 'criteria-ratings-display mt-3';
  
  const title = document.createElement('h6');
  title.className = 'mb-3';
  title.textContent = 'Avaliações por critério:';
  container.appendChild(title);
  
  // Cria uma tabela para os critérios
  const table = document.createElement('div');
  table.className = 'table-responsive';
  
  const tableContent = document.createElement('table');
  tableContent.className = 'table table-sm';
  
  Object.entries(GAME_CRITERIA).forEach(([key, criteria]) => {
    if (criteriaRatings[key]) {
      const row = document.createElement('tr');
      
      // Célula com nome e ícone
      const labelCell = document.createElement('td');
      labelCell.className = 'align-middle';
      labelCell.style.width = '180px';
      labelCell.innerHTML = `<div class="d-flex align-items-center">
        <i class="fas ${criteria.icon} me-2 text-primary"></i>
        <span title="${criteria.description}">${criteria.name}</span>
      </div>`;
      
      // Célula com barra de progresso
      const progressCell = document.createElement('td');
      progressCell.className = 'align-middle';
      
      const value = criteriaRatings[key];
      const percentage = (value / 10) * 100;
      
      progressCell.innerHTML = `
        <div class="d-flex align-items-center">
          <div class="progress flex-grow-1 me-2">
            <div class="progress-bar" role="progressbar" 
              style="width: ${percentage}%;" 
              aria-valuenow="${value}" 
              aria-valuemin="0" 
              aria-valuemax="10">
            </div>
          </div>
          <span class="fw-bold">${value.toFixed(1)}</span>
        </div>
      `;
      
      row.appendChild(labelCell);
      row.appendChild(progressCell);
      tableContent.appendChild(row);
    }
  });
  
  table.appendChild(tableContent);
  container.appendChild(table);
  
  return container;
}
