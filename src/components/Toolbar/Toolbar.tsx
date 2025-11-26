import React from 'react';
import './Toolbar.css';

const Toolbar: React.FC = () => {
  return (
    <div className="toolbar">
      <div className="toolbar-content">
        <h2>Инструменты</h2>
        {/* Здесь будут кнопки инструментов */}
      </div>
    </div>
  );
};

export default Toolbar;