'use strict';

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }

  return arr2;
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.uuid = exports.Context = void 0;

var jsx_runtime_1 = require("react/jsx-runtime");

var react_1 = require("react");

exports.Context = react_1.createContext({});

function uuid() {
  return 'xxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : r & 0x3 | 0x8;
    return v.toString(16);
  });
}

exports.uuid = uuid;

var findNodeById = function findNodeById(tree, id) {
  var rs = null;

  var traverse = function traverse(node) {
    if (id === node.id || !node) {
      rs = node;
      return;
    }

    if (node.children) {
      for (var i = 0; i < node.children.length; ++i) {
        traverse(node.children[i]);
      }
    }
  };

  traverse(tree);
  return rs;
};

var NodeRender = function NodeRender(_ref) {
  var data = _ref.data;

  var _react_1$useContext = react_1.useContext(exports.Context),
      treeData = _react_1$useContext.treeData,
      treeDispatch = _react_1$useContext.treeDispatch;

  return jsx_runtime_1.jsxs("div", Object.assign({
    style: {
      display: 'flex',
      alignItems: 'center'
    }
  }, {
    children: [jsx_runtime_1.jsx("div", Object.assign({
      style: {
        border: '1px solid grey',
        marginTop: 12
      },
      onClick: function onClick() {
        var nextData = _objectSpread({}, treeData);

        var target = findNodeById(nextData, data.id);
        console.log('target', data.id, target);
        target.children = [].concat(_toConsumableArray(target.children), [{
          id: uuid(),
          text: '子结点' + uuid(),
          showChildren: true,
          children: []
        }]);
        treeDispatch({
          type: 'set',
          payload: nextData
        });
      }
    }, {
      children: data.text
    }), void 0), jsx_runtime_1.jsx("div", Object.assign({
      style: {
        marginLeft: 12
      }
    }, {
      children: data.children && data.children.map(function (el) {
        return jsx_runtime_1.jsx(NodeRender, {
          data: el
        }, el.id);
      })
    }), void 0)]
  }), void 0);
};

exports.default = NodeRender;
