'use strict';

module.exports = mindmap;

function mindmap() {
    // TODO
    console.log('mindmap')
}

// const NodeRender = ({ data }) => {
//   const { treeData, treeDispatch } = useContext(context);

//   return (
//     <div style={{ display: 'flex', alignItems: 'center' }}>
//       {/* 根节点 */}
//       <div
//         style={{ border: '1px solid grey', marginTop: 12 }}
//         onClick={() => {
//           const nextData = { ...treeData };
//           const target = findNodeById(nextData, data.id);
//           console.log('target', data.id, target);
//           mindmap();
//           target.children = [
//             ...target.children,
//             {
//               id: uuid(),
//               text: '子结点' + uuid(),
//               showChildren: true,
//               children: [],
//             },
//           ];
//           treeDispatch({ type: 'set', payload: nextData });
//         }}
//       >
//         {data.text}
//       </div>
//       {/* 子节点 */}
//       <div style={{ marginLeft: 12 }}>
//         {data.children &&
//           data.children.map(el => (
//             <NodeRender data={el} key={el.id}></NodeRender>
//           ))}
//       </div>
//     </div>
//   );
// };
