import { createContext, useContext } from "react";
export const Context = createContext({});

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
  const { treeData, treeDispatch } = useContext(Context);

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

export default NodeRender;