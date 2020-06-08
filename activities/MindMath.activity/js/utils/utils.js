function removeEntryFromArray(array, skipIndex) {
  const subset = new Array(array.length - 1)
  for (let i=0; i<array.length; i++) {
    if (i === skipIndex) continue;
    subset[i > skipIndex ? i - 1 : i] = array[i]
  }
  return subset
}

function addEntryIntoArray(array, addIndex, ele) {
  const subset = new Array(array.length + 1)
  for (let i=array.length-1; i>=0; i--) {
    subset[i >= addIndex ? i + 1 : i] = array[i]
  }
  subset[addIndex] = ele
  return subset
}



function allowedCheck(n) {
  return Number.isInteger(n) && n >= 0;
}

function checkIfArrayHasUniqueOps(pattern, writePos) {
  var map = {};
  var flag = 0;
  var flag2 = 0;
  var noOfOps = 0;
  var op = [0,0]
  for (var i = 0; i <= writePos; i++){
    if (isNaN(pattern[i])) {
      noOfOps++
      if(!(pattern[i] in map)){
        map[pattern[i]] = 1;
        flag++
      }
      if(pattern[i] == '-'){
        if(op[0]==0){
          op[0]=1;
          flag2++;
        }
      }
      if(pattern[i] == '/'){
        if(op[1]==0){
          op[1]=1;
          flag2++;
        }
      }

    }
  }

  return {unique: flag==noOfOps, hasTwo: flag2==2}
}

function checkIfArrayHasDups(arr) {
    var map = {}, i, size;

    for (i = 0, size = arr.length; i < size; i++){
        if (map[arr[i]]){
            return true;
        }

        map[arr[i]] = true;
    }
    return false;
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
     var obj ={
       type: 0,
       val: parseInt(pattern[i])
     }
     stack.push(obj)
   }
   else{
     const second = stack.pop()
     const first = stack.pop()
     const operand = pattern[i]
     var result;

     if (operand === '+') {
       result =  first.val + second.val
     }
     else if (operand === '*' || operand === 'x') {
       result =  first.val * second.val
     }
     else if (operand === '-') {
       result =  first.val - second.val
     }
     else if (operand === '/') {
       result =  first.val / second.val
     }

    // const slot = first + operand + second + '=' + result;
     const slot = [first, operand, second, result];
     var obj = {
       type:1,
       val: result
     }
     stack.push(obj);
     slots.push(slot);

     }
   }
   return slots
 }

 function calculateScoreFromSlots(slots, timeTaken) {
   var scr = 0;
   map = {}
   var flag = 0;

   for (var i = 0; i < slots.length; i++) {
     var slot = slots[i];
     if (slot.operator != null) {
       if(!(slot.operator in map)){
         map[slot.operator] = 1;
         flag++
       }
       if (slot.operator === '+' || (slot.operator === '*' || slot.operator === 'x')) {
         scr+=1;
       }
       else if (slot.operator === '-') {
         scr+=2
       }
       else if (slot.operator === '/') {
         scr+=3
       }
       scr++;
     }
   }

   if(flag === 4){
     scr = 13 + 4;
   }
   //considering timeTaken
   var timeScore = Math.max(0, 16 - Math.floor(timeTaken / 4));
   console.log(timeScore);
   var totScore = 2 * scr + timeScore;

   return totScore;
 }
