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
					'activities/Abacus.activity/**/*.js',
					'activities/Abecedarium.activity/**/*.js',
					'activities/Blockrain.activity/**/*.js',
					'activities/Calculate.activity/**/*.js',
					'activities/Calligra.activity/**/*.js',
					'activities/ChatPrototype.activity/**/*.js',
					'activities/Clock.activity/**/*.js',
					'activities/ColorMyWorld.activity/**/*.js',
					'activities/Constellation.activity/**/*.js',
					'activities/Etoys.activity/**/*.js',
					'activities/EbookReader.activity/**/*.js',
					'activities/Flip.activity/**/*.js',
					'activities/FoodChain.activity/**/*.js',
					'activities/Fototoon.activity/**/*.js',
					'activities/GameOfLife.activity/**/*.js',
					'activities/Gears.activity/**/*.js',
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
					'activities/Record.activity/**/*.js',
					'activities/Reflection.activity/**/*.js',
					'activities/Scratch.activity/**/*.js',
					'activities/SharedNotes.activity/**/*.js',
					'activities/Speak.activity/**/*.js',
					'activities/Stopwatch.activity/**/*.js',
					'activities/TamTamMicro.activity/**/*.js',
					'activities/TankOp.activity/**/*.js',
					'activities/TurtleBlocksJS.activity/**/*.js',
					'activities/VideoViewer.activity/**/*.js',
					'activities/Write.activity/**/*.js',
					'activities/XOEditor.activity/**/*.js'
				],
				dest: 'build/'
			}
		}
	});

	// Load the plugin that provides the "terser" task.
	grunt.loadNpmTasks('grunt-terser');

	// Default task(s).
	grunt.registerTask('default', ['terser']);

};
