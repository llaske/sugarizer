//Copyright (c) 2013, Playful Invention Company.

//Permission is hereby granted, free of charge, to any person obtaining a copy
//of this software and associated documentation files (the "Software"), to deal
//in the Software without restriction, including without limitation the rights
//to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//copies of the Software, and to permit persons to whom the Software is
//furnished to do so, subject to the following conditions:

//The above copyright notice and this permission notice shall be included in
//all copies or substantial portions of the Software.

//THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
//THE SOFTWARE.

// -----

// GridPaint has been kept extremely minimal as an explicit design choice.
// If you want to add features please make a fork with a different name.
// Thanks in advance

var onStart, onMove, onEnd;
var zoom;
var touchScreen = false;

function eventInit(){
	touchScreen = ("ontouchstart" in document.documentElement);
	if (touchScreen) {
		document.getElementById("canvas").addEventListener("touchstart", evMousedown, false);
		frame.addEventListener("touchmove", evMousemove, false);
		frame.addEventListener("touchend", evMouseup, false);
	} else {
		document.getElementById("canvas").onmousedown = evMousedown;
		frame.onmousemove = evMousemove;
		frame.onmouseup = evMouseup;
	}
	var wsize = document.body.clientHeight-55;
	zoom = wsize/748;
	document.getElementById("canvas").style.zoom = zoom;
	var useragent = navigator.userAgent.toLowerCase();
	if (useragent.indexOf('chrome') == -1) {
		document.getElementById("canvas").style.MozTransform = "scale("+zoom+") translateX(" + (700*(1-zoom)) + "px)";
		document.getElementById("canvas").style.MozTransformOrigin = "0 0";
	}
}

function evMousedown(e){
	e.preventDefault();
	if (touchScreen) e = e.touches[0];
	var x=localx(e.clientX), y=localy(e.clientY);
	onStart(x,y);
	// HACK: Force refresh on Android
	if (/Android/i.test(navigator.userAgent) && document.location.protocol.substr(0,4) != "http") {
		cnv.style.display='none';
		cnv.offsetHeight;
		cnv.style.display='block';
	}
}


function evMousemove(e){
	e.preventDefault();
	if (touchScreen) e = e.touches[0];
	if(!onMove) return;
	var x=localx(e.clientX), y=localy(e.clientY);
	onMove(x,y);
}

function evMouseup(e){
	e.preventDefault();
	if(!onEnd) return;
	onEnd();
}

function localx(gx){return (gx/zoom-frame.getBoundingClientRect().left);}
function localy(gy){
	return (gy/zoom-frame.getBoundingClientRect().top);
}
