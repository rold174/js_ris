// src/components/RoomInfo.tsx
import React, { useState, useEffect } from 'react';
import './Canvas.css'; // Или создайте отдельный CSS

interface RoomInfoProps {
  roomId: string;
  activeUsers?: string[];
}

const RoomInfo: React.FC<RoomInfoProps> = ({ roomId, activeUsers = [] }) => {
  const [copied, setCopied] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');

  useEffect(() => {
    // Получаем ID текущего пользователя
    const storedId = localStorage.getItem('userId');
    if (storedId) {
      setCurrentUserId(storedId);
    }
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(roomId)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Ошибка копирования:', err);
      });
  };

  return (
    <div className="room-info">
      <div className="room-info__header">
        <span className="room-info__icon">🖼️</span>
        <h3 className="room-info__title">Комната для рисования</h3>
      </div>
      
      <div className="room-info__content">
        <div className="room-info__id">
          <span className="room-info__label">ID комнаты:</span>
          <code className="room-info__value">{roomId}</code>
        </div>
        
        <div className="room-info__actions">
          <button 
            className={`room-info__copy-btn ${copied ? 'copied' : ''}`}
            onClick={handleCopy}
            disabled={copied}
          >
            {copied ? '✓ Скопировано!' : '📋 Копировать ID'}
          </button>
        </div>
        
        {/* Информация об участниках */}
        {activeUsers.length > 0 && (
          <div className="room-info__participants">
            <div className="participants-header">
              <span className="participants-label">Участники:</span>
              <span className="participants-count">{activeUsers.length}</span>
            </div>
            <div className="participants-list">
              {activeUsers.map((userId, index) => (
                <div 
                  key={userId} 
                  className={`participant ${userId === currentUserId ? 'current' : ''}`}
                >
                  <span className="participant-icon">
                    {userId === currentUserId ? '👑' : '👤'}
                  </span>
                  <span className="participant-id">
                    {userId === currentUserId ? 'Вы' : `Участник ${index + 1}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="room-info__footer">
        <p className="room-info__hint">
          Отправьте этот ID друзьям, чтобы они могли присоединиться к рисованию в реальном времени.
          Все изменения синхронизируются автоматически.
        </p>
      </div>
    </div>
  );
};

export default RoomInfo;