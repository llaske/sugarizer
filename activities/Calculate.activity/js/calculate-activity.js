/*jshint multistr: true */
/* This is the calculate activity file, providing methods related to events*/

function getWindowHeight() {
  var windowHeight = 0;
  if (typeof(window.innerHeight) == 'number') {
    windowHeight = window.innerHeight;
  } else {
    if (document.documentElement && document.documentElement.clientHeight) {
      windowHeight = document.documentElement.clientHeight;
    } else {
      if (document.body && document.body.clientHeight) {
        windowHeight = document.body.clientHeight;
      }
    }
  }
  return windowHeight;
}

function getWindowWidth() {
  var windowWidth = 0;
  if (typeof(window.innerWidth) == 'number') {
    windowWidth = window.innerWidth;
  } else {
    if (document.documentElement && document.documentElement.clientWidth) {
      windowWidth = document.documentElement.clientWidth;
    } else {
      if (document.body && document.body.clientWidth) {
        windowWidth = document.body.clientWidth;
      }
    }
  }
  return windowWidth;
}

//This function allows us to get the location of the caret inside the calc input
function doGetCaretPosition(oField) {
  var iCaretPos = 0;
  if (document.selection) {
    oField.focus();
    var oSel = document.selection.createRange();
    oSel.moveStart('character', -oField.value.length);
    iCaretPos = oSel.text.length;
  } else if (oField.selectionStart || oField.selectionStart == '0')
    iCaretPos = oField.selectionStart;
  return (iCaretPos);
}

//We will remove one character from the calc input
//If on desktop, we remove a character from the carret position
function removeCharacter() {
  if (CalculateApp.data.isMobile) {
    CalculateApp.elements.calcInput.value = CalculateApp.elements.calcInput.value.substring(0, CalculateApp.elements.calcInput.value.length - 1);
  } else {
    var caretPosition = doGetCaretPosition(CalculateApp.elements.calcInput);
    if (caretPosition === CalculateApp.elements.calcInput.value.length) {
      caretPosition = caretPosition - 1;
    }
    if (caretPosition < 0) {
      caretPosition = 0;
    }
    var currentValue = CalculateApp.elements.calcInput.value;

    CalculateApp.elements.calcInput.value = currentValue.slice(0, caretPosition) + currentValue.slice(caretPosition + 1);
    CalculateApp.elements.calcInput.setSelectionRange(caretPosition, caretPosition);
  }
  CalculateApp.focus();
}

//We will add test inside the calc input
//If on desktop, we will add the text from the carret position
function addTextInsideInput(value) {
  if (CalculateApp.data.isMobile) {
    CalculateApp.elements.calcInput.value = CalculateApp.elements.calcInput.value + value;
  } else {
    var caretPosition = doGetCaretPosition(CalculateApp.elements.calcInput);
    var currentValue = CalculateApp.elements.calcInput.value;

    CalculateApp.elements.calcInput.value = currentValue.slice(0, caretPosition) + value + currentValue.slice(caretPosition);
    CalculateApp.elements.calcInput.setSelectionRange(caretPosition + value.length, caretPosition + value.length);
  }
  CalculateApp.focus();
}

/* Callback from the calc buttons */
function calcButtonClick(button) {
  if (CalculateApp.data.calculationDone && !isNaN(button.target.value)) {
    CalculateApp.elements.calcInput.value = "";
  }
  CalculateApp.data.calculationDone = false;
  addTextInsideInput(button.target.value);
}

/* Trigger calculation when the key is enter inside the calc input */
function calcInputKeyUp(event) {
  if (event.which == 13) {
    calcEqualClick();
  }
}

/* Generation of the error box */
function getErrorTemplate() {
  return "<div class='result' style='overflow:hidden; margin-top:3px;padding:5px; font-size: 140%; color:#fff; border:5px solid " + CalculateApp.data.buddyColor.stroke + "; background-color:" + CalculateApp.data.buddyColor.fill + "; '> \
  <span style='float:right;display:inline;background-image:url(icons/entry-cancel.svg);background-repeat:no-repeat;width:30px;height:30px;' id='deleteit'></span><br/>\
  {{#label}}<span>{{ label }}</span> <br/> {{/label}}\
  <span>{{ calculation }}</span> <br/> \
  <b style='float:right;'>{{error}}</b> \
  <div style='clear:both;'></div> \
  </div>";
}

/* Generation of the result box */
function getResultTemplate() {
  return "<div class='result' style='overflow:hidden; margin-top:3px;padding:5px; font-size: 140%; color:#fff; border:5px solid " + CalculateApp.data.buddyColor.stroke + "; background-color:" + CalculateApp.data.buddyColor.fill + "; '> \
  <div style='display:inline'>\
  <span style='float:right;display:inline;background-image:url(icons/entry-cancel.svg);background-repeat:no-repeat;width:30px;height:30px;' id='deleteit'></span><br/>\
  {{#label}}<span>Label:{{ label }}</span> <br/> {{/label}}\
  </div>\
  <span style='display:inline;'>Problem: {{ calculation }}</span> <br/> \
  <b style='float:right;text-decoration:underline'>Answer:{{result}}</b> \
  <div style='clear:both;'></div> \
  </div>";
}

/* Generation of the result box */
function getGraphTemplate() {
  return "<div class='result' style='overflow:hidden; margin-top:3px;padding:5px; font-size: 140%; color:#fff; border:5px solid " + CalculateApp.data.buddyColor.stroke + "; background-color:" + CalculateApp.data.buddyColor.fill + "; '> \
  <span style='float:right;display:inline;background-image:url(icons/entry-cancel.svg);background-repeat:no-repeat;width:30px;height:30px;' id='deleteit'></span><br/>\
  {{#label}}<span>{{ label }}</span> <br/> {{/label}}\
  <span>{{ calculation }}</span> <br/> \
  <button value='{{calculation}}' style='background:none; border-radius:0px; float:right; border:0px; margin:3px; width:55px; height:55px; background-image: url(icons/plot.svg)'></button>\
  <div style='clear:both;'></div> \
  </div>";
}

/* We handle a graph request */
function launchGraph(calcInputValue, labelValue) {
  var calculation = {
    calculation: calcInputValue,
    graph: true,
  };
  if (labelValue) {
    calculation.label = labelValue;
  }

  calcInputValue = CalculateApp.tryPatchGraphEquation(calcInputValue);

  try {
    var result = CalculateApp.evalFunctionAtZero(calcInputValue);
    if (result.value) {
      result = result.value;
    }
    calculation.result = result;
  } catch (e) {
    calculation.error = e.message;
  }

  CalculateApp.storeCalculation(calculation);
  CalculateApp.persistCalculations();
  CalculateApp.displayCalculation(calculation);
  if (!calculation.error) {
    CalculateApp.graph(calculation.calculation);
  }
}

/* We handle a calculation request */
function launchCalculation(calcInputValue, labelValue) {
  var calculation = {
    calculation: calcInputValue,
    graph: false
  };

  if (labelValue) {
    calculation.label = labelValue;
  }

  calcInputValue = CalculateApp.tryPatchEquation(calcInputValue);

  try {
    var result = CalculateApp.eval(calcInputValue);
    calculation.result = result.result;
    CalculateApp.elements.calcInput.value = result.resultBase10;
  } catch (e) {
    calculation.error = e.message;
  }

  CalculateApp.storeCalculation(calculation);
  CalculateApp.persistCalculations();
  CalculateApp.displayCalculation(calculation);
}

/* Handling of calc equal button click */
function calcEqualClick() {
  if (CalculateApp.elements.calcInput.value === undefined || CalculateApp.elements.calcInput.value.length === 0) {
    return;
  }

  var labelValue = CalculateApp.elements.labelInput.value;
  var calcInputValue = CalculateApp.elements.calcInput.value;

  calcInputValue = calcInputValue.replace(/ /g, '');

  CalculateApp.elements.labelInput.value = "";
  CalculateApp.elements.calcInput.value = "";
  if (CalculateApp.isGraph(calcInputValue, labelValue)) {
    launchGraph(calcInputValue, labelValue);
  } else {
    launchCalculation(calcInputValue, labelValue);
  }
  CalculateApp.data.calculationDone = true
}

/* Handling of the calc remove one char button click */
function calcDelClick() {
  removeCharacter();
  CalculateApp.focus();
}

/* Handling of the calc clear all button click */
function calcClearClick() {
  CalculateApp.elements.calcInput.value = "";
  CalculateApp.focus();
}

/* Handling of the base palette button click */
function onbaseClick() {
  switch (CalculateApp.data.outputBase) {
    case 10:
      CalculateApp.data.outputBase = 2;
      CalculateApp.elements.basePaletteDiv.style.backgroundImage = "url(icons/base-2.svg)";
      break;
    case 2:
      CalculateApp.data.outputBase = 8;
      CalculateApp.elements.basePaletteDiv.style.backgroundImage = "url(icons/base-8.svg)";
      break;
    case 8:
      CalculateApp.data.outputBase = 16;
      CalculateApp.elements.basePaletteDiv.style.backgroundImage = "url(icons/base-16.svg)";
      break;
    case 16:
      CalculateApp.data.outputBase = 10;
      CalculateApp.elements.basePaletteDiv.style.backgroundImage = "url(icons/base-10.svg)";
      break;
  }
}

/* Handling of the digits palette button click */
function onOutputDigitsClick() {
  switch (CalculateApp.data.outputDigits) {
    case 6:
      CalculateApp.data.outputDigits = 9;
      CalculateApp.elements.outputDigitsPalette.style.backgroundImage = "url(icons/digits-9.svg)";
      break;
    case 9:
      CalculateApp.data.outputDigits = 12;
      CalculateApp.elements.outputDigitsPalette.style.backgroundImage = "url(icons/digits-12.svg)";
      break;
    case 12:
      CalculateApp.data.outputDigits = 15;
      CalculateApp.elements.outputDigitsPalette.style.backgroundImage = "url(icons/digits-15.svg)";
      break;
    case 15:
      CalculateApp.data.outputDigits = 6;
      CalculateApp.elements.outputDigitsPalette.style.backgroundImage = "url(icons/digits-6.svg)";
      break;
  }
}

/* Handling of the radian degree palette button click */
function onradianDegreeClick(input) {
  if (CalculateApp.data.isRadian) {
    CalculateApp.data.isRadian = false;
    CalculateApp.elements.radianDegreePalette.style.backgroundImage = "url(icons/format-deg.svg)";

  } else {
    CalculateApp.data.isRadian = true;
    CalculateApp.elements.radianDegreePalette.style.backgroundImage = "url(icons/format-rad.svg)";
  }
}

/* Handling of a choosen trigo function inside trigo palette */
function ontrigoClick(input) {
  if (CalculateApp.data.calculationDone && isNaN(input.detail.value)) {
    CalculateApp.elements.calcInput.value = "";
  }
  CalculateApp.data.calculationDone = false;
  addTextInsideInput(input.detail.value);
}

/* Handling of a choosen button inside algebra palette */
function onalgebraClick(input) {
  if (CalculateApp.data.calculationDone && isNaN(input.detail.value)) {
    CalculateApp.elements.calcInput.value = "";
  }
  CalculateApp.data.calculationDone = false;
  addTextInsideInput(input.detail.value);
}

/* Gui init */
function initGui() {
  CalculateApp.elements.modalDiv = document.getElementById("modal");
  CalculateApp.elements.resultsZoneDiv = document.getElementById("results-zone");
  CalculateApp.elements.calcInputDiv = document.getElementById("calc-input-div");
  CalculateApp.elements.calcInput = document.getElementById("calc-input");
  CalculateApp.elements.labelInput = document.getElementById("label-input");
  CalculateApp.elements.trigoPaletteDiv = document.getElementById("trigo-palette");
  CalculateApp.elements.algebraPaletteDiv = document.getElementById("algebra-palette");
  CalculateApp.elements.basePaletteDiv = document.getElementById("base-palette");
  CalculateApp.elements.radianDegreePalette = document.getElementById("radian-degree-palette");
  CalculateApp.elements.outputDigitsPalette = document.getElementById("output-digits-palette");

  CalculateApp.elements.calcInput.addEventListener("keyup", calcInputKeyUp, false);

  var buttonInputs = document.getElementsByClassName("calcbuttoninput");
  for (var i = 0; i < buttonInputs.length; i++) {
    buttonInputs[i].addEventListener("click", calcButtonClick, false);
  }

  var buttonClear = document.getElementsByClassName("calcbuttonclear");
  for (i = 0; i < buttonClear.length; i++) {
    CalculateApp.elements.calcButtonClear = buttonClear[i];
    buttonClear[i].addEventListener("click", calcClearClick, false);
  }

  var buttonDel = document.getElementsByClassName("calcbuttondel");
  for (i = 0; i < buttonDel.length; i++) {
    buttonDel[i].addEventListener("click", calcDelClick, false);
  }

  var buttonCalc = document.getElementsByClassName("calcbuttoncalc");
  for (i = 0; i < buttonCalc.length; i++) {
    buttonCalc[i].addEventListener("click", calcEqualClick, false);
  }

  window.onresize = CalculateApp.onResize;

  //Binding of the palettes
  CalculateApp.elements.trigoPalette = new CalculateApp.libs.trigopalette.trigoPalette(CalculateApp.elements.trigoPaletteDiv, undefined);
  CalculateApp.elements.trigoPalette.addEventListener('trigoClick', ontrigoClick);
  CalculateApp.elements.algebraPalette = new CalculateApp.libs.algebrapalette.algebraPalette(CalculateApp.elements.algebraPaletteDiv, undefined);
  CalculateApp.elements.algebraPalette.addEventListener('algebraClick', onalgebraClick);

  var isIos = (navigator.userAgent.match(/iPad|iPhone|iPod/g) ? true : false)
  if (isIos) {
    CalculateApp.elements.basePaletteDiv.addEventListener('touchstart', onbaseClick);
    CalculateApp.elements.radianDegreePalette.addEventListener('touchstart', onradianDegreeClick);
    CalculateApp.elements.outputDigitsPalette.addEventListener('touchstart', onOutputDigitsClick);
  } else {
    CalculateApp.elements.basePaletteDiv.addEventListener('click', onbaseClick);
    CalculateApp.elements.radianDegreePalette.addEventListener('click', onradianDegreeClick);
    CalculateApp.elements.outputDigitsPalette.addEventListener('click', onOutputDigitsClick);
  }
}
