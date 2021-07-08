import logo from './logo.svg';
import './App.css';
import { useContext, createContext, useReducer, useMemo } from 'react';
import Mindmap from 'mindmap'

function App() {
  return (
      <div className="App">
        <Mindmap />
      </div>
  );
}

export default App;
