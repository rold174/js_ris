// src/components/StartPage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createRoom, joinRoom, getRoomInfo } from "../utils/roomManager";
import "./StartPage.css";

export default function StartPage() {
  const [roomId, setRoomId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [recentRooms, setRecentRooms] = useState<string[]>([]);
  const [roomInfo, setRoomInfo] = useState<any>(null);
  const navigate = useNavigate();

  // Загрузка недавних комнат из localStorage
  useEffect(() => {
    const savedRooms = localStorage.getItem('recentRooms');
    if (savedRooms) {
      setRecentRooms(JSON.parse(savedRooms));
    }
  }, []);

  // Проверка существования комнаты при вводе ID
  useEffect(() => {
    const checkRoom = async () => {
      if (roomId.trim().length > 5) {
        const info = await getRoomInfo(roomId);
        setRoomInfo(info);
      } else {
        setRoomInfo(null);
      }
    };
    
    const timeoutId = setTimeout(checkRoom, 500);
    return () => clearTimeout(timeoutId);
  }, [roomId]);

  const handleCreateRoom = async () => {
    setIsCreating(true);
    try {
      const newRoomId = await createRoom();
      
      // Сохраняем в список недавних комнат
      const updatedRecentRooms = [newRoomId, ...recentRooms.filter(id => id !== newRoomId)].slice(0, 5);
      setRecentRooms(updatedRecentRooms);
      localStorage.setItem('recentRooms', JSON.stringify(updatedRecentRooms));
      
      navigate(`/app?room=${newRoomId}`);
    } catch (error: any) {
      alert(error.message || "Ошибка при создании комнаты. Попробуйте еще раз.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    const trimmedRoomId = roomId.trim();
    
    if (!trimmedRoomId) {
      alert("Пожалуйста, введите ID комнаты");
      return;
    }
    
    setIsJoining(true);
    try {
      const result = await joinRoom(trimmedRoomId);
      
      if (result.success) {
        // Сохраняем в список недавних комнат
        const updatedRecentRooms = [trimmedRoomId, ...recentRooms.filter(id => id !== trimmedRoomId)].slice(0, 5);
        setRecentRooms(updatedRecentRooms);
        localStorage.setItem('recentRooms', JSON.stringify(updatedRecentRooms));
        
        navigate(`/app?room=${trimmedRoomId}`);
      } else {
        alert(result.message || "Не удалось присоединиться к комнате.");
      }
    } catch (error: any) {
      alert(error.message || "Ошибка при присоединении к комнате.");
    } finally {
      setIsJoining(false);
    }
  };

  const handleQuickJoin = (id: string) => {
    setRoomId(id);
  };

  const handleCopyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId)
        .then(() => alert("ID комнаты скопирован в буфер обмена!"))
        .catch(() => alert("Не удалось скопировать ID комнаты"));
    }
  };

  return (
    <div className="start-container">
      <div className="start-window">
        <div className="window-header">
          <span className="window-title">Risovashka</span>
          <span className="window-subtitle">Совместное рисование в реальном времени</span>
        </div>
        
        <div className="window-content">
          <h1 className="start-title">Добро пожаловать</h1>
          
          <div className="main-buttons">
            <button 
              className="xp-button create-btn" 
              onClick={handleCreateRoom}
              disabled={isCreating}
            >
              <span className="button-icon">➕</span>
              <span className="button-text">
                {isCreating ? "Создание..." : "Создать комнату"}
              </span>
            </button>
            
            <button 
              className="xp-button join-btn" 
              onClick={handleJoinRoom}
              disabled={isJoining || !roomId.trim()}
            >
              <span className="button-icon">🔗</span>
              <span className="button-text">
                {isJoining ? "Подключение..." : "Присоединиться"}
              </span>
            </button>
          </div>

          <div className="join-section">
            <div className="input-group">
              <div className="input-header">
                <label className="input-label">ID комнаты:</label>
                {roomInfo && (
                  <span className="room-status active">
                    ✓ Комната активна ({roomInfo.participants?.length || 0} участников)
                  </span>
                )}
              </div>
              
              <div className="input-with-button">
                <input
                  type="text"
                  placeholder="Введите ID комнаты (например: room_1701234567890_ABC123)"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="room-input"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && roomId.trim()) {
                      handleJoinRoom();
                    }
                  }}
                  disabled={isJoining}
                />
                {roomId && (
                  <button 
                    className="copy-btn"
                    onClick={handleCopyRoomId}
                    title="Скопировать ID"
                  >
                    📋
                  </button>
                )}
              </div>
              
              {roomId && !roomInfo && (
                <div className="room-hint">
                  Введите существующий ID комнаты или создайте новую
                </div>
              )}
            </div>

            {/* Список недавних комнат */}
            {recentRooms.length > 0 && (
              <div className="recent-rooms">
                <h3 className="recent-title">Недавние комнаты:</h3>
                <div className="room-list">
                  {recentRooms.map((id) => (
                    <button
                      key={id}
                      className="room-chip"
                      onClick={() => handleQuickJoin(id)}
                      title={`Присоединиться к комнате ${id}`}
                    >
                      <span className="room-chip-id">{id.substring(0, 15)}...</span>
                      <span className="room-chip-join">→</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="window-footer">
          <span className="footer-text">
            Создайте комнату для совместного рисования или введите ID существующей комнаты
          </span>
          <div className="footer-stats">
            <span>ID вашей сессии: {localStorage.getItem('userId')?.substring(0, 10)}...</span>
          </div>
        </div>
      </div>
    </div>
  );
}