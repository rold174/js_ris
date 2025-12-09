// src/utils/firebaseRealtime.ts
import { 
  database, 
  ref, 
  onValue, 
  set, 
  update, 
  off, 
  get,  
  push,
  remove  // Добавьте этот импорт
} from "../firebase/config";

export interface DrawingData {
  type: 'draw' | 'clear' | 'fill';
  x?: number;
  y?: number;
  prevX?: number;
  prevY?: number;
  color: string;
  brushSize: number;
  timestamp: number;
  userId: string;
}

export interface CanvasState {
  elements: DrawingData[];
  lastUpdated: number;
  activeUsers: string[];
}

// Получение ID пользователя
export const getUserId = (): string => {
  const storedId = localStorage.getItem('userId');
  if (storedId) return storedId;
  
  const newId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('userId', newId);
  return newId;
};

// Подписка на изменения холста в комнате
export const subscribeToCanvas = (
  roomId: string, 
  onCanvasUpdate: (data: DrawingData[]) => void,
  onUsersUpdate: (users: string[]) => void
) => {
  // Слушаем изменения элементов рисования
  const canvasRef = ref(database, `rooms/${roomId}/canvas/elements`);
  const usersRef = ref(database, `rooms/${roomId}/activeUsers`);
  
  const unsubscribeCanvas = onValue(canvasRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const elements = Object.values(data) as DrawingData[];
      onCanvasUpdate(elements);
    } else {
      onCanvasUpdate([]);
    }
  });
  
  const unsubscribeUsers = onValue(usersRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const users = Object.keys(data);
      onUsersUpdate(users);
    } else {
      onUsersUpdate([]);
    }
  });
  
  return () => {
    off(canvasRef);
    off(usersRef);
    unsubscribeCanvas();
    unsubscribeUsers();
  };
};

// Отправка действия рисования
export const sendDrawingAction = async (
  roomId: string, 
  action: DrawingData
): Promise<void> => {
  try {
    const actionId = `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const actionRef = ref(database, `rooms/${roomId}/canvas/elements/${actionId}`);
    
    await set(actionRef, {
      ...action,
      id: actionId
    });
    
    // Обновляем время последнего действия
    await update(ref(database, `rooms/${roomId}/canvas`), {
      lastUpdated: Date.now()
    });
    
  } catch (error) {
    console.error('Ошибка при отправке действия рисования:', error);
  }
};

// Очистка холста
export const clearCanvas = async (roomId: string, userId: string): Promise<void> => {
  try {
    const clearAction: DrawingData = {
      type: 'clear',
      color: '#FFFFFF',
      brushSize: 0,
      timestamp: Date.now(),
      userId
    };
    
    // Отправляем действие очистки
    await sendDrawingAction(roomId, clearAction);
    
    // Также очищаем все элементы (используем set с null)
    await set(ref(database, `rooms/${roomId}/canvas/elements`), null);
    
  } catch (error) {
    console.error('Ошибка при очистке холста:', error);
  }
};

// Добавление пользователя в активные
export const addActiveUser = async (roomId: string, userId: string): Promise<void> => {
  try {
    await update(ref(database, `rooms/${roomId}/activeUsers`), {
      [userId]: {
        joinedAt: Date.now(),
        lastActive: Date.now()
      }
    });
    
    // Обновляем время последней активности комнаты
    await update(ref(database, `rooms/${roomId}`), {
      lastActivity: Date.now()
    });
    
  } catch (error) {
    console.error('Ошибка при добавлении активного пользователя:', error);
  }
};

// Удаление пользователя из активных (исправленная версия)
export const removeActiveUser = async (roomId: string, userId: string): Promise<void> => {
  try {
    // Способ 1: Использовать remove()
    await remove(ref(database, `rooms/${roomId}/activeUsers/${userId}`));
    
    // Или способ 2: Использовать set() с null
    // await set(ref(database, `rooms/${roomId}/activeUsers/${userId}`), null);
    
  } catch (error) {
    console.error('Ошибка при удалении активного пользователя:', error);
  }
};

// Получение текущего состояния холста
export const getCanvasState = async (roomId: string): Promise<DrawingData[]> => {
  try {
    const canvasRef = ref(database, `rooms/${roomId}/canvas/elements`);
    const snapshot = await get(canvasRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.values(data) as DrawingData[];
    }
    return [];
  } catch (error) {
    console.error('Ошибка при получении состояния холста:', error);
    return [];
  }
};

// Обновление активности пользователя
export const updateUserActivity = async (roomId: string, userId: string): Promise<void> => {
  try {
    await update(ref(database, `rooms/${roomId}/activeUsers/${userId}`), {
      lastActive: Date.now()
    });
  } catch (error) {
    console.error('Ошибка при обновлении активности пользователя:', error);
  }
};

// Инициализация холста комнаты
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

// Получение активных пользователей
export const getActiveUsers = async (roomId: string): Promise<string[]> => {
  try {
    const usersRef = ref(database, `rooms/${roomId}/activeUsers`);
    const snapshot = await get(usersRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data);
    }
    return [];
  } catch (error) {
    console.error('Ошибка при получении активных пользователей:', error);
    return [];
  }
};