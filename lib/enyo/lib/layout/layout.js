
// minifier: path aliases

enyo.path.addPaths({drawer: "drawer/", drawer: "drawer/source/", fittable: "fittable/", fittable: "fittable/source/", list: "list/", list: "list/source/", slideable: "slideable/", slideable: "slideable/source/", panels: "panels/", panels: "panels/source/", tree: "tree/", tree: "tree/source/", imageview: "imageview/", imageview: "imageview/source/"});

// Drawer.js

enyo.kind({
name: "enyo.Drawer",
published: {
open: !0,
orient: "v",
animated: !0
},
style: "overflow: hidden; position: relative;",
tools: [ {
kind: "Animator",
onStep: "animatorStep",
onEnd: "animatorEnd"
}, {
name: "client",
style: "position: relative;",
classes: "enyo-border-box"
} ],
create: function() {
this.inherited(arguments), this.animatedChanged(), this.openChanged();
},
initComponents: function() {
this.createChrome(this.tools), this.inherited(arguments);
},
animatedChanged: function() {
!this.animated && this.hasNode() && this.$.animator.isAnimating() && (this.$.animator.stop(), this.animatorEnd());
},
openChanged: function() {
this.$.client.show();
if (this.hasNode()) if (this.$.animator.isAnimating()) this.$.animator.reverse(); else {
var e = this.orient == "v", t = e ? "height" : "width", n = e ? "top" : "left";
this.applyStyle(t, null);
var r = this.hasNode()[e ? "scrollHeight" : "scrollWidth"];
this.animated ? this.$.animator.play({
startValue: this.open ? 0 : r,
endValue: this.open ? r : 0,
dimension: t,
position: n
}) : this.animatorEnd();
} else this.$.client.setShowing(this.open);
},
animatorStep: function(e) {
if (this.hasNode()) {
var t = e.dimension;
this.node.style[t] = this.domStyles[t] = e.value + "px";
}
var n = this.$.client.hasNode();
if (n) {
var r = e.position, i = this.open ? e.endValue : e.startValue;
n.style[r] = this.$.client.domStyles[r] = e.value - i + "px";
}
this.container && this.container.resized();
},
animatorEnd: function() {
if (!this.open) this.$.client.hide(); else {
this.$.client.domCssText = enyo.Control.domStylesToCssText(this.$.client.domStyles);
var e = this.orient == "v", t = e ? "height" : "width", n = e ? "top" : "left", r = this.$.client.hasNode();
r && (r.style[n] = this.$.client.domStyles[n] = null), this.node && (this.node.style[t] = this.domStyles[t] = null);
}
this.container && this.container.resized();
}
});

// FittableLayout.js

enyo.kind({
name: "enyo.FittableLayout",
kind: "Layout",
calcFitIndex: function() {
for (var e = 0, t = this.container.children, n; n = t[e]; e++) if (n.fit && n.showing) return e;
},
getFitControl: function() {
var e = this.container.children, t = e[this.fitIndex];
return t && t.fit && t.showing || (this.fitIndex = this.calcFitIndex(), t = e[this.fitIndex]), t;
},
getLastControl: function() {
var e = this.container.children, t = e.length - 1, n = e[t];
while ((n = e[t]) && !n.showing) t--;
return n;
},
_reflow: function(e, t, n, r) {
this.container.addRemoveClass("enyo-stretch", !this.container.noStretch);
var i = this.getFitControl();
if (!i) return;
var s = 0, o = 0, u = 0, a, f = this.container.hasNode();
f && (a = enyo.dom.calcPaddingExtents(f), s = f[t] - (a[n] + a[r]));
var l = i.getBounds();
o = l[n] - (a && a[n] || 0);
var c = this.getLastControl();
if (c) {
var h = enyo.dom.getComputedBoxValue(c.hasNode(), "margin", r) || 0;
if (c != i) {
var p = c.getBounds(), d = l[n] + l[e], v = p[n] + p[e] + h;
u = v - d;
} else u = h;
}
var m = s - (o + u);
i.applyStyle(e, m + "px");
},
reflow: function() {
this.orient == "h" ? this._reflow("width", "clientWidth", "left", "right") : this._reflow("height", "clientHeight", "top", "bottom");
}
}), enyo.kind({
name: "enyo.FittableColumnsLayout",
kind: "FittableLayout",
orient: "h",
layoutClass: "enyo-fittable-columns-layout"
}), enyo.kind({
name: "enyo.FittableRowsLayout",
kind: "FittableLayout",
layoutClass: "enyo-fittable-rows-layout",
orient: "v"
});

// FittableRows.js

enyo.kind({
name: "enyo.FittableRows",
layoutKind: "FittableRowsLayout",
noStretch: !1
});

// FittableColumns.js

enyo.kind({
name: "enyo.FittableColumns",
layoutKind: "FittableColumnsLayout",
noStretch: !1
});

// FlyweightRepeater.js

enyo.kind({
name: "enyo.FlyweightRepeater",
published: {
count: 0,
noSelect: !1,
multiSelect: !1,
toggleSelected: !1,
clientClasses: "",
clientStyle: "",
rowOffset: 0
},
events: {
onSetupItem: "",
onRenderRow: ""
},
bottomUp: !1,
components: [ {
kind: "Selection",
onSelect: "selectDeselect",
onDeselect: "selectDeselect"
}, {
name: "client"
} ],
create: function() {
this.inherited(arguments), this.noSelectChanged(), this.multiSelectChanged(), this.clientClassesChanged(), this.clientStyleChanged();
},
noSelectChanged: function() {
this.noSelect && this.$.selection.clear();
},
multiSelectChanged: function() {
this.$.selection.setMulti(this.multiSelect);
},
clientClassesChanged: function() {
this.$.client.setClasses(this.clientClasses);
},
clientStyleChanged: function() {
this.$.client.setStyle(this.clientStyle);
},
setupItem: function(e) {
this.doSetupItem({
index: e,
selected: this.isSelected(e)
});
},
generateChildHtml: function() {
var e = "";
this.index = null;
for (var t = 0, n = 0; t < this.count; t++) n = this.rowOffset + (this.bottomUp ? this.count - t - 1 : t), this.setupItem(n), this.$.client.setAttribute("data-enyo-index", n), e += this.inherited(arguments), this.$.client.teardownRender();
return e;
},
previewDomEvent: function(e) {
var t = this.index = this.rowForEvent(e);
e.rowIndex = e.index = t, e.flyweight = this;
},
decorateEvent: function(e, t, n) {
var r = t && t.index != null ? t.index : this.index;
t && r != null && (t.index = r, t.flyweight = this), this.inherited(arguments);
},
tap: function(e, t) {
if (this.noSelect || t.index === -1) return;
this.toggleSelected ? this.$.selection.toggle(t.index) : this.$.selection.select(t.index);
},
selectDeselect: function(e, t) {
this.renderRow(t.key);
},
getSelection: function() {
return this.$.selection;
},
isSelected: function(e) {
return this.getSelection().isSelected(e);
},
renderRow: function(e) {
if (e < this.rowOffset || e >= this.count + this.rowOffset) return;
this.setupItem(e);
var t = this.fetchRowNode(e);
t && (enyo.dom.setInnerHtml(t, this.$.client.generateChildHtml()), this.$.client.teardownChildren(), this.doRenderRow({
rowIndex: e
}));
},
fetchRowNode: function(e) {
if (this.hasNode()) return this.node.querySelector('[data-enyo-index="' + e + '"]');
},
rowForEvent: function(e) {
if (!this.hasNode()) return -1;
var t = e.target;
while (t && t !== this.node) {
var n = t.getAttribute && t.getAttribute("data-enyo-index");
if (n !== null) return Number(n);
t = t.parentNode;
}
return -1;
},
prepareRow: function(e) {
if (e < 0 || e >= this.count) return;
this.setupItem(e);
var t = this.fetchRowNode(e);
enyo.FlyweightRepeater.claimNode(this.$.client, t);
},
lockRow: function() {
this.$.client.teardownChildren();
},
performOnRow: function(e, t, n) {
if (e < 0 || e >= this.count) return;
t && (this.prepareRow(e), enyo.call(n || null, t), this.lockRow());
},
statics: {
claimNode: function(e, t) {
var n;
t && (t.id !== e.id ? n = t.querySelector("#" + e.id) : n = t), e.generated = Boolean(n || !e.tag), e.node = n, e.node && e.rendered();
for (var r = 0, i = e.children, s; s = i[r]; r++) this.claimNode(s, t);
}
}
});

// List.js

enyo.kind({
name: "enyo.List",
kind: "Scroller",
classes: "enyo-list",
published: {
count: 0,
rowsPerPage: 50,
bottomUp: !1,
noSelect: !1,
multiSelect: !1,
toggleSelected: !1,
fixedHeight: !1,
reorderable: !1,
centerReorderContainer: !0,
reorderComponents: [],
pinnedReorderComponents: [],
swipeableComponents: [],
enableSwipe: !1,
persistSwipeableItem: !1
},
events: {
onSetupItem: "",
onSetupReorderComponents: "",
onSetupPinnedReorderComponents: "",
onReorder: "",
onSetupSwipeItem: "",
onSwipeDrag: "",
onSwipe: "",
onSwipeComplete: ""
},
handlers: {
onAnimateFinish: "animateFinish",
onRenderRow: "rowRendered",
ondragstart: "dragstart",
ondrag: "drag",
ondragfinish: "dragfinish",
onup: "up",
onholdpulse: "holdpulse"
},
rowHeight: 0,
listTools: [ {
name: "port",
classes: "enyo-list-port enyo-border-box",
components: [ {
name: "generator",
kind: "FlyweightRepeater",
canGenerate: !1,
components: [ {
tag: null,
name: "client"
} ]
}, {
name: "holdingarea",
allowHtml: !0,
classes: "enyo-list-holdingarea"
}, {
name: "page0",
allowHtml: !0,
classes: "enyo-list-page"
}, {
name: "page1",
allowHtml: !0,
classes: "enyo-list-page"
}, {
name: "placeholder"
}, {
name: "swipeableComponents",
style: "position:absolute; display:block; top:-1000px; left:0;"
} ]
} ],
reorderHoldTimeMS: 600,
draggingRowIndex: -1,
draggingRowNode: null,
placeholderRowIndex: -1,
dragToScrollThreshold: .1,
prevScrollTop: 0,
autoScrollTimeoutMS: 20,
autoScrollTimeout: null,
autoscrollPageY: 0,
pinnedReorderMode: !1,
initialPinPosition: -1,
itemMoved: !1,
currentPageNumber: -1,
completeReorderTimeout: null,
swipeIndex: null,
swipeDirection: null,
persistentItemVisible: !1,
persistentItemOrigin: null,
swipeComplete: !1,
completeSwipeTimeout: null,
completeSwipeDelayMS: 500,
normalSwipeSpeedMS: 200,
fastSwipeSpeedMS: 100,
percentageDraggedThreshold: .2,
importProps: function(e) {
e && e.reorderable && (this.touch = !0), this.inherited(arguments);
},
create: function() {
this.pageHeights = [], this.inherited(arguments), this.getStrategy().translateOptimized = !0, this.bottomUpChanged(), this.noSelectChanged(), this.multiSelectChanged(), this.toggleSelectedChanged(), this.$.generator.setRowOffset(0), this.$.generator.setCount(this.count);
},
initComponents: function() {
this.createReorderTools(), this.inherited(arguments), this.createSwipeableComponents();
},
createReorderTools: function() {
this.createComponent({
name: "reorderContainer",
classes: "enyo-list-reorder-container",
ondown: "sendToStrategy",
ondrag: "sendToStrategy",
ondragstart: "sendToStrategy",
ondragfinish: "sendToStrategy",
onflick: "sendToStrategy"
});
},
createStrategy: function() {
this.controlParentName = "strategy", this.inherited(arguments), this.createChrome(this.listTools), this.controlParentName = "client", this.discoverControlParent();
},
createSwipeableComponents: function() {
for (var e = 0; e < this.swipeableComponents.length; e++) this.$.swipeableComponents.createComponent(this.swipeableComponents[e], {
owner: this.owner
});
},
rendered: function() {
this.inherited(arguments), this.$.generator.node = this.$.port.hasNode(), this.$.generator.generated = !0, this.reset();
},
resizeHandler: function() {
this.inherited(arguments), this.refresh();
},
bottomUpChanged: function() {
this.$.generator.bottomUp = this.bottomUp, this.$.page0.applyStyle(this.pageBound, null), this.$.page1.applyStyle(this.pageBound, null), this.pageBound = this.bottomUp ? "bottom" : "top", this.hasNode() && this.reset();
},
noSelectChanged: function() {
this.$.generator.setNoSelect(this.noSelect);
},
multiSelectChanged: function() {
this.$.generator.setMultiSelect(this.multiSelect);
},
toggleSelectedChanged: function() {
this.$.generator.setToggleSelected(this.toggleSelected);
},
countChanged: function() {
this.hasNode() && this.updateMetrics();
},
sendToStrategy: function(e, t) {
this.$.strategy.dispatchEvent("on" + t.type, t, e);
},
updateMetrics: function() {
this.defaultPageHeight = this.rowsPerPage * (this.rowHeight || 100), this.pageCount = Math.ceil(this.count / this.rowsPerPage), this.portSize = 0;
for (var e = 0; e < this.pageCount; e++) this.portSize += this.getPageHeight(e);
this.adjustPortSize();
},
holdpulse: function(e, t) {
if (!this.getReorderable() || this.isReordering()) return;
if (t.holdTime >= this.reorderHoldTimeMS && this.shouldStartReordering(e, t)) return t.preventDefault(), this.startReordering(t), !1;
},
dragstart: function(e, t) {
if (this.isReordering()) return !0;
if (this.isSwipeable()) return this.swipeDragStart(e, t);
},
drag: function(e, t) {
if (this.shouldDoReorderDrag(t)) return t.preventDefault(), this.reorderDrag(t), !0;
if (this.isSwipeable()) return t.preventDefault(), this.swipeDrag(e, t), !0;
},
dragfinish: function(e, t) {
this.isReordering() ? this.finishReordering(e, t) : this.isSwipeable() && this.swipeDragFinish(e, t);
},
up: function(e, t) {
this.isReordering() && this.finishReordering(e, t);
},
generatePage: function(e, t) {
this.page = e;
var n = this.rowsPerPage * this.page;
this.$.generator.setRowOffset(n);
var r = Math.min(this.count - n, this.rowsPerPage);
this.$.generator.setCount(r);
var i = this.$.generator.generateChildHtml();
t.setContent(i), this.getReorderable() && this.draggingRowIndex > -1 && this.hideReorderingRow();
var s = t.getBounds().height;
!this.rowHeight && s > 0 && (this.rowHeight = Math.floor(s / r), this.updateMetrics());
if (!this.fixedHeight) {
var o = this.getPageHeight(e);
this.pageHeights[e] = s, this.portSize += s - o;
}
},
pageForRow: function(e) {
return Math.floor(e / this.rowsPerPage);
},
preserveDraggingRowNode: function(e) {
this.draggingRowNode && this.pageForRow(this.draggingRowIndex) === e && (this.$.holdingarea.hasNode().appendChild(this.draggingRowNode), this.draggingRowNode = null, this.removedInitialPage = !0);
},
update: function(e) {
var t = !1, n = this.positionToPageInfo(e), r = n.pos + this.scrollerHeight / 2, i = Math.floor(r / Math.max(n.height, this.scrollerHeight) + .5) + n.no, s = i % 2 === 0 ? i : i - 1;
this.p0 != s && this.isPageInRange(s) && (this.preserveDraggingRowNode(this.p0), this.generatePage(s, this.$.page0), this.positionPage(s, this.$.page0), this.p0 = s, t = !0, this.p0RowBounds = this.getPageRowHeights(this.$.page0)), s = i % 2 === 0 ? Math.max(1, i - 1) : i, this.p1 != s && this.isPageInRange(s) && (this.preserveDraggingRowNode(this.p1), this.generatePage(s, this.$.page1), this.positionPage(s, this.$.page1), this.p1 = s, t = !0, this.p1RowBounds = this.getPageRowHeights(this.$.page1)), t && (this.$.generator.setRowOffset(0), this.$.generator.setCount(this.count), this.fixedHeight || (this.adjustBottomPage(), this.adjustPortSize()));
},
getPageRowHeights: function(e) {
var t = {}, n = e.hasNode().querySelectorAll("div[data-enyo-index]");
for (var r = 0, i, s; r < n.length; r++) i = n[r].getAttribute("data-enyo-index"), i !== null && (s = enyo.dom.getBounds(n[r]), t[parseInt(i, 10)] = {
height: s.height,
width: s.width
});
return t;
},
updateRowBounds: function(e) {
this.p0RowBounds[e] ? this.updateRowBoundsAtIndex(e, this.p0RowBounds, this.$.page0) : this.p1RowBounds[e] && this.updateRowBoundsAtIndex(e, this.p1RowBounds, this.$.page1);
},
updateRowBoundsAtIndex: function(e, t, n) {
var r = n.hasNode().querySelector('div[data-enyo-index="' + e + '"]'), i = enyo.dom.getBounds(r);
t[e].height = i.height, t[e].width = i.width;
},
updateForPosition: function(e) {
this.update(this.calcPos(e));
},
calcPos: function(e) {
return this.bottomUp ? this.portSize - this.scrollerHeight - e : e;
},
adjustBottomPage: function() {
var e = this.p0 >= this.p1 ? this.$.page0 : this.$.page1;
this.positionPage(e.pageNo, e);
},
adjustPortSize: function() {
this.scrollerHeight = this.getBounds().height;
var e = Math.max(this.scrollerHeight, this.portSize);
this.$.port.applyStyle("height", e + "px");
},
positionPage: function(e, t) {
t.pageNo = e;
var n = this.pageToPosition(e);
t.applyStyle(this.pageBound, n + "px");
},
pageToPosition: function(e) {
var t = 0, n = e;
while (n > 0) n--, t += this.getPageHeight(n);
return t;
},
positionToPageInfo: function(e) {
var t = -1, n = this.calcPos(e), r = this.defaultPageHeight;
while (n >= 0) t++, r = this.getPageHeight(t), n -= r;
return t = Math.max(t, 0), {
no: t,
height: r,
pos: n + r,
startRow: t * this.rowsPerPage,
endRow: Math.min((t + 1) * this.rowsPerPage - 1, this.count - 1)
};
},
isPageInRange: function(e) {
return e == Math.max(0, Math.min(this.pageCount - 1, e));
},
getPageHeight: function(e) {
var t = this.pageHeights[e];
if (!t) {
var n = this.rowsPerPage * e, r = Math.min(this.count - n, this.rowsPerPage);
t = this.defaultPageHeight * (r / this.rowsPerPage);
}
return Math.max(1, t);
},
invalidatePages: function() {
this.p0 = this.p1 = null, this.p0RowBounds = {}, this.p1RowBounds = {}, this.$.page0.setContent(""), this.$.page1.setContent("");
},
invalidateMetrics: function() {
this.pageHeights = [], this.rowHeight = 0, this.updateMetrics();
},
scroll: function(e, t) {
var n = this.inherited(arguments), r = this.getScrollTop();
return this.lastPos === r ? n : (this.lastPos = r, this.update(r), this.pinnedReorderMode && this.reorderScroll(e, t), n);
},
setScrollTop: function(e) {
this.update(e), this.inherited(arguments), this.twiddle();
},
getScrollPosition: function() {
return this.calcPos(this.getScrollTop());
},
setScrollPosition: function(e) {
this.setScrollTop(this.calcPos(e));
},
scrollToBottom: function() {
this.update(this.getScrollBounds().maxTop), this.inherited(arguments);
},
scrollToRow: function(e) {
var t = this.pageForRow(e), n = e % this.rowsPerPage, r = this.pageToPosition(t);
this.updateForPosition(r), r = this.pageToPosition(t), this.setScrollPosition(r);
if (t == this.p0 || t == this.p1) {
var i = this.$.generator.fetchRowNode(e);
if (i) {
var s = i.offsetTop;
this.bottomUp && (s = this.getPageHeight(t) - i.offsetHeight - s);
var o = this.getScrollPosition() + s;
this.setScrollPosition(o);
}
}
},
scrollToStart: function() {
this[this.bottomUp ? "scrollToBottom" : "scrollToTop"]();
},
scrollToEnd: function() {
this[this.bottomUp ? "scrollToTop" : "scrollToBottom"]();
},
refresh: function() {
this.invalidatePages(), this.update(this.getScrollTop()), this.stabilize(), enyo.platform.android === 4 && this.twiddle();
},
reset: function() {
this.getSelection().clear(), this.invalidateMetrics(), this.invalidatePages(), this.stabilize(), this.scrollToStart();
},
getSelection: function() {
return this.$.generator.getSelection();
},
select: function(e, t) {
return this.getSelection().select(e, t);
},
deselect: function(e) {
return this.getSelection().deselect(e);
},
isSelected: function(e) {
return this.$.generator.isSelected(e);
},
renderRow: function(e) {
this.$.generator.renderRow(e);
},
rowRendered: function(e, t) {
this.updateRowBounds(t.rowIndex);
},
prepareRow: function(e) {
this.$.generator.prepareRow(e);
},
lockRow: function() {
this.$.generator.lockRow();
},
performOnRow: function(e, t, n) {
this.$.generator.performOnRow(e, t, n);
},
animateFinish: function(e) {
return this.twiddle(), !0;
},
twiddle: function() {
var e = this.getStrategy();
enyo.call(e, "twiddle");
},
pageForPageNumber: function(e, t) {
return e % 2 === 0 ? !t || e === this.p0 ? this.$.page0 : null : !t || e === this.p1 ? this.$.page1 : null;
},
shouldStartReordering: function(e, t) {
return !!this.getReorderable() && t.rowIndex >= 0 && !this.pinnedReorderMode && e === this.$.strategy && t.index >= 0 ? !0 : !1;
},
startReordering: function(e) {
this.$.strategy.listReordering = !0, this.buildReorderContainer(), this.doSetupReorderComponents(e), this.styleReorderContainer(e), this.draggingRowIndex = this.placeholderRowIndex = e.rowIndex, this.draggingRowNode = e.target, this.removedInitialPage = !1, this.itemMoved = !1, this.initialPageNumber = this.currentPageNumber = this.pageForRow(e.rowIndex), this.prevScrollTop = this.getScrollTop(), this.replaceNodeWithPlaceholder(e.rowIndex);
},
buildReorderContainer: function() {
this.$.reorderContainer.destroyClientControls();
for (var e = 0; e < this.reorderComponents.length; e++) this.$.reorderContainer.createComponent(this.reorderComponents[e], {
owner: this.owner
});
this.$.reorderContainer.render();
},
styleReorderContainer: function(e) {
this.setItemPosition(this.$.reorderContainer, e.rowIndex), this.setItemBounds(this.$.reorderContainer, e.rowIndex), this.$.reorderContainer.setShowing(!0), this.centerReorderContainer && this.centerReorderContainerOnPointer(e);
},
appendNodeToReorderContainer: function(e) {
this.$.reorderContainer.createComponent({
allowHtml: !0,
content: e.innerHTML
}).render();
},
centerReorderContainerOnPointer: function(e) {
var t = enyo.dom.calcNodePosition(this.hasNode()), n = e.pageX - t.left - parseInt(this.$.reorderContainer.domStyles.width, 10) / 2, r = e.pageY - t.top + this.getScrollTop() - parseInt(this.$.reorderContainer.domStyles.height, 10) / 2;
this.getStrategyKind() != "ScrollStrategy" && (n -= this.getScrollLeft(), r -= this.getScrollTop()), this.positionReorderContainer(n, r);
},
positionReorderContainer: function(e, t) {
this.$.reorderContainer.addClass("enyo-animatedTopAndLeft"), this.$.reorderContainer.addStyles("left:" + e + "px;top:" + t + "px;"), this.setPositionReorderContainerTimeout();
},
setPositionReorderContainerTimeout: function() {
this.clearPositionReorderContainerTimeout(), this.positionReorderContainerTimeout = setTimeout(enyo.bind(this, function() {
this.$.reorderContainer.removeClass("enyo-animatedTopAndLeft"), this.clearPositionReorderContainerTimeout();
}), 100);
},
clearPositionReorderContainerTimeout: function() {
this.positionReorderContainerTimeout && (clearTimeout(this.positionReorderContainerTimeout), this.positionReorderContainerTimeout = null);
},
shouldDoReorderDrag: function() {
return !this.getReorderable() || this.draggingRowIndex < 0 || this.pinnedReorderMode ? !1 : !0;
},
reorderDrag: function(e) {
this.positionReorderNode(e), this.checkForAutoScroll(e), this.updatePlaceholderPosition(e.pageY);
},
updatePlaceholderPosition: function(e) {
var t = this.getRowIndexFromCoordinate(e);
t !== -1 && (t >= this.placeholderRowIndex ? this.movePlaceholderToIndex(Math.min(this.count, t + 1)) : this.movePlaceholderToIndex(t));
},
positionReorderNode: function(e) {
var t = this.$.reorderContainer.getBounds(), n = t.left + e.ddx, r = t.top + e.ddy;
r = this.getStrategyKind() == "ScrollStrategy" ? r + (this.getScrollTop() - this.prevScrollTop) : r, this.$.reorderContainer.addStyles("top: " + r + "px ; left: " + n + "px"), this.prevScrollTop = this.getScrollTop();
},
checkForAutoScroll: function(e) {
var t = enyo.dom.calcNodePosition(this.hasNode()), n = this.getBounds(), r;
this.autoscrollPageY = e.pageY, e.pageY - t.top < n.height * this.dragToScrollThreshold ? (r = 100 * (1 - (e.pageY - t.top) / (n.height * this.dragToScrollThreshold)), this.scrollDistance = -1 * r) : e.pageY - t.top > n.height * (1 - this.dragToScrollThreshold) ? (r = 100 * ((e.pageY - t.top - n.height * (1 - this.dragToScrollThreshold)) / (n.height - n.height * (1 - this.dragToScrollThreshold))), this.scrollDistance = 1 * r) : this.scrollDistance = 0, this.scrollDistance === 0 ? this.stopAutoScrolling() : this.autoScrollTimeout || this.startAutoScrolling();
},
stopAutoScrolling: function() {
this.autoScrollTimeout && (clearTimeout(this.autoScrollTimeout), this.autoScrollTimeout = null);
},
startAutoScrolling: function() {
this.autoScrollTimeout = setInterval(enyo.bind(this, this.autoScroll), this.autoScrollTimeoutMS);
},
autoScroll: function() {
this.scrollDistance === 0 ? this.stopAutoScrolling() : this.autoScrollTimeout || this.startAutoScrolling(), this.setScrollPosition(this.getScrollPosition() + this.scrollDistance), this.positionReorderNode({
ddx: 0,
ddy: 0
}), this.updatePlaceholderPosition(this.autoscrollPageY);
},
movePlaceholderToIndex: function(e) {
var t, n;
if (e < 0) return;
e >= this.count ? (t = null, n = this.pageForPageNumber(this.pageForRow(this.count - 1)).hasNode()) : (t = this.$.generator.fetchRowNode(e), n = t.parentNode);
var r = this.pageForRow(e);
r >= this.pageCount && (r = this.currentPageNumber), n.insertBefore(this.placeholderNode, t), this.currentPageNumber !== r && (this.updatePageHeight(this.currentPageNumber), this.updatePageHeight(r), this.updatePagePositions(r)), this.placeholderRowIndex = e, this.currentPageNumber = r, this.itemMoved = !0;
},
finishReordering: function(e, t) {
if (!this.isReordering() || this.pinnedReorderMode || this.completeReorderTimeout) return;
return this.stopAutoScrolling(), this.$.strategy.listReordering = !1, this.moveReorderedContainerToDroppedPosition(t), this.completeReorderTimeout = setTimeout(enyo.bind(this, this.completeFinishReordering, t), 100), t.preventDefault(), !0;
},
moveReorderedContainerToDroppedPosition: function() {
var e = this.getRelativeOffset(this.placeholderNode, this.hasNode()), t = this.getStrategyKind() == "ScrollStrategy" ? e.top : e.top - this.getScrollTop(), n = e.left - this.getScrollLeft();
this.positionReorderContainer(n, t);
},
completeFinishReordering: function(e) {
this.completeReorderTimeout = null, this.placeholderRowIndex > this.draggingRowIndex && (this.placeholderRowIndex = Math.max(0, this.placeholderRowIndex - 1));
if (this.draggingRowIndex == this.placeholderRowIndex && this.pinnedReorderComponents.length && !this.pinnedReorderMode && !this.itemMoved) {
this.beginPinnedReorder(e);
return;
}
this.removeDraggingRowNode(), this.removePlaceholderNode(), this.emptyAndHideReorderContainer(), this.pinnedReorderMode = !1, this.reorderRows(e), this.draggingRowIndex = this.placeholderRowIndex = -1, this.refresh();
},
beginPinnedReorder: function(e) {
this.buildPinnedReorderContainer(), this.doSetupPinnedReorderComponents(enyo.mixin(e, {
index: this.draggingRowIndex
})), this.pinnedReorderMode = !0, this.initialPinPosition = e.pageY;
},
emptyAndHideReorderContainer: function() {
this.$.reorderContainer.destroyComponents(), this.$.reorderContainer.setShowing(!1);
},
buildPinnedReorderContainer: function() {
this.$.reorderContainer.destroyClientControls();
for (var e = 0; e < this.pinnedReorderComponents.length; e++) this.$.reorderContainer.createComponent(this.pinnedReorderComponents[e], {
owner: this.owner
});
this.$.reorderContainer.render();
},
reorderRows: function(e) {
this.doReorder(this.makeReorderEvent(e)), this.positionReorderedNode(), this.updateListIndices();
},
makeReorderEvent: function(e) {
return e.reorderFrom = this.draggingRowIndex, e.reorderTo = this.placeholderRowIndex, e;
},
positionReorderedNode: function() {
if (!this.removedInitialPage) {
var e = this.$.generator.fetchRowNode(this.placeholderRowIndex);
e && (e.parentNode.insertBefore(this.hiddenNode, e), this.showNode(this.hiddenNode)), this.hiddenNode = null;
if (this.currentPageNumber != this.initialPageNumber) {
var t, n, r = this.pageForPageNumber(this.currentPageNumber), i = this.pageForPageNumber(this.currentPageNumber + 1);
this.initialPageNumber < this.currentPageNumber ? (t = r.hasNode().firstChild, i.hasNode().appendChild(t)) : (t = r.hasNode().lastChild, n = i.hasNode().firstChild, i.hasNode().insertBefore(t, n)), this.correctPageHeights(), this.updatePagePositions(this.initialPageNumber);
}
}
},
updateListIndices: function() {
if (this.shouldDoRefresh()) {
this.refresh(), this.correctPageHeights();
return;
}
var e = Math.min(this.draggingRowIndex, this.placeholderRowIndex), t = Math.max(this.draggingRowIndex, this.placeholderRowIndex), n = this.draggingRowIndex - this.placeholderRowIndex > 0 ? 1 : -1, r, i, s, o;
if (n === 1) {
r = this.$.generator.fetchRowNode(this.draggingRowIndex), r && r.setAttribute("data-enyo-index", "reordered");
for (i = t - 1, s = t; i >= e; i--) {
r = this.$.generator.fetchRowNode(i);
if (!r) continue;
o = parseInt(r.getAttribute("data-enyo-index"), 10), s = o + 1, r.setAttribute("data-enyo-index", s);
}
r = this.hasNode().querySelector('[data-enyo-index="reordered"]'), r.setAttribute("data-enyo-index", this.placeholderRowIndex);
} else {
r = this.$.generator.fetchRowNode(this.draggingRowIndex), r && r.setAttribute("data-enyo-index", this.placeholderRowIndex);
for (i = e + 1, s = e; i <= t; i++) {
r = this.$.generator.fetchRowNode(i);
if (!r) continue;
o = parseInt(r.getAttribute("data-enyo-index"), 10), s = o - 1, r.setAttribute("data-enyo-index", s);
}
}
},
shouldDoRefresh: function() {
return Math.abs(this.initialPageNumber - this.currentPageNumber) > 1;
},
getNodeStyle: function(e) {
var t = this.$.generator.fetchRowNode(e);
if (!t) return;
var n = this.getRelativeOffset(t, this.hasNode()), r = enyo.dom.getBounds(t);
return {
h: r.height,
w: r.width,
left: n.left,
top: n.top
};
},
getRelativeOffset: function(e, t) {
var n = {
top: 0,
left: 0
};
if (e !== t && e.parentNode) do n.top += e.offsetTop || 0, n.left += e.offsetLeft || 0, e = e.offsetParent; while (e && e !== t);
return n;
},
replaceNodeWithPlaceholder: function(e) {
var t = this.$.generator.fetchRowNode(e);
if (!t) {
enyo.log("No node - " + e);
return;
}
this.placeholderNode = this.createPlaceholderNode(t), this.hiddenNode = this.hideNode(t);
var n = this.pageForPageNumber(this.currentPageNumber);
n.hasNode().insertBefore(this.placeholderNode, this.hiddenNode);
},
createPlaceholderNode: function(e) {
var t = this.$.placeholder.hasNode().cloneNode(!0), n = enyo.dom.getBounds(e);
return t.style.height = n.height + "px", t.style.width = n.width + "px", t;
},
removePlaceholderNode: function() {
this.removeNode(this.placeholderNode), this.placeholderNode = null;
},
removeDraggingRowNode: function() {
this.draggingRowNode = null;
var e = this.$.holdingarea.hasNode();
e.innerHTML = "";
},
removeNode: function(e) {
if (!e || !e.parentNode) return;
e.parentNode.removeChild(e);
},
updatePageHeight: function(e) {
if (e < 0) return;
var t = this.pageForPageNumber(e, !0);
if (t) {
var n = this.pageHeights[e], r = Math.max(1, t.getBounds().height);
this.pageHeights[e] = r, this.portSize += r - n;
}
},
updatePagePositions: function(e) {
this.positionPage(this.currentPageNumber, this.pageForPageNumber(this.currentPageNumber)), this.positionPage(e, this.pageForPageNumber(e));
},
correctPageHeights: function() {
this.updatePageHeight(this.currentPageNumber), this.initialPageNumber != this.currentPageNumber && this.updatePageHeight(this.initialPageNumber);
},
hideNode: function(e) {
return e.style.display = "none", e;
},
showNode: function(e) {
return e.style.display = "block", e;
},
dropPinnedRow: function(e) {
this.moveReorderedContainerToDroppedPosition(e), this.completeReorderTimeout = setTimeout(enyo.bind(this, this.completeFinishReordering, e), 100);
return;
},
cancelPinnedMode: function(e) {
this.placeholderRowIndex = this.draggingRowIndex, this.dropPinnedRow(e);
},
getRowIndexFromCoordinate: function(e) {
var t = this.getScrollTop() + e - enyo.dom.calcNodePosition(this.hasNode()).top;
if (t < 0) return -1;
var n = this.positionToPageInfo(t), r = n.no == this.p0 ? this.p0RowBounds : this.p1RowBounds;
if (!r) return this.count;
var i = n.pos, s = this.placeholderNode ? enyo.dom.getBounds(this.placeholderNode).height : 0, o = 0;
for (var u = n.startRow; u <= n.endRow; ++u) {
if (u === this.placeholderRowIndex) {
o += s;
if (o >= i) return -1;
}
if (u !== this.draggingRowIndex) {
o += r[u].height;
if (o >= i) return u;
}
}
return u;
},
getIndexPosition: function(e) {
return enyo.dom.calcNodePosition(this.$.generator.fetchRowNode(e));
},
setItemPosition: function(e, t) {
var n = this.getNodeStyle(t), r = this.getStrategyKind() == "ScrollStrategy" ? n.top : n.top - this.getScrollTop(), i = "top:" + r + "px; left:" + n.left + "px;";
e.addStyles(i);
},
setItemBounds: function(e, t) {
var n = this.getNodeStyle(t), r = "width:" + n.w + "px; height:" + n.h + "px;";
e.addStyles(r);
},
reorderScroll: function(e, t) {
this.getStrategyKind() == "ScrollStrategy" && this.$.reorderContainer.addStyles("top:" + (this.initialPinPosition + this.getScrollTop() - this.rowHeight) + "px;"), this.updatePlaceholderPosition(this.initialPinPosition);
},
hideReorderingRow: function() {
var e = this.hasNode().querySelector('[data-enyo-index="' + this.draggingRowIndex + '"]');
e && (this.hiddenNode = this.hideNode(e));
},
isReordering: function() {
return this.draggingRowIndex > -1;
},
isSwiping: function() {
return this.swipeIndex != null && !this.swipeComplete && this.swipeDirection != null;
},
swipeDragStart: function(e, t) {
return t.index == null || t.vertical ? !0 : (this.completeSwipeTimeout && this.completeSwipe(t), this.swipeComplete = !1, this.swipeIndex != t.index && (this.clearSwipeables(), this.swipeIndex = t.index), this.swipeDirection = t.xDirection, this.persistentItemVisible || this.startSwipe(t), this.draggedXDistance = 0, this.draggedYDistance = 0, !0);
},
swipeDrag: function(e, t) {
return this.persistentItemVisible ? (this.dragPersistentItem(t), this.preventDragPropagation) : this.isSwiping() ? (this.dragSwipeableComponents(this.calcNewDragPosition(t.ddx)), this.draggedXDistance = t.dx, this.draggedYDistance = t.dy, !0) : !1;
},
swipeDragFinish: function(e, t) {
if (this.persistentItemVisible) this.dragFinishPersistentItem(t); else {
if (!this.isSwiping()) return !1;
var n = this.calcPercentageDragged(this.draggedXDistance);
n > this.percentageDraggedThreshold && t.xDirection === this.swipeDirection ? this.swipe(this.fastSwipeSpeedMS) : this.backOutSwipe(t);
}
return this.preventDragPropagation;
},
isSwipeable: function() {
return this.enableSwipe && this.$.swipeableComponents.controls.length !== 0 && !this.isReordering() && !this.pinnedReorderMode;
},
positionSwipeableContainer: function(e, t) {
var n = this.$.generator.fetchRowNode(e);
if (!n) return;
var r = this.getRelativeOffset(n, this.hasNode()), i = enyo.dom.getBounds(n), s = t == 1 ? -1 * i.width : i.width;
this.$.swipeableComponents.addStyles("top: " + r.top + "px; left: " + s + "px; height: " + i.height + "px; width: " + i.width + "px;");
},
calcNewDragPosition: function(e) {
var t = this.$.swipeableComponents.getBounds(), n = t.left, r = this.$.swipeableComponents.getBounds(), i = this.swipeDirection == 1 ? 0 : -1 * r.width, s = this.swipeDirection == 1 ? n + e > i ? i : n + e : n + e < i ? i : n + e;
return s;
},
dragSwipeableComponents: function(e) {
this.$.swipeableComponents.applyStyle("left", e + "px");
},
startSwipe: function(e) {
e.index = this.swipeIndex, this.positionSwipeableContainer(this.swipeIndex, e.xDirection), this.$.swipeableComponents.setShowing(!0), this.setPersistentItemOrigin(e.xDirection), this.doSetupSwipeItem(e);
},
dragPersistentItem: function(e) {
var t = 0, n = this.persistentItemOrigin == "right" ? Math.max(t, t + e.dx) : Math.min(t, t + e.dx);
this.$.swipeableComponents.applyStyle("left", n + "px");
},
dragFinishPersistentItem: function(e) {
var t = this.calcPercentageDragged(e.dx) > .2, n = e.dx > 0 ? "right" : e.dx < 0 ? "left" : null;
this.persistentItemOrigin == n ? t ? this.slideAwayItem() : this.bounceItem(e) : this.bounceItem(e);
},
setPersistentItemOrigin: function(e) {
this.persistentItemOrigin = e == 1 ? "left" : "right";
},
calcPercentageDragged: function(e) {
return Math.abs(e / this.$.swipeableComponents.getBounds().width);
},
swipe: function(e) {
this.swipeComplete = !0, this.animateSwipe(0, e);
},
backOutSwipe: function(e) {
var t = this.$.swipeableComponents.getBounds(), n = this.swipeDirection == 1 ? -1 * t.width : t.width;
this.animateSwipe(n, this.fastSwipeSpeedMS), this.swipeDirection = null;
},
bounceItem: function(e) {
var t = this.$.swipeableComponents.getBounds();
t.left != t.width && this.animateSwipe(0, this.normalSwipeSpeedMS);
},
slideAwayItem: function() {
var e = this.$.swipeableComponents, t = e.getBounds().width, n = this.persistentItemOrigin == "left" ? -1 * t : t;
this.animateSwipe(n, this.normalSwipeSpeedMS), this.persistentItemVisible = !1, this.setPersistSwipeableItem(!1);
},
clearSwipeables: function() {
this.$.swipeableComponents.setShowing(!1), this.persistentItemVisible = !1, this.setPersistSwipeableItem(!1);
},
completeSwipe: function(e) {
this.completeSwipeTimeout && (clearTimeout(this.completeSwipeTimeout), this.completeSwipeTimeout = null), this.getPersistSwipeableItem() ? this.persistentItemVisible = !0 : (this.$.swipeableComponents.setShowing(!1), this.swipeComplete && this.doSwipeComplete({
index: this.swipeIndex,
xDirection: this.swipeDirection
})), this.swipeIndex = null, this.swipeDirection = null;
},
animateSwipe: function(e, t) {
var n = enyo.now(), r = 0, i = this.$.swipeableComponents, s = parseInt(i.domStyles.left, 10), o = e - s;
this.stopAnimateSwipe();
var u = enyo.bind(this, function() {
var e = enyo.now() - n, r = e / t, a = s + o * Math.min(r, 1);
i.applyStyle("left", a + "px"), this.job = enyo.requestAnimationFrame(u), e / t >= 1 && (this.stopAnimateSwipe(), this.completeSwipeTimeout = setTimeout(enyo.bind(this, function() {
this.completeSwipe();
}), this.completeSwipeDelayMS));
});
this.job = enyo.requestAnimationFrame(u);
},
stopAnimateSwipe: function() {
this.job && (this.job = enyo.cancelRequestAnimationFrame(this.job));
}
});

// PulldownList.js

enyo.kind({
name: "enyo.PulldownList",
kind: "List",
touch: !0,
pully: null,
pulldownTools: [ {
name: "pulldown",
classes: "enyo-list-pulldown",
components: [ {
name: "puller",
kind: "Puller"
} ]
} ],
events: {
onPullStart: "",
onPullCancel: "",
onPull: "",
onPullRelease: "",
onPullComplete: ""
},
handlers: {
onScrollStart: "scrollStartHandler",
onScrollStop: "scrollStopHandler",
ondragfinish: "dragfinish"
},
pullingMessage: "Pull down to refresh...",
pulledMessage: "Release to refresh...",
loadingMessage: "Loading...",
pullingIconClass: "enyo-puller-arrow enyo-puller-arrow-down",
pulledIconClass: "enyo-puller-arrow enyo-puller-arrow-up",
loadingIconClass: "",
create: function() {
var e = {
kind: "Puller",
showing: !1,
text: this.loadingMessage,
iconClass: this.loadingIconClass,
onCreate: "setPully"
};
this.listTools.splice(0, 0, e), this.inherited(arguments), this.setPulling();
},
initComponents: function() {
this.createChrome(this.pulldownTools), this.accel = enyo.dom.canAccelerate(), this.translation = this.accel ? "translate3d" : "translate", this.strategyKind = this.resetStrategyKind(), this.inherited(arguments);
},
resetStrategyKind: function() {
return enyo.platform.android >= 3 ? "TranslateScrollStrategy" : "TouchScrollStrategy";
},
setPully: function(e, t) {
this.pully = t.originator;
},
scrollStartHandler: function() {
this.firedPullStart = !1, this.firedPull = !1, this.firedPullCancel = !1;
},
scroll: function(e, t) {
var n = this.inherited(arguments);
this.completingPull && this.pully.setShowing(!1);
var r = this.getStrategy().$.scrollMath || this.getStrategy(), i = -1 * this.getScrollTop();
return r.isInOverScroll() && i > 0 && (enyo.dom.transformValue(this.$.pulldown, this.translation, "0," + i + "px" + (this.accel ? ",0" : "")), this.firedPullStart || (this.firedPullStart = !0, this.pullStart(), this.pullHeight = this.$.pulldown.getBounds().height), i > this.pullHeight && !this.firedPull && (this.firedPull = !0, this.firedPullCancel = !1, this.pull()), this.firedPull && !this.firedPullCancel && i < this.pullHeight && (this.firedPullCancel = !0, this.firedPull = !1, this.pullCancel())), n;
},
scrollStopHandler: function() {
this.completingPull && (this.completingPull = !1, this.doPullComplete());
},
dragfinish: function() {
if (this.firedPull) {
var e = this.getStrategy().$.scrollMath || this.getStrategy();
e.setScrollY(-1 * this.getScrollTop() - this.pullHeight), this.pullRelease();
}
},
completePull: function() {
this.completingPull = !0;
var e = this.getStrategy().$.scrollMath || this.getStrategy();
e.setScrollY(this.pullHeight), e.start();
},
pullStart: function() {
this.setPulling(), this.pully.setShowing(!1), this.$.puller.setShowing(!0), this.doPullStart();
},
pull: function() {
this.setPulled(), this.doPull();
},
pullCancel: function() {
this.setPulling(), this.doPullCancel();
},
pullRelease: function() {
this.$.puller.setShowing(!1), this.pully.setShowing(!0), this.doPullRelease();
},
setPulling: function() {
this.$.puller.setText(this.pullingMessage), this.$.puller.setIconClass(this.pullingIconClass);
},
setPulled: function() {
this.$.puller.setText(this.pulledMessage), this.$.puller.setIconClass(this.pulledIconClass);
}
}), enyo.kind({
name: "enyo.Puller",
classes: "enyo-puller",
published: {
text: "",
iconClass: ""
},
events: {
onCreate: ""
},
components: [ {
name: "icon"
}, {
name: "text",
tag: "span",
classes: "enyo-puller-text"
} ],
create: function() {
this.inherited(arguments), this.doCreate(), this.textChanged(), this.iconClassChanged();
},
textChanged: function() {
this.$.text.setContent(this.text);
},
iconClassChanged: function() {
this.$.icon.setClasses(this.iconClass);
}
});

// AroundList.js

enyo.kind({
name: "enyo.AroundList",
kind: "enyo.List",
listTools: [ {
name: "port",
classes: "enyo-list-port enyo-border-box",
components: [ {
name: "aboveClient"
}, {
name: "generator",
kind: "FlyweightRepeater",
canGenerate: !1,
components: [ {
tag: null,
name: "client"
} ]
}, {
name: "holdingarea",
allowHtml: !0,
classes: "enyo-list-holdingarea"
}, {
name: "page0",
allowHtml: !0,
classes: "enyo-list-page"
}, {
name: "page1",
allowHtml: !0,
classes: "enyo-list-page"
}, {
name: "belowClient"
}, {
name: "placeholder"
}, {
name: "swipeableComponents",
style: "position:absolute; display:block; top:-1000px; left:0px;"
} ]
} ],
aboveComponents: null,
initComponents: function() {
this.inherited(arguments), this.aboveComponents && this.$.aboveClient.createComponents(this.aboveComponents, {
owner: this.owner
}), this.belowComponents && this.$.belowClient.createComponents(this.belowComponents, {
owner: this.owner
});
},
updateMetrics: function() {
this.defaultPageHeight = this.rowsPerPage * (this.rowHeight || 100), this.pageCount = Math.ceil(this.count / this.rowsPerPage), this.aboveHeight = this.$.aboveClient.getBounds().height, this.belowHeight = this.$.belowClient.getBounds().height, this.portSize = this.aboveHeight + this.belowHeight;
for (var e = 0; e < this.pageCount; e++) this.portSize += this.getPageHeight(e);
this.adjustPortSize();
},
positionPage: function(e, t) {
t.pageNo = e;
var n = this.pageToPosition(e), r = this.bottomUp ? this.belowHeight : this.aboveHeight;
n += r, t.applyStyle(this.pageBound, n + "px");
},
scrollToContentStart: function() {
var e = this.bottomUp ? this.belowHeight : this.aboveHeight;
this.setScrollPosition(e);
}
});

// Slideable.js

enyo.kind({
name: "enyo.Slideable",
kind: "Control",
published: {
axis: "h",
value: 0,
unit: "px",
min: 0,
max: 0,
accelerated: "auto",
overMoving: !0,
draggable: !0
},
events: {
onAnimateFinish: "",
onChange: ""
},
preventDragPropagation: !1,
tools: [ {
kind: "Animator",
onStep: "animatorStep",
onEnd: "animatorComplete"
} ],
handlers: {
ondragstart: "dragstart",
ondrag: "drag",
ondragfinish: "dragfinish"
},
kDragScalar: 1,
dragEventProp: "dx",
unitModifier: !1,
canTransform: !1,
create: function() {
this.inherited(arguments), this.acceleratedChanged(), this.transformChanged(), this.axisChanged(), this.valueChanged(), this.addClass("enyo-slideable");
},
initComponents: function() {
this.createComponents(this.tools), this.inherited(arguments);
},
rendered: function() {
this.inherited(arguments), this.canModifyUnit(), this.updateDragScalar();
},
resizeHandler: function() {
this.inherited(arguments), this.updateDragScalar();
},
canModifyUnit: function() {
if (!this.canTransform) {
var e = this.getInitialStyleValue(this.hasNode(), this.boundary);
e.match(/px/i) && this.unit === "%" && (this.unitModifier = this.getBounds()[this.dimension]);
}
},
getInitialStyleValue: function(e, t) {
var n = enyo.dom.getComputedStyle(e);
return n ? n.getPropertyValue(t) : e && e.currentStyle ? e.currentStyle[t] : "0";
},
updateBounds: function(e, t) {
var n = {};
n[this.boundary] = e, this.setBounds(n, this.unit), this.setInlineStyles(e, t);
},
updateDragScalar: function() {
if (this.unit == "%") {
var e = this.getBounds()[this.dimension];
this.kDragScalar = e ? 100 / e : 1, this.canTransform || this.updateBounds(this.value, 100);
}
},
transformChanged: function() {
this.canTransform = enyo.dom.canTransform();
},
acceleratedChanged: function() {
enyo.platform.android > 2 || enyo.dom.accelerate(this, this.accelerated);
},
axisChanged: function() {
var e = this.axis == "h";
this.dragMoveProp = e ? "dx" : "dy", this.shouldDragProp = e ? "horizontal" : "vertical", this.transform = e ? "translateX" : "translateY", this.dimension = e ? "width" : "height", this.boundary = e ? "left" : "top";
},
setInlineStyles: function(e, t) {
var n = {};
this.unitModifier ? (n[this.boundary] = this.percentToPixels(e, this.unitModifier), n[this.dimension] = this.unitModifier, this.setBounds(n)) : (t ? n[this.dimension] = t : n[this.boundary] = e, this.setBounds(n, this.unit));
},
valueChanged: function(e) {
var t = this.value;
this.isOob(t) && !this.isAnimating() && (this.value = this.overMoving ? this.dampValue(t) : this.clampValue(t)), enyo.platform.android > 2 && (this.value ? (e === 0 || e === undefined) && enyo.dom.accelerate(this, this.accelerated) : enyo.dom.accelerate(this, !1)), this.canTransform ? enyo.dom.transformValue(this, this.transform, this.value + this.unit) : this.setInlineStyles(this.value, !1), this.doChange();
},
getAnimator: function() {
return this.$.animator;
},
isAtMin: function() {
return this.value <= this.calcMin();
},
isAtMax: function() {
return this.value >= this.calcMax();
},
calcMin: function() {
return this.min;
},
calcMax: function() {
return this.max;
},
clampValue: function(e) {
var t = this.calcMin(), n = this.calcMax();
return Math.max(t, Math.min(e, n));
},
dampValue: function(e) {
return this.dampBound(this.dampBound(e, this.min, 1), this.max, -1);
},
dampBound: function(e, t, n) {
var r = e;
return r * n < t * n && (r = t + (r - t) / 4), r;
},
percentToPixels: function(e, t) {
return Math.floor(t / 100 * e);
},
pixelsToPercent: function(e) {
var t = this.unitModifier ? this.getBounds()[this.dimension] : this.container.getBounds()[this.dimension];
return e / t * 100;
},
shouldDrag: function(e) {
return this.draggable && e[this.shouldDragProp];
},
isOob: function(e) {
return e > this.calcMax() || e < this.calcMin();
},
dragstart: function(e, t) {
if (this.shouldDrag(t)) return t.preventDefault(), this.$.animator.stop(), t.dragInfo = {}, this.dragging = !0, this.drag0 = this.value, this.dragd0 = 0, this.preventDragPropagation;
},
drag: function(e, t) {
if (this.dragging) {
t.preventDefault();
var n = this.canTransform ? t[this.dragMoveProp] * this.kDragScalar : this.pixelsToPercent(t[this.dragMoveProp]), r = this.drag0 + n, i = n - this.dragd0;
return this.dragd0 = n, i && (t.dragInfo.minimizing = i < 0), this.setValue(r), this.preventDragPropagation;
}
},
dragfinish: function(e, t) {
if (this.dragging) return this.dragging = !1, this.completeDrag(t), t.preventTap(), this.preventDragPropagation;
},
completeDrag: function(e) {
this.value !== this.calcMax() && this.value != this.calcMin() && this.animateToMinMax(e.dragInfo.minimizing);
},
isAnimating: function() {
return this.$.animator.isAnimating();
},
play: function(e, t) {
this.$.animator.play({
startValue: e,
endValue: t,
node: this.hasNode()
});
},
animateTo: function(e) {
this.play(this.value, e);
},
animateToMin: function() {
this.animateTo(this.calcMin());
},
animateToMax: function() {
this.animateTo(this.calcMax());
},
animateToMinMax: function(e) {
e ? this.animateToMin() : this.animateToMax();
},
animatorStep: function(e) {
return this.setValue(e.value), !0;
},
animatorComplete: function(e) {
return this.doAnimateFinish(e), !0;
},
toggleMinMax: function() {
this.animateToMinMax(!this.isAtMin());
}
});

// Arranger.js

enyo.kind({
name: "enyo.Arranger",
kind: "Layout",
layoutClass: "enyo-arranger",
accelerated: "auto",
dragProp: "ddx",
dragDirectionProp: "xDirection",
canDragProp: "horizontal",
incrementalPoints: !1,
destroy: function() {
var e = this.container.getPanels();
for (var t = 0, n; n = e[t]; t++) n._arranger = null;
this.inherited(arguments);
},
arrange: function(e, t) {},
size: function() {},
start: function() {
var e = this.container.fromIndex, t = this.container.toIndex, n = this.container.transitionPoints = [ e ];
if (this.incrementalPoints) {
var r = Math.abs(t - e) - 2, i = e;
while (r >= 0) i += t < e ? -1 : 1, n.push(i), r--;
}
n.push(this.container.toIndex);
},
finish: function() {},
calcArrangementDifference: function(e, t, n, r) {},
canDragEvent: function(e) {
return e[this.canDragProp];
},
calcDragDirection: function(e) {
return e[this.dragDirectionProp];
},
calcDrag: function(e) {
return e[this.dragProp];
},
drag: function(e, t, n, r, i) {
var s = this.measureArrangementDelta(-e, t, n, r, i);
return s;
},
measureArrangementDelta: function(e, t, n, r, i) {
var s = this.calcArrangementDifference(t, n, r, i), o = s ? e / Math.abs(s) : 0;
return o *= this.container.fromIndex > this.container.toIndex ? -1 : 1, o;
},
_arrange: function(e) {
this.containerBounds || this.reflow();
var t = this.getOrderedControls(e);
this.arrange(t, e);
},
arrangeControl: function(e, t) {
e._arranger = enyo.mixin(e._arranger || {}, t);
},
flow: function() {
this.c$ = [].concat(this.container.getPanels()), this.controlsIndex = 0;
for (var e = 0, t = this.container.getPanels(), n; n = t[e]; e++) {
enyo.dom.accelerate(n, this.accelerated);
if (enyo.platform.safari) {
var r = n.children;
for (var i = 0, s; s = r[i]; i++) enyo.dom.accelerate(s, this.accelerated);
}
}
},
reflow: function() {
var e = this.container.hasNode();
this.containerBounds = e ? {
width: e.clientWidth,
height: e.clientHeight
} : {}, this.size();
},
flowArrangement: function() {
var e = this.container.arrangement;
if (e) for (var t = 0, n = this.container.getPanels(), r; r = n[t]; t++) this.flowControl(r, e[t]);
},
flowControl: function(e, t) {
enyo.Arranger.positionControl(e, t);
var n = t.opacity;
n != null && enyo.Arranger.opacifyControl(e, n);
},
getOrderedControls: function(e) {
var t = Math.floor(e), n = t - this.controlsIndex, r = n > 0, i = this.c$ || [];
for (var s = 0; s < Math.abs(n); s++) r ? i.push(i.shift()) : i.unshift(i.pop());
return this.controlsIndex = t, i;
},
statics: {
positionControl: function(e, t, n) {
var r = n || "px";
if (!this.updating) if (enyo.dom.canTransform() && !enyo.platform.android && enyo.platform.ie !== 10) {
var i = t.left, s = t.top;
i = enyo.isString(i) ? i : i && i + r, s = enyo.isString(s) ? s : s && s + r, enyo.dom.transform(e, {
translateX: i || null,
translateY: s || null
});
} else e.setBounds(t, n);
},
opacifyControl: function(e, t) {
var n = t;
n = n > .99 ? 1 : n < .01 ? 0 : n, enyo.platform.ie < 9 ? e.applyStyle("filter", "progid:DXImageTransform.Microsoft.Alpha(Opacity=" + n * 100 + ")") : e.applyStyle("opacity", n);
}
}
});

// CardArranger.js

enyo.kind({
name: "enyo.CardArranger",
kind: "Arranger",
layoutClass: "enyo-arranger enyo-arranger-fit",
calcArrangementDifference: function(e, t, n, r) {
return this.containerBounds.width;
},
arrange: function(e, t) {
for (var n = 0, r, i, s; r = e[n]; n++) s = n === 0 ? 1 : 0, this.arrangeControl(r, {
opacity: s
});
},
start: function() {
this.inherited(arguments);
var e = this.container.getPanels();
for (var t = 0, n; n = e[t]; t++) {
var r = n.showing;
n.setShowing(t == this.container.fromIndex || t == this.container.toIndex), n.showing && !r && n.resized();
}
},
finish: function() {
this.inherited(arguments);
var e = this.container.getPanels();
for (var t = 0, n; n = e[t]; t++) n.setShowing(t == this.container.toIndex);
},
destroy: function() {
var e = this.container.getPanels();
for (var t = 0, n; n = e[t]; t++) enyo.Arranger.opacifyControl(n, 1), n.showing || n.setShowing(!0);
this.inherited(arguments);
}
});

// CardSlideInArranger.js

enyo.kind({
name: "enyo.CardSlideInArranger",
kind: "CardArranger",
start: function() {
var e = this.container.getPanels();
for (var t = 0, n; n = e[t]; t++) {
var r = n.showing;
n.setShowing(t == this.container.fromIndex || t == this.container.toIndex), n.showing && !r && n.resized();
}
var i = this.container.fromIndex;
t = this.container.toIndex, this.container.transitionPoints = [ t + "." + i + ".s", t + "." + i + ".f" ];
},
finish: function() {
this.inherited(arguments);
var e = this.container.getPanels();
for (var t = 0, n; n = e[t]; t++) n.setShowing(t == this.container.toIndex);
},
arrange: function(e, t) {
var n = t.split("."), r = n[0], i = n[1], s = n[2] == "s", o = this.containerBounds.width;
for (var u = 0, a = this.container.getPanels(), f, l; f = a[u]; u++) l = o, i == u && (l = s ? 0 : -o), r == u && (l = s ? o : 0), i == u && i == r && (l = 0), this.arrangeControl(f, {
left: l
});
},
destroy: function() {
var e = this.container.getPanels();
for (var t = 0, n; n = e[t]; t++) enyo.Arranger.positionControl(n, {
left: null
});
this.inherited(arguments);
}
});

// CarouselArranger.js

enyo.kind({
name: "enyo.CarouselArranger",
kind: "Arranger",
size: function() {
var e = this.container.getPanels(), t = this.containerPadding = this.container.hasNode() ? enyo.dom.calcPaddingExtents(this.container.node) : {}, n = this.containerBounds, r, i, s, o, u;
n.height -= t.top + t.bottom, n.width -= t.left + t.right;
var a;
for (r = 0, s = 0; u = e[r]; r++) o = enyo.dom.calcMarginExtents(u.hasNode()), u.width = u.getBounds().width, u.marginWidth = o.right + o.left, s += (u.fit ? 0 : u.width) + u.marginWidth, u.fit && (a = u);
if (a) {
var f = n.width - s;
a.width = f >= 0 ? f : a.width;
}
for (r = 0, i = t.left; u = e[r]; r++) u.setBounds({
top: t.top,
bottom: t.bottom,
width: u.fit ? u.width : null
});
},
arrange: function(e, t) {
this.container.wrap ? this.arrangeWrap(e, t) : this.arrangeNoWrap(e, t);
},
arrangeNoWrap: function(e, t) {
var n, r, i, s, o = this.container.getPanels(), u = this.container.clamp(t), a = this.containerBounds.width;
for (n = u, i = 0; s = o[n]; n++) {
i += s.width + s.marginWidth;
if (i > a) break;
}
var f = a - i, l = 0;
if (f > 0) {
var c = u;
for (n = u - 1, r = 0; s = o[n]; n--) {
r += s.width + s.marginWidth;
if (f - r <= 0) {
l = f - r, u = n;
break;
}
}
}
var h, p;
for (n = 0, p = this.containerPadding.left + l; s = o[n]; n++) h = s.width + s.marginWidth, n < u ? this.arrangeControl(s, {
left: -h
}) : (this.arrangeControl(s, {
left: Math.floor(p)
}), p += h);
},
arrangeWrap: function(e, t) {
for (var n = 0, r = this.containerPadding.left, i, s; s = e[n]; n++) this.arrangeControl(s, {
left: r
}), r += s.width + s.marginWidth;
},
calcArrangementDifference: function(e, t, n, r) {
var i = Math.abs(e % this.c$.length);
return t[i].left - r[i].left;
},
destroy: function() {
var e = this.container.getPanels();
for (var t = 0, n; n = e[t]; t++) enyo.Arranger.positionControl(n, {
left: null,
top: null
}), n.applyStyle("top", null), n.applyStyle("bottom", null), n.applyStyle("left", null), n.applyStyle("width", null);
this.inherited(arguments);
}
});

// CollapsingArranger.js

enyo.kind({
name: "enyo.CollapsingArranger",
kind: "CarouselArranger",
peekWidth: 0,
size: function() {
this.clearLastSize(), this.inherited(arguments);
},
clearLastSize: function() {
for (var e = 0, t = this.container.getPanels(), n; n = t[e]; e++) n._fit && e != t.length - 1 && (n.applyStyle("width", null), n._fit = null);
},
constructor: function() {
this.inherited(arguments), this.peekWidth = this.container.peekWidth != null ? this.container.peekWidth : this.peekWidth;
},
arrange: function(e, t) {
var n = this.container.getPanels();
for (var r = 0, i = this.containerPadding.left, s, o, u = 0; o = n[r]; r++) o.getShowing() ? (this.arrangeControl(o, {
left: i + u * this.peekWidth
}), r >= t && (i += o.width + o.marginWidth - this.peekWidth), u++) : (this.arrangeControl(o, {
left: i
}), r >= t && (i += o.width + o.marginWidth)), r == n.length - 1 && t < 0 && this.arrangeControl(o, {
left: i - t
});
},
calcArrangementDifference: function(e, t, n, r) {
var i = this.container.getPanels().length - 1;
return Math.abs(r[i].left - t[i].left);
},
flowControl: function(e, t) {
this.inherited(arguments);
if (this.container.realtimeFit) {
var n = this.container.getPanels(), r = n.length - 1, i = n[r];
e == i && this.fitControl(e, t.left);
}
},
finish: function() {
this.inherited(arguments);
if (!this.container.realtimeFit && this.containerBounds) {
var e = this.container.getPanels(), t = this.container.arrangement, n = e.length - 1, r = e[n];
this.fitControl(r, t[n].left);
}
},
fitControl: function(e, t) {
e._fit = !0, e.applyStyle("width", this.containerBounds.width - t + "px"), e.resized();
}
});

// DockRightArranger.js

enyo.kind({
name: "enyo.DockRightArranger",
kind: "Arranger",
basePanel: !1,
overlap: 0,
layoutWidth: 0,
constructor: function() {
this.inherited(arguments), this.overlap = this.container.overlap != null ? this.container.overlap : this.overlap, this.layoutWidth = this.container.layoutWidth != null ? this.container.layoutWidth : this.layoutWidth;
},
size: function() {
var e = this.container.getPanels(), t = this.containerPadding = this.container.hasNode() ? enyo.dom.calcPaddingExtents(this.container.node) : {}, n = this.containerBounds, r, i, s;
n.width -= t.left + t.right;
var o = n.width, u = e.length;
this.container.transitionPositions = {};
for (r = 0; s = e[r]; r++) s.width = r === 0 && this.container.basePanel ? o : s.getBounds().width;
for (r = 0; s = e[r]; r++) {
r === 0 && this.container.basePanel && s.setBounds({
width: o
}), s.setBounds({
top: t.top,
bottom: t.bottom
});
for (j = 0; s = e[j]; j++) {
var a;
if (r === 0 && this.container.basePanel) a = 0; else if (j < r) a = o; else {
if (r !== j) break;
var f = o > this.layoutWidth ? this.overlap : 0;
a = o - e[r].width + f;
}
this.container.transitionPositions[r + "." + j] = a;
}
if (j < u) {
var l = !1;
for (k = r + 1; k < u; k++) {
var f = 0;
if (l) f = 0; else if (e[r].width + e[k].width - this.overlap > o) f = 0, l = !0; else {
f = e[r].width - this.overlap;
for (i = r; i < k; i++) {
var c = f + e[i + 1].width - this.overlap;
if (!(c < o)) {
f = o;
break;
}
f = c;
}
f = o - f;
}
this.container.transitionPositions[r + "." + k] = f;
}
}
}
},
arrange: function(e, t) {
var n, r, i = this.container.getPanels(), s = this.container.clamp(t);
for (n = 0; r = i[n]; n++) {
var o = this.container.transitionPositions[n + "." + s];
this.arrangeControl(r, {
left: o
});
}
},
calcArrangementDifference: function(e, t, n, r) {
var i = this.container.getPanels(), s = e < n ? i[n].width : i[e].width;
return s;
},
destroy: function() {
var e = this.container.getPanels();
for (var t = 0, n; n = e[t]; t++) enyo.Arranger.positionControl(n, {
left: null,
top: null
}), n.applyStyle("top", null), n.applyStyle("bottom", null), n.applyStyle("left", null), n.applyStyle("width", null);
this.inherited(arguments);
}
});

// OtherArrangers.js

enyo.kind({
name: "enyo.LeftRightArranger",
kind: "Arranger",
margin: 40,
axisSize: "width",
offAxisSize: "height",
axisPosition: "left",
constructor: function() {
this.inherited(arguments), this.margin = this.container.margin != null ? this.container.margin : this.margin;
},
size: function() {
var e = this.container.getPanels(), t = this.containerBounds[this.axisSize], n = t - this.margin - this.margin;
for (var r = 0, i, s; s = e[r]; r++) i = {}, i[this.axisSize] = n, i[this.offAxisSize] = "100%", s.setBounds(i);
},
start: function() {
this.inherited(arguments);
var e = this.container.fromIndex, t = this.container.toIndex, n = this.getOrderedControls(t), r = Math.floor(n.length / 2);
for (var i = 0, s; s = n[i]; i++) e > t ? i == n.length - r ? s.applyStyle("z-index", 0) : s.applyStyle("z-index", 1) : i == n.length - 1 - r ? s.applyStyle("z-index", 0) : s.applyStyle("z-index", 1);
},
arrange: function(e, t) {
var n, r, i, s;
if (this.container.getPanels().length == 1) {
s = {}, s[this.axisPosition] = this.margin, this.arrangeControl(this.container.getPanels()[0], s);
return;
}
var o = Math.floor(this.container.getPanels().length / 2), u = this.getOrderedControls(Math.floor(t) - o), a = this.containerBounds[this.axisSize] - this.margin - this.margin, f = this.margin - a * o;
for (n = 0; r = u[n]; n++) s = {}, s[this.axisPosition] = f, this.arrangeControl(r, s), f += a;
},
calcArrangementDifference: function(e, t, n, r) {
if (this.container.getPanels().length == 1) return 0;
var i = Math.abs(e % this.c$.length);
return t[i][this.axisPosition] - r[i][this.axisPosition];
},
destroy: function() {
var e = this.container.getPanels();
for (var t = 0, n; n = e[t]; t++) enyo.Arranger.positionControl(n, {
left: null,
top: null
}), enyo.Arranger.opacifyControl(n, 1), n.applyStyle("left", null), n.applyStyle("top", null), n.applyStyle("height", null), n.applyStyle("width", null);
this.inherited(arguments);
}
}), enyo.kind({
name: "enyo.TopBottomArranger",
kind: "LeftRightArranger",
dragProp: "ddy",
dragDirectionProp: "yDirection",
canDragProp: "vertical",
axisSize: "height",
offAxisSize: "width",
axisPosition: "top"
}), enyo.kind({
name: "enyo.SpiralArranger",
kind: "Arranger",
incrementalPoints: !0,
inc: 20,
size: function() {
var e = this.container.getPanels(), t = this.containerBounds, n = this.controlWidth = t.width / 3, r = this.controlHeight = t.height / 3;
for (var i = 0, s; s = e[i]; i++) s.setBounds({
width: n,
height: r
});
},
arrange: function(e, t) {
var n = this.inc;
for (var r = 0, i = e.length, s; s = e[r]; r++) {
var o = Math.cos(r / i * 2 * Math.PI) * r * n + this.controlWidth, u = Math.sin(r / i * 2 * Math.PI) * r * n + this.controlHeight;
this.arrangeControl(s, {
left: o,
top: u
});
}
},
start: function() {
this.inherited(arguments);
var e = this.getOrderedControls(this.container.toIndex);
for (var t = 0, n; n = e[t]; t++) n.applyStyle("z-index", e.length - t);
},
calcArrangementDifference: function(e, t, n, r) {
return this.controlWidth;
},
destroy: function() {
var e = this.container.getPanels();
for (var t = 0, n; n = e[t]; t++) n.applyStyle("z-index", null), enyo.Arranger.positionControl(n, {
left: null,
top: null
}), n.applyStyle("left", null), n.applyStyle("top", null), n.applyStyle("height", null), n.applyStyle("width", null);
this.inherited(arguments);
}
}), enyo.kind({
name: "enyo.GridArranger",
kind: "Arranger",
incrementalPoints: !0,
colWidth: 100,
colHeight: 100,
size: function() {
var e = this.container.getPanels(), t = this.colWidth, n = this.colHeight;
for (var r = 0, i; i = e[r]; r++) i.setBounds({
width: t,
height: n
});
},
arrange: function(e, t) {
var n = this.colWidth, r = this.colHeight, i = Math.max(1, Math.floor(this.containerBounds.width / n)), s;
for (var o = 0, u = 0; u < e.length; o++) for (var a = 0; a < i && (s = e[u]); a++, u++) this.arrangeControl(s, {
left: n * a,
top: r * o
});
},
flowControl: function(e, t) {
this.inherited(arguments), enyo.Arranger.opacifyControl(e, t.top % this.colHeight !== 0 ? .25 : 1);
},
calcArrangementDifference: function(e, t, n, r) {
return this.colWidth;
},
destroy: function() {
var e = this.container.getPanels();
for (var t = 0, n; n = e[t]; t++) enyo.Arranger.positionControl(n, {
left: null,
top: null
}), n.applyStyle("left", null), n.applyStyle("top", null), n.applyStyle("height", null), n.applyStyle("width", null);
this.inherited(arguments);
}
});

// Panels.js

enyo.kind({
name: "enyo.Panels",
classes: "enyo-panels",
published: {
index: 0,
draggable: !0,
animate: !0,
wrap: !1,
arrangerKind: "CardArranger",
narrowFit: !0
},
events: {
onTransitionStart: "",
onTransitionFinish: ""
},
handlers: {
ondragstart: "dragstart",
ondrag: "drag",
ondragfinish: "dragfinish",
onscroll: "domScroll"
},
tools: [ {
kind: "Animator",
onStep: "step",
onEnd: "completed"
} ],
fraction: 0,
create: function() {
this.transitionPoints = [], this.inherited(arguments), this.arrangerKindChanged(), this.narrowFitChanged(), this.indexChanged();
},
rendered: function() {
this.inherited(arguments), enyo.makeBubble(this, "scroll");
},
domScroll: function(e, t) {
this.hasNode() && this.node.scrollLeft > 0 && (this.node.scrollLeft = 0);
},
initComponents: function() {
this.createChrome(this.tools), this.inherited(arguments);
},
arrangerKindChanged: function() {
this.setLayoutKind(this.arrangerKind);
},
narrowFitChanged: function() {
this.addRemoveClass("enyo-panels-fit-narrow", this.narrowFit);
},
destroy: function() {
this.destroying = !0, this.inherited(arguments);
},
removeControl: function(e) {
this.inherited(arguments), this.destroying && this.controls.length > 0 && this.isPanel(e) && (this.setIndex(Math.max(this.index - 1, 0)), this.flow(), this.reflow());
},
isPanel: function() {
return !0;
},
flow: function() {
this.arrangements = [], this.inherited(arguments);
},
reflow: function() {
this.arrangements = [], this.inherited(arguments), this.refresh();
},
getPanels: function() {
var e = this.controlParent || this;
return e.children;
},
getActive: function() {
var e = this.getPanels(), t = this.index % e.length;
return t < 0 && (t += e.length), e[t];
},
getAnimator: function() {
return this.$.animator;
},
setIndex: function(e) {
this.setPropertyValue("index", e, "indexChanged");
},
setIndexDirect: function(e) {
this.setIndex(e), this.completed();
},
selectPanelByName: function(e) {
if (!e) return;
var t = 0, n = this.getPanels(), r = n.length;
for (; t < r; ++t) if (e === n[t].name) return this.setIndex(t), t;
},
previous: function() {
this.setIndex(this.index - 1);
},
next: function() {
this.setIndex(this.index + 1);
},
clamp: function(e) {
var t = this.getPanels().length - 1;
return this.wrap ? e : Math.max(0, Math.min(e, t));
},
indexChanged: function(e) {
this.lastIndex = e, this.index = this.clamp(this.index), !this.dragging && this.$.animator && (this.$.animator.isAnimating() && this.completed(), this.$.animator.stop(), this.hasNode() && (this.animate ? (this.startTransition(), this.$.animator.play({
startValue: this.fraction
})) : this.refresh()));
},
step: function(e) {
this.fraction = e.value, this.stepTransition();
},
completed: function() {
return this.$.animator.isAnimating() && this.$.animator.stop(), this.fraction = 1, this.stepTransition(), this.finishTransition(), !0;
},
dragstart: function(e, t) {
if (this.draggable && this.layout && this.layout.canDragEvent(t)) return t.preventDefault(), this.dragstartTransition(t), this.dragging = !0, this.$.animator.stop(), !0;
},
drag: function(e, t) {
this.dragging && (t.preventDefault(), this.dragTransition(t));
},
dragfinish: function(e, t) {
this.dragging && (this.dragging = !1, t.preventTap(), this.dragfinishTransition(t));
},
dragstartTransition: function(e) {
if (!this.$.animator.isAnimating()) {
var t = this.fromIndex = this.index;
this.toIndex = t - (this.layout ? this.layout.calcDragDirection(e) : 0);
} else this.verifyDragTransition(e);
this.fromIndex = this.clamp(this.fromIndex), this.toIndex = this.clamp(this.toIndex), this.fireTransitionStart(), this.layout && this.layout.start();
},
dragTransition: function(e) {
var t = this.layout ? this.layout.calcDrag(e) : 0, n = this.transitionPoints, r = n[0], i = n[n.length - 1], s = this.fetchArrangement(r), o = this.fetchArrangement(i), u = this.layout ? this.layout.drag(t, r, s, i, o) : 0, a = t && !u;
a, this.fraction += u;
var f = this.fraction;
if (f > 1 || f < 0 || a) (f > 0 || a) && this.dragfinishTransition(e), this.dragstartTransition(e), this.fraction = 0;
this.stepTransition();
},
dragfinishTransition: function(e) {
this.verifyDragTransition(e), this.setIndex(this.toIndex), this.dragging && this.fireTransitionFinish();
},
verifyDragTransition: function(e) {
var t = this.layout ? this.layout.calcDragDirection(e) : 0, n = Math.min(this.fromIndex, this.toIndex), r = Math.max(this.fromIndex, this.toIndex);
if (t > 0) {
var i = n;
n = r, r = i;
}
n != this.fromIndex && (this.fraction = 1 - this.fraction), this.fromIndex = n, this.toIndex = r;
},
refresh: function() {
this.$.animator && this.$.animator.isAnimating() && this.$.animator.stop(), this.startTransition(), this.fraction = 1, this.stepTransition(), this.finishTransition();
},
startTransition: function() {
this.fromIndex = this.fromIndex != null ? this.fromIndex : this.lastIndex || 0, this.toIndex = this.toIndex != null ? this.toIndex : this.index, this.layout && this.layout.start(), this.fireTransitionStart();
},
finishTransition: function() {
this.layout && this.layout.finish(), this.transitionPoints = [], this.fraction = 0, this.fromIndex = this.toIndex = null, this.fireTransitionFinish();
},
fireTransitionStart: function() {
var e = this.startTransitionInfo;
this.hasNode() && (!e || e.fromIndex != this.fromIndex || e.toIndex != this.toIndex) && (this.startTransitionInfo = {
fromIndex: this.fromIndex,
toIndex: this.toIndex
}, this.doTransitionStart(enyo.clone(this.startTransitionInfo)));
},
fireTransitionFinish: function() {
var e = this.finishTransitionInfo;
this.hasNode() && (!e || e.fromIndex != this.lastIndex || e.toIndex != this.index) && (this.finishTransitionInfo = {
fromIndex: this.lastIndex,
toIndex: this.index
}, this.doTransitionFinish(enyo.clone(this.finishTransitionInfo))), this.lastIndex = this.index;
},
stepTransition: function() {
if (this.hasNode()) {
var e = this.transitionPoints, t = (this.fraction || 0) * (e.length - 1), n = Math.floor(t);
t -= n;
var r = e[n], i = e[n + 1], s = this.fetchArrangement(r), o = this.fetchArrangement(i);
this.arrangement = s && o ? enyo.Panels.lerp(s, o, t) : s || o, this.arrangement && this.layout && this.layout.flowArrangement();
}
},
fetchArrangement: function(e) {
return e != null && !this.arrangements[e] && this.layout && (this.layout._arrange(e), this.arrangements[e] = this.readArrangement(this.getPanels())), this.arrangements[e];
},
readArrangement: function(e) {
var t = [];
for (var n = 0, r = e, i; i = r[n]; n++) t.push(enyo.clone(i._arranger));
return t;
},
statics: {
isScreenNarrow: function() {
return enyo.dom.getWindowWidth() <= 800;
},
lerp: function(e, t, n) {
var r = [];
for (var i = 0, s = enyo.keys(e), o; o = s[i]; i++) r.push(this.lerpObject(e[o], t[o], n));
return r;
},
lerpObject: function(e, t, n) {
var r = enyo.clone(e), i, s;
if (t) for (var o in e) i = e[o], s = t[o], i != s && (r[o] = i - (i - s) * n);
return r;
}
}
});

// Node.js

enyo.kind({
name: "enyo.Node",
published: {
expandable: !1,
expanded: !1,
icon: "",
onlyIconExpands: !1,
selected: !1
},
style: "padding: 0 0 0 16px;",
content: "Node",
defaultKind: "Node",
classes: "enyo-node",
components: [ {
name: "icon",
kind: "Image",
showing: !1
}, {
kind: "Control",
name: "caption",
Xtag: "span",
style: "display: inline-block; padding: 4px;",
allowHtml: !0
}, {
kind: "Control",
name: "extra",
tag: "span",
allowHtml: !0
} ],
childClient: [ {
kind: "Control",
name: "box",
classes: "enyo-node-box",
Xstyle: "border: 1px solid orange;",
components: [ {
kind: "Control",
name: "client",
classes: "enyo-node-client",
Xstyle: "border: 1px solid lightblue;"
} ]
} ],
handlers: {
ondblclick: "dblclick"
},
events: {
onNodeTap: "nodeTap",
onNodeDblClick: "nodeDblClick",
onExpand: "nodeExpand",
onDestroyed: "nodeDestroyed"
},
create: function() {
this.inherited(arguments), this.selectedChanged(), this.iconChanged();
},
destroy: function() {
this.doDestroyed(), this.inherited(arguments);
},
initComponents: function() {
this.expandable && (this.kindComponents = this.kindComponents.concat(this.childClient)), this.inherited(arguments);
},
contentChanged: function() {
this.$.caption.setContent(this.content);
},
iconChanged: function() {
this.$.icon.setSrc(this.icon), this.$.icon.setShowing(Boolean(this.icon));
},
selectedChanged: function() {
this.addRemoveClass("enyo-selected", this.selected);
},
rendered: function() {
this.inherited(arguments), this.expandable && !this.expanded && this.quickCollapse();
},
addNodes: function(e) {
this.destroyClientControls();
for (var t = 0, n; n = e[t]; t++) this.createComponent(n);
this.$.client.render();
},
addTextNodes: function(e) {
this.destroyClientControls();
for (var t = 0, n; n = e[t]; t++) this.createComponent({
content: n
});
this.$.client.render();
},
tap: function(e, t) {
return this.onlyIconExpands ? t.target == this.$.icon.hasNode() ? this.toggleExpanded() : this.doNodeTap() : (this.toggleExpanded(), this.doNodeTap()), !0;
},
dblclick: function(e, t) {
return this.doNodeDblClick(), !0;
},
toggleExpanded: function() {
this.setExpanded(!this.expanded);
},
quickCollapse: function() {
this.removeClass("enyo-animate"), this.$.box.applyStyle("height", "0");
var e = this.$.client.getBounds().height;
this.$.client.setBounds({
top: -e
});
},
_expand: function() {
this.addClass("enyo-animate");
var e = this.$.client.getBounds().height;
this.$.box.setBounds({
height: e
}), this.$.client.setBounds({
top: 0
}), setTimeout(enyo.bind(this, function() {
this.expanded && (this.removeClass("enyo-animate"), this.$.box.applyStyle("height", "auto"));
}), 225);
},
_collapse: function() {
this.removeClass("enyo-animate");
var e = this.$.client.getBounds().height;
this.$.box.setBounds({
height: e
}), setTimeout(enyo.bind(this, function() {
this.addClass("enyo-animate"), this.$.box.applyStyle("height", "0"), this.$.client.setBounds({
top: -e
});
}), 25);
},
expandedChanged: function(e) {
if (!this.expandable) this.expanded = !1; else {
var t = {
expanded: this.expanded
};
this.doExpand(t), t.wait || this.effectExpanded();
}
},
effectExpanded: function() {
this.$.client && (this.expanded ? this._expand() : this._collapse());
}
});

// ImageViewPin.js

enyo.kind({
name: "enyo.ImageViewPin",
kind: "enyo.Control",
published: {
highlightAnchorPoint: !1,
anchor: {
top: 0,
left: 0
},
position: {
top: 0,
left: 0
}
},
style: "position:absolute;z-index:1000;width:0px;height:0px;",
handlers: {
onPositionPin: "reAnchor"
},
create: function() {
this.inherited(arguments), this.styleClientControls(), this.positionClientControls(), this.highlightAnchorPointChanged(), this.anchorChanged();
},
styleClientControls: function() {
var e = this.getClientControls();
for (var t = 0; t < e.length; t++) e[t].applyStyle("position", "absolute");
},
positionClientControls: function() {
var e = this.getClientControls();
for (var t = 0; t < e.length; t++) for (var n in this.position) e[t].applyStyle(n, this.position[n] + "px");
},
highlightAnchorPointChanged: function() {
this.addRemoveClass("pinDebug", this.highlightAnchorPoint);
},
anchorChanged: function() {
var e = null, t = null;
for (t in this.anchor) {
e = this.anchor[t].toString().match(/^(\d+(?:\.\d+)?)(.*)$/);
if (!e) continue;
this.anchor[t + "Coords"] = {
value: e[1],
units: e[2] || "px"
};
}
},
reAnchor: function(e, t) {
var n = t.scale, r = t.bounds, i = this.anchor.right ? this.anchor.rightCoords.units == "px" ? r.width + r.x - this.anchor.rightCoords.value * n : r.width * (100 - this.anchor.rightCoords.value) / 100 + r.x : this.anchor.leftCoords.units == "px" ? this.anchor.leftCoords.value * n + r.x : r.width * this.anchor.leftCoords.value / 100 + r.x, s = this.anchor.bottom ? this.anchor.bottomCoords.units == "px" ? r.height + r.y - this.anchor.bottomCoords.value * n : r.height * (100 - this.anchor.bottomCoords.value) / 100 + r.y : this.anchor.topCoords.units == "px" ? this.anchor.topCoords.value * n + r.y : r.height * this.anchor.topCoords.value / 100 + r.y;
this.applyStyle("left", i + "px"), this.applyStyle("top", s + "px");
}
});

// ImageView.js

enyo.kind({
name: "enyo.ImageView",
kind: enyo.Scroller,
touchOverscroll: !1,
thumb: !1,
animate: !0,
verticalDragPropagation: !0,
horizontalDragPropagation: !0,
published: {
scale: "auto",
disableZoom: !1,
src: undefined
},
events: {
onZoom: ""
},
touch: !0,
preventDragPropagation: !1,
handlers: {
ondragstart: "dragPropagation"
},
components: [ {
name: "animator",
kind: "Animator",
onStep: "zoomAnimationStep",
onEnd: "zoomAnimationEnd"
}, {
name: "viewport",
style: "overflow:hidden;min-height:100%;min-width:100%;",
classes: "enyo-fit",
ongesturechange: "gestureTransform",
ongestureend: "saveState",
ontap: "singleTap",
ondblclick: "doubleClick",
onmousewheel: "mousewheel",
components: [ {
kind: "Image",
ondown: "down"
} ]
} ],
create: function() {
this.inherited(arguments), this.canTransform = enyo.dom.canTransform(), this.canTransform || this.$.image.applyStyle("position", "relative"), this.canAccelerate = enyo.dom.canAccelerate(), this.bufferImage = new Image, this.bufferImage.onload = enyo.bind(this, "imageLoaded"), this.bufferImage.onerror = enyo.bind(this, "imageError"), this.srcChanged(), this.getStrategy().setDragDuringGesture(!1), this.getStrategy().$.scrollMath && this.getStrategy().$.scrollMath.start();
},
down: function(e, t) {
t.preventDefault();
},
dragPropagation: function(e, t) {
var n = this.getStrategy().getScrollBounds(), r = n.top === 0 && t.dy > 0 || n.top >= n.maxTop - 2 && t.dy < 0, i = n.left === 0 && t.dx > 0 || n.left >= n.maxLeft - 2 && t.dx < 0;
return !(r && this.verticalDragPropagation || i && this.horizontalDragPropagation);
},
mousewheel: function(e, t) {
t.pageX |= t.clientX + t.target.scrollLeft, t.pageY |= t.clientY + t.target.scrollTop;
var n = (this.maxScale - this.minScale) / 10, r = this.scale;
if (t.wheelDelta > 0 || t.detail < 0) this.scale = this.limitScale(this.scale + n); else if (t.wheelDelta < 0 || t.detail > 0) this.scale = this.limitScale(this.scale - n);
return this.eventPt = this.calcEventLocation(t), this.transformImage(this.scale), r != this.scale && this.doZoom({
scale: this.scale
}), this.ratioX = this.ratioY = null, t.preventDefault(), !0;
},
srcChanged: function() {
this.src && this.src.length > 0 && this.bufferImage && this.src != this.bufferImage.src && (this.bufferImage.src = this.src);
},
imageLoaded: function(e) {
this.originalWidth = this.bufferImage.width, this.originalHeight = this.bufferImage.height, this.scaleChanged(), this.$.image.setSrc(this.bufferImage.src), enyo.dom.transformValue(this.getStrategy().$.client, "translate3d", "0px, 0px, 0"), this.positionClientControls(this.scale), this.alignImage();
},
resizeHandler: function() {
this.inherited(arguments), this.$.image.src && this.scaleChanged();
},
scaleChanged: function() {
var e = this.hasNode();
if (e) {
this.containerWidth = e.clientWidth, this.containerHeight = e.clientHeight;
var t = this.containerWidth / this.originalWidth, n = this.containerHeight / this.originalHeight;
this.minScale = Math.min(t, n), this.maxScale = this.minScale * 3 < 1 ? 1 : this.minScale * 3, this.scale == "auto" ? this.scale = this.minScale : this.scale == "width" ? this.scale = t : this.scale == "height" ? this.scale = n : this.scale == "fit" ? (this.fitAlignment = "center", this.scale = Math.max(t, n)) : (this.maxScale = Math.max(this.maxScale, this.scale), this.scale = this.limitScale(this.scale));
}
this.eventPt = this.calcEventLocation(), this.transformImage(this.scale);
},
imageError: function(e) {
enyo.error("Error loading image: " + this.src), this.bubble("onerror", e);
},
alignImage: function() {
if (this.fitAlignment && this.fitAlignment === "center") {
var e = this.getScrollBounds();
this.setScrollLeft(e.maxLeft / 2), this.setScrollTop(e.maxTop / 2);
}
},
gestureTransform: function(e, t) {
this.eventPt = this.calcEventLocation(t), this.transformImage(this.limitScale(this.scale * t.scale));
},
calcEventLocation: function(e) {
var t = {
x: 0,
y: 0
};
if (e && this.hasNode()) {
var n = this.node.getBoundingClientRect();
t.x = Math.round(e.pageX - n.left - this.imageBounds.x), t.x = Math.max(0, Math.min(this.imageBounds.width, t.x)), t.y = Math.round(e.pageY - n.top - this.imageBounds.y), t.y = Math.max(0, Math.min(this.imageBounds.height, t.y));
}
return t;
},
transformImage: function(e) {
this.tapped = !1;
var t = this.imageBounds || this.innerImageBounds(e);
this.imageBounds = this.innerImageBounds(e), this.scale > this.minScale ? this.$.viewport.applyStyle("cursor", "move") : this.$.viewport.applyStyle("cursor", null), this.$.viewport.setBounds({
width: this.imageBounds.width + "px",
height: this.imageBounds.height + "px"
}), this.ratioX = this.ratioX || (this.eventPt.x + this.getScrollLeft()) / t.width, this.ratioY = this.ratioY || (this.eventPt.y + this.getScrollTop()) / t.height;
var n, r;
this.$.animator.ratioLock ? (n = this.$.animator.ratioLock.x * this.imageBounds.width - this.containerWidth / 2, r = this.$.animator.ratioLock.y * this.imageBounds.height - this.containerHeight / 2) : (n = this.ratioX * this.imageBounds.width - this.eventPt.x, r = this.ratioY * this.imageBounds.height - this.eventPt.y), n = Math.max(0, Math.min(this.imageBounds.width - this.containerWidth, n)), r = Math.max(0, Math.min(this.imageBounds.height - this.containerHeight, r));
if (this.canTransform) {
var i = {
scale: e
};
this.canAccelerate ? i = enyo.mixin({
translate3d: Math.round(this.imageBounds.left) + "px, " + Math.round(this.imageBounds.top) + "px, 0px"
}, i) : i = enyo.mixin({
translate: this.imageBounds.left + "px, " + this.imageBounds.top + "px"
}, i), enyo.dom.transform(this.$.image, i);
} else this.$.image.setBounds({
width: this.imageBounds.width + "px",
height: this.imageBounds.height + "px",
left: this.imageBounds.left + "px",
top: this.imageBounds.top + "px"
});
this.setScrollLeft(n), this.setScrollTop(r), this.positionClientControls(e);
},
limitScale: function(e) {
return this.disableZoom ? e = this.scale : e > this.maxScale ? e = this.maxScale : e < this.minScale && (e = this.minScale), e;
},
innerImageBounds: function(e) {
var t = this.originalWidth * e, n = this.originalHeight * e, r = {
x: 0,
y: 0,
transX: 0,
transY: 0
};
return t < this.containerWidth && (r.x += (this.containerWidth - t) / 2), n < this.containerHeight && (r.y += (this.containerHeight - n) / 2), this.canTransform && (r.transX -= (this.originalWidth - t) / 2, r.transY -= (this.originalHeight - n) / 2), {
left: r.x + r.transX,
top: r.y + r.transY,
width: t,
height: n,
x: r.x,
y: r.y
};
},
saveState: function(e, t) {
var n = this.scale;
this.scale *= t.scale, this.scale = this.limitScale(this.scale), n != this.scale && this.doZoom({
scale: this.scale
}), this.ratioX = this.ratioY = null;
},
doubleClick: function(e, t) {
enyo.platform.ie == 8 && (this.tapped = !0, t.pageX = t.clientX + t.target.scrollLeft, t.pageY = t.clientY + t.target.scrollTop, this.singleTap(e, t), t.preventDefault());
},
singleTap: function(e, t) {
setTimeout(enyo.bind(this, function() {
this.tapped = !1;
}), 300), this.tapped ? (this.tapped = !1, this.smartZoom(e, t)) : this.tapped = !0;
},
smartZoom: function(e, t) {
var n = this.hasNode(), r = this.$.image.hasNode();
if (n && r && this.hasNode() && !this.disableZoom) {
var i = this.scale;
this.scale != this.minScale ? this.scale = this.minScale : this.scale = this.maxScale, this.eventPt = this.calcEventLocation(t);
if (this.animate) {
var s = {
x: (this.eventPt.x + this.getScrollLeft()) / this.imageBounds.width,
y: (this.eventPt.y + this.getScrollTop()) / this.imageBounds.height
};
this.$.animator.play({
duration: 350,
ratioLock: s,
baseScale: i,
deltaScale: this.scale - i
});
} else this.transformImage(this.scale), this.doZoom({
scale: this.scale
});
}
},
zoomAnimationStep: function(e, t) {
var n = this.$.animator.baseScale + this.$.animator.deltaScale * this.$.animator.value;
this.transformImage(n);
},
zoomAnimationEnd: function(e, t) {
this.doZoom({
scale: this.scale
}), this.$.animator.ratioLock = undefined;
},
positionClientControls: function(e) {
this.waterfallDown("onPositionPin", {
scale: e,
bounds: this.imageBounds
});
}
});

// ImageCarousel.js

enyo.kind({
name: "enyo.ImageCarousel",
kind: enyo.Panels,
arrangerKind: "enyo.CarouselArranger",
defaultScale: "auto",
disableZoom: !1,
lowMemory: !1,
published: {
images: []
},
handlers: {
onTransitionStart: "transitionStart",
onTransitionFinish: "transitionFinish"
},
create: function() {
this.inherited(arguments), this.imageCount = this.images.length, this.images.length > 0 && (this.initContainers(), this.loadNearby());
},
initContainers: function() {
for (var e = 0; e < this.images.length; e++) this.$["container" + e] || (this.createComponent({
name: "container" + e,
style: "height:100%; width:100%;"
}), this.$["container" + e].render());
for (e = this.images.length; e < this.imageCount; e++) this.$["image" + e] && this.$["image" + e].destroy(), this.$["container" + e].destroy();
this.imageCount = this.images.length;
},
loadNearby: function() {
var e = this.getBufferRange();
for (var t in e) this.loadImageView(e[t]);
},
getBufferRange: function() {
var e = [];
if (this.layout.containerBounds) {
var t = 1, n = this.layout.containerBounds, r, i, s, o, u, a;
o = this.index - 1, u = 0, a = n.width * t;
while (o >= 0 && u <= a) s = this.$["container" + o], u += s.width + s.marginWidth, e.unshift(o), o--;
o = this.index, u = 0, a = n.width * (t + 1);
while (o < this.images.length && u <= a) s = this.$["container" + o], u += s.width + s.marginWidth, e.push(o), o++;
}
return e;
},
reflow: function() {
this.inherited(arguments), this.loadNearby();
},
loadImageView: function(e) {
return this.wrap && (e = (e % this.images.length + this.images.length) % this.images.length), e >= 0 && e <= this.images.length - 1 && (this.$["image" + e] ? this.$["image" + e].src != this.images[e] && (this.$["image" + e].setSrc(this.images[e]), this.$["image" + e].setScale(this.defaultScale), this.$["image" + e].setDisableZoom(this.disableZoom)) : (this.$["container" + e].createComponent({
name: "image" + e,
kind: "ImageView",
scale: this.defaultScale,
disableZoom: this.disableZoom,
src: this.images[e],
verticalDragPropagation: !1,
style: "height:100%; width:100%;"
}, {
owner: this
}), this.$["image" + e].render())), this.$["image" + e];
},
setImages: function(e) {
this.setPropertyValue("images", e, "imagesChanged");
},
imagesChanged: function() {
this.initContainers(), this.loadNearby();
},
indexChanged: function() {
this.loadNearby(), this.lowMemory && this.cleanupMemory(), this.inherited(arguments);
},
transitionStart: function(e, t) {
if (t.fromIndex == t.toIndex) return !0;
},
transitionFinish: function(e, t) {
this.loadNearby(), this.lowMemory && this.cleanupMemory();
},
getActiveImage: function() {
return this.getImageByIndex(this.index);
},
getImageByIndex: function(e) {
return this.$["image" + e] || this.loadImageView(e);
},
cleanupMemory: function() {
var e = getBufferRange();
for (var t = 0; t < this.images.length; t++) enyo.indexOf(t, e) === -1 && this.$["image" + t] && this.$["image" + t].destroy();
}
});
