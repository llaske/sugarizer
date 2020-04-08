function Resources() {
    this.resourceCache = {};
    this.loading = [];
    this.readyCallbacks = [];

    // Load an image url or an array of image urls
    this.load = function (urlOrArr) {
      var _this = this;
        if(urlOrArr instanceof Array) {
            urlOrArr.forEach(function(url) {
                _this.loadIn(url);
            });
        }
        else {
            _this.loadIn(urlOrArr);
        }
    }

    this.loadIn = function (url) {
      var _this = this;
        if(this.resourceCache[url]) {
            return this.resourceCache[url];
        }
        else {
            var img = new Image();
            img.onload = function() {
                _this.resourceCache[url] = img;
                if(_this.isReady()) {
                    _this.readyCallbacks.forEach(function(func) { func(); });
                }
            };
            this.resourceCache[url] = false;
            img.src = url;
        }
    }

    this.get = function (url) {
        return this.resourceCache[url];
    }

    this.isReady = function () {
        var ready = true;
        for(var k in this.resourceCache) {
            if(this.resourceCache.hasOwnProperty(k) &&
               !this.resourceCache[k]) {
                ready = false;
            }
        }
        return ready;
    }

    this.onReady = function (func) {
        this.readyCallbacks.push(func);
        if(this.isReady()) {
            this.readyCallbacks.forEach(function(func) { func(); });
        }
    }

};

define(function () {
  return Resources;
});
