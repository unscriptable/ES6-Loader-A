# Motivations

## ES6 and a multi-lingual future

One of the goals of ES6 (or later versions of the language) is to allow other
languages to coexist alongside it in browsers and other environments.  There
are a few major problems that need to be scrutinized in order for this to
happen.  Furthermore, since there will be multiple flavors of JavaScript at
the same time (ES5, ES6, ES7) and multiple authoring formats (AMD, node, ES6),
there will be similar problems to solve without even considering
multiple languages.

One of these problems is *language intrinsics*.  How does the + operator
behave when applied to strings?  Does it apply at all?  Can primitives be
auto-blessed to object types? etc.

Another of these problems is modularity.  What is a unit of code?  How are
elements of the unit exported to other units?  How are elements of units
imported into the current unit?

Language intrinsics is beyond my field of expertise, so I won't get into that.
From here, I'll be concentrating on modules, importing, and exporting.

## Importing and exporting

So if you had to allow multiple languages to rendezvous on their imports and
exports, what would you do?  Perhaps you'd abstract the importing and exporting
process of the language?  In short: find a common way to define imports
and exports.

Exporting is all about naming.
Importing is about naming, as well.  However, it is also about locating,
fetching, and binding.  Until multiple languages can be interpreted or
compiled in the browsers, importing may need to concern itself with
translation, as well.

Some languages have delegated the fetching and translating responsibilities
of importing into separate concepts.  For instance, Java has ClassLoaders.
If importing is then simplified to just naming and binding, it becomes a
simpler thing to abstract.

At this point, we've identified four new abstract concepts for ES6:

Modules: define a basic unit of code.
Exporters: identify values to be exported from a module.
Importers: identify another module, that other module's exports, and
	how to bind the values into the current module.
Loaders: fetch, translate, and otherwise prepare a module for importing.

## Realms

Realm = Importer(s) + Exporter(s) + Loader(s) (also Intrinsics)

Are realms created explicitly or implicitly when you define a new Loader,
Importer, etc?
