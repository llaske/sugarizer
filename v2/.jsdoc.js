module.exports = {
	source: {
		include: ["./js/components/"],
	},
	plugins: [
		"node_modules/jsdoc-vuejs"
	],	
	opts: {
		destination: "./docs",
	},
};