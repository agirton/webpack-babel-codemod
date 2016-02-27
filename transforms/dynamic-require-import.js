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
 *   qux,
 *   norf
 * }
 *
 */

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  return root
    .find(j.Property)
    .forEach(nodePath => {
      const { value: { value, key } } = nodePath;
      const { name } = key;
      const argName = j.identifier(name);
      const variable = j.importDefaultSpecifier(argName);
      const declaration = j.importDeclaration(
        [variable], j.literal(value.arguments[0].value)
      );

      const { value: nodes } = findBody(nodePath);
      const index = findLastIndex(nodes, el => {
        if (el.type === 'ImportDeclaration') {
          return true;
        }
        return false;
      });
      nodes.splice(index + 1, 0, declaration);
    })
    .replaceWith(nodePath => nodePath.value.key.name)
    .toSource({ quote: 'single' });
}

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
