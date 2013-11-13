var Sufijo = "";
var Actual = 1;
var Maximo = 1;
var Numero = 1;

function Actualizar() { 
  if (Actual == 0) {Sufijo = "Init-";Maximo = 1;}
  if (Actual == 1) {Sufijo = "1-PrenderPesonalizar-";Maximo = 11;}
  if (Actual == 2) {Sufijo = "2-ElFrame-";Maximo = 9;}
  if (Actual == 3) {Sufijo = "3-LasVistas-";Maximo = 4;}
  if (Actual == 4) {Sufijo = "4-AbrirCerrar-";Maximo = 8;}
  if (Actual == 5) {Sufijo = "5-Journal-";Maximo = 6;}
  if (Actual == 6) {Sufijo = "6-ApagarXO-";Maximo = 5;}
  
  $('#help').remove();  
  $('#here').after("<img id='help' src='images/" + Actual + "/" + Sufijo + Numero + ".gif'>");
  /* Puntos */
  
  $('#points').remove();
  $('#select_0').remove();
  $('#select_1').remove();
  $('#select_2').remove();
  $('#select_3').remove();
  $('#select_4').remove();
  $('#select_5').remove();
  $('#select_6').remove();

  if (Actual == 0) {txt = "<div id='points'><div id='select_0' class='current'></div><div id='select_1' class='current-no'></div>  <div id='select_2' class='current-no'></div><div id='select_3' class='current-no'></div><div id='select_4' class='current-no'></div><div id='select_5' class='current-no'></div><div id='select_6' class='current-no'></div></div>"}

  if (Actual == 1) {txt = "<div id='points'><div id='select_0' class='current-no'></div><div id='select_1' class='current'></div>  <div id='select_2' class='current-no'></div><div id='select_3' class='current-no'></div><div id='select_4' class='current-no'></div><div id='select_5' class='current-no'></div><div id='select_6' class='current-no'></div></div>"}

  if (Actual == 2) {txt = "<div id='points'><div id='select_0' class='current-no'></div><div id='select_1' class='current-no'></div>  <div id='select_2' class='current'></div><div id='select_3' class='current-no'></div><div id='select_4' class='current-no'></div><div id='select_5' class='current-no'></div><div id='select_6' class='current-no'></div></div>"}

  if (Actual == 3) {txt = "<div id='points'><div id='select_0' class='current-no'></div><div id='select_1' class='current-no'></div>  <div id='select_2' class='current-no'></div><div id='select_3' class='current'></div><div id='select_4' class='current-no'></div><div id='select_5' class='current-no'></div><div id='select_6' class='current-no'></div></div>"}

  if (Actual == 4) {txt = "<div id='points'><div id='select_0' class='current-no'></div><div id='select_1' class='current-no'></div>  <div id='select_2' class='current-no'></div><div id='select_3' class='current-no'></div><div id='select_4' class='current'></div><div id='select_5' class='current-no'></div><div id='select_6' class='current-no'></div></div>"}

  if (Actual == 5) {txt = "<div id='points'><div id='select_0' class='current-no'></div><div id='select_1' class='current-no'></div>  <div id='select_2' class='current-no'></div><div id='select_3' class='current-no'></div><div id='select_4' class='current-no'></div><div id='select_5' class='current'></div><div id='select_6' class='current-no'></div></div>"}

  if (Actual == 6) {txt = "<div id='points'><div id='select_0' class='current-no'></div><div id='select_1' class='current-no'></div>  <div id='select_2' class='current-no'></div><div id='select_3' class='current-no'></div><div id='select_4' class='current-no'></div><div id='select_5' class='current-no'></div><div id='select_6' class='current'></div></div>"}

  $("#help").after(txt);

  $("#select_0").click(function() {Actual = 0;Numero = 1;});
  $("#select_1").click(function() {Actual = 1;Numero = 1;});
  $("#select_2").click(function() {Actual = 2;Numero = 1;});
  $("#select_3").click(function() {Actual = 3;Numero = 1;});
  $("#select_4").click(function() {Actual = 4;Numero = 1;});
  $("#select_5").click(function() {Actual = 5;Numero = 1;});
  $("#select_6").click(function() {Actual = 6;Numero = 1;});


  Numero += 1;
  if (Numero > Maximo) {
      Actual += 1;
      Numero = 1;
      if (Actual > 6) {
        Actual = 0
      };     
  };

  setTimeout(Actualizar, 1000);
}

$(document).ready(function() {
  $("#unfullscreen").hide();   
  $("#prev-bt").click(function() {
      Numero = 1;
      Actual -= 1;
      if (Actual < 0) {
          Actual = 6
      };    
  });
  
  $("#next-bt").click(function() {
      Numero = 1;
      Actual += 1;
      if (Actual > 6) {
          Actual = 0
      };  
  });  
  $("#fullscreen").click(function() {
      $(".toolbar").fadeIn('slow');
      $("#canvas").css('top', '0px');
      $("#unfullscreen").show();
  });
  
  $("#unfullscreen").click(function() {
      $(".toolbar").show()
      $("#canvas").css('top', '55px');
      $("#unfullscreen").hide();
  }); 
});
setTimeout(Actualizar, 1000);

