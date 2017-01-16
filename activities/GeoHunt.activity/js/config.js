var INSTALLED={
	"keys":["Caribbean","World","Guyana","G/Town Roads","Iceland","Greenland"],
	"Caribbean":{
		"path":"activity/data/caribbean/",
		"bbox":[-90.,-2.,-53.,30.],
		"center":[-71.5,14.5],
		"color":"rgba(255,255,0,0)",
		"fill":"rgba(0,100,40,0)",
		"width":2,
		"polygon_sources":[
			{"filename":"caribbean.geojson","color":"rgba(0,255,0,1)","fill":'rgba(0,255,0,0.15)','width':1,"category":"Caribbean","layer_name":'Nations'},
		],
		"point_sources":[],
		"line_sources":[],
		"gpx_sources":[]
	},
	"Guyana":{
		"path":"activity/data/guyana/",
		"bbox":[-61.5,1.1,-56.3,8.7],
		"center":[-58.9,4.9],
		"color":"rgba(255,255,0,1)",
		"fill":"rgba(0,100,40,.1)",
		"width":2,
		"polygon_sources":[
			{"filename":"pacs.geojson","color":"rgba(0,255,0,1)","fill":'rgba(0,255,0,0.25)','width':1,"category":"PAC","layer_name":'Protected Areas'},
			{"filename":"gy_rivers.geojson","color":"rgba(0,100,255,1)","fill":'rgba(0,0,255,1)','width':1,"category":"PAC", "layer_name":'Rivers'},
//			{"filename":"gy_creeks.geojson","color":"rgba(100,200,155,1)","fill":'rgba(0,0,255,1)','width':1,"category":"PAC", "layer_name":'Creeks'},
		],
		"point_sources":[
			{"filename":"gy_towns.geojson","color":"rgba(255,0,0,1)","fill":'rgba(255,255,255,1)','width':5,'radius':10,"category":"Places", "layer_name":'Towns'},
		],
		"line_sources":[
//			{"filename":"test_segment.geojson","color":"rgba(155,255,0,1)",'width':5},
		],
		"gpx_sources":[]
	},
	"Iceland":{
		"path":"activity/data/iceland/",
		"bbox":[-24.542, 63.39,-13.499,66.536],
		"center":[(-24.542+-13.499)/2.,65.],
		"color":"#ff0",
		"fill":"rgba(0,100,0,0.5)",
		"width":2,
		"polygon_sources":[],
		"point_sources":[],
		"line_sources":[],
		"gpx_sources":[]
	},
	"Greenland":{
		"path":"activity/data/greenland/",
		"bbox":[-73.054, 59.79,-12.155,83.624],
		"center":[(-73.054-12.155)/2.,76.],
		"color":"#ff0",
		"fill":"rgba(100,100,0,0.5)",
		"width":2,
		"polygon_sources":[],
		"point_sources":[],
		"line_sources":[],
		"gpx_sources":[]
	},
	"World":{
		"path":"activity/data/world/",
		"bbox":[-160,-60,100,60],
        "center":[0,20],
        "color":"rgba(255,0,0,0)",
        "fill":"rgba(0,100,0,0.1)",
        "width":0,
        "polygon_sources":[
            {"filename":"world_borders.geojson","color":"rgba(0,255,0,1)","fill":'rgba(0,255,0,0.25)','width':1,"category":"World","layer_name":'Countries'},
        ],
        "point_sources":[],
        "line_sources":[],
		"gpx_sources":[]
    },
    "G/Town Roads":{
        "path":"activity/data/georgetown/",
        "bbox":[-58.104,6.762, -58.169,6.832],
		"center":[-58.13836,6.79834],
        "color":"rgba(255,0,0,0)",
        "fill":"rgba(0,100,0,0.1)",
        "width":0,
        "polygon_sources":[
            {"filename":"gt_roads.geojson","color":"rgba(0,255,234,1)","fill":'rgba(0,255,0,0.25)','width':3,"category":"Roads","layer_name":'Georgetown Roads'}
        ],
        "point_sources":[],
        "line_sources":[],
		"gpx_sources":[
            {"filename":"gtown-44.gpx","color":"rgba(255,0,0,1)","fill":'rgba(0,255,0,0.25)','width':3,"category":"Bus Routes","layer_name":"Bus 44"},
            {"filename":"gtown-45.gpx","color":"rgba(155,110,0,1)","fill":'rgba(0,255,0,0.25)','width':3,"category":"Bus Routes","layer_name":"Bus 45"},
				]
    }

}
