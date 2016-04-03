var timelimit=1000;//1 minute
function screenSaver () {
	Timer=setTimeout(activate,timelimit);
	document.addEventListener('click',deactivate,false);
	document.addEventListener('mousemove',deactivate,false);
	document.addEventListener('keypress',deactivate,false);
}
function deactivate(){
	clearTimeout(Timer);
	var parent=document.getElementsByTagName("body");
	var child=document.getElementById("screen");
	child.style.display="none";
	Timer=setTimeout(resume,timelimit);
}
function resume(){
	var image=document.getElementById("screen");
	image.style.display="block";
}
function activate(){
	var image = document.createElement("img");
	image.src="js/screensaver.gif";
	image.style.width="100%";
	image.style.height="100%";
	image.setAttribute("id","screen");
	image.style.position="absolute";
	image.style.top="0px";
	image.style.right="0px";
	image.style.left="0px";
	var element = document.getElementById("body");
	element.appendChild(image);
	document.addEventListener('click',deactivate,false);
	document.addEventListener('mousemove',deactivate,false);
	document.addEventListener('keypress',deactivate,false);
}
	