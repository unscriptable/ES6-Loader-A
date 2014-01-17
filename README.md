# ES6 Loader/A

A forward-looking, backward-compatible proposal for loading ES6 modules.

## The boot process

There's a fundamental divide between scripts and modules.  Scripts are sync by
nature and modules are async.  Scripts are global and modules are individually
scoped.

To bridge this gap, there has to be a way to enter into module scope from 
global (script) scope.  This isn't very different from other languages and
VMs, several of which expose "main" -- basically a naming convention for an
entry point.  In ES6, there should be a similar concept for entering
module scope.

Some environments, such as node.js, don't have a user-definable entry point.
*All user code* evaluates in module scope already.

ES6 environments that start in global scope should have at least one entry 
point into module scope:

1. In browsers, the `<module>` element.
2. A global `loadMainModule(href)` function.

Node.js does not have a global scope, so it does not have -- nor need -- a 
`loadMainModule(href)` function.  Node.js's entry point is the command line.

### The `<module>` element

Much like the `<script>` element, the `<module>` element may specify a `src`
attribute that specifies the href of the module to evaluate, or it may contain
ES6 code as its text content.  In either case, the ES6 code will execute as 
soon as possible, but never synchronously.  <module> elements are unnamed and
can not be referenced from other modules.

<module> elements should support both `onload` and `onerror` event handlers.
It is beyond the scope of this document, but `onerror` should probably
specify a useful error message on the event parameter, unlike `onerror`
handlers for `<link>` and `<script>` elements today.

### The `loadMainModule(href)` global function

Some environments may support the `loadMainModule(href)` global function.
Like the `<module>` element, this function fetches and evaluates the module's
source code asynchronously.  The function returns a promise that resolves to an
undefined value or rejects with an exception to indicate success or failure 
(e.g a 404 HTTP error or a SyntaxError).

### Realms

A realm may be roughly described as an *execution environment*.  Each realm has
a global scope, language intrinsics (beyond the scope of this document), and a
default loader.  Both the global variable and the default loader are available as
scoped variables to every module: `global` and 'loader'.  (Should the `global`
scoped variable be aliased to `window` in browsers?)

Note: neither `global` nor 'loader' is declared in the global scope.  These
exist only in module scope.

Main modules evaluate in the default realm.  

TBD: how are new realms created?  Does `new Loader()` create a new realm?

What is the exact relationship between loaders and realms?

## The Loader object

Loader objects are built-in objects much like Array, Object, Math, etc.
However, when they are constructed, they capture a reference to the loader
in scope (s/b realm in scope?) -- their "parent loader" -- when they are 
constructed.  Unless explicitly instructed otherwise, loaders clone a copy
of their parent loader's registry and module pipeline.  This allows loaders 
to be built incrementally without interference from or intimate knowledge 
of other loaders.

### The Loader constructor

`var myLoader = new Loader(load, normalize, realm);`

load: function (normalized): Promise
normalize: function (name, refName, refAddress): string
realm: provides intrinsics, parent loader, and global

### The Loader prototype

Loader.prototype.import(id): Promise

1. The `id` parameter is normalized using the normalize constructor parameter.
Normalization will most commonly just resolve relative module ids, such as 
reducing leading dots ("./" or "../") in node.js. In advanced module
systems, such as in the dojo toolkit, curl.js, or RequireJS, the normalization
function may actually re-map or transform the module id.
2. The loader searches its internal registry for the normalized id.  If found,
a resolved promise for the module is returned.  Otherwise, an unfulfilled 
promise is returned.
3. If the normalized id is not in the loader's registry, the loader calls the 
load function.  The loader uses the fulfillment value of load's promise to
place the module declaration in the registry.
4. Once the module declaration is placed in the registry, its dependencies are
similarly processed (normalization and pipeline) and its factory function is 
evaluated.  The promise is resolved with the module as its fulfillment value.

The `import` function is not configurable.

Loader.prototoype.normalize(name): string

The `normalize` function is exposed for convenience and metadata tasks.  It is
not normally needed since the `import` function calls `normalize` internally.

TODO: other loader functions? loader.define(id, src);

## The load function

Every loader object has an associated import pipeline

which will perform the following steps to place the module
declaration into its registry:
	a. locate
	b. fetch
	c. tanslate
	d. declare