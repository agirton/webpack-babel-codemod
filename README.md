## Webpack codemod

When using Babel 5 you could import another js module that's es2015, but you use the commonjs format like so:

```javascript
// foo.js
export default {
  bar: 'bar'
}

// baz.js
require('foo')
```

However under the hood Babel converted this require statement to be, `require('foo').default` because we were exporting a module with the default keyword. Instead of having to rewrite all of these anonymous `require` statements to use the default property, we will just hoist the es2015 `import` statement to the top and then use the `argument` value of the `require` statement as the value.

For example:
```javascript
// from:
import 'foo'
import bar from 'bar'

const baz = {
  qux: require('bundle?lazy!qux'),
  norf: require('bundle?lazy!norf')
}

// to:
import 'foo'
import bar from 'bar'

import qux from 'bundle?lazy!qux';
import norf from 'bundle?lazy!norf';

const baz = {
  qux: qux,
  norf: norf
}
```

### Setup & Run

  * `npm install -g jscodeshift` or install locally `npm install jscodeshift --save-dev`
  * `git clone https://github.com/agirton/webpack-babel-codemod.git`
  * `jscodeshift -t <codemod-script> <file>`
    * If installed locally the command is `./node_modules/.bin/jscodeshift -t <codemod-script> <file>`
  * Use the `-d` option for a dry-run and use `-p` to print the output
    for comparison
