const ObjectValues = object => Object.keys(object)
  .map(key => object[key])

function State(state = {}) {
  this.state = state
  const subscribeList = {}

  const render = (statesToChange, prevState = {}) => {
    statesToChange.forEach(state => {
      subscribeList[state].forEach(subscribers => {
        const elem = document.querySelector(subscribers[0])
        if (typeof subscribers[1] === 'function') {
          subscribers[1](elem, this.state[state], prevState[state] )
        } else {
          const propertyToChange = subscribers[1]
          elem[propertyToChange] = this.state[state]
        }
      })
    })
  }

  this.set = function(arg) {
    const stateToUpdate = (typeof arg === 'function')
      ? arg(this.state)
      : arg
    const prevState = this.state
    Object.assign(this.state, stateToUpdate || {})
    for (let state in stateToUpdate) {
      if (!(state in subscribeList)) {
        subscribeList[state] = []
      }
    }
    render(Object.keys(stateToUpdate || {}), prevState)
  }

  this.subscribe = function(obj) {
    for (let key in obj) {
      if (key in subscribeList) {
        if (Array.isArray(obj[key])) {
          if (Array.isArray(obj[key][0])) {
            subscribeList[key].map(arr => {
              subscribeList[key].push(arr)
            })
          } else {
            subscribeList[key].push(obj[key])
          }
        }
      } else {
        if (Array.isArray(obj[key])) {
          if (Array.isArray(obj[key][0])) {
            subscribeList[key] = obj[key]
          } else {
            subscribeList[key] = [obj[key]]
          }
        }
      }
    }
    render(Object.keys(obj))
  }
}
define(() => State)
