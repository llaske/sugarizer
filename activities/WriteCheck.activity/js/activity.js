define(["sugar-web/activity/activity"], function (activity) {

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!'], function (doc) {

		// Initialize the activity.
		activity.setup();


var canvas = document.getElementById("paint-canvas");
var parent = document.getElementById("paint-app");

// get canvas 2D context and set it to the correct size
var ctx = canvas.getContext("2d");
resize();

// resize canvas when window is resized
function resize() {

  ctx.canvas.width = parent.offsetWidth;
  ctx.canvas.height = parent.offsetHeight;

	//console.log(canvas.getBoundingClientRect());
}

// add event listeners to specify when functions should be triggered
window.addEventListener("resize", resize);
document.addEventListener("mousemove", draw);
document.addEventListener("mousedown", setPosition);
document.addEventListener("mouseenter", setPosition);

// last known position
var pos = { x: 0, y: 0 };

// new position from mouse events
function setPosition(e) {
	//console.log(e);
  pos.x = e.clientX-canvas.getBoundingClientRect().x;
  pos.y = e.clientY-canvas.getBoundingClientRect().y;
  //console.log(pos);
}

function draw(e) {
  if (e.buttons !== 1) return; // if mouse is pressed.....

  var color = '#FFFFFF';

  ctx.beginPath(); // begin the drawing path

  ctx.lineWidth = 20; // width of line
  ctx.lineCap = "round"; // rounded end cap
  ctx.strokeStyle = color; // hex color of line

  ctx.moveTo(pos.x, pos.y); // from position
  setPosition(e);
  ctx.lineTo(pos.x, pos.y); // to position

  ctx.stroke(); // draw it!
}


//Delete Before This
	});

});
