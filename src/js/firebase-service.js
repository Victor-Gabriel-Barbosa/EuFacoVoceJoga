// Serviço para gerenciar operações do Firebase
import { getFirestore, collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, orderBy, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { app, auth } from './firebase-config.js';
import ImageCompressor from './image-compressor.js';

// ===========================================
// MODO DESENVOLVEDOR - REMOVER EM PRODUÇÃO
// ===========================================
const DEV_MODE = true; // Altere para false em produção
const MOCK_USER = {
  uid: 'dev-user-123',
  email: 'desenvolvedor@teste.com',
  displayName: 'Desenvolvedor Teste',
  photoURL: null
};

let currentMockUser = DEV_MODE ? MOCK_USER : null;
let authStateCallbacks = [];

// Função para mostrar feedback visual no modo desenvolvedor
function showDevFeedback(message, type = 'info') {
  if (!DEV_MODE) return;
  
  const colors = {
    info: '#17a2b8',
    success: '#28a745',
    warning: '#ffc107',
    error: '#dc3545'
  };
  
  console.log(`%c[MODO DEV] ${message}`, `color: ${colors[type]}; font-weight: bold;`);
  
  // Criar toast visual se ToastManager estiver disponível
  if (typeof window !== 'undefined' && window.ToastManager) {
    window.ToastManager.info(`🔧 DEV: ${message}`);
  }
}

// Mostrar aviso inicial se estiver em modo desenvolvedor
if (DEV_MODE && typeof window !== 'undefined') {
  console.log('%c🔧 MODO DESENVOLVEDOR ATIVO', 'color: #ffc107; font-size: 16px; font-weight: bold;');
  console.log('%cUse os seguintes comandos:', 'color: #17a2b8;');
  console.log('%c- FirebaseService.devLogin() - Fazer login simulado', 'color: #6c757d;');
  console.log('%c- FirebaseService.devLogout() - Fazer logout simulado', 'color: #6c757d;');
  console.log('%c- FirebaseService.toggleDevMode() - Alternar modo', 'color: #6c757d;');
  console.log('%c- FirebaseService.isDevMode() - Verificar status', 'color: #6c757d;');
  console.log('%cLembre-se de desativar antes da produção!', 'color: #dc3545; font-weight: bold;');
}
// ===========================================

// Inicializa o Firestore
const db = getFirestore(app);

// Constantes
const GAMES_COLLECTION = 'games';
const RATINGS_COLLECTION = 'ratings';

// Classe para gerenciar operações do Firebase
class FirebaseService {
  // Adicionar um novo jogo
  async addGame(gameData) {
    try {
      // Verifica se o usuário está autenticado
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        throw new Error("Você precisa estar logado para cadastrar um jogo.");
      }
      
      // Adiciona timestamp e informações do usuário
      const gameWithTimestamp = {
        ...gameData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        averageRating: 0,
        ratingCount: 0,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: currentUser.displayName || "Usuário"
      };
      
      const docRef = await addDoc(collection(db, GAMES_COLLECTION), gameWithTimestamp);
      console.log("Game added with ID: ", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("Error adding game: ", error);
      throw error;
    }
  }  // Upload de imagem como base64 diretamente no Firestore
  async uploadGameImage(file, gameId) {
    try {
      // Verifica o tamanho do arquivo (limita a 750KB para ficar dentro do limite do Firestore de 1MB por documento)
      const fileSizeKB = file.size / 1024;
      if (fileSizeKB > 750) {
        // Tenta comprimir a imagem primeiro
        const compressedFile = await ImageCompressor.compressIfNeeded(file, {
          maxSizeKB: 750,
          quality: 0.8,
          maxWidth: 1200,
          maxHeight: 1200
        });
        
        // Verifica se a compressão foi suficiente
        const compressedSizeKB = compressedFile.size / 1024;
        if (compressedSizeKB > 750) {
          throw new Error(`Não foi possível comprimir a imagem suficientemente (${Math.round(compressedSizeKB)}KB). O tamanho máximo é 750KB.`);
        }
        
        // Usa o arquivo comprimido
        file = compressedFile;
      }
      
      return new Promise((resolve, reject) => {
        // Converte o arquivo para Base64
        const reader = new FileReader();
        
        reader.onload = async (event) => {
          try {
            const base64String = event.target.result;
            
            // Atualiza o documento do jogo com a string base64 da imagem
            const gameRef = doc(db, GAMES_COLLECTION, gameId);
            await updateDoc(gameRef, {
              imageUrl: base64String
            });
            
            resolve(base64String);
          } catch (error) {
            console.error("Error saving image to Firestore: ", error);
            reject(error);
          }
        };
        
        reader.onerror = (error) => {
          console.error("Error reading file: ", error);
          reject(error);
        };
        
        // Lê o arquivo como DataURL (Base64)
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error("Error processing image: ", error);
      throw error;
    }
  }

  // Obter todos os jogos
  async getAllGames() {
    try {
      const gamesQuery = query(collection(db, GAMES_COLLECTION), orderBy("averageRating", "desc"));
      const querySnapshot = await getDocs(gamesQuery);
      
      const games = [];
      querySnapshot.forEach((doc) => {
        games.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return games;
    } catch (error) {
      console.error("Error getting games: ", error);
      throw error;
    }
  }

  // Obter um jogo específico
  async getGameById(gameId) {
    try {
      const docRef = doc(db, GAMES_COLLECTION, gameId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      } else {
        console.log("No such game exists!");
        return null;
      }
    } catch (error) {
      console.error("Error getting game: ", error);
      throw error;
    }
  }
  // Atualizar um jogo
  async updateGame(gameId, gameData) {
    try {
      // Verifica se o usuário está autenticado
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        throw new Error("Você precisa estar logado para atualizar um jogo.");
      }
      
      // Verifica se o usuário é o proprietário do jogo
      const game = await this.getGameById(gameId);
      if (!game) {
        throw new Error("Jogo não encontrado.");
      }
      
      if (game.userId !== currentUser.uid) {
        throw new Error("Você não tem permissão para editar este jogo.");
      }
      
      const gameRef = doc(db, GAMES_COLLECTION, gameId);
      
      // Adiciona timestamp de atualização
      const updatedData = {
        ...gameData,
        updatedAt: serverTimestamp(),
        userId: currentUser.uid,  // Garante que o userId continua correto
        userEmail: currentUser.email,
        userName: currentUser.displayName || "Usuário"
      };
      
      await updateDoc(gameRef, updatedData);
      console.log("Game updated: ", gameId);
      return gameId;
    } catch (error) {
      console.error("Error updating game: ", error);
      throw error;
    }
  }

  // Excluir um jogo
  async deleteGame(gameId) {
    try {
      // Verifica se o usuário está autenticado
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        throw new Error("Você precisa estar logado para excluir um jogo.");
      }
      
      // Verifica se o usuário é o proprietário do jogo
      const game = await this.getGameById(gameId);
      if (!game) {
        throw new Error("Jogo não encontrado.");
      }
      
      if (game.userId !== currentUser.uid) {
        throw new Error("Você não tem permissão para excluir este jogo.");
      }
      
      await deleteDoc(doc(db, GAMES_COLLECTION, gameId));
      console.log("Game deleted: ", gameId);
      return true;
    } catch (error) {
      console.error("Error deleting game: ", error);
      throw error;
    }
  }
  // Adicionar uma avaliação para um jogo
  async rateGame(gameId, rating) {
    try {
      // Verifica se o usuário está autenticado
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        throw new Error("Você precisa estar logado para avaliar um jogo.");
      }
      
      // Adiciona a avaliação na subcoleção de avaliações
      const ratingData = {
        rating: rating,
        timestamp: serverTimestamp(),
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: currentUser.displayName || "Usuário"
      };
      
      // Verifica se o usuário já avaliou este jogo antes
      const ratingsQuery = collection(db, GAMES_COLLECTION, gameId, RATINGS_COLLECTION);
      const querySnapshot = await getDocs(ratingsQuery);
      
      let existingRatingId = null;
      
      // Procura por avaliações anteriores do mesmo usuário
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.userId === currentUser.uid) {
          existingRatingId = docSnap.id;
        }
      });
      
      // Se já existir uma avaliação, atualiza em vez de adicionar
      if (existingRatingId) {
        const ratingRef = doc(db, GAMES_COLLECTION, gameId, RATINGS_COLLECTION, existingRatingId);
        await updateDoc(ratingRef, ratingData);
      } else {
        await addDoc(collection(db, GAMES_COLLECTION, gameId, RATINGS_COLLECTION), ratingData);
      }
      
      // Recalcula a média das avaliações
      const updatedQuerySnapshot = await getDocs(ratingsQuery);
      
      let totalRating = 0;
      let count = 0;
      
      updatedQuerySnapshot.forEach((docSnap) => {
        totalRating += docSnap.data().rating;
        count++;
      });
      
      
      const averageRating = count > 0 ? totalRating / count : 0;
      
      // Atualiza o documento do jogo com a nova média
      const gameRef = doc(db, GAMES_COLLECTION, gameId);
      await updateDoc(gameRef, {
        averageRating: averageRating,
        ratingCount: count
      });
      
      return {
        averageRating,
        ratingCount: count
      };
    } catch (error) {
      console.error("Error rating game: ", error);
      throw error;
    }
  }
  // Adicionar uma avaliação por critérios para um jogo
  async rateCriteriaGame(gameId, criteriaRatings) {
    try {
      // Verifica se o usuário está autenticado
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        throw new Error("Você precisa estar logado para avaliar um jogo.");
      }
      
      // Verifica se o usuário é o proprietário do jogo (usuários não podem avaliar seus próprios jogos)
      const game = await this.getGameById(gameId);
      if (game.userId === currentUser.uid) {
        throw new Error("Você não pode avaliar seu próprio jogo.");
      }
      
      // Adiciona a avaliação na subcoleção de avaliações
      const ratingData = {
        criteriaRatings: criteriaRatings,
        averageRating: Object.values(criteriaRatings).reduce((sum, val) => sum + val, 0) / 
                      Object.values(criteriaRatings).length,
        timestamp: serverTimestamp(),
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: currentUser.displayName || "Usuário"
      };
      
      // Verifica se o usuário já avaliou este jogo antes
      const ratingsQuery = collection(db, GAMES_COLLECTION, gameId, RATINGS_COLLECTION);
      const querySnapshot = await getDocs(ratingsQuery);
      
      let existingRatingId = null;
      
      // Procura por avaliações anteriores do mesmo usuário
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.userId === currentUser.uid) {
          existingRatingId = docSnap.id;
        }
      });
      
      // Se já existir uma avaliação, atualiza em vez de adicionar
      if (existingRatingId) {
        const ratingRef = doc(db, GAMES_COLLECTION, gameId, RATINGS_COLLECTION, existingRatingId);
        await updateDoc(ratingRef, ratingData);
      } else {
        await addDoc(collection(db, GAMES_COLLECTION, gameId, RATINGS_COLLECTION), ratingData);
      }
      
      // Recalcula a média das avaliações
      const updatedRatingsQuery = collection(db, GAMES_COLLECTION, gameId, RATINGS_COLLECTION);
      const updatedQuerySnapshot = await getDocs(updatedRatingsQuery);
      
      // Inicializa contadores
      const criteriaScores = {};
      Object.keys(criteriaRatings).forEach(key => {
        criteriaScores[key] = 0;
      });
      
      let totalAverageRating = 0;
      let count = 0;
      
      // Soma todas as avaliações
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        if (data.criteriaRatings) {
          // Se for avaliação por critérios
          Object.entries(data.criteriaRatings).forEach(([key, value]) => {
            criteriaScores[key] = (criteriaScores[key] || 0) + value;
          });
          totalAverageRating += data.averageRating;
        } else if (data.rating) totalAverageRating += data.rating; // Se for avaliação simples (compatibilidade)
        
        count++;
      });
      
      // Calcula médias por critério
      const averageCriteriaScores = {};
      Object.entries(criteriaScores).forEach(([key, total]) => {
        averageCriteriaScores[key] = count > 0 ? total / count : 0;
      });
      
      // Calcula média geral
      const averageRating = count > 0 ? totalAverageRating / count : 0;
      
      // Atualiza o documento do jogo com a nova média
      const gameRef = doc(db, GAMES_COLLECTION, gameId);
      await updateDoc(gameRef, {
        averageRating: averageRating,
        criteriaRatings: averageCriteriaScores,
        ratingCount: count
      });
        return {
        averageRating,
        criteriaRatings: averageCriteriaScores,
        ratingCount: count
      };
    } catch (error) {
      console.error("Error rating game with criteria: ", error);
      throw error;
    }
  }

  // Métodos de autenticação

  // Login com Google
  async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      // O token de acesso pode ser usado para acessar a API do Google
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      // Informações do usuário logado
      const user = result.user;
      console.log("Usuário logado:", user.displayName);
      return user;
    } catch (error) {
      console.error("Erro ao fazer login com Google:", error);
      throw error;
    }
  }

  // Logout
  async logout() {
    try {
      await signOut(auth);
      console.log("Usuário deslogado com sucesso");
      return true;
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      throw error;
    }
  }

  // Obter usuário atual
  getCurrentUser() {
    // Modo desenvolvedor - retorna usuário simulado se estiver em modo de desenvolvimento
    if (DEV_MODE) return currentMockUser;
    
    return auth.currentUser;
  }

  // Observar mudanças de estado de autenticação
  onAuthStateChanged(callback) {
    // Modo desenvolvedor - chama o callback imediatamente com o usuário simulado se estiver em modo de desenvolvimento
    if (DEV_MODE) {
      authStateCallbacks.push(callback);
      
      // Simula mudança de estado de autenticação após 100ms
      setTimeout(() => {
        callback(currentMockUser);
      }, 100);
      
      return () => {
        // Remove o callback (não será chamado novamente em modo desenvolvedor)
        authStateCallbacks = authStateCallbacks.filter(cb => cb !== callback);
      };
    }    
    return onAuthStateChanged(auth, callback);
  }

  // ===========================================
  // MÉTODOS DE MODO DESENVOLVEDOR - REMOVER EM PRODUÇÃO
  // ===========================================
  // Alternar entre modo desenvolvedor e modo produção
  toggleDevMode() {
    if (!DEV_MODE) return false; // Só permite alternar se DEV_MODE estiver true
    
    currentMockUser = currentMockUser ? null : MOCK_USER;
    
    // Notifica todos os callbacks sobre a mudança
    authStateCallbacks.forEach(callback => {
      setTimeout(() => callback(currentMockUser), 10);
    });
    
    const isActive = currentMockUser !== null;
    showDevFeedback(`Modo ${isActive ? 'ATIVADO' : 'DESATIVADO'}`, isActive ? 'success' : 'warning');
    return isActive;
  }
  
  // Verificar se está em modo desenvolvedor
  isDevMode() {
    return DEV_MODE && currentMockUser !== null;
  }
  
  // Simular login em modo desenvolvedor
  async devLogin() {
    if (!DEV_MODE) return false;
    
    currentMockUser = MOCK_USER;
    
    // Notifica todos os callbacks
    authStateCallbacks.forEach(callback => {
      setTimeout(() => callback(currentMockUser), 10);
    });
    
    showDevFeedback('Login simulado realizado', 'success');
    return MOCK_USER;
  }
  
  // Simular logout em modo desenvolvedor
  async devLogout() {
    if (!DEV_MODE) return false;
    
    currentMockUser = null;
    
    // Notifica todos os callbacks
    authStateCallbacks.forEach(callback => {
      setTimeout(() => callback(null), 10);
    });
    
    showDevFeedback('Logout simulado realizado', 'warning');
    return true;
  }
  
  // ===========================================
}

export default new FirebaseService();

// ===========================================
// MODO DESENVOLVEDOR - REMOVER EM PRODUÇÃO  
// ===========================================
// Expõe o FirebaseService globalmente para facilitar uso no console
if (DEV_MODE && typeof window !== 'undefined') {
  window.FirebaseService = new FirebaseService();
  
  // Adiciona atalhos úteis
  window.devLogin = () => window.FirebaseService.devLogin();
  window.devLogout = () => window.FirebaseService.devLogout();
  window.toggleDev = () => window.FirebaseService.toggleDevMode();
  window.checkDev = () => window.FirebaseService.isDevMode();
  
  console.log('%c💡 Atalhos disponíveis no console:', 'color: #28a745; font-weight: bold;');
  console.log('%c- devLogin() - Login rápido', 'color: #6c757d;');
  console.log('%c- devLogout() - Logout rápido', 'color: #6c757d;');
  console.log('%c- toggleDev() - Alternar modo', 'color: #6c757d;');
  console.log('%c- checkDev() - Verificar status', 'color: #6c757d;');
}
// ===========================================
