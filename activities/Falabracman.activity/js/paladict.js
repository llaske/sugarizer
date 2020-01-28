function Paladict (dict) {
  this.dict = dict;

  this.changeDict = function (_dict) {
    this.dict = _dict;
  }
  this.getRandomWord = function () {
    let no = Math.floor(Math.random() * this.dict.length);
    return this.dict[no];
  }

}

define(function () {
  return Paladict;
});
