import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRoom, joinRoom } from "../utils/roomManager";
import "./StartPage.css";

export default function StartPage() {
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    const newRoomId = createRoom();
    navigate(`/app?room=${newRoomId}`);
  };

  const handleJoinRoom = () => {
    if (!roomId.trim()) {
      alert("Пожалуйста, введите ID комнаты");
      return;
    }
    
    if (joinRoom(roomId)) {
      navigate(`/app?room=${roomId}`);
    } else {
      alert("Комната не найдена. Проверьте ID комнаты.");
    }
  };

  return (
    <div className="start-container">
      <div className="start-window">
        <div className="window-header">
          <span className="window-title">Risovashka</span>
        </div>
        
        <div className="window-content">
          <h1 className="start-title">Добро пожаловать</h1>
          
          <div className="main-buttons">
            <button className="xp-button create-btn" onClick={handleCreateRoom}>
              <span className="button-icon">➕</span>
              <span className="button-text">Создать комнату</span>
            </button>
            
            <button className="xp-button join-btn" onClick={handleJoinRoom}>
              <span className="button-icon">🔗</span>
              <span className="button-text">Присоединиться</span>
            </button>
          </div>

          <div className="join-section">
            <div className="input-group">
              <label className="input-label">ID комнаты:</label>
              <input
                type="text"
                placeholder="Введите ID комнаты"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="room-input"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleJoinRoom();
                  }
                }}
              />
            </div>
          </div>
        </div>
        
        <div className="window-footer">
          <span className="footer-text">Выберите действие для начала работы</span>
        </div>
      </div>
    </div>
  );
}