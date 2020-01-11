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

var frame, cnv, hitbuffer, clearbtn;
var shapes=[], colors=[];
var cnames = ['red', 'yellow', '#ff6600', '#764300', 'limegreen', 'blue', 'darkmagenta', 'black', 'white'];
var cletters = ['r', 'y', 'o', 'n', 'g', 'b', 'v', 'k', 'w'];
var bselected = 0;
var newcolor=cnames[bselected], changed=false;
var scale = 708/600;
var fname = 'sqgridpos';

/////////////////////////
//
// Setup
//
/////////////////////////

function appInit(){
	frame = document.getElementById('frame');	
	clearbtn = document.getElementById("clear-button");
	thumbframe = document.getElementById('thumbframe');	
	cnv = document.getElementById('gridcnv');	
	cnv.width=1024; cnv.height=748;
	hitbuffer = document.getElementById('hitbuffer');	
	hitbuffer.width=1024; hitbuffer.height=748;
	var hsplit = location.href.split('--');
	if(hsplit.length==3) fname = hsplit[1];
	for(var i=0;i<shapedefs.length;i++) newShape(shapedefs[i]);
	for(var i=0;i<shapes.length;i++) colors.push('red');
	eventInit();
	if (mode == 'edit')
		editMode();
	else
		selectorMode();
	loadPos(selected);
	hittestInit();
	thumbsInit();
	drawButtons();

	clearbtn.addEventListener("click", handleClearButton);
}

function newShape(points){
	var s = {};
	s.points = points;
	shapes.push(s);
}



/////////////////////////
//
// Events
//
/////////////////////////


function handleStart(x,y){
	if(x<120) {handleButton(y); return;}
	var i = findPiece(x,y);
	onMove = handleMove;
	onEnd = handleEnd;
	handleMove(x,y);
}

function handleMove(x,y){
	changed = true;
	var p = findPiece(x,y); 
	if(p<0) return;
	colors[p] = newcolor;
	fillPiece(p);
	strokePiece(p);
}

function handleEnd(e){
	onMove = undefined;
	onUp = undefined;
	savePos(selected);
}


function handleButton(y){
	if(y>50 & y<100) selectorMode(true);
	var b = Math.floor((y-110)/70);
	if(b<0) return;
	if(b>=cnames.length) return;
	bselected = b;
	newcolor = cnames[b];
	drawButtons();
}

/////////////////////////
//
// Hit Test
//
/////////////////////////

var useragent = navigator.userAgent.toLowerCase();
if (useragent.indexOf('chrome') == -1) {
	function hittestInit(){
		hitbuffer.style.visibility = 'hidden';
		var ctx = hitbuffer.getContext('2d');
		ctx.save();
		ctx.translate(220, 38);
		ctx.scale(scale, scale);
		for(var i=0;i<shapes.length;i++){	
			var low = hexdigit(i&0xf);
			var mid = hexdigit((i>>4)&0xf);
			var high = hexdigit((i>>8)&0xf);
			ctx.fillStyle = '#'+high+'F'+mid+'F'+low+'F';
			shapePath(i, ctx, true);
		  ctx.fill();		
		}
		ctx.restore();
	}
}
else{
	function hittestInit(){
		hitbuffer.style.visibility = 'hidden';
		var ctx = hitbuffer.getContext('2d');
		ctx.save();
		ctx.translate(140, 20);
		ctx.scale(scale, scale);
		for(var i=0;i<shapes.length;i++){	
			var low = hexdigit(i&0xf);
			var mid = hexdigit((i>>4)&0xf);
			var high = hexdigit((i>>8)&0xf);
			ctx.fillStyle = '#'+high+'F'+mid+'F'+low+'F';
			shapePath(i, ctx, true);
		  ctx.fill();		
		}
		ctx.restore();
	}
}

function findPiece(x,y){
	var ctx = hitbuffer.getContext('2d');
	var pixel = ctx.getImageData(x, y, 1, 1).data;
	if(pixel[3]!=255) return -1;
	var high = pixel[0]>>4;
	var mid = pixel[1]>>4;
	var low = pixel[2]>>4;
	return (high<<8)+(mid<<4)+low;
}

function hexdigit(n){return '0123456789ABCDEF'.charAt(n);}

/////////////////////////
//
// Drawing
//
/////////////////////////

function fillPiece(i){
	var ctx = cnv.getContext('2d');
	ctx.save();
	ctx.translate(140, 20);
	ctx.scale(scale, scale);
	ctx.fillStyle = colors[i]; 
	shapePath(i, ctx);
  ctx.fill();
  ctx.restore();
}	

function strokePiece(i){
	var ctx = cnv.getContext('2d');
	ctx.save();
	ctx.translate(140, 20);
	ctx.scale(scale, scale);
	ctx.strokeStyle = '#404040'; 
	ctx.lineWidth = 1;
	shapePath(i, ctx);
  ctx.stroke();
  ctx.restore();
}	
	
function shapePath(n, ctx, shift){
	var pp = shapes[n].points;
	ctx.beginPath();
	ctx.moveTo(pp[0], pp[1]);
 	for (var i=2; i < pp.length; i+=2) ctx.lineTo(pp[i], pp[i+1]);
	ctx.lineTo(pp[0], pp[1]);
}

function drawButtons(){
	var ctx = cnv.getContext('2d');
	ctx.fillStyle = '#f0f0f0';
	ctx.fillRect(0, 0, 120, 700);
	ctx.strokeStyle = '#505050'; 
	for(var i=0;i<cnames.length;i++) drawButton(ctx, i);
	drawSaveButton(ctx);
}

function drawButton(ctx, n, c){
	ctx.fillStyle = cnames[n]; 
	ctx.lineWidth = (n==bselected)?4:2;
	roundRectPath(ctx, 10,110+70*n,30,30);
	ctx.fill();
  ctx.stroke();
}

function roundRectPath(ctx, x, y, w, h){
	var r = 4;
	ctx.beginPath();
	ctx.moveTo(x+r, y);
	ctx.lineTo(x+w-r, y);
	ctx.quadraticCurveTo(x+w,y,x+w,y+r);
	ctx.lineTo(x+w, y+h-r);
	ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
	ctx.lineTo(x+r, y+h);
	ctx.quadraticCurveTo(x,y+h,x,y+h-r);
	ctx.lineTo(x, y+r);
	ctx.quadraticCurveTo(x,y,x+r,y);
}

function drawSaveButton(ctx){
	var image=document.getElementById("back")
	var pat = ctx.createPattern(image, "no-repeat");
	ctx.fillStyle = pat; 
	ctx.beginPath();
	ctx.fillRect(0, 25, 55, 55);
	ctx.fill();
  ctx.stroke();
}

function handleClearButton(){
	for(var i in colors){
		colors[i] = "white";
		fillPiece(i);
		strokePiece(i);
	}
}