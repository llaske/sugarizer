function converter(value, rate) {
  let containerChilds = document.querySelectorAll('input.elem');
  for (let i = 0; i < containerChilds.length; i++) {
    containerChilds[i].value = (containerChilds[i].name * value) / rate;
  }
}
