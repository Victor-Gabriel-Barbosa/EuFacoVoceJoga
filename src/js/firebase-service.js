// Serviço para gerenciar operações do Firebase
import { getFirestore, collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, orderBy, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { app } from './firebase-config.js';
import ImageCompressor from './image-compressor.js';

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
      // Adiciona timestamp
      const gameWithTimestamp = {
        ...gameData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        averageRating: 0,
        ratingCount: 0
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
      const gameRef = doc(db, GAMES_COLLECTION, gameId);
      
      // Adiciona timestamp de atualização
      const updatedData = {
        ...gameData,
        updatedAt: serverTimestamp()
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
      // Adiciona a avaliação na subcoleção de avaliações
      const ratingData = {
        rating: rating,
        timestamp: serverTimestamp()
      };
      
      await addDoc(collection(db, GAMES_COLLECTION, gameId, RATINGS_COLLECTION), ratingData);
      
      // Recalcula a média das avaliações
      const ratingsQuery = collection(db, GAMES_COLLECTION, gameId, RATINGS_COLLECTION);
      const querySnapshot = await getDocs(ratingsQuery);
      
      let totalRating = 0;
      let count = 0;
      
      querySnapshot.forEach((doc) => {
        totalRating += doc.data().rating;
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
}

export default new FirebaseService();
