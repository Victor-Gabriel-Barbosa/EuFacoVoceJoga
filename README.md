# Eu Faço Você Joga!

Site oficial da competição de desenvolvimento de jogos indie "Eu Faço Você Joga!".

## Sobre o Projeto

Este é um site completo para a competição de desenvolvimento de jogos indie "Eu Faço Você Joga!". O projeto foi desenvolvido com foco em usabilidade e funcionalidades CRUD (Create, Read, Update, Delete) para gerenciar os jogos inscritos na competição.

## Funcionalidades

### Página Inicial
- Apresentação do projeto e propósito da competição
- Exibição dos jogos mais bem avaliados (top 3)
- Navegação intuitiva para as principais seções do site

### Cadastro de Jogos
- Formulário completo para inscrição de jogos
- Upload de imagens para capa do jogo
- Validação de dados em tempo real
- Feedback visual após o cadastro

### Visualização e Avaliação
- Lista de todos os jogos cadastrados
- Sistema de avaliação com 5 estrelas
- Ordenação por avaliação, data ou nome
- Busca e filtragem de jogos

### Detalhes do Jogo
- Visualização completa das informações do jogo
- Sistema de avaliação interativo
- Compartilhamento em redes sociais
- Links para jogar ou baixar o jogo

### Edição e Exclusão
- Interface para edição dos dados do jogo
- Confirmação visual para operações sensíveis
- Exclusão segura de jogos com confirmação

## Tecnologias Utilizadas

- **Frontend**:
  - HTML5, CSS3, JavaScript
  - Bootstrap 5 (responsividade e componentes)
  - Font Awesome (ícones)
  - Google Fonts

- **Backend/Storage**:
  - Firebase Firestore (banco de dados)
  - Armazenamento de imagens como base64 diretamente no Firestore
  - Compressão automática de imagens para otimização

## Estrutura do Projeto

```
/
├── index.html               # Página inicial
├── jogos.html               # Lista de jogos
├── cadastro.html            # Formulário de cadastro
├── detalhes.html            # Detalhes do jogo
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   └── navbar.js        # Componente de navegação
│   ├── css/
│   │   └── styles.css       # Estilos personalizados
│   ├── images/              # Imagens e recursos visuais
│   │   ├── game-placeholder.jpg
│   │   └── favicon/         # Ícones do site
│   └── js/
│       ├── firebase-config.js    # Configuração do Firebase
│       ├── firebase-service.js   # Serviços de acesso ao Firestore
│       ├── image-compressor.js   # Compressor de imagens
│       ├── toast-manager.js      # Gerenciador de notificações
│       └── utils.js              # Funções utilitárias
```

## Como Executar

1. Clone este repositório:
```bash
git clone https://github.com/seunome/eufacovocejoganome.git
cd eufacovocejoganome
```

2. Configure o Firebase:
   - Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
   - Ative o Firestore
   - Substitua as configurações no arquivo `src/js/firebase-config.js`

3. Abra o arquivo `index.html` em seu navegador ou use um servidor local:
```bash
# Com Python 3
python -m http.server
```

4. Acesse o site no navegador:
```
http://localhost:8000
```

## Recursos Adicionais

- **Sistema de Avaliação**: Os usuários podem avaliar os jogos com notas de 1 a 5 estrelas
- **Ranking Automático**: Os jogos são ordenados automaticamente por média de avaliações
- **Design Responsivo**: Interface adaptável para dispositivos móveis, tablets e desktops
- **Feedback Visual**: Notificações toast para informar o usuário sobre ações realizadas
- **Compartilhamento Social**: Opções para compartilhar os jogos em redes sociais

## Licença

Este projeto está licenciado sob a licença MIT - consulte o arquivo LICENSE para obter detalhes.

## Autor

Desenvolvido para a competição "Eu Faço Você Joga!" - 2025

```
index.html                  # Página principal
README.md                   # Documentação
src/
  components/               # Componentes JavaScript
    navbar.js               # Funcionalidades da barra de navegação
  css/
    styles.css              # Estilos personalizados
  images/
    game-placeholder.jpg    # Imagens utilizadas no site
  js/
    firebase-config.js      # Configuração do Firebase (se utilizado)
    theme-toggle.js         # Script para alternância entre temas
```

## Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## Contato

Para mais informações sobre a competição, entre em contato através de contato@eufacovocejogarafael.com.br
