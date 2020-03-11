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
}
window.onresize = displayResize;
window.onload = displayResize;
