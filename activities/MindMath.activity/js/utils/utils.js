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
