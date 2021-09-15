import React, {
  createContext,
  memo,
  MutableRefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { usePersistFn } from './hooks';

export const DataContext = createContext({});
export const FocusContext = createContext({});
export const SVGContext = createContext(null);

export function uuid() {
  return 'xxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const findNodeById = (tree, id) => {
  let rs = null;

  const traverse = (node, parent, idx) => {
    if (id === node.id) {
      rs = {
        node,
        parent,
        idx,
      };
      return;
    }

    if (node.children) {
      for (let i = 0; i < node.children.length; ++i) {
        traverse(node.children[i], node, i);
      }
    }
  };
  traverse(tree, null, undefined);
  if (!rs) {
    console.error(rs, id, tree);
    throw new Error('node not found');
  }
  return rs;
};

// 指针和引用的区别
// a = {aa:{bb:1}}
// c = a.aa.bb
// c =undefined
// a.aa.bb  // 1

const useEditNode = ({ treectx, focusctx }) => {
  const { focus, focusDispatch } = focusctx;
  const { tree, treeDispatch } = treectx;

  const addChild = usePersistFn(id => {
    if (!id) {
      console.log('addChild should have an id');
      return;
    }
    const nextData = { ...tree };
    const { node: target } = findNodeById(nextData, id);

    const newNode = {
      id: uuid(),
      text: '子结点' + uuid(),
      showChildren: true,
      children: [],
    };
    target.children.push(newNode);
    treeDispatch({ type: 'set', payload: nextData, source: 'child' });
    focusDispatch({ type: 'focus', payload: newNode });
  });

  const addSibling = usePersistFn(id => {
    if (!id) {
      console.log('addSibling should have an id');
      return;
    }
    const nextData = { ...tree };
    const { parent, node: target, idx } = findNodeById(nextData, id);
    if (idx === undefined) {
      console.log('addSibling can`t perform on root');
      return;
    }
    const newNode = {
      id: uuid(),
      text: '子结点' + uuid(),
      showChildren: true,
      children: [],
    };
    parent.children.splice(idx + 1, 0, newNode);
    treeDispatch({ type: 'set', payload: nextData, source: 'sib' });
    focusDispatch({ type: 'focus', payload: newNode });
  });

  const deleteNode = usePersistFn(id => {
    if (!id) {
      console.log('deleteNode should have an id');
      return;
    }
    const nextTree = { ...tree };
    const { parent, node: target } = findNodeById(nextTree, id);
    if (parent && parent.children) {
      parent.children = parent.children.filter(el => el.id !== target.id);
    }
    treeDispatch({ type: 'set', payload: nextTree, source: 'del' });
    focusDispatch({ type: 'blur' });
  });

  const editNode = usePersistFn((id, node) => {
    if (!id) {
      console.log('editNode should have an id');
      return;
    }
    const nextTree = { ...tree };
    let { node: target } = findNodeById(nextTree, id);
    target = Object.assign(target, node);
    // Object.keys(node).map(key => {
    //   target[key] = node[key];
    // });
    treeDispatch({ type: 'set', payload: nextTree, source: 'edit' });
  });

  return {
    addChild,
    addSibling,
    deleteNode,
    editNode,
  };
};

const mindmapContainerPadding = 12;
// eslint-disable-next-line react/display-name
const RecursiveNode = React.forwardRef(({ node, tabIndex }, ref) => {
  const focusctx = useContext(FocusContext);
  const { focus, focusDispatch } = focusctx;
  const treectx = useContext(DataContext);
  const svgctx = useContext(SVGContext);

  const [editable, setEditable] = useState(false);
  const { editNode } = useEditNode({
    treectx,
    focusctx,
  });

  const onFocus = e => {
    e.stopPropagation();
    focusDispatch({ type: 'focus', payload: node });
  };

  const [value, setValue] = useState(node?.text);

  useEffect(() => {
    if (!focus) {
      setEditable(false);
      editNode(node.id, { ...node, text: value });
    }
  }, [focus]);

  const rootRef = useRef();
  const childrenRef = useRef([]);

  const [svgPaths, setSvgPaths] = useState([]);
  const [svgSize, setSvgSize] = useState([]);

  /* 绘制svg连线 */
  useEffect(() => {
    const path = [];
    const computPath = root => {
      const [rootNode, childrenNode] = root.children;

      const x = rootNode.offsetLeft + rootNode.getBoundingClientRect().width;

      const y =
        root.style.position === 'relative'
          ? root.offsetTop - mindmapContainerPadding + root.offsetHeight / 2
          : root.offsetTop + root.offsetHeight / 2;

      // console.log('root ', rootNode);
      if (!childrenNode.children || !childrenNode.children.length) return;

      // 单个子节点，解决单个子节点连线计算错位问题
      if (childrenNode.children.length === 1) {
        path.push(`M${x} ${y} H ${x + 10} V ${y} H ${x + 20}`);
        computPath(childrenNode.children[0]);
        return;
      }

      // 多个子节点
      Array.from(childrenNode.children).forEach(el => {
        const childy = el.offsetTop + el.offsetHeight / 2;
        path.push(`M${x} ${y} H ${x + 10} V ${childy} H ${x + 20}`);
        computPath(el);
      });
    };
    computPath(rootRef.current);
    if (node.isRoot) {
      console.log(
        '绘制svg连线',
        rootRef.current,
        rootRef.current.scrollWidth,
        rootRef.current.getBoundingClientRect().height
      );
      setSvgPaths(path);

      // 修复结点溢出容器时，连线位置错位
      setSvgSize([rootRef.current.scrollWidth, rootRef.current.scrollHeight]);
    }
  }, [node]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
        minWidth: 100,
        position: node.isRoot ? 'relative' : 'unset',
      }}
      ref={rootRef}
    >
      {/* 根节点 */}
      <div
        tabIndex={tabIndex}
        style={{
          border: '1px solid grey',
          flexShrink: 0,
          lineHeight: 1.2,
          marginTop: 12,
          outline:
            focus && focus.id === node.id
              ? editable
                ? '1px solid navy'
                : '1px solid yellow'
              : undefined,
        }}
        onDoubleClick={() => setEditable(true)}
        onClick={onFocus}
        // https://stackoverflow.com/questions/49639144/why-does-react-warn-against-an-contenteditable-component-having-children-managed
        contentEditable={editable}
        suppressContentEditableWarning={true}
        onInput={e => {
          setValue(e.target.innerText);
        }}
        onKeyDown={e => {
          editable && e.stopPropagation();
        }}
      >
        <span>{node?.text}</span>
      </div>

      {/* 子节点 */}
      <div style={{ marginLeft: 18 }}>
        {node.children &&
          node.children.map((el, idx) => (
            <RecursiveNode
              node={el}
              key={el.id}
              tabIndex={idx}
              ref={r => {
                childrenRef.current[idx] = r;
              }}
            ></RecursiveNode>
          ))}
      </div>

      {/* 连线 */}
      {node.isRoot && (
        <svg
          width={svgSize[0] || '100%'}
          height={svgSize[1] || '100%'}
          style={{ position: 'absolute', top: 0, left: 0, zIndex: -1 }}
        >
          {/* <defs>
                  <filter id="edge-removal">
                    <feComponentTransfer>
                      <feFuncA
                        type="table"
                        tableValues="0 0 0 0 0 0 0 0 0 0 1"
                      />
                    </feComponentTransfer>
                  </filter>
                </defs>
                <g filter="url(#edge-removal)" fill="transparent" stroke="navy"> */}
          <g
            fill="transparent"
            stroke="navy"
            style={{ shapeRendering: 'crispEdges' }}
            strokeWidth={1}
          >
            {svgPaths.map(d => {
              return <path d={d} key={d}></path>;
            })}
          </g>
        </svg>
      )}
    </div>
  );
});

const SVGLine = () => {};

/* 用于debug */
const SingleLayerNode = ({ node }) => {
  return (
    <>
      text: {node?.text} {'  '}
      id: {node?.id}
    </>
  );
};

type focusAction = { type: 'focus'; payload: object } | { type: 'blur' };

const MindMap = () => {
  const svgRef = useRef([]);
  const [tree, treeDispatch] = useReducer(
    (prev, action) => {
      switch (action.type) {
        case 'set':
          return { ...action.payload };
        default:
          return prev;
      }
    },
    {
      id: 'root',
      text: '主题',
      isRoot: true,
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

  const { addChild, deleteNode, addSibling } = useEditNode({
    treectx,
    focusctx,
  });
  const focusRef = useRef(focus);
  focusRef.current = focus;

  const mindmapref = useRef();

  /* 键盘事件处理 */
  useEffect(() => {
    const onKeyDown = e => {
      // console.log('onKeyDown', e);
      switch (e.key) {
        case 'Tab':
          e.stopPropagation();
          e.preventDefault();
          addChild(focusRef.current?.id);
          break;
        case 'Delete':
          deleteNode(focusRef.current?.id);
          break;
        case 'Enter':
          addSibling(focusRef.current?.id);
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
          width: '50%',
          height: '50vh',
          position: 'relative',
          margin: 12,
          padding: mindmapContainerPadding,
          overflow: 'auto',
        }}
        onClick={blur}
      >
        <DataContext.Provider value={treectx}>
          <FocusContext.Provider value={focusctx}>
            <SVGContext.Provider value={svgRef}>
              <RecursiveNode node={tree}></RecursiveNode>
            </SVGContext.Provider>
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
