# 🔧 Modo Desenvolvedor - Instruções de Uso

## ⚠️ IMPORTANTE: REMOVER EM PRODUÇÃO

Este modo é apenas para desenvolvimento local. Remova antes de publicar o site.

## Como usar o Modo Desenvolvedor

### 1. Ativação automática

O modo desenvolvedor está **ATIVADO por padrão** quando `DEV_MODE = true` no arquivo `firebase-service.js`.

### 2. Botão na Navbar

- Um botão amarelo com ícone `</>` aparece na barra de navegação
- Clique nele para alternar entre modo ativo/inativo  
- Quando ativo: botão amarelo com texto "DEV"
- Quando inativo: botão transparente apenas com ícone

### 3. Comandos do Console

Abra o console do navegador (F12) e use os seguintes comandos:

**Comandos completos:**

```javascript
// Verificar se está em modo desenvolvedor
FirebaseService.isDevMode()

// Fazer login simulado
FirebaseService.devLogin()

// Fazer logout simulado
FirebaseService.devLogout()

// Alternar entre ativo/inativo
FirebaseService.toggleDevMode()

// Ver dados do usuário simulado
FirebaseService.getCurrentUser()
```

**Atalhos rápidos:**

```javascript
// Atalhos mais simples (apenas em modo dev)
devLogin()    // Login rápido
devLogout()   // Logout rápido
toggleDev()   // Alternar modo
checkDev()    // Verificar status
```

### 4. Indicadores Visuais

- **Botão na navbar:** Ícone `</>` (inativo) ou `</> DEV` (ativo)
- **Indicador flutuante:** Badge "🔧 MODO DEV" no canto superior direito quando ativo
- **Console colorido:** Mensagens destacadas em cores para feedback
- **Animação:** O indicador pisca suavemente para chamar atenção

### 5. Usuário Simulado

Quando ativo, o sistema simula um usuário com os seguintes dados:

- **ID:** dev-user-123
- **Email:** desenvolvedor@teste.com
- **Nome:** Desenvolvedor Teste
- **Foto:** Placeholder padrão

## Funcionalidades Testáveis

Com o modo desenvolvedor ativo, você pode testar:

- ✅ **Cadastro de jogos** - sem precisar fazer login real
- ✅ **Avaliação de jogos** - simula usuário logado
- ✅ **Edição de jogos** - apenas jogos do "usuário desenvolvedor"
- ✅ **Interface de usuário logado** - navbar mostra perfil simulado
- ✅ **Eventos de autenticação** - dispara todos os callbacks normalmente

## Como Remover para Produção

### Passo 1: Firebase Service

No arquivo `src/js/firebase-service.js`:

1. Altere `DEV_MODE = true` para `DEV_MODE = false`
2. Ou remova completamente todo o código entre os comentários:

```javascript
// ===========================================
// MODO DESENVOLVEDOR - REMOVER EM PRODUÇÃO
// ===========================================
```

### Passo 2: Navbar

No arquivo `src/components/navbar.js`:

1. Remova o HTML do botão desenvolvedor (seção com comentários de remoção)
2. Remova a lógica do botão desenvolvedor (seção com comentários de remoção)

### Passo 3: Limpeza

1. Delete este arquivo `DEV_MODE_INSTRUCTIONS.md`
2. Teste se tudo funciona normalmente sem o modo desenvolvedor

## Dicas de Uso

- **Console do navegador:** Use `devLogin()` para simular login instantâneo
- **Teste rápido:** Clique no botão DEV na navbar para alternar rapidamente
- **Debugging:** Use `checkDev()` para verificar o estado atual
- **Reset:** Recarregue a página para voltar ao estado inicial

---

**Lembre-se: Este modo NÃO deve estar ativo em produção!**
