var gearB=function(opt_options) {
	/*
		http://openlayers.org/en/v3.14.0/examples/custom-controls.html

		This button is intended for use with ControlPanel to show/hide
		by means of toggleClass("show");
	*/

	var options = opt_options || {};
	var button = document.createElement('button');
	button.id="gearB";
	button.className="gearB";
	button.innerHTML = '<img src="activity/img/flaticon/gear.png" class="icon"/>';
	button.title="Configuration";

	var controlCB = function() {
		$(".control_panel").toggleClass("show");
		console.log("controlCB show off");
	};

	button.addEventListener('click', controlCB, false);
	button.addEventListener('touchstart', controlCB, false);

	var element = document.createElement('div');
	element.className = 'gearB ol-unselectable ol-control';
	element.appendChild(button);

	ol.control.Control.call(this, {
		element: element,
		target: options.target
	});
};
ol.inherits(gearB, ol.control.Control);
