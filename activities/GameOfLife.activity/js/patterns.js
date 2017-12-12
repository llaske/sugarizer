const initialPattern = (
  new Array(30).fill(0)
    .map(() => new Array(50).fill(0))
)

const generateRandomBoardState = () => (
  new Array(30).fill(0)
    .map(() => {
      const row = new Array(50).fill(0)
      return row.map(() => Math.floor(Math.random() * 2))
    })
)

const glider = () => {
  const pattern = initialPattern
  pattern[5][7] = 1
  pattern[6][5] = 1
  pattern[6][6] = 1
  pattern[7][6] = 1
  pattern[7][7] = 1
  return pattern
}

const no = () => {
  const pattern = initialPattern
  for (let j = 0; j < 30; j++) {
    if (!((j + 1) % 4 === 0)) {
      for (let i = 2; i < 50; i+=4) {
        pattern[j][i] = 1
      }
    }
  }
  return pattern
}

const patterns = [generateRandomBoardState, glider, no]

define(() => {
  return patterns
})