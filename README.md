# mindmap
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/) [![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)



![](2021-07-29-14-06-34.png)


<!-- ### 参考 -->

<!-- lerna配置：
- [](https://medium.com/rewrite-tech/how-to-create-a-monorepo-with-lerna-3ed6dfec5021) -->

## 实现思路 

### 1. 渲染与布局
#### 1.1 结点布局

思维导图的数据结构本质上是一个`n叉树`，即一个结点可以有n个子结点。

而且在思维导图中，根结点与它的子结点是一种“纵向关系”，子结点之间是“横向关系”。

所以我们可以得出一般的结点渲染规律：

```
**************************
*       ------ chlid     *
*       |                * 
*  root ------- chlid    * 
*       |                * 
*       ------ chlid     *
**************************     

```
具体实现中，我们可以直接借助 `HTML` 和 `CSS`提供的特性来完成布局：使用 `flexbox` 将 `root` 和所有 `chlid` 左右分布，而同级的所有 `chlid` 按照 `Normal flow` 自上向下排列。

整个思维导图结点的渲染通过一个 `递归组件` 完成。

#### 1.2 结点连线

在调研了几个比较常见的思维导图实现（[ProcessOn](https://www.processon.com/)、[RMind](https://github.com/Mongkii/RMind)、[百度脑图](https://naotu.baidu.com/)）后，我发现结点连线一般有 `canvas` 绘制、`svg`绘制两种方案。

我做的时候，感觉使用 `svg` 处理可能会好一些。因为后续如果要在连线上做事件绑定、样式改变等功能时，`svg` 可以直接去做绑定，而如果使用 `canvas` 实现的话就更复杂一些（比如点击事件还需要去写一些逻辑去判断点击的是哪条连线或者哪个位置）。

具体实现是：在渲染顶层根节点时，递归计算各个结点位置并进行连线的绘制（这个是可以实现的，因为 `React` 的渲染是深度优先，子节点的渲染总会先比根结点先执行）。

伪代码：
``` jsx
const RecursiveNode = ()=> {
  
  const rootRef = useRef();
  
  /* 绘制svg连线 */
  useEffect(() => {
    const path = [];
    const computPath = root => {      

      // 结点左上角横坐标
      const x = EXRESSION_TO_GET_X;

      // 结点左上纵坐标
      const y = EXRESSION_TO_GET_Y;
        
      // 没有子节点
      if (!NO_CHILDREN) return;

      // 多个子节点
      root.children.forEach(el => {
        const childy = EXRESSION_TO_GET_CHILD_Y;
        path.push(EXRESSION_TO_DRAW_SVG_LINE);
        
        // 递归计算
        computPath(el);
      });
    };

    computPath(rootRef.current);
    
    if (node.isRoot) {      
      setSvgPaths(path);      
    }
  }, [node]);
  
  return <div>
    {RENDER_NODE_AND_CHILD}
    {node.isRoot && RENDER_SVG}
  </div>
}
```


