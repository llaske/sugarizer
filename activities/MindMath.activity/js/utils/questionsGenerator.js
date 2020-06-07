const OPERATORS = [ '+', '-','/', '*']
var opLen = 4

function QuestionsGenerator() {
  this.level = 0;
  this.skipQuestion = {};
  this.target = null;
  this.best = "";
  this.uniq = {};
  this.dups = false;
  this.inputNumbers = [];
  this.found = false;

  this.generateInputNumbers = function () {
    var t = 5;
    const upperRanges = [4,6,8,12,20];
    var inputNumbers = [];
    var noOfOnes = 0;
    var noOfTwos = 0;
    while(t--){
      /*[1, 1, 1, 1, 1], [1, 1, 1, 1, 2], [1, 1, 1, 1, 3], [1, 1, 1, 1, 4], [1, 1, 1, 1, 5],
       [1, 1, 1, 2, 2], [1, 1, 1, 2, 3], [1, 1, 2, 2, 2], [1, 2, 2, 2, 2], [2, 2, 2, 2, 2]
       are invalid combinations so we will avoid these*/
      if ((noOfOnes == 1 && noOfTwos == 3) || (noOfOnes == 2 && noOfTwos == 2) || (noOfTwos == 4)) {
        var min = 3;
        var tmp = Math.floor(Math.random() * (upperRanges[t] + 1 - min) + min);
        inputNumbers.push(tmp);
      }
      else  {
        var min = 1;
        var tmp = Math.floor(Math.random() * (upperRanges[t] + 1 - min) + min);
        if (tmp == 1) {
          noOfOnes++;
        }
        else if (tmp == 2) {
          noOfTwos++;
        }
        inputNumbers.push(tmp);
      }
    }
    return inputNumbers
  }

  this.genrpn = function (pattern, remaining, writePos, unresolvedNumbers) {
    if (unresolvedNumbers > 1) {
      for (let i = 0;
        (i < opLen  && !this.found); i++) {
        pattern[writePos] = OPERATORS[i];
        const evalRes = evaluator(pattern, writePos);
        const allowed = evalRes.allowed;
        const result = evalRes.result;
        const rpn = pattern.slice(0,writePos+1).join(',');
        const arrayRes = checkIfArrayHasUniqueOps(pattern, writePos);
        const unique = arrayRes.unique;
        const hasTwo = arrayRes.hasTwo;

        var flag = false;
        if (this.dups) {
          if(!(rpn in this.uniq)){
            flag = true;
            this.uniq[rpn] = 1;
          }
        }
        else {
          flag = true;
        }
        if(result > 100 && hasTwo){
          flag = false;
        }

        if (!this.found && allowed && flag && unique) {
          var str = this.inputNumbers.sort().join();

          if (!this.skipQuestion[str+','+result]) {
            if(result < 100 && writePos == 8){
              if (result<=69 && result>=10 && this.level == 0) {
                this.found = true;
                this.target = result;
                this.best = rpn;
                this.skipQuestion[str+','+result] = result;
              }
              if (result<100 && result>=1 && this.level == 1) {
                this.found = true;
                this.target = result;
                this.best = rpn;
                this.skipQuestion[str+','+result] = result;
              }
            }
          }

          this.genrpn(pattern, remaining, writePos + 1, unresolvedNumbers - 1)
        }
      }
    }

    for (let i = 0; i < remaining.length && !this.found; i++) {
      const remainingSubset = removeEntryFromArray(remaining, i)
      pattern[writePos] = remaining[i]
      this.genrpn(pattern, remainingSubset, writePos + 1, unresolvedNumbers + 1)
    }

  }

  this.find = function () {
    this.found = false;
    this.target = null;
    this.best = "";
    this.uniq = {}
    this.dups = checkIfArrayHasDups(this.inputNumbers)
    const pattern = new Array(2 * this.inputNumbers.length)
    this.genrpn(pattern, this.inputNumbers, 0, 0)
  }

  this.generate = function (level, len) {
    this.level = level;
    var questions = [];
    for (var qNo = 0; qNo < len; qNo++) {
      this.inputNumbers = this.generateInputNumbers();
      this.find();
      var question = {
        inputNumbers: this.inputNumbers,
        targetNum: this.target,
        difficulty: this.level === 0 ? 'easy' : 'medium',
        bestSoln: this.best.split(','),
      }
      questions.push(question);
    }
    return questions
  }
}
