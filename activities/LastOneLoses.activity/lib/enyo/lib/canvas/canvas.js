
// Canvas.js

enyo.kind({
name: "enyo.Canvas",
kind: enyo.Control,
tag: "canvas",
attributes: {
width: 500,
height: 500
},
defaultKind: "enyo.canvas.Control",
generateInnerHtml: function() {
return "";
},
teardownChildren: function() {},
rendered: function() {
this.renderChildren();
},
addChild: function() {
enyo.UiComponent.prototype.addChild.apply(this, arguments);
},
removeChild: function() {
enyo.UiComponent.prototype.removeChild.apply(this, arguments);
},
renderChildren: function(e) {
var t = e, n = this.hasNode();
t || n.getContext && (t = n.getContext("2d"));
if (t) for (var r = 0, i; i = this.children[r]; r++) i.render(t);
},
update: function() {
var e = this.hasNode();
if (e.getContext) {
var t = e.getContext("2d"), n = this.getBounds();
t.clearRect(0, 0, n.width, n.height), this.renderChildren(t);
}
}
});

// CanvasControl.js

enyo.kind({
name: "enyo.canvas.Control",
kind: enyo.UiComponent,
defaultKind: "enyo.canvas.Control",
published: {
bounds: null
},
events: {
onRender: ""
},
constructor: function() {
this.bounds = {
l: enyo.irand(400),
t: enyo.irand(400),
w: enyo.irand(100),
h: enyo.irand(100)
}, this.inherited(arguments);
},
importProps: function(e) {
this.inherited(arguments), e && e.bounds && (enyo.mixin(this.bounds, e.bounds), delete e.bounds);
},
renderSelf: function(e) {
this.doRender({
context: e
});
},
render: function(e) {
this.children.length ? this.renderChildren(e) : this.renderSelf(e);
},
renderChildren: function(e) {
for (var t = 0, n; n = this.children[t]; t++) n.render(e);
}
});

// Shape.js

enyo.kind({
name: "enyo.canvas.Shape",
kind: enyo.canvas.Control,
published: {
color: "red",
outlineColor: ""
},
fill: function(e) {
e.fill();
},
outline: function(e) {
e.stroke();
},
draw: function(e) {
this.color && (e.fillStyle = this.color, this.fill(e)), this.outlineColor && (e.strokeStyle = this.outlineColor, this.outline(e));
}
});

// Circle.js

enyo.kind({
name: "enyo.canvas.Circle",
kind: enyo.canvas.Shape,
renderSelf: function(e) {
e.beginPath(), e.arc(this.bounds.l, this.bounds.t, this.bounds.w, 0, Math.PI * 2), this.draw(e);
}
});

// Rectangle.js

enyo.kind({
name: "enyo.canvas.Rectangle",
kind: enyo.canvas.Shape,
published: {
clear: !1
},
renderSelf: function(e) {
this.clear ? e.clearRect(this.bounds.l, this.bounds.t, this.bounds.w, this.bounds.h) : this.draw(e);
},
fill: function(e) {
e.fillRect(this.bounds.l, this.bounds.t, this.bounds.w, this.bounds.h);
},
outline: function(e) {
e.strokeRect(this.bounds.l, this.bounds.t, this.bounds.w, this.bounds.h);
}
});

// Text.js

enyo.kind({
name: "enyo.canvas.Text",
kind: enyo.canvas.Shape,
published: {
text: "",
font: "12pt Arial",
align: "left"
},
renderSelf: function(e) {
e.textAlign = this.align, e.font = this.font, this.draw(e);
},
fill: function(e) {
e.fillText(this.text, this.bounds.l, this.bounds.t);
},
outline: function(e) {
e.strokeText(this.text, this.bounds.l, this.bounds.t);
}
});

// Image.js

enyo.kind({
name: "enyo.canvas.Image",
kind: enyo.canvas.Control,
published: {
src: ""
},
create: function() {
this.image = new Image, this.inherited(arguments), this.srcChanged();
},
srcChanged: function() {
this.src && (this.image.src = this.src);
},
renderSelf: function(e) {
e.drawImage(this.image, this.bounds.l, this.bounds.t);
}
});
