// Менеджер комнат для совместного рисования

interface Room {
  id: string;
  createdAt: Date;
  users: string[]; // В будущем можно добавить информацию о пользователях
}

const rooms = new Map<string, Room>();

export const createRoom = (): string => {
  const roomId = generateRoomId();
  const room: Room = {
    id: roomId,
    createdAt: new Date(),
    users: []
  };
  
  rooms.set(roomId, room);
  console.log(`Комната создана: ${roomId}`);
  return roomId;
};

export const joinRoom = (roomId: string): boolean => {
  const room = rooms.get(roomId);
  if (room) {
    console.log(`Присоединение к комнате: ${roomId}`);
    return true;
  }
  return false;
};

export const getRoom = (roomId: string): Room | undefined => {
  return rooms.get(roomId);
};

export const deleteRoom = (roomId: string): void => {
  rooms.delete(roomId);
  console.log(`Комната удалена: ${roomId}`);
};

const generateRoomId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};