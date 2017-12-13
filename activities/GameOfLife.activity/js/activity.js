define(['sugar-web/activity/activity',"webL10n", 'activity/Board', 'activity/vanilla-state', 'activity/patterns', 'activity/shadeColor'], function (activity, l10n, Board, State, patterns, shadeColor) {
  require(['domReady!'], function (doc) {
    activity.setup()
    window.addEventListener('localized', () => {
      activity.getXOColor((err, color) => {
        const dataStore = activity.getDatastoreObject()
        main(Board, State, patterns, color, shadeColor, l10n, dataStore)
      })
    })
  })
})

function main(Board, State, patterns, color, shadeColor, l10n, dataStore) {
  const state = new State({
    boardState: [],
    generation: 0,
    playPauseIcon: 'play',
    shouldPlay: false,
  })
  const [randomPattern, gliderPattern, noPattern, blankPattern] = patterns
  const target =  document.querySelector('.main canvas')
  const board = new Board( state.state.boardState,
    color.fill,
    '#FBF6F5',
    shadeColor(color.stroke, 10),
    color.stroke,
    12,
    12,
    2,
    2,
    target
  )
  document.querySelector('.generation-count').style.color = color.fill
  document.querySelector('.generation-status').style.color = color.fill
  document.querySelector('.generation-status').innerText = l10n.get('Generation')

  board.draw()

  const storeLocally = state => {
    dataStore.setDataAsText({
      state: state
    })
    console.log('writing')
    dataStore.save( err => {
      if (err) {
        console.log('writing failed.')
        console.error(err)
      } else {
        console.log('writing saved.')
      }
    })
  }

  const generateGeneration = () => {
    if (state.state.shouldPlay) {
      const nextGenerationBoard = state.state.boardState.map((row, y) => (
        row.map((cell, x) => (
          transformCellByRule(cell, findNeighbours(x, y))
        ))
      ))
      state.set(prev => ({
        boardState: nextGenerationBoard,
        generation: prev.generation + 1
      }))
      setTimeout(generateGeneration, 100)
    } else {
      return 0
    }
  }

  const transformCellByRule = (cell, neighbours)  => {
    const cellIsAlive = cell === 1 || cell === 2
    const aliveInNeighbour = neighbours.filter(cell => (cell === 1 || cell === 2 ))
    const numOfAliveNeighbours = aliveInNeighbour.length
    if (cellIsAlive) {
      if (numOfAliveNeighbours < 2) {
        return 0
      } else if (numOfAliveNeighbours === 2 || numOfAliveNeighbours === 3) {
        return 1
      } else {
        return 0
      }
    } else {
      if (numOfAliveNeighbours === 3) {
        return 2
      } else {
        return 0
      }
    }
  }

  const findNeighbours = (x, y) => {
    const leftX = (x - 1 === -1)
      ? 49
      : x - 1
    const rightX = (x + 1 === 50)
      ? 0
      : x + 1
    const topY = (y - 1 === -1)
      ? 29
      : y - 1
    const bottomY = (y + 1 === 30)
      ? 0
      : y + 1
    const { boardState } = state.state
    const left =  boardState[y][leftX]
    const right = boardState[y][rightX]
    const top = boardState[topY][x]
    const bottom = boardState[bottomY][x]
    const leftTop = boardState[topY][leftX]
    const leftBottom = boardState[bottomY][leftX]
    const rightTop = boardState[topY][rightX]
    const rightBottom = boardState[bottomY][rightX]

    return [left, right, top, bottom, leftTop, leftBottom, rightTop, rightBottom]
  }

  state.subscribe({
    boardState: [
      '.fake-selector',
      (fakeElem, value, prevValue) => {
        board.update(value)
      }
    ],

    generation: [
      '.generation-count', 'innerText'
    ],

    playPauseIcon: [
      '#play-pause',
      (elem, value, prevValue) => {
        elem.className = `${value} toolbutton`
      }
    ],

    shouldPlay: [
      '.fake-selector',
      (fakeElem, value, prevValue) => {
        if (value) {
          generateGeneration()
        }
      }
    ]
  })

  dataStore.loadAsText((err, metadata, data) => {
    const dataToLoad = data
      ? data.state
      : randomPattern()
    state.set({
      boardState:  dataToLoad,
    })
  })

  board.onClick((cellX, cellY) => {
    state.set(prev => {
      const newState = [...prev.boardState]
      newState[cellY][cellX] = 2
      return {
        boardState: newState
      }
    })
  })

  document.querySelector('#play-pause')
    .addEventListener('click', () => {
      state.set(prev => {
        const iconToSet = (prev.playPauseIcon === 'play') ? 'pause' : 'play'
        const togglePlay = (prev.shouldPlay === true) ? false : true
        if (prev.shouldPlay) {
          storeLocally({
            state: state.state.boardState
          })
        }
      return {
        playPauseIcon: iconToSet,
        shouldPlay: togglePlay
      }
    })
  })

  document.querySelector('#random')
    .addEventListener('click', () => {
      state.set({
        boardState: randomPattern(),
        generation: 0
      })
    })
  document.querySelector('#glider')
    .addEventListener('click', () => {
      state.set({
        boardState: glider(),
        generation: 0
      })
    })
  document.querySelector('#no')
    .addEventListener('click', () => {
      state.set({
        boardState: no(),
        generation: 0
      })
    })
  document.querySelector('#clear')
    .addEventListener('click', () => {
      state.set({
        boardState: blankPattern(),
        generation: 0,
        playPauseIcon: 'play',
        shouldPlay: false
      })
    })

  window.addEventListener('resize', e => {
    board.handleResize(window.innerWidth, state.state.boardState)
  })
  board.handleResize(window.innerWidth, state.state.boardState)
}
