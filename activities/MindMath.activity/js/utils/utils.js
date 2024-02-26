function removeEntryFromArray(array, skipIndex) {
  const subset = new Array(array.length - 1)
  for (let i = 0; i < array.length; i++) {
    if (i === skipIndex) continue;
    subset[i > skipIndex ? i - 1 : i] = array[i]
  }
  return subset
}

function addEntryIntoArray(array, addIndex, ele) {
  const subset = new Array(array.length + 1)
  for (let i = array.length - 1; i >= 0; i--) {
    subset[i >= addIndex ? i + 1 : i] = array[i]
  }
  subset[addIndex] = ele
  return subset
}

function findEle(arr, ele) {
  var len = arr.length;
  for (var i = len - 1; i >= 0; i--) {
    if (arr[i] === ele) {
      return true;
    }
  }
  return false;
}

function allowedCheck(n) {
  return Number.isInteger(n) && n >= 0;
}

function checkIfArrayHasUniqueOps(pattern, writePos) {
  var map = {};
  var flag = 0;
  var flag2 = 0;
  var noOfOps = 0;
  var op = [0, 0]
  for (var i = 0; i <= writePos; i++) {
    if (isNaN(pattern[i])) {
      noOfOps++
      if (!(pattern[i] in map)) {
        map[pattern[i]] = 1;
        flag++
      }
      if (pattern[i] == '-') {
        if (op[0] == 0) {
          op[0] = 1;
          flag2++;
        }
      }
      if (pattern[i] == '/') {
        if (op[1] == 0) {
          op[1] = 1;
          flag2++;
        }
      }

    }
  }

  return {
    unique: flag == noOfOps,
    hasTwo: flag2 == 2
  }
}

function checkIfArrayHasDups(arr) {
  var map = {},
    i, size;

  for (i = 0, size = arr.length; i < size; i++) {
    if (map[arr[i]]) {
      return true;
    }

    map[arr[i]] = true;
  }
  return false;
}

//used in hints generation algorithm to calculate score from operators in given rpn pattern
function score(pattern, writePos) {
  var scr = 0;
  var map = {}
  var flag = 0;
  for (var i = 0; i <= writePos; i++) {
    if (isNaN(pattern[i])) {
      if (!(pattern[i] in map)) {
        map[pattern[i]] = 1;
        flag++
      }
      if (pattern[i] == '+' || pattern[i] == '*') {
        scr += 1;
      } else if (pattern[i] == '-') {
        scr += 2
      } else if (pattern[i] == '/') {
        scr += 3
      }

    }
  }
  if (flag == 4) {
    scr = 13
  }
  return scr;
}

function rpnToSlots(pattern) {
  const stack = []
  const slots = []
  const len = pattern.length
  for (var i = 0; i < len; i++) {
    if (!isNaN(pattern[i])) {
      var obj = {
        type: 0,
        val: parseInt(pattern[i])
      }
      stack.push(obj)
    } else {
      const second = stack.pop()
      const first = stack.pop()
      const operand = pattern[i]
      var result;

      if (operand === '+') {
        result = first.val + second.val
      } else if (operand === '*' || operand === 'x') {
        result = first.val * second.val
      } else if (operand === '-') {
        result = first.val - second.val
      } else if (operand === '/') {
        result = first.val / second.val
      }

      const slot = [first, operand, second, result];
      var obj = {
        type: 1,
        val: result
      }
      stack.push(obj);
      slots.push(slot);

    }
  }
  return slots
}

function findUselessOperations(slots) {
  var resQueue = [];
  var slotsGood = new Array(slots.length);

  var resSlot = slots[slots.length - 1];
  slotsGood[slots.length - 1] = 1;

  if (resSlot.num1.type === 1) {
    resQueue.push(resSlot.num1.val);
  }
  if (resSlot.num2.type === 1) {
    resQueue.push(resSlot.num2.val);
  }

  while (resQueue.length !== 0) {
    var res = resQueue.pop()
    for (var i = slots.length - 2; i >= 0; i--) {
      if (slotsGood[i] !== 1 && res === slots[i].res) {
        if (slots[i].num1.type === 1) {
          resQueue.push(slots[i].num1.val)
        }
        if (slots[i].num2.type === 1) {
          resQueue.push(slots[i].num2.val)
        }
        slotsGood[i] = 1;
        break;
      }
    }
  }
  //slotsGood[i] === 0 => ith operation is useless , otherwise it is good.
  return slotsGood;
}

function calculateScoreFromSlots(slots, timeTaken, noOfHintsUsed) {
  var scr = 0;
  var map = {}
  var flag = 0;

  for (var i = 0; i < slots.length; i++) {
    var slot = slots[i];
    //consider only good operations or slots or ignore any useless operation
    if (slot.operator != null && !slot.useless) {
      if (!(slot.operator in map)) {
        map[slot.operator] = 1;
        flag++
      }
      if (slot.operator === '+' || (slot.operator === '*' || slot.operator === 'x')) {
        scr += 1;
      } else if (slot.operator === '-') {
        scr += 2
      } else if (slot.operator === '/') {
        scr += 3
      }
      scr++;
    }
  }

  if (flag === 4) {
    scr = 13 + 4;
  }
  //considering timeTaken
  var timeScore = Math.max(0, 15 - Math.floor(timeTaken / 4));
  console.log('timeScore is: ' + timeScore);
  var totScore = 2 * scr + timeScore;

  if (noOfHintsUsed === 1) {
    totScore = Math.floor(totScore * 3 / 4);
  } else if (noOfHintsUsed === 2) {
    totScore = Math.floor(totScore * 2 / 4);
  } else if (noOfHintsUsed === 3) {
    totScore = Math.floor(totScore * 1 / 4);
  } else if (noOfHintsUsed >= 4) {
    totScore = 0;
  }

  return totScore;
}

var xoLogo = '<?xml version="1.0" ?><!DOCTYPE svg  PUBLIC \'-//W3C//DTD SVG 1.1//EN\'  \'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\' [<!ENTITY stroke_color "#010101"><!ENTITY fill_color "#FFFFFF">]><svg enable-background="new 0 0 55 55" height="55px" version="1.1" viewBox="0 0 55 55" width="55px" x="0px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" y="0px"><g display="block" id="stock-xo_1_"><path d="M33.233,35.1l10.102,10.1c0.752,0.75,1.217,1.783,1.217,2.932   c0,2.287-1.855,4.143-4.146,4.143c-1.145,0-2.178-0.463-2.932-1.211L27.372,40.961l-10.1,10.1c-0.75,0.75-1.787,1.211-2.934,1.211   c-2.284,0-4.143-1.854-4.143-4.141c0-1.146,0.465-2.184,1.212-2.934l10.104-10.102L11.409,24.995   c-0.747-0.748-1.212-1.785-1.212-2.93c0-2.289,1.854-4.146,4.146-4.146c1.143,0,2.18,0.465,2.93,1.214l10.099,10.102l10.102-10.103   c0.754-0.749,1.787-1.214,2.934-1.214c2.289,0,4.146,1.856,4.146,4.145c0,1.146-0.467,2.18-1.217,2.932L33.233,35.1z" fill="&fill_color;" stroke="&stroke_color;" stroke-width="3.5"/><circle cx="27.371" cy="10.849" fill="&fill_color;" r="8.122" stroke="&stroke_color;" stroke-width="3.5"/></g></svg>';


var generateXOLogoWithColor = function(strokeColor, fillColor) {
  var coloredLogo = xoLogo;
  coloredLogo = coloredLogo.replace("#010101", strokeColor)
  coloredLogo = coloredLogo.replace("#FFFFFF", fillColor)
  return "data:image/svg+xml;base64," + btoa(coloredLogo);
}
