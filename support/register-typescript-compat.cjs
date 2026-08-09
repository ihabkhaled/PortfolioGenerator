'use strict';

const Module = require('node:module');

const originalResolveFilename = Module._resolveFilename;
const compatibilityEntry = require.resolve('typescript-compat');

/**
 * typescript-eslint does not yet understand the TypeScript 7 compiler API.
 * Keep TypeScript 7 as the repository's primary compiler while resolving the
 * tool's private `typescript` import to the pinned compatibility package.
 */
Module._resolveFilename = function resolveTypeScriptForLint(request, parent, isMain, options) {
  if (request === 'typescript') {
    return compatibilityEntry;
  }

  return originalResolveFilename.call(this, request, parent, isMain, options);
};
