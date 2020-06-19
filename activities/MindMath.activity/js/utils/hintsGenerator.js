var opLen = 4;

function HintsGenerator() {
  this.best = "";
  this.maxScore = 0;
  this.uniq = {};
  this.dups = false;
  this.compulsoryOps = [];
  this.targetNumber = 27;
  this.inputNumbers = [1, 2, 2, 4, 5];
  this.prevOpsUsed = [];
  this.found = false;

  this.genhints = function(pattern, remaining, writePos, unresolvedNumbers) {
    if (unresolvedNumbers > 1) {
      for (let i = 0;
        (i < opLen && !this.found); i++) {
        pattern[writePos] = OPERATORS[i]
        const evalRes = evaluator(pattern, writePos);
        const allowed = evalRes.allowed;
        const result = evalRes.result;
        const rpn = pattern.slice(0, writePos + 1).join(',')
        const arrayRes = checkIfArrayHasUniqueOps(pattern, writePos);
        const unique = arrayRes.unique;
        const hasTwo = arrayRes.hasTwo;

        var flag = false;
        if (this.dups) {
          if (!(rpn in this.uniq)) {
            flag = true;
            this.uniq[rpn] = 1;
          }
        } else {
          flag = true;
        }
        //we will not check result or recurse furhter if the result is more than 100 and we don't have '-' and '/'.
        if (result > this.targetNumber && hasTwo) {
          flag = false;
        }

        if (!this.found && allowed && flag) {
          //checking if it contains compulsory operators
          if (this.compulsoryOps.length != 0) {
            var compCt = 0;
            for (var cmp = 0; cmp < this.compulsoryOps.length; cmp++) {
              var ct = findEle(rpn, this.compulsoryOps[cmp]);
              if (ct) {
                compCt++;
              }
            }
            if (compCt === this.compulsoryOps.length) {
              var comp = true;
            } else {
              var comp = false;
            }

          } else {
            var comp = true;
          }
          //we will finalize the rpn only if the result we  get from it equals
          //to target and it contains all the compulsory operators
          if (result == this.targetNumber && comp) {
            //calculate score considering previous operators used 
            var patternWithPrevOpsUsed = this.prevOpsUsed.concat(pattern);
            var s = score(patternWithPrevOpsUsed, writePos + this.prevOpsUsed.length);
            if (s > this.maxScore) {
              this.maxScore = s;
              this.best = rpn;
            }
            if (s == 13) {
              this.found = true;
            }
          }
          this.genhints(pattern, remaining, writePos + 1, unresolvedNumbers - 1);
        }
      }
    }

    for (let i = 0; i < remaining.length && !this.found; i++) {
      const remainingSubset = removeEntryFromArray(remaining, i);
      pattern[writePos] = remaining[i];
      this.genhints(pattern, remainingSubset, writePos + 1, unresolvedNumbers + 1);
    }

  },

  this.initializePrevOpsUsed = function (prev_slots = []) {
    this.prevOpsUsed = [];
    for (var i = 0; i < prev_slots.length; i++) {
      this.prevOpsUsed.push(prev_slots[i].operator);
    };
  },

  this.generate = function(inputNumbers, targetNum, compulsoryOps, prev_slots) {
    this.found = false;
    this.maxScore = 0;
    this.best = "";
    this.uniq = {};
    this.inputNumbers = inputNumbers;
    this.targetNumber = targetNum;
    this.compulsoryOps = compulsoryOps;
    this.initializePrevOpsUsed(prev_slots);
    this.dups = checkIfArrayHasDups(this.inputNumbers);
    const pattern = new Array(2 * this.inputNumbers.length);
    this.genhints(pattern, this.inputNumbers, 0, 0);
    var bestArr = this.best.split(',');
    var slots = rpnToSlots(bestArr);
    return slots;
  }
}
