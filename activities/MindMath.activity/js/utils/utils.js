function removeEntryFromArray(array, skipIndex) {
  const subset = new Array(array.length - 1)
  for (let i=0; i<array.length; i++) {
    if (i === skipIndex) continue;
    subset[i > skipIndex ? i - 1 : i] = array[i]
  }
  return subset
}

function allowedCheck(n) {
  return Number.isInteger(n) && n >= 0;
}

function score(pattern,writePos) {
  var scr = 0;
  map = {}
  var flag = 0;
  for (var i = 0; i <= writePos; i++) {
    if (isNaN(pattern[i])) {
      if(!(pattern[i] in map)){
        map[pattern[i]] = 1;
        flag++
      }
      if (pattern[i]=='+' || pattern[i]=='*' ) {
        scr+=1;
      }
      else if (pattern[i]=='-') {
        scr+=2
      }
      else if (pattern[i]=='/') {
        scr+=3
      }

    }
  }
  if(flag == 4){
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
     stack.push(parseInt(pattern[i]))
   }
   else{
     const second = stack.pop()
     const first = stack.pop()
     const operand = pattern[i]
     var result;

     if (operand === '+') {
       result =  first + second
     }
     else if (operand === '*' || operand === 'x') {
       result =  first * second
     }
     else if (operand === '-') {
       result =  first - second
     }
     else if (operand === '/') {
       result =  first / second
     }

    // const slot = first + operand + second + '=' + result;
     const slot = [first, operand, second, result];
     stack.push(result);
     slots.push(slot);

     }
   }
   return slots
 }
