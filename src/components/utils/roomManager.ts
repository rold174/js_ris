// src/utils/roomManager.ts
import { database, ref, set, get, update } from "../firebase/config";

export interface Room {
  id: string;
  createdAt: number;
  createdBy: string; // ID пользователя или его имя
  participants: string[];
  isActive: boolean;
  lastActivity: number;
}

// Уникальный идентификатор для текущего пользователя (упрощенный вариант)
const getUserId = (): string => {
  // В реальном приложении здесь должна быть система аутентификации
  const storedId = localStorage.getItem('userId');
  if (storedId) return storedId;
  
  const newId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('userId', newId);
  return newId;
};

// Создание новой комнаты
export const createRoom = async (): Promise<string> => {
  try {
    // Генерируем ID комнаты
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const userId = getUserId();
    
    const roomData: Room = {
      id: roomId,
      createdAt: Date.now(),
      createdBy: userId,
      participants: [userId], // Создатель сразу становится участником
      isActive: true,
      lastActivity: Date.now()
    };
    
    // Сохраняем комнату в Firebase
    await set(ref(database, `rooms/${roomId}`), roomData);
    
    // Также сохраняем в локальное хранилище для быстрого доступа
    localStorage.setItem('currentRoom', roomId);
    
    console.log('Комната создана:', {
      id: roomId,
      firebasePath: `rooms/${roomId}`,
      creator: userId
    });
    
    return roomId;
  } catch (error) {
    console.error('Ошибка при создании комнаты:', error);
    throw new Error('Не удалось создать комнату. Попробуйте еще раз.');
  }
};

// Присоединение к существующей комнате
export const joinRoom = async (roomId: string): Promise<{success: boolean, message?: string}> => {
  try {
    // Проверяем, существует ли комната
    const roomRef = ref(database, `rooms/${roomId}`);
    const snapshot = await get(roomRef);
    
    if (!snapshot.exists()) {
      return { 
        success: false, 
        message: "Комната не найдена. Проверьте ID комнаты." 
      };
    }
    
    const roomData = snapshot.val() as Room;
    
    // Проверяем, активна ли комната
    if (!roomData.isActive) {
      return { 
        success: false, 
        message: "Комната неактивна или была закрыта." 
      };
    }
    
    // Проверяем, не истекло ли время активности (например, 24 часа)
    const hoursSinceLastActivity = (Date.now() - roomData.lastActivity) / (1000 * 60 * 60);
    if (hoursSinceLastActivity > 24) {
      await update(roomRef, { isActive: false });
      return { 
        success: false, 
        message: "Комната устарела и была закрыта." 
      };
    }
    
    const userId = getUserId();
    
    // Проверяем, не присоединен ли уже пользователь
    if (!roomData.participants.includes(userId)) {
      // Добавляем пользователя в участники
      const updatedParticipants = [...roomData.participants, userId];
      
      await update(roomRef, {
        participants: updatedParticipants,
        lastActivity: Date.now()
      });
      
      console.log('Пользователь присоединился:', {
        roomId,
        userId,
        totalParticipants: updatedParticipants.length
      });
    }
    
    // Сохраняем в локальное хранилище
    localStorage.setItem('currentRoom', roomId);
    
    return { success: true };
    
  } catch (error) {
    console.error('Ошибка при присоединении к комнате:', error);
    return { 
      success: false, 
      message: "Ошибка соединения с сервером. Попробуйте еще раз." 
    };
  }
};

// Получение информации о комнате
export const getRoomInfo = async (roomId: string): Promise<Room | null> => {
  try {
    const roomRef = ref(database, `rooms/${roomId}`);
    const snapshot = await get(roomRef);
    
    if (snapshot.exists()) {
      return snapshot.val() as Room;
    }
    return null;
  } catch (error) {
    console.error('Ошибка при получении информации о комнате:', error);
    return null;
  }
};

// Обновление времени последней активности
export const updateRoomActivity = async (roomId: string): Promise<void> => {
  try {
    const roomRef = ref(database, `rooms/${roomId}`);
    await update(roomRef, {
      lastActivity: Date.now()
    });
  } catch (error) {
    console.error('Ошибка при обновлении активности комнаты:', error);
  }
};

// Получение списка всех активных комнат (для админки или статистики)
export const getAllActiveRooms = async (): Promise<Room[]> => {
  try {
    const roomsRef = ref(database, 'rooms');
    const snapshot = await get(roomsRef);
    
    if (!snapshot.exists()) return [];
    
    const rooms: Room[] = [];
    snapshot.forEach((childSnapshot) => {
      const room = childSnapshot.val() as Room;
      if (room.isActive) {
        rooms.push(room);
      }
    });
    
    return rooms;
  } catch (error) {
    console.error('Ошибка при получении списка комнат:', error);
    return [];
  }
};

// Выход из комнаты
export const leaveRoom = async (roomId: string, userId: string): Promise<void> => {
  try {
    const roomInfo = await getRoomInfo(roomId);
    if (!roomInfo) return;
    
    const updatedParticipants = roomInfo.participants.filter(id => id !== userId);
    
    // Если в комнате не осталось участников, помечаем как неактивную
    const updates: any = {
      participants: updatedParticipants,
      lastActivity: Date.now()
    };
    
    if (updatedParticipants.length === 0) {
      updates.isActive = false;
    }
    
    await update(ref(database, `rooms/${roomId}`), updates);
    
    localStorage.removeItem('currentRoom');
    
  } catch (error) {
    console.error('Ошибка при выходе из комнаты:', error);
  }
};

// Добавьте в существующий файл roomManager.ts

export const initializeRoomCanvas = async (roomId: string): Promise<void> => {
  try {
    const canvasRef = ref(database, `rooms/${roomId}/canvas`);
    const snapshot = await get(canvasRef);
    
    if (!snapshot.exists()) {
      await set(canvasRef, {
        elements: {},
        lastUpdated: Date.now(),
        createdAt: Date.now()
      });
    }
  } catch (error) {
    console.error('Ошибка при инициализации холста комнаты:', error);
  }
};