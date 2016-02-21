import test from 'ava';
import jscodeshift from 'jscodeshift';
import { readFileSync } from 'fs';
import 'babel-core/register';

import DynamicRequireToImport from '../transforms/dynamic-require-import.js';

test(t => {
  const source = readFileSync('./fixtures/dynamic-require-import.before.js').toString();
  const expected = readFileSync('./fixtures/dynamic-require-import.after.js').toString();
  const result = DynamicRequireToImport({ source }, { jscodeshift });
  t.is(result, expected);
})
