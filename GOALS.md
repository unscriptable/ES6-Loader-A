# GOALS

## What do normal user-devs need?

### Static imports and exports

```js
import { foo } from 'opaque string';
```

User-devs should not care -- nor know how -- the environment interprets the
opaque string passed to `import`.  They should not care that the module is
fetched async or that it was translated from another module type or language.

### Dynamic imports

```js
if (!has('a-feature')) {
	import('../myshim').then(apply).catch(handleError);
}
```

User-devs should have a basic facility for loading a module based on a run-time
decision.  User-devs should be able to use relative names.

## What do advanced user-devs need?

### Packages that may be in different formats or languages

It should be this easy to use another package:

```js
addPipeline(loader, new PipelineForMyPackage());
```

The specifics of the syntax need to be explored, but the basic question is:

> How much should the loader help simplify this task?

### Coordination of multiple packages

For multiple packages to work together, the thing that loads them (I'll call
them a "pipeline" for now, but it could be a loader or a separate thing)
has to somehow indicate to other pipelines that it will handle a
given module normalization or import.  Some ways to do this:

1. some sort of explicit pipeline coordinator / controller (a "switch")
	a. a hashmap of extension-to-pipeline pairs
	b. a hashmap of package-name-to-pipeline pairs
	c. a hashmap of url-path-to-pipeline pairs
	d. a list of predicate-pipeline pairs
2. pipelines override each other per function (around advise)
	a. each override uses around advise "brute force" or meld.js
	b. each function returns a signal if it does or does not handle the module

New packages could be discovered on-the-fly, so the process of extending a
pipeline needs to be incremental (<-- wrong word).

> Since packages are not a formal part of ES (yet), should the loader have
any special treatment for them?

Probably not. Therefore, my favorite way to combine pipelines is via predicate
function since it provides the most generic and flexible API for choosing a
pipeline from a module name.

> Should the loader provide any special facilities for combining pipelines?

It certainly could, but maybe that's too much opinion in the implementation.
Maybe that's the job of a modern module loader, like beck.js/lode.js.

## Stability / robustness

This is a very bad idea:

```js
System.fetch = function (name) {
	return $.ajax(name);
};
```

This is a valid operation in TC39's proposed Loader.  The problem is that
any other code that uses the same loader is now forced to use this `fetch`
function.  If some other code had installed its own `fetch`, it will be
ignored from this time forward.  In an async module world, there's no way
to predict which `fetch` override will win.

This is problem #1 with the TC39 Loader:

> *TC39 Gotcha*: The order of Loader method overrides are non-deterministic.

This also illustrates problem #2 with the TC39 Loader:

> *TC39 Gotcha*: The mechanism to override Loader methods is not robust.

Even if the developer were diligent enough to delegate to the previous `fetch`
function (see next code snippet), it's too easy for some "rogue code"
somewhere deep in some third-party package to override the global loader.

Modules should not be able to override their own loader.  Not ever.

This means that either the loader should not be configurable.  I would also
argue that it shouldn't be global: each module should see a loader that is
specific to its "family".

> What determines a module's "family"? Its realm, its package, or its loader?

This illustrates another problem with the TC39 proposal.  There's no mechanism
for a module to reference its own loader.  It can only see the System loader.

> *TC39 Gotcha*: Modules can't reference their own loader.

## Performance / redundancy

When using packages -- a *de facto* standard these days -- the pipeline
functions are consistent for the entire package.  The decision to use a
particular pipeline function (locate, fetch, translate) will not change from
function to function.  Unfortunately, the TC39 Loader provides no way to
make a decision once: the decision to use an override function needs to be
made inside every function.

> *TC39 Gotcha*: Override decisions execute more often than necessary.

```js
// assume there's a way to reference this module's Loader as `loader`:
var locate = loader.locate;
var fetch = loader.fetch;
var translate = loader.translate;
loader.locate = function (def) {
	if (isThisOurModule(def.name)) {
		return myLocate(def);
	}
	else {
		return locate.apply(this, arguments);
	}
};
loader.fetch = function (def) {
	if (isThisOurModule(def.name)) {
		return myFetch(def);
	}
	else {
		return fetch.apply(this, arguments);
	}
};
loader.translate = function (def) {
	if (isThisOurModule(def.name)) {
		return myTranslate(def);
	}
	else {
		return translate.apply(this, arguments);
	}
};
```



-- what if the dev doesn't want to override all of the pipeline functions?

-- how can we make order deterministic?
