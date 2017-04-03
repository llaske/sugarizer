var LANGUAGE_NAMES={
	"keys":["en","fr","es","de","it","gr","cn","sw","th"],
	"en":"English",
	"fr":"French",
	"es":"Spanish",
	"de":"German",
	"it":"Italian",
	"gr":"Greek",
	"cn":"Chinese",
	"sw":"Swahili",
	"th":"Thai"
};
var REGION_NAMES=["World","Americas","Europe","Asia","Africa",];
var REGION_ICONS=[
	"./icons/world.svg","./icons/americas.svg","./icons/europe.svg",
	"./icons/asia.svg","./icons/africa.svg"
];
var NUM_COLORS=50;
var MODE_NAMES=["Coloring","Tour","Interactive"];
var COLORING=0;
var TOUR=1;
var INTERACTIVE=2;
var DEFAULT_STROKE="RGBA(200,200,200,1.0)";
var OUTLINE_COLOR="rgba(255,255,0,255)";
var OUTLINE_WIDTH=2;
var INSTALLED={
	"keys":[
		"World","Americas","Europe","Asia","Africa"
	],
	"World":{
		"path":"data/world/",
		"bbox":[-179.,-55.,179., 55.],
		"center":[0,40],
		"color":"rgba(255,255,0,0)",
		"fill":"rgba(0,100,40,0)",
		"width":2,
		"polygon_sources":[
			{"filename":"world.geojson","color":"rgba(200,200,200,1)","fill":'rgba(100,100,100,1)','width':1,"category":"World","layer_name":'World'},
		],
		"point_sources":[],
		"line_sources":[],
		"gpx_sources":[]
	},
	"Asia":{
		"path":"data/asia/",
		"bbox":[19.63,-54.75,179.0, 75.85],
		"center":[125.,10.],
		"color":"rgba(255,255,0,0)",
		"fill":"rgba(0,100,40,0)",
		"width":2,
		"polygon_sources":[
			{"filename":"asia.geojson","color":"rgba(200,200,200,1)","fill":'rgba(100,100,100,1)','width':1,"category":"Asia","layer_name":'Asia'},
		],
		"point_sources":[],
		"line_sources":[],
		"gpx_sources":[]
	},
	"Americas":{
		"path":"data/americas/",
		"bbox":[-187.52, -55.92,-12.15, 83.62],
		"center":[-99,0.05],
		"color":"rgba(255,255,0,0)",
		"fill":"rgba(0,100,40,0)",
		"width":2,
		"polygon_sources":[
			{"filename":"americas.geojson","color":"rgba(200,200,200,1)","fill":'rgba(100,100,100,1)','width':1,"category":"Americas","layer_name":'Americas'},
		],
		"point_sources":[],
		"line_sources":[],
		"gpx_sources":[]
	},
	"Australia Region":{
		"path":"data/australia/",
		"bbox":[105.63,-54.75,159.10,-10.05],
		"center":[132,-32.4],
		"color":"rgba(255,255,0,0)",
		"fill":"rgba(0,100,40,0)",
		"width":2,
		"polygon_sources":[
			{"filename":"australia.geojson","color":"rgba(200,200,200,1)","fill":'rgba(100,100,100,1)','width':1,"category":"Australia Region","layer_name":'Australia'},
		],
		"point_sources":[],
		"line_sources":[],
		"gpx_sources":[]
	},
	"Africa":{
		"toggle":false,
		"path":"data/africa/",
		"bbox":[-25.36,-40.97, 63.50, 40.54],
		"center":[19.,3.0],
		"color":"rgba(255,255,0,0)",
		"fill":"rgba(0,100,40,0)",
		"width":2,
		"polygon_sources":[
			{"filename":"africa.geojson","color":"rgba(200,200,200,1)","fill":'rgba(100,100,100,1)','width':1,"category":"Africa","layer_name":'Africa'},
		],
		"point_sources":[],
		"line_sources":[],
		"gpx_sources":[]
	},
	"Europe":{
		"path":"data/europe/",
		"bbox":[-31.29, 27.64, 40.18, 71.16],
		"center":[4,51.3],
		"color":"rgba(255,255,0,0)",
		"fill":"rgba(0,100,40,0)",
		"width":2,
		"polygon_sources":[
			{"filename":"europe.geojson","color":"rgba(200,200,200,1)","fill":'rgba(100,100,100,1)','width':1,"category":"Europe","layer_name":'Europe'},
		],
		"point_sources":[],
		"line_sources":[],
		"gpx_sources":[]
	},

}
