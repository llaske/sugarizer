/**
 * Tutorials:
 * http://www.html5rocks.com/en/tutorials/webaudio/games/
 * http://www.html5rocks.com/en/tutorials/webaudio/positional_audio/ <- +1 as it is three.js
 * http://www.html5rocks.com/en/tutorials/webaudio/intro/
 *
 * Spec:
 * https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html
 *
 * Chromium Demo:
 * http://chromium.googlecode.com/svn/trunk/samples/audio/index.html  <- running page
 * http://code.google.com/p/chromium/source/browse/trunk/samples/audio/ <- source
 */


/**
 * Notes on removing tQuery dependancy
 * * some stuff depends on tQuery
 * * find which one
 * * tQuery.Webaudio got a world link for the listener
 *   * do a plugin with followListener(world), unfollowListener(world)
 * * namespace become WebAudio.* instead of WebAudio.*
 */

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//		WebAudio							//
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////


window.AudioContext = window.AudioContext || window.webkitAudioContext;

/**
 * Main class to handle webkit audio
 *
 * TODO make the clip detector from http://www.html5rocks.com/en/tutorials/webaudio/games/
 *
 * @class Handle webkit audio API
 *
 * @param {tQuery.World} [world] the world on which to run
 */
WebAudio = function () {
    // sanity check - the api MUST be available
    if (WebAudio.isAvailable === false) {
        this._addRequiredMessage();
        // Throw an error to stop execution
        throw new Error('WebAudio API is required and not available.')
    }

    // create the context
    this._ctx = new AudioContext();
    // setup internal variable
    this._muted = false;
    this._volume = 1;

    // setup the end of the node chain
    // TODO later code the clipping detection from http://www.html5rocks.com/en/tutorials/webaudio/games/
    this._gainNode = this._ctx.createGain();
    this._compressor = this._ctx.createDynamicsCompressor();
    this._gainNode.connect(this._compressor);
    this._compressor.connect(this._ctx.destination);

    // init page visibility
    this._pageVisibilityCtor();
};


/**
 * vendor.js way to make plugins ala jQuery
 * @namespace
 */
WebAudio.fn = WebAudio.prototype;


/**
 * destructor
 */
WebAudio.prototype.destroy = function () {
    this._pageVisibilityDtor();
};

/**
 * @return {Boolean} true if it is available or not
 */
WebAudio.isAvailable = window.AudioContext ? true : false;

//////////////////////////////////////////////////////////////////////////////////
//		comment								//
//////////////////////////////////////////////////////////////////////////////////

WebAudio.prototype._addRequiredMessage = function (parent) {
    // handle defaults arguements
    parent = parent || document.body;
    // message directly taken from Detector.js
    var domElement = document.createElement('div');
    domElement.style.fontFamily = 'monospace';
    domElement.style.fontSize = '13px';
    domElement.style.textAlign = 'center';
    domElement.style.background = '#eee';
    domElement.style.color = '#000';
    domElement.style.padding = '1em';
    domElement.style.width = '475px';
    domElement.style.margin = '5em auto 0';
    domElement.innerHTML = [
        'Your browser does not seem to support <a href="https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html">WebAudio API</a>.<br />',
        'Try with <a href="https://www.google.com/intl/en/chrome/browser/">Chrome Browser</a>.'
    ].join('\n');
    // add it to the parent
    parent.appendChild(domElement);
}

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

/**
 * get the audio context
 *
 * @returns {AudioContext} the audio context
 */
WebAudio.prototype.context = function () {
    return this._ctx;
};

/**
 * Create a sound
 *
 * @returns {WebAudio.Sound} the sound just created
 */
WebAudio.prototype.createSound = function () {
    var webaudio = this;
    var sound = new WebAudio.Sound(webaudio);
    return sound;
}


/**
 * return the entry node in the master node chains
 */
WebAudio.prototype._entryNode = function () {
    //return this._ctx.destination;
    return this._gainNode;
}

//////////////////////////////////////////////////////////////////////////////////
//		volume/mute							//
//////////////////////////////////////////////////////////////////////////////////

/**
 * getter/setter on the volume
 */
WebAudio.prototype.volume = function (value) {
    if (value === undefined)    return this._volume;
    // update volume
    this._volume = value;
    // update actual volume IIF not muted
    if (this._muted === false) {
        this._gainNode.gain.value = this._volume;
    }
    // return this for chained API
    return this;
};

/**
 * getter/setter for mute
 */
WebAudio.prototype.mute = function (value) {
    if (value === undefined)    return this._muted;
    this._muted = value;
    this._gainNode.gain.value = this._muted ? 0 : this._volume;
    return this;	// for chained API
}

/**
 * to toggle the mute
 */
WebAudio.prototype.toggleMute = function () {
    if (this.mute())    this.mute(false);
    else            this.mute(true);
}

//////////////////////////////////////////////////////////////////////////////////
//		pageVisibility							//
//////////////////////////////////////////////////////////////////////////////////


WebAudio.prototype._pageVisibilityCtor = function () {
    // shim to handle browser vendor
    this._pageVisibilityEventStr = (document.hidden !== undefined ? 'visibilitychange' :
        (document.mozHidden !== undefined ? 'mozvisibilitychange' :
            (document.msHidden !== undefined ? 'msvisibilitychange' :
                (document.webkitHidden !== undefined ? 'webkitvisibilitychange' :
                    console.assert(false, "Page Visibility API unsupported")
                ))));
    this._pageVisibilityDocumentStr = (document.hidden !== undefined ? 'hidden' :
        (document.mozHidden !== undefined ? 'mozHidden' :
            (document.msHidden !== undefined ? 'msHidden' :
                (document.webkitHidden !== undefined ? 'webkitHidden' :
                    console.assert(false, "Page Visibility API unsupported")
                ))));
    // event handler for visibilitychange event
    this._$pageVisibilityCallback = function () {
        var isHidden = document[this._pageVisibilityDocumentStr] ? true : false;
        this.mute(isHidden ? true : false);
    }.bind(this);
    // bind the event itself
    document.addEventListener(this._pageVisibilityEventStr, this._$pageVisibilityCallback, false);
}

WebAudio.prototype._pageVisibilityDtor = function () {
    // unbind the event itself
    document.removeEventListener(this._pageVisibilityEventStr, this._$pageVisibilityCallback, false);
}
/**
 * Constructor
 *
 * @class builder to generate nodes chains. Used in WebAudio.Sound
 * @param {AudioContext} audioContext the audio context
 */
WebAudio.NodeChainBuilder = function (audioContext) {
    console.assert(audioContext instanceof AudioContext);
    this._context = audioContext;
    this._firstNode = null;
    this._lastNode = null;
    this._nodes = {};
};

/**
 * creator
 *
 * @param  {webkitAudioContext}    audioContext the context
 * @return {WebAudio.NodeChainBuider}    just created object
 */
WebAudio.NodeChainBuilder.create = function (audioContext) {
    return new WebAudio.NodeChainBuilder(audioContext);
}

/**
 * destructor
 */
WebAudio.NodeChainBuilder.prototype.destroy = function () {
};

//////////////////////////////////////////////////////////////////////////////////
//		getters								//
//////////////////////////////////////////////////////////////////////////////////

/**
 * getter for the nodes
 */
WebAudio.NodeChainBuilder.prototype.nodes = function () {
    return this._nodes;
}

/**
 * @returns the first node of the chain
 */
WebAudio.NodeChainBuilder.prototype.first = function () {
    return this._firstNode;
}

/**
 * @returns the last node of the chain
 */
WebAudio.NodeChainBuilder.prototype.last = function () {
    return this._lastNode;
}

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

/**
 * add a node to the chain
 * @param {[type]} node       [description]
 * @param {[type]} properties [description]
 */
WebAudio.NodeChainBuilder.prototype._addNode = function (node, properties) {
    // update this._bufferSourceDst - needed for .cloneBufferSource()
    var lastIsBufferSource = this._lastNode && ('playbackRate' in this._lastNode) ? true : false;
    if (lastIsBufferSource)    this._bufferSourceDst = node;

    // connect this._lastNode to node if suitable
    if (this._lastNode !== null)    this._lastNode.connect(node);

    // update this._firstNode && this._lastNode
    if (this._firstNode === null)    this._firstNode = node;
    this._lastNode = node;

    // apply properties to the node
    for (var property in properties) {
        node[property] = properties[property];
    }

    // for chained API
    return this;
};


//////////////////////////////////////////////////////////////////////////////////
//		creator for each type of nodes					//
//////////////////////////////////////////////////////////////////////////////////

/**
 * Clone the bufferSource. Used just before playing a sound
 * @returns {AudioBufferSourceNode} the clone AudioBufferSourceNode
 */
WebAudio.NodeChainBuilder.prototype.cloneBufferSource = function () {
    console.assert(this._nodes.bufferSource, "no buffersource presents. Add one.");
    var orig = this._nodes.bufferSource;
    var clone = this._context.createBufferSource()
    clone.buffer = orig.buffer;
    clone.playbackRate = orig.playbackRate;
    clone.loop = orig.loop;
    clone.connect(this._bufferSourceDst);
    return clone;
}

/**
 * add a bufferSource
 *
 * @param {Object} [properties] properties to set in the created node
 */
WebAudio.NodeChainBuilder.prototype.bufferSource = function (properties) {
    var node = this._context.createBufferSource()
    this._nodes.bufferSource = node;
    return this._addNode(node, properties)
};

/**
 * add a createMediaStreamSource
 *
 * @param {Object} [properties] properties to set in the created node
 */
WebAudio.NodeChainBuilder.prototype.mediaStreamSource = function (stream, properties) {
//	console.assert( stream instanceof LocalMediaStream )
    var node = this._context.createMediaStreamSource(stream)
    this._nodes.bufferSource = node;
    return this._addNode(node, properties)
};

/**
 * add a createMediaElementSource
 * @param  {HTMLElement} element    the element to add
 * @param {Object} [properties] properties to set in the created node
 */
WebAudio.NodeChainBuilder.prototype.mediaElementSource = function (element, properties) {
    console.assert(element instanceof HTMLAudioElement || element instanceof HTMLVideoElement)
    var node = this._context.createMediaElementSource(element)
    this._nodes.bufferSource = node;
    return this._addNode(node, properties)
};

/**
 * add a panner
 *
 * @param {Object} [properties] properties to set in the created node
 */
WebAudio.NodeChainBuilder.prototype.panner = function (properties) {
    var node = this._context.createPanner()
    this._nodes.panner = node;
    return this._addNode(node, properties)
};

/**
 * add a analyser
 *
 * @param {Object} [properties] properties to set in the created node
 */
WebAudio.NodeChainBuilder.prototype.analyser = function (properties) {
    var node = this._context.createAnalyser()
    this._nodes.analyser = node;
    return this._addNode(node, properties)
};

/**
 * add a gainNode
 *
 * @param {Object} [properties] properties to set in the created node
 */
WebAudio.NodeChainBuilder.prototype.gainNode = function (properties) {
    var node = this._context.createGain()
    this._nodes.gainNode = node;
    return this._addNode(node, properties)
};

/**
 * sound instance
 *
 * @class Handle one sound for WebAudio
 *
 * @param {tQuery.World} [world] the world on which to run
 * @param {WebAudio.NodeChainBuilder} [nodeChain] the nodeChain to use
 */
WebAudio.Sound = function (webaudio, nodeChain) {
    this._webaudio = webaudio;
    this._context = this._webaudio.context();

    console.assert(this._webaudio instanceof WebAudio);

    // create a default NodeChainBuilder if needed
    if (nodeChain === undefined) {
        nodeChain = new WebAudio.NodeChainBuilder(this._context)
            .bufferSource().gainNode().analyser().panner();
    }
    // setup this._chain
    console.assert(nodeChain instanceof WebAudio.NodeChainBuilder);
    this._chain = nodeChain;
    // connect this._chain.last() node to this._webaudio._entryNode()
    this._chain.last().connect(this._webaudio._entryNode());

    // create some alias
    this._source = this._chain.nodes().bufferSource;
    this._gainNode = this._chain.nodes().gainNode;
    this._analyser = this._chain.nodes().analyser;
    this._panner = this._chain.nodes().panner;

    // sanity check
    console.assert(this._source, "no bufferSource: not yet supported")
    console.assert(this._gainNode, "no gainNode: not yet supported")
    console.assert(this._analyser, "no analyser: not yet supported")
    console.assert(this._panner, "no panner: not yet supported")
};

WebAudio.Sound.create = function (webaudio, nodeChain) {
    return new WebAudio.Sound(webaudio, nodeChain);
}

/**
 * destructor
 */
WebAudio.Sound.prototype.destroy = function () {
    // disconnect from this._webaudio
    this._chain.last().disconnect();
    // destroy this._chain
    this._chain.destroy();
    this._chain = null;
};

/**
 * vendor.js way to make plugins ala jQuery
 * @namespace
 */
WebAudio.Sound.fn = WebAudio.Sound.prototype;

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

/**
 * getter of the chain nodes
 */
WebAudio.Sound.prototype.nodes = function () {
    return this._chain.nodes();
};

/**
 * @returns {Boolean} true if the sound is playable, false otherwise
 */
WebAudio.Sound.prototype.isPlayable = function () {
    return this._source.buffer ? true : false;
};

/**
 * play the sound
 *
 * @param {Number} [time] time when to play the sound
 */
WebAudio.Sound.prototype.play = function (time) {
    // handle parameter polymorphism
    if (time === undefined)    time = 0;
    // if not yet playable, ignore
    // - usefull when the sound download isnt yet completed
    if (this.isPlayable() === false)    return;
    // clone the bufferSource
    var clonedNode = this._chain.cloneBufferSource();
    // set the noteOn
    clonedNode.start(time);
    // create the source object
    var source = {
        node: clonedNode,
        stop: function (time) {
            if (time === undefined)    time = 0;
            this.node.stop(time);
            return source;	// for chained API
        }
    }
    // return it
    return source;
};

/**
 * getter/setter on the volume
 *
 * @param {Number} [value] the value to set, if not provided, get current value
 */
WebAudio.Sound.prototype.volume = function (value) {
    if (value === undefined)    return this._gainNode.gain.value;
    this._gainNode.gain.value = value;
    return this;	// for chained API
};


/**
 * getter/setter on the loop
 *
 * @param {Number} [value] the value to set, if not provided, get current value
 */
WebAudio.Sound.prototype.loop = function (value) {
    if (value === undefined)    return this._source.loop;
    this._source.loop = value;
    return this;	// for chained API
};

/**
 * getter/setter on the source buffer
 *
 * @param {Number} [value] the value to set, if not provided, get current value
 */
WebAudio.Sound.prototype.buffer = function (value) {
    if (value === undefined)    return this._source.buffer;
    this._source.buffer = value;
    return this;	// for chained API
};


/**
 * Set parameter for the pannerCone
 *
 * @param {Number} innerAngle the inner cone hangle in radian
 * @param {Number} outerAngle the outer cone hangle in radian
 * @param {Number} outerGain the gain to apply when in the outerCone
 */
WebAudio.Sound.prototype.pannerCone = function (innerAngle, outerAngle, outerGain) {
    this._panner.coneInnerAngle = innerAngle * 180 / Math.PI;
    this._panner.coneOuterAngle = outerAngle * 180 / Math.PI;
    this._panner.coneOuterGain = outerGain;
    return this;	// for chained API
};

/**
 * getter/setter on the pannerConeInnerAngle
 *
 * @param {Number} value the angle in radian
 */
WebAudio.Sound.prototype.pannerConeInnerAngle = function (value) {
    if (value === undefined)    return this._panner.coneInnerAngle / 180 * Math.PI;
    this._panner.coneInnerAngle = value * 180 / Math.PI;
    return this;	// for chained API
};

/**
 * getter/setter on the pannerConeOuterAngle
 *
 * @param {Number} value the angle in radian
 */
WebAudio.Sound.prototype.pannerConeOuterAngle = function (value) {
    if (value === undefined)    return this._panner.coneOuterAngle / 180 * Math.PI;
    this._panner.coneOuterAngle = value * 180 / Math.PI;
    return this;	// for chained API
};

/**
 * getter/setter on the pannerConeOuterGain
 *
 * @param {Number} value the value
 */
WebAudio.Sound.prototype.pannerConeOuterGain = function (value) {
    if (value === undefined)    return this._panner.coneOuterGain;
    this._panner.coneOuterGain = value;
    return this;	// for chained API
};

/**
 * compute the amplitude of the sound (not sure at all it is the proper term)
 *
 * @param {Number} width the number of frequencyBin to take into account
 * @returns {Number} return the amplitude of the sound
 */
WebAudio.Sound.prototype.amplitude = function (width) {
    // handle paramerter
    width = width !== undefined ? width : 2;
    // inint variable
    var analyser = this._analyser;
    var freqByte = new Uint8Array(analyser.frequencyBinCount);
    // get the frequency data
    analyser.getByteFrequencyData(freqByte);
    // compute the sum
    var sum = 0;
    for (var i = 0; i < width; i++) {
        sum += freqByte[i];
    }
    // complute the amplitude
    var amplitude = sum / (width * 256 - 1);
    // return ampliture
    return amplitude;
}

/**
 * Generate a sinusoid buffer.
 * FIXME should likely be in a plugin
 */
WebAudio.Sound.prototype.tone = function (hertz, seconds) {
    // handle parameter
    hertz = hertz !== undefined ? hertz : 200;
    seconds = seconds !== undefined ? seconds : 1;
    // set default value
    var nChannels = 1;
    var sampleRate = 44100;
    var amplitude = 2;
    // create the buffer
    var buffer = this._webaudio.context().createBuffer(nChannels, seconds * sampleRate, sampleRate);
    var fArray = buffer.getChannelData(0);
    // fill the buffer
    for (var i = 0; i < fArray.length; i++) {
        var time = i / buffer.sampleRate;
        var angle = hertz * time * Math.PI;
        fArray[i] = Math.sin(angle) * amplitude;
    }
    // set the buffer
    this.buffer(buffer);
    return this;	// for chained API
}


/**
 * Put this function is .Sound with getByt as private callback
 */
WebAudio.Sound.prototype.makeHistogram = function (nBar) {
    // get analyser node
    var analyser = this._analyser;
    // allocate the private histo if needed - to avoid allocating at every frame
    //this._privHisto	= this._privHisto || new Float32Array(analyser.frequencyBinCount);
    this._privHisto = this._privHisto || new Uint8Array(analyser.frequencyBinCount);
    // just an alias
    var freqData = this._privHisto;

    // get the data
    //analyser.getFloatFrequencyData(freqData);
    analyser.getByteFrequencyData(freqData);
    //analyser.getByteTimeDomainData(freqData);

    /**
     * This should be in imageprocessing.js almost
     */
    var makeHisto = function (srcArr, dstLength) {
        var barW = Math.floor(srcArr.length / dstLength);
        var nBar = Math.floor(srcArr.length / barW);
        var arr = []
        for (var x = 0, arrIdx = 0; x < srcArr.length; arrIdx++) {
            var sum = 0;
            for (var i = 0; i < barW; i++, x++) {
                sum += srcArr[x];
            }
            var average = sum / barW;
            arr[arrIdx] = average;
        }
        return arr;
    }
    // build the histo
    var histo = makeHisto(freqData, nBar);
    // return it
    return histo;
}

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

/**
 * Load a sound
 *
 * @param {String} url the url of the sound to load
 * @param {Function} onSuccess function to notify once the url is loaded (optional)
 * @param {Function} onError function to notify if an error occurs (optional)
 */
WebAudio.Sound.prototype.load = function (url, onSuccess, onError) {
    // handle default arguments
    onError = onError || function () {
        console.warn("unable to load sound " + url);
    };
    // try to load the user
    this._loadAndDecodeSound(url, function (buffer) {
        this._source.buffer = buffer;
        onSuccess && onSuccess(this);
    }.bind(this), function () {
        onError && onError(this);
    }.bind(this));
    return this;	// for chained API
};

/**
 * Load and decode a sound
 *
 * @param {String} url the url where to get the sound
 * @param {Function} onLoad the function called when the sound is loaded and decoded (optional)
 * @param {Function} onError the function called when an error occured (optional)
 */
WebAudio.Sound.prototype._loadAndDecodeSound = function (url, onLoad, onError) {
    var context = this._context;

    context.decodeAudioData(url, function (buffer) {
        console.log("OK")
        onLoad && onLoad(buffer);
    }, function () {
        console.log("KO")
        onError && onError();
    });
}
/**
 * gowiththeflow.js - a javascript flow control micro library
 * https://github.com/jeromeetienne/gowiththeflow.js
 */
WebAudio.Flow = function () {
    var self, stack = [], timerId = setTimeout(function () {
        timerId = null;
        self._next();
    }, 0);
    return self = {
        destroy: function () {
            timerId && clearTimeout(timerId);
        },
        par: function (callback, isSeq) {
            if (isSeq || !(stack[stack.length - 1] instanceof Array)) stack.push([]);
            stack[stack.length - 1].push(callback);
            return self;
        }, seq: function (callback) {
            return self.par(callback, true);
        },
        _next: function (err, result) {
            var errors = [], results = [], callbacks = stack.shift() || [], nbReturn = callbacks.length, isSeq = nbReturn == 1;
            for (var i = 0; i < callbacks.length; i++) {
                (function (fct, index) {
                    fct(function (error, result) {
                        errors[index] = error;
                        results[index] = result;
                        if (--nbReturn == 0)    self._next(isSeq ? errors[0] : errors, isSeq ? results[0] : results)
                    }, err, result)
                })(callbacks[i], i);
            }
        }
    }
};
