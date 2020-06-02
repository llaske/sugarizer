function Paladict (dict) {
  this.dict = dict;
  this.defaultDict = [].concat(dict);

  this.changeDict = function (_dict) {
    this.dict = [].concat(_dict);
  }
  this.getRandomWord = function () {
    var no = Math.floor(Math.random() * this.dict.length);
    return this.dict[no];
  }

}

define(function () {
  return Paladict;
});
