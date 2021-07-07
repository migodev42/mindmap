import logo from './logo.svg';
import './App.css';
import { useContext, createContext, useReducer, useMemo } from 'react';

const context = createContext({});

export function uuid() {
  return 'xxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const findNodeById = (tree, id) => {
  let rs = null;

  const traverse = node => {
    if (id === node.id || !node) {
      rs = node;
      return;
    }

    if (node.children) {
      for (let i = 0; i < node.children.length; ++i) {
        traverse(node.children[i]);
      }
    }
  };
  traverse(tree);
  return rs;
};

const NodeRender = ({ data }) => {
  const { treeData, treeDispatch } = useContext(context);

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {/* 根节点 */}
      <div
        style={{ border: '1px solid grey', marginTop: 12 }}
        onClick={() => {
          const nextData = { ...treeData };
          const target = findNodeById(nextData, data.id);
          console.log('target', data.id, target);
          target.children = [
            ...target.children,
            {
              id: uuid(),
              text: '子结点' + uuid(),
              showChildren: true,
              children: [],
            },
          ];
          treeDispatch({ type: 'set', payload: nextData });
        }}
      >
        {data.text}
      </div>
      {/* 子节点 */}
      <div style={{ marginLeft: 12 }}>
        {data.children &&
          data.children.map(el => (
            <NodeRender data={el} key={el.id}></NodeRender>
          ))}
      </div>
    </div>
  );
};

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
    <context.Provider value={value}>
      <div className="App">
        <NodeRender data={treeData} />
      </div>
    </context.Provider>
  );
}

export default App;
