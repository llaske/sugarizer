! function(t) {
    if ("object" == typeof exports && "undefined" != typeof module) module.exports = t();
    else if ("function" == typeof define && define.amd) define([], t);
    else {
        var e;
        e = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this, e.functionPlot = t()
    }
}(function() {
    return function t(e, n, r) {
        function i(a, o) {
            if (!n[a]) {
                if (!e[a]) {
                    var l = "function" == typeof require && require;
                    if (!o && l) return l(a, !0);
                    if (s) return s(a, !0);
                    var c = new Error("Cannot find module '" + a + "'");
                    throw c.code = "MODULE_NOT_FOUND", c
                }
                var u = n[a] = {
                    exports: {}
                };
                e[a][0].call(u.exports, function(t) {
                    var n = e[a][1][t];
                    return i(n ? n : t)
                }, u, u.exports, t, e, n, r)
            }
            return n[a].exports
        }
        for (var s = "function" == typeof require && require, a = 0; a < r.length; a++) i(r[a]);
        return i
    }({
        1: [function(t, e) {
            "use strict";
            var n, r, i = window.d3,
                s = t("events"),
                a = t("extend"),
                o = t("./lib/tip"),
                l = t("./lib/utils"),
                c = t("./lib/helper/"),
                u = l.assert;
            e.exports = function(t) {
                function e() {
                    this.id = t.target, this.linkedGraphs = [this], this.setVars(), this.build(), this.setUpEventListeners()
                }
                t = t || {}, t.data = t.data || [];
                var l, h, p, f, d, v, m = i.svg.line().x(function(t) {
                    return d(t[0])
                }).y(function(t) {
                    return v(t[1])
                });
                return e.prototype = Object.create(s.prototype), e.prototype.updateBounds = function() {
                    l = this.meta.width = (t.width || n.DEFAULT_WIDTH) - p.left - p.right, h = this.meta.height = (t.height || n.DEFAULT_HEIGHT) - p.top - p.bottom;
                    var e = this.meta.xDomain,
                        r = this.meta.yDomain,
                        s = i.format("s"),
                        a = i.format(".0r"),
                        o = function(t) {
                            return Math.abs(t) >= 1 ? s(t) : a(t)
                        };
                    d = this.meta.xScale = i.scale.linear().domain(e).range([0, l]), v = this.meta.yScale = i.scale.linear().domain(r).range([h, 0]), this.meta.xAxis = i.svg.axis().scale(d).orient("bottom").tickFormat(o), this.meta.yAxis = i.svg.axis().scale(v).orient("left").tickFormat(o)
                }, e.prototype.setVars = function() {
                    var e = 10;
                    this.meta = {}, p = this.meta.margin = {
                        left: 30,
                        right: 30,
                        top: 20,
                        bottom: 20
                    }, f = this.meta.zoomBehavior = i.behavior.zoom();
                    var n = this.meta.xDomain = t.xDomain || [-e / 2, e / 2],
                        r = this.meta.yDomain = t.yDomain || [-e / 2, e / 2];
                    u(n[0] < n[1]), u(r[0] < r[1]), t.title && (this.meta.margin.top = 40), this.updateBounds()
                }, e.prototype.build = function() {
                    var e = this.root = i.select(t.target).selectAll("svg").data([t]);
                    this.root.enter = e.enter().append("svg").attr("class", "function-plot").attr("font-size", this.getFontSize()), e.attr("width", l + p.left + p.right).attr("height", h + p.top + p.bottom), this.buildTitle(), this.buildLegend(), this.buildCanvas(), this.buildClip(), this.buildAxis(), this.buildContent();
                    var n = this.tip = o(a(t.tip, {
                        owner: this
                    }));
                    this.canvas.call(n), this.buildZoomHelper()
                }, e.prototype.buildTitle = function() {
                    var e = this.root.selectAll("text.title").data(function(t) {
                        return [t.title].filter(Boolean)
                    });
                    e.enter().append("text").attr("class", "title").attr("y", p.top / 2).attr("x", p.left + l / 2).attr("font-size", 25).attr("text-anchor", "middle").attr("alignment-baseline", "middle").text(t.title), e.exit().remove()
                }, e.prototype.buildLegend = function() {
                    this.root.enter.append("text").attr("class", "top-right-legend").attr("text-anchor", "end"), this.root.select(".top-right-legend").attr("y", p.top).attr("x", l + p.left)
                }, e.prototype.buildCanvas = function() {
                    var e = this;
                    this.meta.zoomBehavior.x(d).y(v).scaleExtent([1e-5, 1 / 0]).on("zoom", function() {
                        e.emit("all:zoom", d, v)
                    });
                    var n = this.canvas = this.root.selectAll(".canvas").data(function(t) {
                        return [t]
                    });
                    this.canvas.enter = n.enter().append("g").attr("class", "canvas"), n.attr("transform", "translate(" + p.left + "," + p.top + ")").call(f).each(function() {
                        var e = i.select(this);
                        t.disableZoom && e.on(".zoom", null)
                    })
                }, e.prototype.buildClip = function() {
                    var t = this.id,
                        e = this.canvas.enter.append("defs");
                    e.append("clipPath").attr("id", "function-plot-clip-" + t).append("rect").attr("class", "clip static-clip"), this.canvas.selectAll(".clip").attr("width", l).attr("height", h)
                }, e.prototype.buildAxis = function() {
                    var t = this.canvas.enter;
                    t.append("g").attr("class", "x axis"), t.append("g").attr("class", "y axis"), this.canvas.select(".x.axis").attr("transform", "translate(0," + h + ")").call(this.meta.xAxis), this.canvas.select(".y.axis").call(this.meta.yAxis), this.canvas.selectAll(".axis path, .axis line").attr("fill", "none").attr("stroke", "black").attr("shape-rendering", "crispedges").attr("opacity", .1)
                }, e.prototype.buildAxisLabel = function() {
                    var t, e, n = this.canvas;
                    t = n.selectAll("text.x.axis-label").data(function(t) {
                        return [t.xLabel].filter(Boolean)
                    }), t.enter().append("text").attr("class", "x axis-label").attr("text-anchor", "end"), t.attr("x", l).attr("y", h - 6).text(function(t) {
                        return t
                    }), t.exit().remove(), e = n.selectAll("text.y.axis-label").data(function(t) {
                        return [t.yLabel].filter(Boolean)
                    }), e.enter().append("text").attr("class", "y axis-label").attr("y", 6).attr("dy", ".75em").attr("text-anchor", "end").attr("transform", "rotate(-90)"), e.text(function(t) {
                        return t
                    }), e.exit().remove()
                }, e.prototype.buildContent = function() {
                    var t = this,
                        e = this.canvas,
                        n = this.content = e.selectAll("g.content").data(function(t) {
                            return [t]
                        });
                    n.enter().append("g").attr("clip-path", "url(#function-plot-clip-" + this.id + ")").attr("class", "content");
                    var s = n.selectAll("path.y.origin").data([
                        [
                            [0, v.domain()[0]],
                            [0, v.domain()[1]]
                        ]
                    ]);
                    s.enter().append("path").attr("class", "y origin").attr("stroke", "#eee"), s.attr("d", m);
                    var o = n.selectAll("path.x.origin").data([
                        [
                            [d.domain()[0], 0],
                            [d.domain()[1], 0]
                        ]
                    ]);
                    o.enter().append("path").attr("class", "x origin").attr("stroke", "#eee"), o.attr("d", m);
                    var l = n.selectAll("g.graph").data(function(t) {
                        return t.data
                    });
                    l.enter().append("g").attr("class", "graph"), l.each(function(e, n) {
                        var s = a({
                                owner: t,
                                index: n
                            }, e.graphOptions),
                            o = s.type || "line";
                        i.select(this).call(r[o](s)), i.select(this).call(c(s))
                    })
                }, e.prototype.buildZoomHelper = function() {
                    var t = this;
                    this.canvas.enter.append("rect").attr("class", "zoom-and-drag").style("fill", "none").style("pointer-events", "all"), this.canvas.select(".zoom-and-drag").attr("width", l).attr("height", h).on("mouseover", function() {
                        t.emit("all:mouseover")
                    }).on("mouseout", function() {
                        t.emit("all:mouseout")
                    }).on("mousemove", function() {
                        t.emit("all:mousemove")
                    })
                }, e.prototype.addLink = function() {
                    for (var t = 0; t < arguments.length; t += 1) this.linkedGraphs.push(arguments[t])
                }, e.prototype.getFontSize = function() {
                    var fontSize = Math.max(Math.max(l, h) / 60, 8)
                    if (fontSize > 15) {
                      fontSize = 15;
                    }
                    return fontSize
                }, e.prototype.setUpEventListeners = function() {
                    var t = this,
                        e = {
                            mousemove: function(e, n) {
                                t.tip.move(e, n)
                            },
                            mouseover: function() {
                                t.tip.show()
                            },
                            mouseout: function() {
                                t.tip.hide()
                            },
                            draw: function() {
                                t.buildContent()
                            },
                            "zoom:scaleUpdate": function(t, e) {
                                f.x(d.domain(t.domain())).y(v.domain(e.domain()))
                            },
                            "tip:update": function(e, r, i) {
                                var s = t.root.datum().data[i],
                                    a = s.title || "",
                                    o = s.renderer || function(t, e) {
                                        return t.toFixed(3) + ", " + e.toFixed(3)
                                    },
                                    l = [];
                                a && l.push(a), l.push(o(e, r)), t.root.select(".top-right-legend").attr("fill", n.COLORS[i]).text(l.join(" "))
                            }
                        },
                        r = {
                            mousemove: function() {
                                var e = i.mouse(t.root.select("rect.zoom-and-drag").node()),
                                    n = d.invert(e[0]),
                                    r = v.invert(e[1]);
                                t.linkedGraphs.forEach(function(t) {
                                    t.emit("mousemove", n, r)
                                })
                            },
                            zoom: function(e, n) {
                                t.linkedGraphs.forEach(function(t, r) {
                                    var i = t.canvas;
                                    i.select(".x.axis").call(t.meta.xAxis), i.select(".y.axis").call(t.meta.yAxis), r && t.emit("zoom:scaleUpdate", e, n), t.emit("draw")
                                }), t.emit("all:mousemove")
                            }
                        };
                    Object.keys(e).forEach(function(n) {
                        t.on(n, e[n]), !r[n] && t.on("all:" + n, function() {
                            var e = Array.prototype.slice.call(arguments);
                            t.linkedGraphs.forEach(function(t) {
                                var r = e.slice();
                                r.unshift(n), t.emit.apply(t, r)
                            })
                        })
                    }), Object.keys(r).forEach(function(e) {
                        t.on("all:" + e, r[e])
                    })
                }, new e
            }, n = e.exports.constants = t("./lib/constants"), r = e.exports.types = t("./lib/types/")
        }, {
            "./lib/constants": 3,
            "./lib/helper/": 6,
            "./lib/tip": 7,
            "./lib/types/": 8,
            "./lib/utils": 11,
            events: 2,
            extend: 12
        }],
        2: [function(t, e) {
            function n() {
                this._events = this._events || {}, this._maxListeners = this._maxListeners || void 0
            }

            function r(t) {
                return "function" == typeof t
            }

            function i(t) {
                return "number" == typeof t
            }

            function s(t) {
                return "object" == typeof t && null !== t
            }

            function a(t) {
                return void 0 === t
            }
            e.exports = n, n.EventEmitter = n, n.prototype._events = void 0, n.prototype._maxListeners = void 0, n.defaultMaxListeners = 10, n.prototype.setMaxListeners = function(t) {
                if (!i(t) || 0 > t || isNaN(t)) throw TypeError("n must be a positive number");
                return this._maxListeners = t, this
            }, n.prototype.emit = function(t) {
                var e, n, i, o, l, c;
                if (this._events || (this._events = {}), "error" === t && (!this._events.error || s(this._events.error) && !this._events.error.length)) {
                    if (e = arguments[1], e instanceof Error) throw e;
                    throw TypeError('Uncaught, unspecified "error" event.')
                }
                if (n = this._events[t], a(n)) return !1;
                if (r(n)) switch (arguments.length) {
                    case 1:
                        n.call(this);
                        break;
                    case 2:
                        n.call(this, arguments[1]);
                        break;
                    case 3:
                        n.call(this, arguments[1], arguments[2]);
                        break;
                    default:
                        for (i = arguments.length, o = new Array(i - 1), l = 1; i > l; l++) o[l - 1] = arguments[l];
                        n.apply(this, o)
                } else if (s(n)) {
                    for (i = arguments.length, o = new Array(i - 1), l = 1; i > l; l++) o[l - 1] = arguments[l];
                    for (c = n.slice(), i = c.length, l = 0; i > l; l++) c[l].apply(this, o)
                }
                return !0
            }, n.prototype.addListener = function(t, e) {
                var i;
                if (!r(e)) throw TypeError("listener must be a function");
                if (this._events || (this._events = {}), this._events.newListener && this.emit("newListener", t, r(e.listener) ? e.listener : e), this._events[t] ? s(this._events[t]) ? this._events[t].push(e) : this._events[t] = [this._events[t], e] : this._events[t] = e, s(this._events[t]) && !this._events[t].warned) {
                    var i;
                    i = a(this._maxListeners) ? n.defaultMaxListeners : this._maxListeners, i && i > 0 && this._events[t].length > i && (this._events[t].warned = !0, console.error("(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit.", this._events[t].length), "function" == typeof console.trace && console.trace())
                }
                return this
            }, n.prototype.on = n.prototype.addListener, n.prototype.once = function(t, e) {
                function n() {
                    this.removeListener(t, n), i || (i = !0, e.apply(this, arguments))
                }
                if (!r(e)) throw TypeError("listener must be a function");
                var i = !1;
                return n.listener = e, this.on(t, n), this
            }, n.prototype.removeListener = function(t, e) {
                var n, i, a, o;
                if (!r(e)) throw TypeError("listener must be a function");
                if (!this._events || !this._events[t]) return this;
                if (n = this._events[t], a = n.length, i = -1, n === e || r(n.listener) && n.listener === e) delete this._events[t], this._events.removeListener && this.emit("removeListener", t, e);
                else if (s(n)) {
                    for (o = a; o-- > 0;)
                        if (n[o] === e || n[o].listener && n[o].listener === e) {
                            i = o;
                            break
                        }
                    if (0 > i) return this;
                    1 === n.length ? (n.length = 0, delete this._events[t]) : n.splice(i, 1), this._events.removeListener && this.emit("removeListener", t, e)
                }
                return this
            }, n.prototype.removeAllListeners = function(t) {
                var e, n;
                if (!this._events) return this;
                if (!this._events.removeListener) return 0 === arguments.length ? this._events = {} : this._events[t] && delete this._events[t], this;
                if (0 === arguments.length) {
                    for (e in this._events) "removeListener" !== e && this.removeAllListeners(e);
                    return this.removeAllListeners("removeListener"), this._events = {}, this
                }
                if (n = this._events[t], r(n)) this.removeListener(t, n);
                else
                    for (; n.length;) this.removeListener(t, n[n.length - 1]);
                return delete this._events[t], this
            }, n.prototype.listeners = function(t) {
                var e;
                return e = this._events && this._events[t] ? r(this._events[t]) ? [this._events[t]] : this._events[t].slice() : []
            }, n.listenerCount = function(t, e) {
                var n;
                return n = t._events && t._events[e] ? r(t._events[e]) ? 1 : t._events[e].length : 0
            }
        }, {}],
        3: [function(t, e) {
            "use strict";
            var n = window.d3;
            e.exports = {
                COLORS: ["steelblue", "red", "#05b378", "orange", "#4040e8", "yellow"].map(function(t) {
                    return n.hsl(t)
                }),
                ITERATIONS_LIMIT: 1e3,
                DEFAULT_WIDTH: 550,
                DEFAULT_HEIGHT: 350,
                TIP_X_EPS: 1
            }
        }, {}],
        4: [function(t, e) {
            "use strict";
            var n = t("./utils"),
                r = t("./constants"),
                i = n.assert;
            e.exports = {
                range: function(t, e) {
                    var n = e.range || [-1 / 0, 1 / 0],
                        r = t.meta.xScale,
                        i = Math.max(r.domain()[0], n[0]),
                        s = Math.min(r.domain()[1], n[1]);
                    return [i, s]
                },
                eval: function(t, e) {
                    i("function" == typeof e.fn);
                    var s = [],
                        a = this.range(t, e),
                        o = a[0],
                        l = a[1],
                        c = e.samples || 100,
                        u = e.deltaX;
                    u || (u = (l - o) / c);
                    var h = (l - o) / u;
                    h = h || 1, i(h >= 0), h > r.ITERATIONS_LIMIT && (h = r.ITERATIONS_LIMIT, u = (l - o) / h);
                    for (var p = 0; h >= p; p += 1) {
                        var f = o + u * p,
                            d = e.fn(f);
                        n.isValidNumber(f) && n.isValidNumber(d) && s.push([f, d])
                    }
                    return s = this.split(s, e.graphOptions)
                },
                split: function(t, e) {
                    e = e || {};
                    var n = .001,
                        r = Array.prototype.slice.call(e.limits || []),
                        i = [],
                        s = 0,
                        a = 1,
                        o = [];
                    for (r.unshift(-1e8), r.push(1e8); s < t.length;) {
                        for (; s < t.length && t[s][0] < r[a - 1] + n;) ++s;
                        for (o = []; s < t.length && t[s][0] >= r[a - 1] + n && t[s][0] <= r[a] - n;) o.push(t[s++]);
                        ++a, o.length && i.push(o)
                    }
                    return i
                }
            }
        }, {
            "./constants": 3,
            "./utils": 11
        }],
        5: [function(t, e) {
            "use strict";
            var n = window.d3,
                r = t("../types/line");
            e.exports = function(t) {
                function e(t) {
                    var e = t.derivative.x0,
                        n = t.fn(e),
                        r = t.derivative.fn(e);
                    a.fn = function(t) {
                        return r * (t - e) + n
                    }
                }

                function i(e) {
                    var n = this;
                    e.derivative.updateOnMouseOver && !e.derivative.$$mouseListener && (e.derivative.$$mouseListener = function(t) {
                        e.derivative.x0 = t, s(n)
                    }, t.owner.on("tip:update", e.derivative.$$mouseListener))
                }
                var s, a = {
                    skipTip: !0
                };
                return s = function(s) {
                    s.each(function(o) {
                        var l = n.select(this);
                        e.call(s, o), i.call(s, o);
                        var c = l.selectAll("g.derivative").data([a]);
                        c.enter().append("g").attr("class", "derivative"), c.call(r(t)), c.selectAll("path").attr("opacity", .5)
                    })
                }
            }
        }, {
            "../types/line": 9
        }],
        6: [function(t, e) {
            "use strict";
            var n = window.d3,
                r = t("./derivative");
            e.exports = function(t) {
                function e(e) {
                    e.each(function(e) {
                        var i = n.select(this);
                        e.derivative && i.call(r(t))
                    })
                }
                return e
            }
        }, {
            "./derivative": 5
        }],
        7: [function(t, e) {
            "use strict";
            var n = window.d3,
                r = t("extend"),
                i = t("./utils"),
                s = t("./constants");
            e.exports = function(t) {
                function e(t, e) {
                    return t.append("path").datum(e).attr("stroke", "grey").attr("stroke-dasharray", "5,5").attr("opacity", .5).attr("d", l)
                }

                function a(r) {
                    var i = r.selectAll("g.tip").data(function(t) {
                        return [t]
                    });
                    i.enter().append("g").attr("class", "tip").attr("clip-path", "url(#function-plot-clip-" + t.owner.id + ")"), a.el = i.selectAll("g.inner-tip").data(function(t) {
                        return [t]
                    }), a.el.enter().append("g").attr("class", "inner-tip").style("display", "none").each(function() {
                        var r = n.select(this);
                        e(r, [
                            [0, -t.owner.meta.height - o],
                            [0, t.owner.meta.height + o]
                        ]).attr("class", "tip-x-line").style("display", "none"), e(r, [
                            [-t.owner.meta.width - o, 0],
                            [t.owner.meta.width + o, 0]
                        ]).attr("class", "tip-y-line").style("display", "none"), r.append("circle").attr("r", 3), r.append("text").attr("transform", "translate(5,-5)")
                    }), r.selectAll(".tip-x-line").style("display", t.xLine ? null : "none"), r.selectAll(".tip-y-line").style("display", t.yLine ? null : "none")
                }
                t = r({
                    xLine: !1,
                    yLine: !1,
                    renderer: function(t, e) {
                        return "(" + t.toFixed(3) + ", " + e.toFixed(3) + ")"
                    },
                    owner: null
                }, t);
                var o = 20,
                    l = n.svg.line().x(function(t) {
                        return t[0]
                    }).y(function(t) {
                        return t[1]
                    });
                return a.move = function(e, n) {
                    var r, l, c, u = 1 / 0,
                        h = -1,
                        p = a.el,
                        f = 1e8,
                        d = t.owner.meta,
                        v = p.data()[0].data,
                        m = d.xScale,
                        y = d.yScale,
                        x = d.width,
                        g = d.height;
                    for (r = 0; r < v.length; r += 1)
                        if (!v[r].skipTip) {
                            var b = v[r].range || [-f, f];
                            if (e > b[0] - s.TIP_X_EPS && e < b[1] + s.TIP_X_EPS) {
                                var w = v[r].fn(e);
                                if (i.isValidNumber(w)) {
                                    var _ = Math.abs(w - n);
                                    u > _ && (u = _, h = r)
                                }
                            }
                        }
                    if (-1 !== h) {
                        l = e, v[h].range && (l = Math.max(l, v[h].range[0]), l = Math.min(l, v[h].range[1])), c = v[h].fn(l), a.show(), t.owner.emit("tip:update", l, c, h);
                        var L = i.restrict(l, m.invert(-o), m.invert(x + o)),
                            A = i.restrict(c, y.invert(g + o), y.invert(-o));
                        p.attr("transform", "translate(" + m(L) + "," + y(A) + ")"), p.select("circle").attr("fill", s.COLORS[h]), p.select("text").attr("fill", s.COLORS[h]).text(t.renderer(l, c))
                    } else a.hide()
                }, a.show = function() {
                    this.el.style("display", null)
                }, a.hide = function() {
                    this.el.style("display", "none")
                }, Object.keys(t).forEach(function(e) {
                    i.getterSetter.call(a, t, e)
                }), a
            }
        }, {
            "./constants": 3,
            "./utils": 11,
            extend: 12
        }],
        8: [function(t, e) {
            "use strict";
            e.exports = {
                line: t("./line"),
                scatter: t("./scatter")
            }
        }, {
            "./line": 9,
            "./scatter": 10
        }],
        9: [function(t, e) {
            "use strict";
            var n = window.d3,
                r = t("../constants"),
                i = t("../data");
            e.exports = function(t) {
                function e(s) {
                    var a = t.index;
                    s.each(function(s) {
                        var c = e.el = n.select(this),
                            u = i.eval(t.owner, s),
                            h = c.selectAll("path").data(u);
                        h.enter().append("path").attr("class", "line line-" + a).attr("stroke", r.COLORS[a]), h.each(function() {
                            var e, i = n.select(this);
                            t.closed ? (i.attr("fill", r.COLORS[a]), i.attr("fill-opacity", .3), e = l) : (i.attr("fill", "none"), e = o), i.attr("d", e)
                        }), h.exit().remove()
                    })
                }
                var s = t.owner.meta.xScale,
                    a = t.owner.meta.yScale,
                    o = n.svg.line().interpolate(t.interpolate || "cardinal").x(function(t) {
                        return s(t[0])
                    }).y(function(t) {
                        return a(t[1])
                    }),
                    l = n.svg.area().x(function(t) {
                        return s(t[0])
                    }).y0(a(0)).y1(function(t) {
                        return a(t[1])
                    });
                return e
            }
        }, {
            "../constants": 3,
            "../data": 4
        }],
        10: [function(t, e) {
            "use strict";
            var n = window.d3,
                r = t("../constants"),
                i = t("../data");
            e.exports = function(t) {
                function e(e) {
                    var o = t.index;
                    e.each(function(e) {
                        var l, c, u = n.hsl(r.COLORS[o].toString()),
                            h = i.eval(t.owner, e),
                            p = [];
                        for (l = 0; l < h.length; l += 1)
                            for (c = 0; c < h[l].length; c += 1) p.push(h[l][c]);
                        var f = n.select(this).selectAll("circle").data(p);
                        f.enter().append("circle").attr("class", "circle circle-" + o).attr("fill", n.hsl(u.toString()).brighter(1.5)).attr("stroke", u), f.attr("opacity", .7).attr("r", 1).attr("cx", function(t) {
                            return s(t[0])
                        }).attr("cy", function(t) {
                            return a(t[1])
                        }), f.exit().remove()
                    })
                }
                var s = t.owner.meta.xScale,
                    a = t.owner.meta.yScale;
                return e
            }
        }, {
            "../constants": 3,
            "../data": 4
        }],
        11: [function(t, e) {
            "use strict";
            e.exports = {
                isValidNumber: function(t) {
                    return "number" == typeof t && !isNaN(t) && isFinite(t)
                },
                getterSetter: function(t, e) {
                    var n = this;
                    this[e] = function(r) {
                        return arguments.length ? (t[e] = r, n) : t[e]
                    }
                },
                restrict: function(t, e, n) {
                    if (e > n) {
                        var r = e;
                        e = n, n = r
                    }
                    return t = Math.max(t, e), t = Math.min(t, n)
                },
                assert: function(t, e) {
                    if (e = e || "assertion failed", !t) throw new Error(e)
                }
            }
        }, {}],
        12: [function(t, e) {
            var n, r = Object.prototype.hasOwnProperty,
                i = Object.prototype.toString,
                s = function(t) {
                    "use strict";
                    if (!t || "[object Object]" !== i.call(t)) return !1;
                    var e = r.call(t, "constructor"),
                        s = t.constructor && t.constructor.prototype && r.call(t.constructor.prototype, "isPrototypeOf");
                    if (t.constructor && !e && !s) return !1;
                    var a;
                    for (a in t);
                    return a === n || r.call(t, a)
                };
            e.exports = function a() {
                "use strict";
                var t, e, r, i, o, l, c = arguments[0],
                    u = 1,
                    h = arguments.length,
                    p = !1;
                for ("boolean" == typeof c ? (p = c, c = arguments[1] || {}, u = 2) : ("object" != typeof c && "function" != typeof c || null == c) && (c = {}); h > u; ++u)
                    if (t = arguments[u], null != t)
                        for (e in t) r = c[e], i = t[e], c !== i && (p && i && (s(i) || (o = Array.isArray(i))) ? (o ? (o = !1, l = r && Array.isArray(r) ? r : []) : l = r && s(r) ? r : {}, c[e] = a(p, l, i)) : i !== n && (c[e] = i));
                return c
            }
        }, {}]
    }, {}, [1])(1)
});
