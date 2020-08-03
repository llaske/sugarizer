//code from https://github.com/Wiebke/TangramGenerator
//Copyright (c) 2019 Wiebke Köpp
/* generating variable -> True if still in generating process */
var generating = true;
var eval = false;

/* Conversion between different angle systems */
var toRadians = function (degrees) {
    return degrees * Math.PI / 180.0;
};

function round(value, decimals = 4) {
 return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

var toDegrees = function (radians) {
    return radians * 180.0 / Math.PI;
};

/* Transform angle to that it falls in the interval [0;360] */
var clipAngle = function (angle) {
    if (angle < 0) {
        while (angle < 0) {
            angle += 360;
        }
    } else if (angle >= 360) {
        while (angle >= 360) {
            angle -= 360;
        }
    }
    return angle;
};

/* Comparison of to Numbers taking into account precision */

/* Returns true, if the absolute error between two given doubles is smaller than a
 * set threshold */
var numberEq = function (a, b) {
    return Math.abs(a - b) < 0.000000000001;
};

/* Returns true, if the absolute error between two given doubles is smaller than a
 * given range */
var numberRange = function (a, b, range) {
    return Math.abs(a - b) < range;
};

/* Returns true, if the two given numbers are not within a a set threshold of
 * each other */
var numberNEq = function (a, b) {
    return !numberEq(a, b);
};

/* Cross product in 3D */
var crossProduct3D = function (a, b) {
    if (a.length != 3 || b.length != 3) {
        return [0, 0, 0];
    }
    var result = [];
    result[0] = a[1] * b[2] - a[2] * b[1];
    result[1] = a[2] * b[0] - a[0] * b[2];
    result[2] = a[0] * b[1] - a[1] * b[0];
    return result;
};

/* Shuffle an array, algorithm based on Fisher-Yates-Shuffle */
var shuffleArray = function (array) {
    var elementsLeft = array.length;
    var elementCopy, index;
    /* while there are still element left */
    while (elementsLeft) {
        /* Pick one of the remaining elements (index between 0 and elementsLeft -1 */
        index = Math.floor(Math.random() * elementsLeft);
        elementsLeft--;
        /* Switch the chosen element with the one at index elementsLeft, this
         * results in filling the array with randomly chosen elements from the back */
        elementCopy = array[elementsLeft];
        array[elementsLeft] = array[index];
        array[index] = elementCopy;
    }
    return array;
};

/* Eliminate duplicates in an array, based on a given compare function */
var eliminateDuplicates = function (array, compareFunction, keepDoubles) {
    array = array.sort(compareFunction);
    var newArray = [array[0]];
    for (var index = 1; index < array.length; index++) {
        newArray.push(array[index]);
        if (compareFunction(array[index], array[index - 1]) === 0) {
            newArray.pop();
            /* Throw the other part of the duplicate away as well */
            if (!keepDoubles) {
                newArray.pop();
            }
        }
    }
    return newArray;
};

/* Check if two array have equal content, based on a given compare function */
var arrayEq = function (arrayA, arrayB, compareFunction) {
    if (arrayA.length != arrayB.length) {
        return false;
    }
    arrayA = arrayA.slice(0).sort(compareFunction);
    arrayB = arrayB.slice(0).sort(compareFunction);
    for (var index = 0; index < arrayA.length; index++) {
        if (compareFunction(arrayA[index], arrayB[index]) != 0) {
            return false;
        }
    }
    return true;
};

/* Count the number of unique elements in an array, based on a given compare
 * function */
var numUniqueElements = function (array, compareFunction) {
    var unique = eliminateDuplicates(array.slice(0), compareFunction, true);
    return array.length;
};

var shiftItemToTail = function (arr, i) {
  return [...arr.filter((e, j) => i !== j), arr[i]];
}

var xoLogo = '<?xml version="1.0" ?><!DOCTYPE svg  PUBLIC \'-//W3C//DTD SVG 1.1//EN\'  \'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\' [<!ENTITY stroke_color "#010101"><!ENTITY fill_color "#FFFFFF">]><svg enable-background="new 0 0 55 55" height="55px" version="1.1" viewBox="0 0 55 55" width="55px" x="0px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" y="0px"><g display="block" id="stock-xo_1_"><path d="M33.233,35.1l10.102,10.1c0.752,0.75,1.217,1.783,1.217,2.932   c0,2.287-1.855,4.143-4.146,4.143c-1.145,0-2.178-0.463-2.932-1.211L27.372,40.961l-10.1,10.1c-0.75,0.75-1.787,1.211-2.934,1.211   c-2.284,0-4.143-1.854-4.143-4.141c0-1.146,0.465-2.184,1.212-2.934l10.104-10.102L11.409,24.995   c-0.747-0.748-1.212-1.785-1.212-2.93c0-2.289,1.854-4.146,4.146-4.146c1.143,0,2.18,0.465,2.93,1.214l10.099,10.102l10.102-10.103   c0.754-0.749,1.787-1.214,2.934-1.214c2.289,0,4.146,1.856,4.146,4.145c0,1.146-0.467,2.18-1.217,2.932L33.233,35.1z" fill="&fill_color;" stroke="&stroke_color;" stroke-width="3.5"/><circle cx="27.371" cy="10.849" fill="&fill_color;" r="8.122" stroke="&stroke_color;" stroke-width="3.5"/></g></svg>';


var generateXOLogoWithColor = function(strokeColor, fillColor) {
  var coloredLogo = xoLogo;
  coloredLogo = coloredLogo.replace("#010101", strokeColor)
  coloredLogo = coloredLogo.replace("#FFFFFF", fillColor)
  return "data:image/svg+xml;base64," + btoa(coloredLogo);
}

function checkDifficultyOfTangram (tang) {
  return tang.evaluation.getValue(2) <= 11 ? 1 : 0;
};

function roundToNearest(num, rountTo) {
  return Math.round(num / rountTo) * rountTo;
};
