import {
  createContext,
  memo,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
export const DataContext = createContext({});
export const FocusContext = createContext({});

export function uuid() {
  return 'xxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const findNodeById = (tree, id) => {
  let rs = null;

  const traverse = (node, parent) => {
    if (!node || id === node.id) {
      rs = {
        parent,
        node,
      };
      return;
    }

    if (node.children) {
      for (let i = 0; i < node.children.length; ++i) {
        traverse(node.children[i], node);
      }
    }
  };
  traverse(tree, null);
  if (!rs) throw new Error('node not found', rs, id, tree);
  return rs;
};

// 指针和引用的区别
// a = {aa:{bb:1}}
// c = a.aa.bb
// c =undefined
// a.aa.bb  // 1

const useEditNode = ({ treectx, focusctx }) => {
  const { tree, treeDispatch } = treectx;
  const { focusDispatch } = focusctx;
  const addChild = id => {
    if (!id) {
      console.log('addChild should have an id');
      return;
    }

    const nextData = { ...tree };
    const { node: target } = findNodeById(nextData, id);
    // console.log('target', data.id, target);

    const newNode = {
      id: uuid(),
      text: '子结点' + uuid(),
      showChildren: true,
      children: [],
    };
    target.children = [...target?.children, newNode];
    console.log('dispatched treeDispatch');
    treeDispatch({ type: 'set', payload: nextData });
    focusDispatch({ type: 'focus', payload: newNode });
  };

  const deleteNode = id => {
    if (!id) {
      console.log('deleteNode should have an id');
      return;
    }
    const nextTree = { ...tree };
    const { parent, node: target } = findNodeById(nextTree, id);
    if (parent && parent.children) {
      parent.children = parent.children.filter(el => el.id !== target.id);
    }
    treeDispatch({ type: 'set', payload: nextTree });
    focusDispatch({ type: 'blur' });
  };

  return {
    addChild,
    deleteNode,
  };
};

const RecursiveNode = ({ node }) => {
  const { focus, focusDispatch } = useContext(FocusContext);
  const [editable, setEditable] = useState(false);
  const onFocus = e => {
    e.stopPropagation();
    focusDispatch({ type: 'focus', payload: node });
  };
  useEffect(() => {
    if (!focus) setEditable(false);
  }, [focus]);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
        minWidth: 100,
      }}
    >
      {/* 根节点 */}
      <div
        style={{
          border: '1px solid grey',
          flexShrink: 0,
          marginTop: 12,
          marginRight: 6,
          lineHeight: 1.2,
          outline:
            focus && focus.id === node.id ? '1px solid yellow' : undefined,
        }}
        onDoubleClick={() => setEditable(true)}
        onClick={onFocus}
        contentEditable={editable}
      >
        {!editable && node?.text}
        {editable && <input type="text" value={node?.text} />}
      </div>
      {/* 子节点 */}
      <div style={{ marginLeft: 6 }}>
        {node.children &&
          node.children.map(el => (
            <RecursiveNode node={el} key={el.id}></RecursiveNode>
          ))}
      </div>
    </div>
  );
};

/* 用于debug */
const SingleLayerNode = ({ node }) => {
  return (
    <>
      {node?.text} {node?.id}
    </>
  );
};

type focusAction =
  | { type: 'focus'; payload: object }
  | { type: 'blur'; payload: any };

const MindMap = () => {
  const [tree, treeDispatch] = useReducer(
    (tree, action) => {
      switch (action.type) {
        case 'set':
          return { ...action.payload };
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

  const [focus, focusDispatch] = useReducer((prev, action: focusAction) => {
    switch (action.type) {
      case 'focus':
        return action.payload;
      case 'blur':
        return null;
      default: {
        return prev;
      }
    }
  }, null);

  const treectx = useMemo(
    () => ({
      tree,
      treeDispatch,
    }),
    [tree]
  );
  const focusctx = useMemo(
    () => ({
      focus,
      focusDispatch,
    }),
    [focus]
  );

  const { addChild, deleteNode } = useEditNode({ treectx, focusctx });
  const focusRef = useRef(focus);
  focusRef.current = focus;

  const mindmapref = useRef();
  useEffect(() => {
    const onKeyDown = e => {
      console.log('onKeyDown', e);
      switch (e.key) {
        case 'Tab':
          e.stopPropagation();
          e.preventDefault();
          addChild(focusRef.current?.id);
          break;
        case 'Delete':
          deleteNode(focusRef.current?.id);
          break;
        default:
      }
    };
    mindmapref.current.addEventListener('keydown', onKeyDown);
    return () => {
      mindmapref.current.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const blur = () => {
    focusDispatch({ type: 'blur' });
  };
  return (
    <>
      <div
        tabIndex={0}
        ref={mindmapref}
        style={{
          outline: '1px solid grey',
          width: '100%',
          // display: 'flex',
          // justifyContent: 'safe center',
          // position: 'relative',
          margin: 12,
          padding: 12,
          overflow: 'auto',
        }}
        onClick={blur}
      >
        <DataContext.Provider value={treectx}>
          <FocusContext.Provider value={focusctx}>
            <RecursiveNode node={tree}></RecursiveNode>
          </FocusContext.Provider>
        </DataContext.Provider>
      </div>
      <div style={{ position: 'absolute', bottom: 50 }}>
        当前选中：<SingleLayerNode node={focus}></SingleLayerNode>
      </div>
    </>
  );
};
export default MindMap;
