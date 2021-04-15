import React from 'react';
import { Diagram } from './features/diagram/Diagram';
import { MyForm } from './features/my-form/MyForm';
import './App.css';

function App() {
  return (
    <div className="App">
      <MyForm />
      <Diagram />
    </div>
  );
}

export default App;
