/* ideas for Loader constructor */
var myLoader = new Loader(function (get, normalize, declare, _import) {
	// normalize: function (relName: string, refName: string): string
	// declare: function (normalizedName: string, value: {Promise|Function})
	// _import: function (normalizedName): Promise
	return {
		normalize: function (relName, refName) {
			return normalize(relName, refName);
		},
		'import': function (normalizedName) {
			return _import(normalizedName);
		}
	};
});

var myLoader = new Loader(function (get, normalize, declare, _import) {
	// normalize: function (relName: string, refName: string): string
	// declare: function (normalizedName: string, value: {Promise|Function})
	// _import: function (normalizedName): Promise

	// returns a scoped importer factory
	return function (id) {
		return {
			normalize: function (relName, refName) {
				return normalize(relName, refName);
			},
			'import': function (normalizedName) {
				return _import(normalizedName);
			}
		};
	};
});


global.createImporter(function (parentImporter) {
	return function (relName, refName) {
		return {
			'import': function (relName) {},
			// are there other scoped functions?
			'export': function (name, value) {},
			define: function (src) {}
		};
	};
});

global['import']('../foo', 'prop1', 'prop2').then(function (prop1, prop2) {
	// do something with prop1, prop2
}, failHard);

// Note: import != global.import
