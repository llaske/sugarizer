var ObjectValues = function ObjectValues(object) {
  return Object.keys(object).map(function (key) {
    return object[key];
  });
};

function State() {
  var _this = this;

  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  this.state = state;
  var subscribeList = {};

  var render = function render(statesToChange) {
    var prevState = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    statesToChange.forEach(function (state) {
      subscribeList[state].forEach(function (subscribers) {
        var elem = document.querySelector(subscribers[0]);
        if (typeof subscribers[1] === 'function') {
          subscribers[1](elem, _this.state[state], prevState[state]);
        } else {
          var propertyToChange = subscribers[1];
          elem[propertyToChange] = _this.state[state];
        }
      });
    });
  };

  this.set = function (arg) {
    var stateToUpdate = typeof arg === 'function' ? arg(this.state) : arg;
    var prevState = this.state;
    Object.assign(this.state, stateToUpdate || {});
    for (var _state in stateToUpdate) {
      if (!(_state in subscribeList)) {
        subscribeList[_state] = [];
      }
    }
    render(Object.keys(stateToUpdate || {}), prevState);
  };

  this.subscribe = function (obj) {
    var _loop = function _loop(key) {
      if (key in subscribeList) {
        if (Array.isArray(obj[key])) {
          if (Array.isArray(obj[key][0])) {
            subscribeList[key].map(function (arr) {
              subscribeList[key].push(arr);
            });
          } else {
            subscribeList[key].push(obj[key]);
          }
        }
      } else {
        if (Array.isArray(obj[key])) {
          if (Array.isArray(obj[key][0])) {
            subscribeList[key] = obj[key];
          } else {
            subscribeList[key] = [obj[key]];
          }
        }
      }
    };

    for (var key in obj) {
      _loop(key);
    }
    render(Object.keys(obj));
  };
}
define(function () {
  return State;
});