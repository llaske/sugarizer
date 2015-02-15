
// Compute window frame size - used only for Chrome App
function computeSize() {
	document.getElementById("sugarizerframe").height = window.innerHeight;
}

computeSize();
window.onresize = computeSize;