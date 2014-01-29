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

var thumbcnvs = [];
var thumbframe;
var mode, selected=0;
var tl;

/////////////////////////
//
// Thumbnails
//
/////////////////////////

function thumbsInit(){
	tl = {x0: 20, y0: 100, xd: 200, yd: 200, xn: 5};
	thumbframe.style.width = '1024px';
	thumbframe.style.height = '748px';
	newThumbCanvases();
	select(selected);
}


function newThumbCanvases(){
	var x, y=tl.y0;
	for(i=0;i<15;i++){
		if((i%tl.xn)==0) x=tl.x0;
		var cnv = newThumbCanvas(x, y);
		var pos = gallery[i];
		drawThumb(cnv, pos);
		thumbframe.appendChild(cnv);
		thumbcnvs.push(cnv);
		x+=tl.xd;		
		if((i%tl.xn)==(tl.xn-1)) y+=tl.yd;
	}
}

function newThumbCanvas(x, y){
	var cnv = document.createElement('canvas');
	cnv.style.position = 'absolute'
	cnv.style.width = 176+'px';
	cnv.style.height = 147+'px';
	cnv.style.left = x+'px';
	cnv.style.top = y+'px';
	cnv.width = 176;
	cnv.height = 147;
	return cnv;
}

function drawThumb(cnv, pos){
	var ctx = cnv.getContext('2d');
	ctx.save();
	ctx.fillStyle = 'lightblue';
	ctx.scale(176/720, 176/720);
	ctx.strokeStyle = '#404040'; 
	ctx.lineWidth = 1;
	for(var i=0;i<shapes.length;i++){
		ctx.fillStyle= fromColorLetter(pos[i]);;
		shapePath(i, ctx);
		ctx.fill();
	}
	for(var i=0;i<shapes.length;i++){
		shapePath(i, ctx);
		ctx.stroke();
	}
	ctx.restore();
}


/////////////////////////
//
// Events
//
/////////////////////////

function handleThumbStart(x, y){
	var n = Math.floor((y-tl.y0)/tl.yd)*tl.xn+Math.floor((x-tl.x0)/tl.xd);
	if((n<0)||(n>=15)) return;
	select(n); 
	editMode(true);
}

function handleRotate(e){
	var o = window.orientation;
	if((o==90)||(o==-90)) {
		frame.style.width = '1024px';
		frame.style.height = '748px';
		editMode(true);
	} else {
		frame.style.width = '768px';
		frame.style.height = '1004px';
		selectorMode(true);
	}
}

function editMode(save){
	mode = 'edit';
	thumbframe.style.visibility = 'hidden';
	onStart = handleStart;
	loadPos(selected);
	changed = false;
	if (save) saveGallery();
}

function selectorMode(save){
	mode = 'selector';
	thumbframe.style.visibility = 'visible';
	onStart = handleThumbStart;
	if(changed) savePos(selected);
	if (save) saveGallery();
}


function select(n){
	thumbcnvs[selected].style.border = '0px';
	thumbcnvs[n].style.border = '3px solid black'; 
	selected=n;
}

/////////////////////////
//
// Persistance
//
/////////////////////////

function loadPos(n){
	var pos = gallery[n];
	for(var i=0;i<colors.length;i++) colors[i]= fromColorLetter(pos[i]);
	for(var i=0;i<shapes.length;i++) fillPiece(i);
	for(var i=0;i<shapes.length;i++) strokePiece(i);
}

function savePos(n){
	var pos = posString();
	drawThumb(thumbcnvs[n], pos);
	gallery[n] = pos;
	saveGallery();
}

function storedPos(n){
	var pos = '';
	for(var i=0;i<colors.length;i++) pos+='w';
	return pos;
}

function posString(){
	var res = '';
	for(var i=0;i<colors.length;i++) res+=toColorLetter(colors[i]);
	return res;
}

function timestamp(){
	return Math.floor(Date.now()/1000);
}

function fromColorLetter(c){return cnames[cletters.indexOf(c)];}
function toColorLetter(c){return cletters[cnames.indexOf(c)];}

