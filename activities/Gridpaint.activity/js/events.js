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

function eventInit(){
	window.onmousedown = evMousedown;	
	frame.onmousemove = evMousemove;	
	frame.onmouseup = evMouseup;
	var wsize = window.innerWidth;
	var wtop = 55;
	if (wsize <= 480) {
		zoom = 0.353;
		wtop = 150;
	} else if (wsize <= 768) {
		zoom = 0.6;
		wtop = 90;
	} else if (wsize <= 1024) {
		zoom = 0.95;
		wtop = 60;
	} else {
		zoom = 1.10;
		wtop = 55;	
	}
	document.getElementById("canvas").style.zoom = zoom;
	document.getElementById("canvas").style.top = wtop + "px";
}

function evMousedown(e){
	e.preventDefault(); 
	var x=localx(e.clientX), y=localy(e.clientY);
	onStart(x,y);
}


function evMousemove(e){
	e.preventDefault(); 
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
function localy(gy){return (gy/zoom-frame.getBoundingClientRect().top);}

