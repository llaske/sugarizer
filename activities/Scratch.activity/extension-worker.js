/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 8);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

var microee = __webpack_require__(9);

// Implements a subset of Node's stream.Transform - in a cross-platform manner.
function Transform() {}

microee.mixin(Transform);

// The write() signature is different from Node's
// --> makes it much easier to work with objects in logs.
// One of the lessons from v1 was that it's better to target
// a good browser rather than the lowest common denominator
// internally.
// If you want to use external streams, pipe() to ./stringify.js first.
Transform.prototype.write = function(name, level, args) {
  this.emit('item', name, level, args);
};

Transform.prototype.end = function() {
  this.emit('end');
  this.removeAllListeners();
};

Transform.prototype.pipe = function(dest) {
  var s = this;
  // prevent double piping
  s.emit('unpipe', dest);
  // tell the dest that it's being piped to
  dest.emit('pipe', s);

  function onItem() {
    dest.write.apply(dest, Array.prototype.slice.call(arguments));
  }
  function onEnd() { !dest._isStdio && dest.end(); }

  s.on('item', onItem);
  s.on('end', onEnd);

  s.when('unpipe', function(from) {
    var match = (from === dest) || typeof from == 'undefined';
    if(match) {
      s.removeListener('item', onItem);
      s.removeListener('end', onEnd);
      dest.emit('unpipe');
    }
    return match;
  });

  return dest;
};

Transform.prototype.unpipe = function(from) {
  this.emit('unpipe', from);
  return this;
};

Transform.prototype.format = function(dest) {
  throw new Error([
    'Warning: .format() is deprecated in Minilog v2! Use .pipe() instead. For example:',
    'var Minilog = require(\'minilog\');',
    'Minilog',
    '  .pipe(Minilog.backends.console.formatClean)',
    '  .pipe(Minilog.backends.console);'].join('\n'));
};

Transform.mixin = function(dest) {
  var o = Transform.prototype, k;
  for (k in o) {
    o.hasOwnProperty(k) && (dest.prototype[k] = o[k]);
  }
};

module.exports = Transform;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var minilog = __webpack_require__(16);
minilog.enable();

module.exports = minilog('vm');

/***/ }),
/* 2 */
/***/ (function(module, exports) {

var hex = {
  black: '#000',
  red: '#c23621',
  green: '#25bc26',
  yellow: '#bbbb00',
  blue:  '#492ee1',
  magenta: '#d338d3',
  cyan: '#33bbc8',
  gray: '#808080',
  purple: '#708'
};
function color(fg, isInverse) {
  if(isInverse) {
    return 'color: #fff; background: '+hex[fg]+';';
  } else {
    return 'color: '+hex[fg]+';';
  }
}

module.exports = color;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SharedDispatch = __webpack_require__(7);

var log = __webpack_require__(1);

/**
 * This class provides a Worker with the means to participate in the message dispatch system managed by CentralDispatch.
 * From any context in the messaging system, the dispatcher's "call" method can call any method on any "service"
 * provided in any participating context. The dispatch system will forward function arguments and return values across
 * worker boundaries as needed.
 * @see {CentralDispatch}
 */

var WorkerDispatch = function (_SharedDispatch) {
    _inherits(WorkerDispatch, _SharedDispatch);

    function WorkerDispatch() {
        _classCallCheck(this, WorkerDispatch);

        /**
         * This promise will be resolved when we have successfully connected to central dispatch.
         * @type {Promise}
         * @see {waitForConnection}
         * @private
         */
        var _this = _possibleConstructorReturn(this, (WorkerDispatch.__proto__ || Object.getPrototypeOf(WorkerDispatch)).call(this));

        _this._connectionPromise = new Promise(function (resolve) {
            _this._onConnect = resolve;
        });

        /**
         * Map of service name to local service provider.
         * If a service is not listed here, it is assumed to be provided by another context (another Worker or the main
         * thread).
         * @see {setService}
         * @type {object}
         */
        _this.services = {};

        _this._onMessage = _this._onMessage.bind(_this, self);
        if (typeof self !== 'undefined') {
            self.onmessage = _this._onMessage;
        }
        return _this;
    }

    /**
     * @returns {Promise} a promise which will resolve upon connection to central dispatch. If you need to make a call
     * immediately on "startup" you can attach a 'then' to this promise.
     * @example
     *      dispatch.waitForConnection.then(() => {
     *          dispatch.call('myService', 'hello');
     *      })
     */


    _createClass(WorkerDispatch, [{
        key: 'setService',


        /**
         * Set a local object as the global provider of the specified service.
         * WARNING: Any method on the provider can be called from any worker within the dispatch system.
         * @param {string} service - a globally unique string identifying this service. Examples: 'vm', 'gui', 'extension9'.
         * @param {object} provider - a local object which provides this service.
         * @returns {Promise} - a promise which will resolve once the service is registered.
         */
        value: function setService(service, provider) {
            var _this2 = this;

            if (this.services.hasOwnProperty(service)) {
                log.warn('Worker dispatch replacing existing service provider for ' + service);
            }
            this.services[service] = provider;
            return this.waitForConnection.then(function () {
                return _this2._remoteCall(self, 'dispatch', 'setService', service);
            });
        }

        /**
         * Fetch the service provider object for a particular service name.
         * @override
         * @param {string} service - the name of the service to look up
         * @returns {{provider:(object|Worker), isRemote:boolean}} - the means to contact the service, if found
         * @protected
         */

    }, {
        key: '_getServiceProvider',
        value: function _getServiceProvider(service) {
            // if we don't have a local service by this name, contact central dispatch by calling `postMessage` on self
            var provider = this.services[service];
            return {
                provider: provider || self,
                isRemote: !provider
            };
        }

        /**
         * Handle a call message sent to the dispatch service itself
         * @override
         * @param {Worker} worker - the worker which sent the message.
         * @param {DispatchCallMessage} message - the message to be handled.
         * @returns {Promise|undefined} - a promise for the results of this operation, if appropriate
         * @protected
         */

    }, {
        key: '_onDispatchMessage',
        value: function _onDispatchMessage(worker, message) {
            var promise = void 0;
            switch (message.method) {
                case 'handshake':
                    promise = this._onConnect();
                    break;
                case 'terminate':
                    // Don't close until next tick, after sending confirmation back
                    setTimeout(function () {
                        return self.close();
                    }, 0);
                    promise = Promise.resolve();
                    break;
                default:
                    log.error('Worker dispatch received message for unknown method: ' + message.method);
            }
            return promise;
        }
    }, {
        key: 'waitForConnection',
        get: function get() {
            return this._connectionPromise;
        }
    }]);

    return WorkerDispatch;
}(SharedDispatch);

module.exports = new WorkerDispatch();

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var ArgumentType = {
    ANGLE: 'angle',
    BOOLEAN: 'Boolean',
    COLOR: 'color',
    NUMBER: 'number',
    STRING: 'string'
};

module.exports = ArgumentType;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var BlockType = {
    BOOLEAN: 'Boolean',
    COMMAND: 'command',
    CONDITIONAL: 'conditional',
    HAT: 'hat',
    REPORTER: 'reporter'
};

module.exports = BlockType;

/***/ }),
/* 6 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var log = __webpack_require__(1);

/**
 * @typedef {object} DispatchCallMessage - a message to the dispatch system representing a service method call
 * @property {*} responseId - send a response message with this response ID. See {@link DispatchResponseMessage}
 * @property {string} service - the name of the service to be called
 * @property {string} method - the name of the method to be called
 * @property {Array|undefined} args - the arguments to be passed to the method
 */

/**
 * @typedef {object} DispatchResponseMessage - a message to the dispatch system representing the results of a call
 * @property {*} responseId - a copy of the response ID from the call which generated this response
 * @property {*|undefined} error - if this is truthy, then it contains results from a failed call (such as an exception)
 * @property {*|undefined} result - if error is not truthy, then this contains the return value of the call (if any)
 */

/**
 * @typedef {DispatchCallMessage|DispatchResponseMessage} DispatchMessage
 * Any message to the dispatch system.
 */

/**
 * The SharedDispatch class is responsible for dispatch features shared by
 * {@link CentralDispatch} and {@link WorkerDispatch}.
 */

var SharedDispatch = function () {
    function SharedDispatch() {
        _classCallCheck(this, SharedDispatch);

        /**
         * List of callback registrations for promises waiting for a response from a call to a service on another
         * worker. A callback registration is an array of [resolve,reject] Promise functions.
         * Calls to local services don't enter this list.
         * @type {Array.<[Function,Function]>}
         */
        this.callbacks = [];

        /**
         * The next response ID to be used.
         * @type {int}
         */
        this.nextResponseId = 0;
    }

    /**
     * Call a particular method on a particular service, regardless of whether that service is provided locally or on
     * a worker. If the service is provided by a worker, the `args` will be copied using the Structured Clone
     * algorithm, except for any items which are also in the `transfer` list. Ownership of those items will be
     * transferred to the worker, and they should not be used after this call.
     * @example
     *      dispatcher.call('vm', 'setData', 'cat', 42);
     *      // this finds the worker for the 'vm' service, then on that worker calls:
     *      vm.setData('cat', 42);
     * @param {string} service - the name of the service.
     * @param {string} method - the name of the method.
     * @param {*} [args] - the arguments to be copied to the method, if any.
     * @returns {Promise} - a promise for the return value of the service method.
     */


    _createClass(SharedDispatch, [{
        key: 'call',
        value: function call(service, method) {
            for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
                args[_key - 2] = arguments[_key];
            }

            return this.transferCall.apply(this, [service, method, null].concat(args));
        }

        /**
         * Call a particular method on a particular service, regardless of whether that service is provided locally or on
         * a worker. If the service is provided by a worker, the `args` will be copied using the Structured Clone
         * algorithm, except for any items which are also in the `transfer` list. Ownership of those items will be
         * transferred to the worker, and they should not be used after this call.
         * @example
         *      dispatcher.transferCall('vm', 'setData', [myArrayBuffer], 'cat', myArrayBuffer);
         *      // this finds the worker for the 'vm' service, transfers `myArrayBuffer` to it, then on that worker calls:
         *      vm.setData('cat', myArrayBuffer);
         * @param {string} service - the name of the service.
         * @param {string} method - the name of the method.
         * @param {Array} [transfer] - objects to be transferred instead of copied. Must be present in `args` to be useful.
         * @param {*} [args] - the arguments to be copied to the method, if any.
         * @returns {Promise} - a promise for the return value of the service method.
         */

    }, {
        key: 'transferCall',
        value: function transferCall(service, method, transfer) {
            try {
                var _getServiceProvider2 = this._getServiceProvider(service),
                    provider = _getServiceProvider2.provider,
                    isRemote = _getServiceProvider2.isRemote;

                if (provider) {
                    for (var _len2 = arguments.length, args = Array(_len2 > 3 ? _len2 - 3 : 0), _key2 = 3; _key2 < _len2; _key2++) {
                        args[_key2 - 3] = arguments[_key2];
                    }

                    if (isRemote) {
                        return this._remoteTransferCall.apply(this, [provider, service, method, transfer].concat(args));
                    }

                    var result = provider[method].apply(provider, args);
                    return Promise.resolve(result);
                }
                return Promise.reject(new Error('Service not found: ' + service));
            } catch (e) {
                return Promise.reject(e);
            }
        }

        /**
         * Check if a particular service lives on another worker.
         * @param {string} service - the service to check.
         * @returns {boolean} - true if the service is remote (calls must cross a Worker boundary), false otherwise.
         * @private
         */

    }, {
        key: '_isRemoteService',
        value: function _isRemoteService(service) {
            return this._getServiceProvider(service).isRemote;
        }

        /**
         * Like {@link call}, but force the call to be posted through a particular communication channel.
         * @param {object} provider - send the call through this object's `postMessage` function.
         * @param {string} service - the name of the service.
         * @param {string} method - the name of the method.
         * @param {*} [args] - the arguments to be copied to the method, if any.
         * @returns {Promise} - a promise for the return value of the service method.
         */

    }, {
        key: '_remoteCall',
        value: function _remoteCall(provider, service, method) {
            for (var _len3 = arguments.length, args = Array(_len3 > 3 ? _len3 - 3 : 0), _key3 = 3; _key3 < _len3; _key3++) {
                args[_key3 - 3] = arguments[_key3];
            }

            return this._remoteTransferCall.apply(this, [provider, service, method, null].concat(args));
        }

        /**
         * Like {@link transferCall}, but force the call to be posted through a particular communication channel.
         * @param {object} provider - send the call through this object's `postMessage` function.
         * @param {string} service - the name of the service.
         * @param {string} method - the name of the method.
         * @param {Array} [transfer] - objects to be transferred instead of copied. Must be present in `args` to be useful.
         * @param {*} [args] - the arguments to be copied to the method, if any.
         * @returns {Promise} - a promise for the return value of the service method.
         */

    }, {
        key: '_remoteTransferCall',
        value: function _remoteTransferCall(provider, service, method, transfer) {
            for (var _len4 = arguments.length, args = Array(_len4 > 4 ? _len4 - 4 : 0), _key4 = 4; _key4 < _len4; _key4++) {
                args[_key4 - 4] = arguments[_key4];
            }

            var _this = this;

            return new Promise(function (resolve, reject) {
                var responseId = _this._storeCallbacks(resolve, reject);

                /** @TODO: remove this hack! this is just here so we don't try to send `util` to a worker */
                if (args.length > 0 && typeof args[args.length - 1].yield === 'function') {
                    args.pop();
                }

                if (transfer) {
                    provider.postMessage({ service: service, method: method, responseId: responseId, args: args }, transfer);
                } else {
                    provider.postMessage({ service: service, method: method, responseId: responseId, args: args });
                }
            });
        }

        /**
         * Store callback functions pending a response message.
         * @param {Function} resolve - function to call if the service method returns.
         * @param {Function} reject - function to call if the service method throws.
         * @returns {*} - a unique response ID for this set of callbacks. See {@link _deliverResponse}.
         * @protected
         */

    }, {
        key: '_storeCallbacks',
        value: function _storeCallbacks(resolve, reject) {
            var responseId = this.nextResponseId++;
            this.callbacks[responseId] = [resolve, reject];
            return responseId;
        }

        /**
         * Deliver call response from a worker. This should only be called as the result of a message from a worker.
         * @param {int} responseId - the response ID of the callback set to call.
         * @param {DispatchResponseMessage} message - the message containing the response value(s).
         * @protected
         */

    }, {
        key: '_deliverResponse',
        value: function _deliverResponse(responseId, message) {
            try {
                var _callbacks$responseId = _slicedToArray(this.callbacks[responseId], 2),
                    resolve = _callbacks$responseId[0],
                    reject = _callbacks$responseId[1];

                delete this.callbacks[responseId];
                if (message.error) {
                    reject(message.error);
                } else {
                    resolve(message.result);
                }
            } catch (e) {
                log.error('Dispatch callback failed: ' + JSON.stringify(e));
            }
        }

        /**
         * Handle a message event received from a connected worker.
         * @param {Worker} worker - the worker which sent the message, or the global object if running in a worker.
         * @param {MessageEvent} event - the message event to be handled.
         * @protected
         */

    }, {
        key: '_onMessage',
        value: function _onMessage(worker, event) {
            /** @type {DispatchMessage} */
            var message = event.data;
            message.args = message.args || [];
            var promise = void 0;
            if (message.service) {
                if (message.service === 'dispatch') {
                    promise = this._onDispatchMessage(worker, message);
                } else {
                    promise = this.call.apply(this, [message.service, message.method].concat(_toConsumableArray(message.args)));
                }
            } else if (typeof message.responseId === 'undefined') {
                log.error('Dispatch caught malformed message from a worker: ' + JSON.stringify(event));
            } else {
                this._deliverResponse(message.responseId, message);
            }
            if (promise) {
                if (typeof message.responseId === 'undefined') {
                    log.error('Dispatch message missing required response ID: ' + JSON.stringify(event));
                } else {
                    promise.then(function (result) {
                        return worker.postMessage({ responseId: message.responseId, result: result });
                    }, function (error) {
                        return worker.postMessage({ responseId: message.responseId, error: error });
                    });
                }
            }
        }

        /**
         * Fetch the service provider object for a particular service name.
         * @abstract
         * @param {string} service - the name of the service to look up
         * @returns {{provider:(object|Worker), isRemote:boolean}} - the means to contact the service, if found
         * @protected
         */

    }, {
        key: '_getServiceProvider',
        value: function _getServiceProvider(service) {
            throw new Error('Could not get provider for ' + service + ': _getServiceProvider not implemented');
        }

        /**
         * Handle a call message sent to the dispatch service itself
         * @abstract
         * @param {Worker} worker - the worker which sent the message.
         * @param {DispatchCallMessage} message - the message to be handled.
         * @returns {Promise|undefined} - a promise for the results of this operation, if appropriate
         * @private
         */

    }, {
        key: '_onDispatchMessage',
        value: function _onDispatchMessage(worker, message) {
            throw new Error('Unimplemented dispatch message handler cannot handle ' + message.method + ' method');
        }
    }]);

    return SharedDispatch;
}();

module.exports = SharedDispatch;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* eslint-env worker */

var ArgumentType = __webpack_require__(4);
var BlockType = __webpack_require__(5);
var dispatch = __webpack_require__(3);

var ExtensionWorker = function () {
    function ExtensionWorker() {
        var _this = this;

        _classCallCheck(this, ExtensionWorker);

        this.nextExtensionId = 0;

        this.initialRegistrations = [];

        dispatch.waitForConnection.then(function () {
            dispatch.call('extensions', 'allocateWorker').then(function (x) {
                var _x = _slicedToArray(x, 2),
                    id = _x[0],
                    extension = _x[1];

                _this.workerId = id;

                try {
                    importScripts(extension);

                    var initialRegistrations = _this.initialRegistrations;
                    _this.initialRegistrations = null;

                    Promise.all(initialRegistrations).then(function () {
                        return dispatch.call('extensions', 'onWorkerInit', id);
                    });
                } catch (e) {
                    dispatch.call('extensions', 'onWorkerInit', id, e);
                }
            });
        });

        this.extensions = [];
    }

    _createClass(ExtensionWorker, [{
        key: 'register',
        value: function register(extensionObject) {
            var extensionId = this.nextExtensionId++;
            this.extensions.push(extensionObject);
            var serviceName = 'extension.' + this.workerId + '.' + extensionId;
            var promise = dispatch.setService(serviceName, extensionObject).then(function () {
                return dispatch.call('extensions', 'registerExtensionService', serviceName);
            });
            if (this.initialRegistrations) {
                this.initialRegistrations.push(promise);
            }
            return promise;
        }
    }]);

    return ExtensionWorker;
}();

global.Scratch = global.Scratch || {};
global.Scratch.ArgumentType = ArgumentType;
global.Scratch.BlockType = BlockType;

/**
 * Expose only specific parts of the worker to extensions.
 */
var extensionWorker = new ExtensionWorker();
global.Scratch.extensions = {
    register: extensionWorker.register.bind(extensionWorker)
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6)))

/***/ }),
/* 9 */
/***/ (function(module, exports) {

function M() { this._events = {}; }
M.prototype = {
  on: function(ev, cb) {
    this._events || (this._events = {});
    var e = this._events;
    (e[ev] || (e[ev] = [])).push(cb);
    return this;
  },
  removeListener: function(ev, cb) {
    var e = this._events[ev] || [], i;
    for(i = e.length-1; i >= 0 && e[i]; i--){
      if(e[i] === cb || e[i].cb === cb) { e.splice(i, 1); }
    }
  },
  removeAllListeners: function(ev) {
    if(!ev) { this._events = {}; }
    else { this._events[ev] && (this._events[ev] = []); }
  },
  listeners: function(ev) {
    return (this._events ? this._events[ev] || [] : []);
  },
  emit: function(ev) {
    this._events || (this._events = {});
    var args = Array.prototype.slice.call(arguments, 1), i, e = this._events[ev] || [];
    for(i = e.length-1; i >= 0 && e[i]; i--){
      e[i].apply(this, args);
    }
    return this;
  },
  when: function(ev, cb) {
    return this.once(ev, cb, true);
  },
  once: function(ev, cb, when) {
    if(!cb) return this;
    function c() {
      if(!when) this.removeListener(ev, c);
      if(cb.apply(this, arguments) && when) this.removeListener(ev, c);
    }
    c.cb = cb;
    this.on(ev, c);
    return this;
  }
};
M.mixin = function(dest) {
  var o = M.prototype, k;
  for (k in o) {
    o.hasOwnProperty(k) && (dest.prototype[k] = o[k]);
  }
};
module.exports = M;


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

// default filter
var Transform = __webpack_require__(0);

var levelMap = { debug: 1, info: 2, warn: 3, error: 4 };

function Filter() {
  this.enabled = true;
  this.defaultResult = true;
  this.clear();
}

Transform.mixin(Filter);

// allow all matching, with level >= given level
Filter.prototype.allow = function(name, level) {
  this._white.push({ n: name, l: levelMap[level] });
  return this;
};

// deny all matching, with level <= given level
Filter.prototype.deny = function(name, level) {
  this._black.push({ n: name, l: levelMap[level] });
  return this;
};

Filter.prototype.clear = function() {
  this._white = [];
  this._black = [];
  return this;
};

function test(rule, name) {
  // use .test for RegExps
  return (rule.n.test ? rule.n.test(name) : rule.n == name);
};

Filter.prototype.test = function(name, level) {
  var i, len = Math.max(this._white.length, this._black.length);
  for(i = 0; i < len; i++) {
    if(this._white[i] && test(this._white[i], name) && levelMap[level] >= this._white[i].l) {
      return true;
    }
    if(this._black[i] && test(this._black[i], name) && levelMap[level] <= this._black[i].l) {
      return false;
    }
  }
  return this.defaultResult;
};

Filter.prototype.write = function(name, level, args) {
  if(!this.enabled || this.test(name, level)) {
    return this.emit('item', name, level, args);
  }
};

module.exports = Filter;


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

var Transform = __webpack_require__(0),
    Filter = __webpack_require__(10);

var log = new Transform(),
    slice = Array.prototype.slice;

exports = module.exports = function create(name) {
  var o   = function() { log.write(name, undefined, slice.call(arguments)); return o; };
  o.debug = function() { log.write(name, 'debug', slice.call(arguments)); return o; };
  o.info  = function() { log.write(name, 'info',  slice.call(arguments)); return o; };
  o.warn  = function() { log.write(name, 'warn',  slice.call(arguments)); return o; };
  o.error = function() { log.write(name, 'error', slice.call(arguments)); return o; };
  o.log   = o.debug; // for interface compliance with Node and browser consoles
  o.suggest = exports.suggest;
  o.format = log.format;
  return o;
};

// filled in separately
exports.defaultBackend = exports.defaultFormatter = null;

exports.pipe = function(dest) {
  return log.pipe(dest);
};

exports.end = exports.unpipe = exports.disable = function(from) {
  return log.unpipe(from);
};

exports.Transform = Transform;
exports.Filter = Filter;
// this is the default filter that's applied when .enable() is called normally
// you can bypass it completely and set up your own pipes
exports.suggest = new Filter();

exports.enable = function() {
  if(exports.defaultFormatter) {
    return log.pipe(exports.suggest) // filter
              .pipe(exports.defaultFormatter) // formatter
              .pipe(exports.defaultBackend); // backend
  }
  return log.pipe(exports.suggest) // filter
            .pipe(exports.defaultBackend); // formatter
};



/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

var Transform = __webpack_require__(0),
    cache = [ ];

var logger = new Transform();

logger.write = function(name, level, args) {
  cache.push([ name, level, args ]);
};

// utility functions
logger.get = function() { return cache; };
logger.empty = function() { cache = []; };

module.exports = logger;


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

var Transform = __webpack_require__(0);

var newlines = /\n+$/,
    logger = new Transform();

logger.write = function(name, level, args) {
  var i = args.length-1;
  if (typeof console === 'undefined' || !console.log) {
    return;
  }
  if(console.log.apply) {
    return console.log.apply(console, [name, level].concat(args));
  } else if(JSON && JSON.stringify) {
    // console.log.apply is undefined in IE8 and IE9
    // for IE8/9: make console.log at least a bit less awful
    if(args[i] && typeof args[i] == 'string') {
      args[i] = args[i].replace(newlines, '');
    }
    try {
      for(i = 0; i < args.length; i++) {
        args[i] = JSON.stringify(args[i]);
      }
    } catch(e) {}
    console.log(args.join(' '));
  }
};

logger.formatters = ['color', 'minilog'];
logger.color = __webpack_require__(14);
logger.minilog = __webpack_require__(15);

module.exports = logger;


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

var Transform = __webpack_require__(0),
    color = __webpack_require__(2);

var colors = { debug: ['cyan'], info: ['purple' ], warn: [ 'yellow', true ], error: [ 'red', true ] },
    logger = new Transform();

logger.write = function(name, level, args) {
  var fn = console.log;
  if(console[level] && console[level].apply) {
    fn = console[level];
    fn.apply(console, [ '%c'+name+' %c'+level, color('gray'), color.apply(color, colors[level])].concat(args));
  }
};

// NOP, because piping the formatted logs can only cause trouble.
logger.pipe = function() { };

module.exports = logger;


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

var Transform = __webpack_require__(0),
    color = __webpack_require__(2),
    colors = { debug: ['gray'], info: ['purple' ], warn: [ 'yellow', true ], error: [ 'red', true ] },
    logger = new Transform();

logger.write = function(name, level, args) {
  var fn = console.log;
  if(level != 'debug' && console[level]) {
    fn = console[level];
  }

  var subset = [], i = 0;
  if(level != 'info') {
    for(; i < args.length; i++) {
      if(typeof args[i] != 'string') break;
    }
    fn.apply(console, [ '%c'+name +' '+ args.slice(0, i).join(' '), color.apply(color, colors[level]) ].concat(args.slice(i)));
  } else {
    fn.apply(console, [ '%c'+name, color.apply(color, colors[level]) ].concat(args));
  }
};

// NOP, because piping the formatted logs can only cause trouble.
logger.pipe = function() { };

module.exports = logger;


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

var Minilog = __webpack_require__(11);

var oldEnable = Minilog.enable,
    oldDisable = Minilog.disable,
    isChrome = (typeof navigator != 'undefined' && /chrome/i.test(navigator.userAgent)),
    console = __webpack_require__(13);

// Use a more capable logging backend if on Chrome
Minilog.defaultBackend = (isChrome ? console.minilog : console);

// apply enable inputs from localStorage and from the URL
if(typeof window != 'undefined') {
  try {
    Minilog.enable(JSON.parse(window.localStorage['minilogSettings']));
  } catch(e) {}
  if(window.location && window.location.search) {
    var match = RegExp('[?&]minilog=([^&]*)').exec(window.location.search);
    match && Minilog.enable(decodeURIComponent(match[1]));
  }
}

// Make enable also add to localStorage
Minilog.enable = function() {
  oldEnable.call(Minilog, true);
  try { window.localStorage['minilogSettings'] = JSON.stringify(true); } catch(e) {}
  return this;
};

Minilog.disable = function() {
  oldDisable.call(Minilog);
  try { delete window.localStorage.minilogSettings; } catch(e) {}
  return this;
};

exports = module.exports = Minilog;

exports.backends = {
  array: __webpack_require__(12),
  browser: Minilog.defaultBackend,
  localStorage: __webpack_require__(18),
  jQuery: __webpack_require__(17)
};


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

var Transform = __webpack_require__(0);

var cid = new Date().valueOf().toString(36);

function AjaxLogger(options) {
  this.url = options.url || '';
  this.cache = [];
  this.timer = null;
  this.interval = options.interval || 30*1000;
  this.enabled = true;
  this.jQuery = window.jQuery;
  this.extras = {};
}

Transform.mixin(AjaxLogger);

AjaxLogger.prototype.write = function(name, level, args) {
  if(!this.timer) { this.init(); }
  this.cache.push([name, level].concat(args));
};

AjaxLogger.prototype.init = function() {
  if(!this.enabled || !this.jQuery) return;
  var self = this;
  this.timer = setTimeout(function() {
    var i, logs = [], ajaxData, url = self.url;
    if(self.cache.length == 0) return self.init();
    // Test each log line and only log the ones that are valid (e.g. don't have circular references).
    // Slight performance hit but benefit is we log all valid lines.
    for(i = 0; i < self.cache.length; i++) {
      try {
        JSON.stringify(self.cache[i]);
        logs.push(self.cache[i]);
      } catch(e) { }
    }
    if(self.jQuery.isEmptyObject(self.extras)) {
        ajaxData = JSON.stringify({ logs: logs });
        url = self.url + '?client_id=' + cid;
    } else {
        ajaxData = JSON.stringify(self.jQuery.extend({logs: logs}, self.extras));
    }

    self.jQuery.ajax(url, {
      type: 'POST',
      cache: false,
      processData: false,
      data: ajaxData,
      contentType: 'application/json',
      timeout: 10000
    }).success(function(data, status, jqxhr) {
      if(data.interval) {
        self.interval = Math.max(1000, data.interval);
      }
    }).error(function() {
      self.interval = 30000;
    }).always(function() {
      self.init();
    });
    self.cache = [];
  }, this.interval);
};

AjaxLogger.prototype.end = function() {};

// wait until jQuery is defined. Useful if you don't control the load order.
AjaxLogger.jQueryWait = function(onDone) {
  if(typeof window !== 'undefined' && (window.jQuery || window.$)) {
    return onDone(window.jQuery || window.$);
  } else if (typeof window !== 'undefined') {
    setTimeout(function() { AjaxLogger.jQueryWait(onDone); }, 200);
  }
};

module.exports = AjaxLogger;


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

var Transform = __webpack_require__(0),
    cache = false;

var logger = new Transform();

logger.write = function(name, level, args) {
  if(typeof window == 'undefined' || typeof JSON == 'undefined' || !JSON.stringify || !JSON.parse) return;
  try {
    if(!cache) { cache = (window.localStorage.minilog ? JSON.parse(window.localStorage.minilog) : []); }
    cache.push([ new Date().toString(), name, level, args ]);
    window.localStorage.minilog = JSON.stringify(cache);
  } catch(e) {}
};

module.exports = logger;

/***/ })
/******/ ]);
//# sourceMappingURL=extension-worker.js.map