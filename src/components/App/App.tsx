import React, { useState } from 'react';
import Toolbar from '../Toolbar/Toolbar';
import Canvas from '../Canvas/Canvas';
import './App.css';

function App() {
  const [currentTool, setCurrentTool] = useState('brush');
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState('#000000');

  return (
    <div className="app">
      <Toolbar
        currentTool={currentTool}
        onToolChange={setCurrentTool}
        brushSize={brushSize}
        onBrushSizeChange={setBrushSize}
        brushColor={brushColor}
        onBrushColorChange={setBrushColor}
      />
      <Canvas
        currentTool={currentTool}
        brushSize={brushSize}
        brushColor={brushColor}
      />
    </div>
  );
}

export default App;