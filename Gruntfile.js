module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		terser: {
			options: {
				keep_fnames: true
			},
			dynamic_mappings: {
				expand: true,
				src: [
					'lib/*.js',
					'js/*.js',
					'activities/**/*.js'
				]
			}
		}
	});

	// Load the plugin that provides the "terser" task.
	grunt.loadNpmTasks('grunt-terser');

	// Default task(s).
	grunt.registerTask('default', ['terser']);

};
