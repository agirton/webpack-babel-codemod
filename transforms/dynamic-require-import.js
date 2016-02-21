/**
 * Replace anonymous require statements with ES2015 import statements
 *
 * e.g.
 *
 * from:
 * import 'foo'
 * import bar from 'bar'
 *
 * const baz = {
 *   qux: require('bundle?lazy!qux'),
 *   norf: require('bundle?lazy!norf')
 * }
 *
 * to:
 * import 'foo'
 * import bar from 'bar'
 *
 * import qux from 'bundle?lazy!qux';
 * import norf from 'bundle?lazy!norf';
 *
 * const baz = {
 *   qux: qux,
 *   norf: norf
 * }
 *
 */

export default function transformer(file, api) {
  const j = api.jscodeshift;

  // split if value is a dynamic Webpack require.
  const valueFromWebpackDynamic = val => {
    let values = val.split('!');
    if (val.indexOf('?') > 0 && values.length > 2) {
      values = val.split('?');
    }
    return values[values.length - 1];
  }

  const getExpressionArgumentValue = exp => {
    const name = exp.value.arguments[0].value;
    return {
      argValue: valueFromWebpackDynamic(name),
      name
    }
  }

  return j(file.source)
    .find(j.CallExpression,  {
      type: 'CallExpression',
      callee: {
        name: 'require'
      }
    })
    .forEach(exp => {
      const { argValue, name } = getExpressionArgumentValue(exp);
      const argName = j.identifier(argValue);
      const variable = j.importDefaultSpecifier(argName);
      const declaration = j.importDeclaration([variable], j.literal(name));

      const { value: nodes } = findBody(exp);
      const index = findLastIndex(nodes, el => {
        if (el.type === 'ImportDeclaration') {
          return true;
        }
        return false;
      });
      nodes.splice(index + 1, 0, declaration);
    })
    .replaceWith(exp => getExpressionArgumentValue(exp).argValue)
    .toSource({ quote: 'single' });
};

function findBody(node) {
  // traverse up the tree until end, or find body
  while(node.parentPath) {
    node = node.parentPath;

    if (node.name === 'body') {
      return node;
    }
  }

  return false;
}

function findLastIndex(arr, predicate) {
  const length = arr.length;
  let index = length;

  while (index--) {
    if (predicate(arr[index], index, arr)) {
      return index;
    }
  }
  return -1;
}
