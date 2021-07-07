import logo from './logo.svg';
import './App.css';
import { useContext, createContext, useReducer, useMemo } from 'react';
import Mindmap, { Context } from 'mindmap'

console.log('Mindmap,Context',Mindmap,Context);

function App() {
  const [treeData, treeDispatch] = useReducer(
    (tree, action) => {
      switch (action.type) {
        case 'set':
          return action.payload;
        default:
          return tree;
      }
    },
    {
      id: 'root',
      text: '主题',
      showChildren: true,
      children: [
        {
          id: 'child1',
          text: '子结点1',
          showChildren: true,
          children: [],
        },
        {
          id: 'child2',
          text: '子结点2',
          showChildren: true,
          children: [
            {
              id: 'child2-1',
              text: '子结点2-1',
              showChildren: true,
              children: [],
            },
            {
              id: 'child2-2',
              text: '子结点2-2',
              showChildren: true,
              children: [],
            },
          ],
        },
        {
          id: 'child3',
          text: '子结点3',
          showChildren: true,
          children: [
            {
              id: 'child3-1',
              text: '子结点3-1',
              showChildren: true,
              children: [],
            },
            {
              id: 'child3-2',
              text: '子结点3-2',
              showChildren: true,
              children: [],
            },
          ],
        },
      ],
    }
  );

  const value = useMemo(
    () => ({
      treeData, 
      treeDispatch,
    }),
    [treeData]
  );

  return (
    <Context.Provider value={value}>
      <div className="App">
        <Mindmap data={treeData} />
      </div>
    </Context.Provider>
  );
}

export default App;
