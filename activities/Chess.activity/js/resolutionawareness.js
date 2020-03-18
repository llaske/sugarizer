/* p4wn, AKA 5k chess - by Douglas Bagnall <douglas@paradise.net.nz>
 *
 * This code is in the public domain, or as close to it as various
 * laws allow. No warranty; no restrictions.
 *
 * @author Douglas Bagnall <douglas@paradise.net.nz>
 * @author Oliver Merkel <merkel.oliver@web.de>
 *
 */
/* The routines here resize the screen elements to optimize them for
 * the given device resolution */

 function displayResize(evt) {
  var available_height = window.innerHeight - 100,
      available_width = window.innerWidth;
  var tmp_square_height = available_height >> 3,
      tmp_square_width = available_width / 11.5;
  var tmp = tmp_square_height > tmp_square_width ?
      tmp_square_width : tmp_square_height;
  var tmp_square = tmp < 30 ? 30 : tmp;
  tmp_square -= 8;
  game.render_elements(tmp_square, tmp_square);
  var pieces = game.elements.pieces;
  for (var y = 9; y > 1; y--){
    for(var x = 1;  x < 9; x++){
      var i = y * 10 + x;
      pieces[i].height = tmp_square;
      pieces[i].width = tmp_square;
    }
  }
  var playerOneIcon_div = document.getElementsByClassName("playerOneIcon")[0];
	var playerOneName_div = document.getElementsByClassName("playerOneName")[0];
	var playerTwoIcon_div = document.getElementsByClassName("playerTwoIcon")[0];
	var playerTwoName_div = document.getElementsByClassName("playerTwoName")[0];
  if(window.innerHeight < 415){
    playerOneIcon_div.style.height = "30px";
    if(playerOneIcon_div.firstChild != null){
      playerOneIcon_div.firstChild.style.height = "30px";
    }
    playerOneName_div.style.height = "30px";
    playerTwoIcon_div.style.height = "30px";
    if(playerTwoIcon_div.firstChild != null){
      playerTwoIcon_div.firstChild.style.height = "30px";
    }
    playerTwoName_div.style.height = "30px";
  }
  else{
    playerOneIcon_div.style.height = "40px";
    if(playerOneIcon_div.firstChild != null){
      playerOneIcon_div.firstChild.style.height = "40px";
    }
    playerOneName_div.style.height = "40px";
    playerTwoIcon_div.style.height = "40px";
    if(playerTwoIcon_div.firstChild != null){
      playerTwoIcon_div.firstChild.style.height = "40px";
    }
    playerTwoName_div.style.height = "40px";
  }
}
window.onresize = displayResize;
window.onload = displayResize;
function myFunction(x){
  if(x.matches && window.innerHeight>= 654){
    document.getElementById("board-goes-here").style.marginLeft = "";
    document.getElementsByClassName("p4wn-log")[0].style.width = "150px";
  }
  else if(x.matches && window.innerHeight<= 654 && window.innerWidth<=600 && window.innerWidth>=300){
    document.getElementById("board-goes-here").style.marginLeft = "";
    document.getElementsByClassName("p4wn-log")[0].style.width = "150px";
  }
  else{
    document.getElementById("board-goes-here").style.marginLeft = "10%";
    document.getElementsByClassName("p4wn-log")[0].style.width = "200px";
  }
}
var x = window.matchMedia("(max-width: 845px)");
myFunction(x);
x.addListener(myFunction);