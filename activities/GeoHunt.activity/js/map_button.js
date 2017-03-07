var MapButton=function(opt_options){
	
	//http://openlayers.org/en/v3.14.0/examples/custom-controls.html
	me={};
	var options = opt_options || {};
	var button = document.createElement('button');
	button.id=opt_options['id'];
	button.className=opt_options['className'];
	button.innerHTML = opt_options['innerHTML'];//'<img src="./static/ggmc/img/flaticon/play.png" class="icon"/>'
	button.title=opt_options['title'];
	
	var CB=opt_options['CB'];//function(e){if(DEBUG)console.log(this);};
	var callCB=function(e){
		try{
			if(DEBUG)console.log("CB");
			CB(e);
		}
		catch(e){
			if(DEBUG)console.log("Failed to call CB");
			if(DEBUG)console.log(e);
		}
	}
	
	button.addEventListener('click', callCB, false);
	button.addEventListener('touchstart', callCB, false);
	
	var element = document.createElement('div');
	element.className = opt_options['className']+' ol-unselectable ol-control';
	element.appendChild(button);
	
	ol.control.Control.call(this, {
		element: element,
		target: options.target
	});

}
ol.inherits(MapButton, ol.control.Control);
