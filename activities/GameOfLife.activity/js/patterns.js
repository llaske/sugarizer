const generateRandomBoardState = () => (
  new Array(30).fill(0)
    .map(() => {
      const row = new Array(50).fill(0)
      return row.map(() => Math.floor(Math.random() * 2))
    })
)

const glider = () => {
  const pattern = generateRandomBoardState()
  pattern[5][7] = 1
  pattern[6][5] = 1
  pattern[6][6] = 1
  pattern[7][6] = 1
  pattern[7][7] = 1
  return glider()
}
const patterns = [generateRandomBoardState, glider]

define(() => {
  return patterns
})