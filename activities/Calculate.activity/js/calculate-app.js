//This is the CalculateApp object, providing a full context for the app
var CalculateApp = {
  /* UI Elements */
  elements: {
    resultsZoneDiv: undefined,
    calcInputDiv: undefined,
    calcInput: undefined,
    labelInput: undefined,
    modalDiv: undefined
  },

  /* libraries loaded by require */
  libs: {
    mustache: undefined,
    functionPlot: undefined
  },

  /* Application data */
  data: {
    buddyColor: {
      stroke: "#1500A7",
      fill: "#ff0000"
    },
    calculations: [],
    windowWidth: undefined,
    windowHeight: undefined,
    isMobile: /iphone|ipod|ipad|android|blackberry|opera mini|opera mobi|skyfire|maemo|windows phone|palm|iemobile|symbian|symbianos|fennec/i.test(navigator.userAgent.toLowerCase()),
    isIos: (navigator.userAgent.match(/iPad|iPhone|iPod/g) ? true : false ),
    outputBase: 10,
    outputDigits: 6,
    isRadian: false,
    pi: 3.141592653589793
  },

  /* Return if Chrome WebApp env. Chrome WebApp does not allow eval. */
  isFullMode: function fullModeEval() {
    if (typeof chrome != "undefined" && chrome.app && chrome.app.runtime) {
      return false;
    }
    return true;
  }(),

  /* Evaluate a calculation without using eval() */
  evalParser: function(input) {
    var result = Parser.parse(input).evaluate();
    return result;
  },

  /* Evaluate a calculation using eval() - provides advanced features */
  evalMathJS: function(input) {
    var result = mathjs.eval(input);
    return result;
  },

  /* Auto eval using light or full mode */
  eval: function(input) {
    var result;
    var resultBase10;
    if (CalculateApp.isFullMode) {
      result = CalculateApp.evalMathJS(input);
      resultBase10 = CalculateApp.baseConv(CalculateApp.evalMathJS(input), CalculateApp.data.outputBase, 10);
    } else {
      result = CalculateApp.evalParser(input);
      resultBase10 = CalculateApp.baseConv(CalculateApp.evalParser(input), CalculateApp.data.outputBase, 10);
    }
    return {
      resultBase10: CalculateApp.toFixed(result, CalculateApp.data.outputDigits),
      result: CalculateApp.toFixed(resultBase10, CalculateApp.data.outputDigits)
    };
  },

  /* Calcul f(x) with x = 0 using light or full mode*/
  evalFunctionAtZero: function(input) {
    var result;
    if (CalculateApp.isFullMode) {
      try {
        result = mathjs.eval(input)(0);
        if (isNaN(result) || !isFinite(result)) {
          return 0;
        }
        return result;
      } catch (error) {
        return 0;
      }
    } else {
      try {
        result = Parser.parse(input).evaluate({
          x: 0
        });
        if (isNaN(result) || !isFinite(result)) {
          return 0;
        }
        return result;
      } catch (error) {
        return 0;
      }
    }
  },

  /* Check if simple calculation or function */
  isGraph: function(input) {
    if (input.indexOf("f(x)") == -1) {
      return false;
    }
    return true;
  },

  /* Display a graph */
  _graph: function(equation, valueForZero, graphFn) {
    nanoModal(CalculateApp.elements.modalDiv, {
      buttons: [],
    }).onShow(function(m) {
      CalculateApp.elements.modalDiv.style.display = "block";
      CalculateApp.elements.modalDiv.style.marginLeft = "auto";
      CalculateApp.elements.modalDiv.style.marginRight = "auto";
      CalculateApp.elements.modalDiv.style.height = parseInt(CalculateApp.data.windowHeight * 80 / 100) + "px";
      CalculateApp.elements.modalDiv.style.width = parseInt(CalculateApp.data.windowWidth * 80 / 100) + "px";
      try {
        var openedModal = CalculateApp.libs.functionPlot({
          target: '#plot',
          yDomain: [valueForZero - 10, valueForZero + 10],
          xDomain: [-10, 10],
          width: parseInt(CalculateApp.data.windowWidth * 80 / 100),
          height: parseInt(CalculateApp.data.windowHeight * 80 / 100),
          data: [{
            fn: graphFn
          }]
        });
        for (var i = 0; i < 10; i++) {
          window.scroll(0, 0);
        }
      } catch (err) {
        m.hide();
      }

    }).onHide(function(m) {
      m.remove();
      setTimeout(function() {
        CalculateApp.focus();
      }, 300);
    }).show();
  },

  /* Display a graph using light mode */
  graphParser: function(equation) {
    var valueForZero = CalculateApp.evalFunctionAtZero(equation);
    var graphFn = function(x) {
      return Parser.parse(equation).evaluate({
        "x": x
      });
    };
    CalculateApp._graph(equation, valueForZero, graphFn);
  },

  /* Display a graph using full mode */
  graphMathJS: function(equation) {
    var valueForZero = CalculateApp.evalFunctionAtZero(equation);
    var graphFn = mathjs.eval(equation);
    CalculateApp._graph(equation, valueForZero, graphFn);
  },

  /* Display a graph using light or full mode */
  graph: function(input) {
    input = CalculateApp.tryPatchGraphEquation(input);

    if (CalculateApp.isFullMode) {
      return CalculateApp.graphMathJS(input);
    } else {
      return CalculateApp.graphParser(input);
    }
  },

  /* Display a calculation */
  displayCalculation: function(calculation) {
    var node = document.createElement("div");
    if (calculation.error) {
      node.innerHTML = CalculateApp.libs.mustache.render(getErrorTemplate(), calculation);
    } else {
      if (calculation.graph) {
        node.innerHTML = CalculateApp.libs.mustache.render(getGraphTemplate(), calculation);
        var childrens = node.childNodes[0].childNodes;
        var functionGraph = function(input) {
          CalculateApp.graph(input.target.value);
        };
        for (var i = 0; i < childrens.length; i++) {
          if (childrens[i].tagName === "BUTTON") {
            childrens[i].addEventListener('click', functionGraph);
          }
        }
      } else {
        node.innerHTML = CalculateApp.libs.mustache.render(getResultTemplate(), calculation);
      }
    }
    CalculateApp.elements.resultsZoneDiv.insertBefore(node, CalculateApp.elements.resultsZoneDiv.childNodes[0]);
  },

  /* Add calculation to list */
  storeCalculation: function(calculation) {
    if(CalculateApp.data.calculations === null){
      CalculateApp.data.calculations = [];
    }
    CalculateApp.data.calculations.push(calculation);
  },

  /* Persist calculation lists */
  persistCalculations: function() {
    var calculationsToSave = [];
    for (var i = CalculateApp.data.calculations.length - 1; i >= 0; i--) {
      if (calculationsToSave.length >= 20) {
        break;
      }
      calculationsToSave.unshift(CalculateApp.data.calculations[i]);
    }
    var json = JSON.stringify(calculationsToSave);
    CalculateApp.libs.activity.getDatastoreObject().setDataAsText(json);
    CalculateApp.libs.activity.getDatastoreObject().save(function() {});
  },

  /* Base convert */
  baseConv: function(number, to, from) {
    if (to == from) {
      return number;
    }
    return parseInt(number, from || 10).toString(to);
  },

  /* Handle window resize */
  onResize: function() {
    CalculateApp.data.windowHeight = getWindowHeight();
    CalculateApp.data.windowWidth = getWindowWidth();

    setTimeout(function() {
      CalculateApp.elements.resultsZoneDiv.style.height = CalculateApp.elements.calcInputDiv.clientHeight + "px";
      CalculateApp.elements.resultsZoneDiv.style.display = "block";
    }, 300);
  },

  /* Focus only if computer */
  focus: function() {
    if (!CalculateApp.data.isMobile) {
      CalculateApp.elements.calcInput.focus();
    }
  },

  /* Translation of the Gui */
  transateGui: function() {
    if (CalculateApp.libs.webL10n.get("calcul") !== undefined && CalculateApp.libs.webL10n.get("calcul").length > 0) {
      CalculateApp.elements.calcInput.placeholder = CalculateApp.libs.webL10n.get("calcul");
    }
    if (CalculateApp.libs.webL10n.get("label") !== undefined && CalculateApp.libs.webL10n.get("label").length > 0) {
      CalculateApp.elements.labelInput.placeholder = CalculateApp.libs.webL10n.get("label");
    }
    if (CalculateApp.libs.webL10n.get("clear") !== undefined && CalculateApp.libs.webL10n.get("clear").length > 0) {
      CalculateApp.elements.calcButtonClear.innerHTML = CalculateApp.libs.webL10n.get("clear");
    }
  },

  /* We clear the result box and display all previous calculations */
  displayAllCalculations: function() {
    while (CalculateApp.elements.resultsZoneDiv.firstChild) {
      CalculateApp.elements.resultsZoneDiv.removeChild(CalculateApp.elements.resultsZoneDiv.firstChild);
    }
    if(CalculateApp.data.calculations !== null){
      for (var i = 0; i < CalculateApp.data.calculations.length; i++) {
        CalculateApp.displayCalculation(CalculateApp.data.calculations[i]);
      }
    }
  },

  /* We try to patch the equation to handle things like degree to radians conversion */
  tryPatchEquation: function(equation) {
    if (CalculateApp.data.isRadian) {
      return equation;
    }
    var matchingFunctions = [
      "cos",
      "sin",
      "tan",
      "acos",
      "asin",
      "atan",
      "cosh",
      "sinh",
      "tanh"
    ];

    for (var i = 0; i < matchingFunctions.length; i++) {
      var regex = new RegExp(matchingFunctions[i] + "\\((.+?)\\)", "gi");
      var results = equation.match(regex);
      if (results) {
        for (var j = 0; j < results.length; j++) {
          var parenthesisRegex = new RegExp("\\(([^\\)]+)\\)", "gi");
          var arrayToReplace = parenthesisRegex.exec(results[j]);
          if (arrayToReplace && arrayToReplace.length >= 2) {
            equation = equation.replace(arrayToReplace[1], arrayToReplace[1] + " * " + CalculateApp.data.pi + " / 180");
          }
        }
      }
    }
    return equation;
  },

  /* We try to patch the equation to make the graph working on both full mode and light mode */
  tryPatchGraphEquation: function(question) {
    if (!CalculateApp.isFullMode) {
      question = question.replace("f(x)=", "");
    }
    return question;
  },

  /* Simple toFixed method to format the output with max digits */
  toFixed: function(value, precision) {
    if (isNaN(value) || (Number(value) === value && value % 1 === 0)) {
      return value;
    }
    var power = Math.pow(10, precision || 0);
    return String(Math.round(value * power) / power);
  }
};
