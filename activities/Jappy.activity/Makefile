compile:
	rapydscript compile -b lib/jappy.pyj > lib/baselib.js
	cat code_editor.tag.html | riot --stdin --config js/riot.config.js --stdout > js/codeeditor.js
	cat toolbar.tag.html | riot --stdin --config js/riot.config.js --stdout > js/toolbar.js

dist_xo:
	python setup.py dist_xo
