import {
  createContext,
  memo,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
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
  if (!rs) throw new Error('node not found');
  return rs;
};

const useEditNode = ({ treectx }) => {
  const { tree, treeDispatch } = treectx;

  const addChild = id => {
    if (!id) {
      console.log('addChild should have an id');
      return;
    }

    const nextData = { ...tree };
    const target = findNodeById(nextData, id);
    // console.log('target', data.id, target);

    target.children = [
      ...target?.children,
      {
        id: uuid(),
        text: '子结点' + uuid(),
        showChildren: true,
        children: [],
      },
    ];
    console.log('dispatched treeDispatch');
    treeDispatch({ type: 'set', payload: nextData });
  };

  return {
    addChild,
  };
};

const RecursiveNode = ({ node }) => {
  const { focusDispatch } = useContext(FocusContext);

  const onFocus = () => {
    focusDispatch({ type: 'focus', payload: node });
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {/* 根节点 */}
      <div
        style={{ border: '1px solid grey', marginTop: 12 }}
        onClick={onFocus}
      >
        {node?.text}
      </div>
      {/* 子节点 */}
      <div style={{ marginLeft: 12 }}>
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

  const { addChild } = useEditNode({ treectx });
  const focusRef = useRef(focus);
  focusRef.current = focus;

  const mindmapref = useRef();
  useEffect(() => {
    const onKeyDown = e => {
      console.log('onKeyDown', e);
      if (e.key !== 'Tab') return;
      e.stopPropagation();
      e.preventDefault();
      addChild(focusRef.current?.id);
    };
    mindmapref.current.addEventListener('keydown', onKeyDown);
    return () => {
      mindmapref.current.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return (
    <div
      tabIndex={0}
      ref={mindmapref}
      style={{
        outline: '1px solid grey',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        margin: 12,
        padding: 12,
      }}
    >
      <DataContext.Provider value={treectx}>
        <FocusContext.Provider value={focusctx}>
          <RecursiveNode node={tree}></RecursiveNode>
        </FocusContext.Provider>

        <div style={{ position: 'absolute', bottom: 50 }}>
          当前选中：<SingleLayerNode node={focus}></SingleLayerNode>
        </div>
      </DataContext.Provider>
    </div>
  );
};
export default MindMap;
