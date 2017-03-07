#!/usr/bin/env python
import json

clist=[
'Cuba',
'Haiti',
'Dominican Republic',
'Puerto Rico',
'Jamaica',
'Trinidad and Tobago',
'Guadeloupe',
'Martinique',
'Bahamas',
'Barbados',
'Saint Lucia',
'Aruba',
'Saint Vincent and the Grenadines',
'United States Virgin Islands',
'Grenada',
'Antigua and Barbuda',
'Dominica',
'Cayman Islands',
'Saint Kitts and Nevis',
'Saint Martin',
'British Virgin Islands',
'Netherlands Antilles',
'Anguilla',
'Saint Barthelemy',
'Montserrat',
'Suriname',
'Guyana'
]

print "Looking for %d countries ..."%(len(clist))
indices_found=[]

infname="world_borders.geojson"
inf=open(infname)

oufname="caribbean_countries.txt"
ouf=open(oufname,'w')

x=eval(inf.read())
for f in x['features']:
	#print f['properties']['NAME']
	try:
		cname=f['properties']['NAME']
		idx=clist.index(cname)
		print "Found: %s"%cname
		print f
		indices_found.append(idx)
		ouf.write(json.dumps(f))
		ouf.write("\n\n")
	except Exception,e:pass

indices_found.sort()
print indices_found

for idx in range(len(clist)):
	try:
		dummy=indices_found.index(idx)
	except:
		print "Not found: %s"%clist[idx]

ouf.close()
