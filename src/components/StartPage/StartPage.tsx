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
      <h1 className="start-title">Рисовалка</h1>
      
      <div className="room-actions">
        <button className="start-btn create-btn" onClick={handleCreateRoom}>
          Создать комнату
        </button>
        
        <div className="join-section">
          <input
            type="text"
            placeholder="Введите ID комнаты"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="room-input"
          />
          <button className="start-btn join-btn" onClick={handleJoinRoom}>
            Присоединиться
          </button>
        </div>
      </div>
    </div>
  );
}