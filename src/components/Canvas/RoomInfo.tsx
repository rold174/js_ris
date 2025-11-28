import React from 'react';

interface RoomInfoProps {
  roomId: string;
}

const RoomInfo: React.FC<RoomInfoProps> = ({ roomId }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(roomId);
  };

  return (
    <div className="room-info">
      <div className="room-info__header">
        <h3 className="room-info__title">Комната для рисования</h3>
      </div>
      <div className="room-info__content">
        <div className="room-info__id">
          <span className="room-info__label">ID комнаты:</span>
          <span className="room-info__value">{roomId}</span>
        </div>
        <div className="room-info__actions">
          <button className="room-info__copy-btn" onClick={handleCopy}>
            📋 Копировать ID
          </button>
        </div>
      </div>
      <div className="room-info__footer">
        <span className="room-info__hint">
          Поделитесь этим ID с друзьями для совместного рисования
        </span>
      </div>
    </div>
  );
};

export default RoomInfo;