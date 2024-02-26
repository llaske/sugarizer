function calculate(stack, operand) {
  const second = stack.pop()
  const first = stack.pop()
  switch (operand) {
    case '+':
      return first + second
    case '*':
      return first * second
    case '-':
      return first - second
    case '/':
      return first / second
  }
}

function evaluator(symbols, last) {
  const stack = []
  const length = last ? last + 1 : symbols.length
  let allowed = true

  for (let i = 0; i < length; i++) {
    const s = symbols[i]
    if (typeof s === 'number') {
      stack.push(s)
    } else {
      const result = calculate(stack, s)
      allowed = allowedCheck(result)
      if (!allowed) break;
      stack.push(result)
    }
  }

  return {
    allowed,
    result: stack.pop()
  }
}
