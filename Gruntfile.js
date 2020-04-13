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
					'activities/Abacus.activity/**/*.js',
					'activities/Abecedarium.activity/**/*.js',
					'activities/Blockrain.activity/**/*.js',
					'activities/Calculate.activity/**/*.js',
					'activities/Calligra.activity/lib/*.js', // TODO: js/vue.js don't work
					'activities/ChatPrototype.activity/**/*.js',
					'activities/Clock.activity/**/*.js',
					'activities/ColorMyWorld.activity/**/*.js',
					'activities/Constellation.activity/**/*.js',
					'activities/Etoys.activity/**/*.js',
					'activities/EbookReader.activity/lib/*.js', // TODO: js/vue.js don't work
					'activities/Falabracman.activity/**/*.js',
					'activities/Flip.activity/**/*.js',
					'activities/FoodChain.activity/**/*.js',
					'activities/Fototoon.activity/**/*.js',
					'activities/FractionBounce.activity/lib/*.js', // TODO: js/vue.js don't work
					'activities/GameOfLife.activity/**/*.js',
					'activities/Gears.activity/js/*.js', // TODO: lib/gearsketch dont work
					'activities/GetThingsDone.activity/**/*.js',
					'activities/Gridpaint.activity/**/*.js',
					'activities/Jappy.activity/**/*.js',
					'activities/LabyrinthJS.activity/**/*.js',
					'activities/LastOneLoses.activity/**/*.js',
					'activities/Markdown.activity/**/*.js',
					'activities/MazeWeb.activity/**/*.js',
					'activities/MediaViewer.activity/**/*.js',
					'activities/Memorize.activity/**/*.js',
					'activities/Moon.activity/**/*.js',
					'activities/Paint.activity/**/*.js',
					'activities/PhysicsJS.activity/**/*.js',
					'activities/Pomodoro.activity/**/*.js',
					'activities/QRCode.activity/**/*.js',
					'activities/Record.activity/lib/*.js',  // TODO: js/recordrtc.js don't work
					'activities/Reflection.activity/**/*.js',
					'activities/Scratch.activity/**/*.js',
					'activities/SharedNotes.activity/**/*.js',
					'activities/Speak.activity/**/*.js',
					'activities/Stopwatch.activity/**/*.js',
					'activities/TamTamMicro.activity/**/*.js',
					'activities/TankOp.activity/**/*.js',
					'activities/TurtleBlocksJS.activity/**/*.js',
					'activities/VideoViewer.activity/**/*.js',
					'activities/Write.activity/js/*.js',  // TODO: lib/quill is in ES6
					'activities/XOEditor.activity/**/*.js'
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
