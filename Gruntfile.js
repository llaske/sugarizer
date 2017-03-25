module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		uglify: {
			options: {
				banner: '/*! Sugarizer <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			dynamic_mappings: {
				expand: true,
				src: [
					'lib/*.js',
					'js/*.js',
					'activities/Abacus.Activity/**/*.js',
					'activities/Abecedarium.Activity/**/*.js',
					'activities/Blockrain.Activity/**/*.js',
					'activities/Calculate.Activity/**/*.js',
					'activities/ChatPrototype.Activity/**/*.js',
					'activities/Clock.Activity/**/*.js',
					'activities/ColorMyWorld.Activity/**/*.js',
					'activities/Cordova.Activity/**/*.js',
					'activities/Etoys.Activity/**/*.js',
					'activities/FoodChain.Activity/**/*.js',
					'activities/Gears.Activity/js/*.js', // TODO: lib/gearsketch dont work
					'activities/GetThingsDone.Activity/**/*.js',
					'activities/Gridpaint.Activity/**/*.js',
					'activities/LabyrinthJS.Activity/**/*.js',
					'activities/LastOneLoses.Activity/**/*.js',
					'activities/Markdown.Activity/**/*.js',
					'activities/MazeWeb.Activity/**/*.js',
					'activities/MediaViewer.Activity/**/*.js',
					'activities/Memorize.Activity/**/*.js',
					'activities/Moon.Activity/**/*.js',
					'activities/Paint.Activity/**/*.js',
					'activities/PhysicsJS.Activity/**/*.js',
					'activities/Record.Activity/lib/*.js',  // TODO: js/recordrtc.js don't work
					'activities/Reflection.Activity/**/*.js',
					'activities/SharedNotes.Activity/**/*.js',
					'activities/Speak.Activity/**/*.js',
					'activities/Stopwatch.Activity/**/*.js',
					'activities/TamTamMicro.Activity/**/*.js',
					'activities/TankOp.Activity/**/*.js',
					'activities/TurtleBlocksJS.Activity/**/*.js',
					'activities/VideoViewer.Activity/**/*.js',
					'activities/WelcomeWeb.Activity/**/*.js',
					'activities/XOEditor.Activity/**/*.js'
				],
				dest: 'build/'
			}
		}
	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-uglify');

	// Default task(s).
	grunt.registerTask('default', ['uglify']);

};
