define(['sugar-web/activity/activity', 'activity/Board', 'activity/vanilla-state'], function (activity, Board, State) {
  require(['domReady!'], function (doc) {
    activity.setup()
    main(Board, State)
  })
})

function main(Board, State) {
  const state = new State({
    boardState: [],
    genetation: 0,
  })

  const generateRandomBoardState = (
    new Array(30).fill(0)
      .map(() => {
        const row = new Array(50).fill(0)
        return row.map(() => Math.floor(Math.random() * 2))
      })
  )

  state.set({boardState: generateRandomBoardState})
  const target = document.querySelector('.main canvas')
  const board = new Board( state.state.boardState,
    '#C02E70',
    '#FBF6F5',
    '#ED5B9D',
    '#EA3788',
    12,
    12,
    2,
    2,
    target
  )
  board.draw()
}
