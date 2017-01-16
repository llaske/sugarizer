#!/usr/bin/env python
import time,json,string,sys

t0=time.time()

infname="./gy_main_rivers.geojson"
inf=open(infname)
x=json.loads(inf.read())
inf.close()

oufdir="./extracted/"

template="""
{
	"type":"FeatureCollection",
	"totalFeatures":1,
	"features":[
		{
			"type":"Feature",
			"id":"line_test",
			"geometry":{
				"type":"LineString",
				"coordinates":[[-60.0,7.4],[-57.5,2.1]]
			},
			"geometry_name":"the_geom",
			"properties":{"NAME":"TestSegment"}
		}
	]
}

"""

for fidx in range(len(x['features'])):
	
	f=x['features'][fidx]

	oufobj=json.loads(template)
	oufobj['features'][0]['id']=f['id']
	oufobj['features'][0]['type']=f['type']
	oufobj['features'][0]['geometry']=f['geometry']
	oufobj['features'][0]['properties']=f['properties']
	
	msg=''
	msg+=f['type']+'\t'
	msg+=f['id']+'\t'
	msg+=f['geometry']['type']+'\t'
	msg+=f['geometry_name']+'\t'
	
	oufname=string.replace(f['properties']['NAME'],' ','_')
	oufname=string.replace(oufname,'/_','')
	oufname="%s/%s_RIVER.geojson"%('xtracted',oufname)
	
	msg+=oufname
	print "%s"%(msg)
	
	ouf=open(oufname,'w')
	ouf.write(json.dumps(oufobj))
	ouf.close()
	
	
	

print 'exiting: %.2f'%(time.time()-t0)
