define(["sugar-web/graphics/palette"], function(palette) {

	'use strict';

	var textpalette = {};

	textpalette.TextPalette = function(textButton) {

		palette.Palette.call(this, textButton);

		this.getPalette().id = "text-palette";

		var containerElem = document.createElement('div');

		var content = '<div class="row small">' +
		'<label id="messageLabel">' + 'Texte:' + '</label>' +
		'</div>' +
		'<div class="row expand">' +
		'<textarea rows="8" id="editor" class="expand"></textarea>' +
		'</div>';


		var styleToolbar = '<div class="toolbar" id="text-style-toolbar">' +
		'<button class="toolbutton" id="text-inc-size"></button>' +
		'<button class="toolbutton" id="text-dec-size"></button>' +
		'<button class="toolbutton" id="text-set-bold"></button>' +
		'<button class="toolbutton" id="text-set-italic"></button>'+
		'</div>';

		content = content + styleToolbar;

		var colors = ['#000000', '#ff0000', '#00008b', '#006400', '#8b008b',
		'#c0c0c0', '#ffd700', '#008000', '#ff4500', '#8b4513' ];

		content = content + '<table><tr>';
		for (var i = 0; i < colors.length; i++) {
			content = content + '<td><button class="color-picker" ' +
			'value="' + colors[i] + '" ' +
			'style="background-color: ' + colors[i] + '"></button></td>';
			if (i == 4) {
				content = content + '</tr><tr>';
			};
		};
		content = content + '</tr></table>';

		containerElem.innerHTML = content;

		this.setContent([containerElem]);

		this.editorElem = containerElem.querySelector('#editor');

		this.colorButtons = document.querySelectorAll(".color-picker");

		this.incTextBtn = containerElem.querySelector('#text-inc-size');
		this.decTextBtn = containerElem.querySelector('#text-dec-size');
		this.boldTextBtn = containerElem.querySelector('#text-set-bold');
		this.italicTextBtn = containerElem.querySelector('#text-set-italic');

		var that = this;
		var refreshColorStyle = function() {
			var color_class = that.colorButtons;
			for(var index=0; index<=9; index++) {
				if(color_class[index].value == that.currentColor) {
					color_class[index].style.border = "5px solid #696969";
				} else {
					color_class[index].style.border = "2px solid white";
				}
			}
			if (that.currentFontWeight == "bold") {
				document.getElementById("text-set-bold").style.backgroundColor = "grey";
			} else {
				document.getElementById("text-set-bold").style.backgroundColor = "";
			}
			if (that.currentFontStyle == "italic") {
				document.getElementById("text-set-italic").style.backgroundColor = "grey";
			} else {
				document.getElementById("text-set-italic").style.backgroundColor = "";
			}
		}

		textButton.addEventListener('click', function(e) {
			document.getElementById("messageLabel").innerHTML = (document.getElementById("text-button").title) + ":";
			that.currentMessage = that.editorElem.value = app.message;
			that.currentColor = app.messageStyle.color;
			that.currentFontWeight = app.messageStyle.fontWeight;
			that.currentFontStyle = app.messageStyle.fontStyle;
			that.currentFontSize = app.messageStyle.size;
			refreshColorStyle();
		});

		var sendMessage = function() {
			that.textEvent.detail.color = that.currentColor;
			that.textEvent.detail.value = that.currentMessage;
			that.textEvent.detail.fontWeight = that.currentFontWeight;
			that.textEvent.detail.fontStyle = that.currentFontStyle;
			that.textEvent.detail.size = that.currentFontSize;
			refreshColorStyle();
			that.getPalette().dispatchEvent(that.textEvent);
		}

		var editor = this.editorElem;

		var colorButtons = this.colorButtons;
		for (var i = 0; i < colorButtons.length; i++) {
			colorButtons[i].addEventListener('click', function(e) {
				that.currentColor = this.value;
				sendMessage();
			});
		};

		this.incTextBtn.addEventListener('click', function(e) {
			that.currentFontSize = Math.min(100, that.currentFontSize+2);
			sendMessage();
		});

		this.decTextBtn.addEventListener('click', function(e) {
			that.currentFontSize = Math.max(24, that.currentFontSize-2);
			sendMessage();
		});

		this.boldTextBtn.addEventListener('click', function(e) {
			that.currentFontWeight = (that.currentFontWeight == 'bold' ? 'normal' : 'bold');
			sendMessage();
		});

		this.italicTextBtn.addEventListener('click', function(e) {
			that.currentFontStyle = (that.currentFontStyle == 'italic' ? 'normal' : 'italic');
			sendMessage();
		});

		this.textEvent = document.createEvent('CustomEvent');
		this.textEvent.initCustomEvent('text', true, true, {'value': ''});

		this.editorElem.addEventListener('input', function() {
			that.currentMessage = this.value;
			sendMessage();
		}, false);

	};

	var addEventListener = function(type, listener, useCapture) {
		return this.getPalette().addEventListener(type, listener, useCapture);
	};

	textpalette.TextPalette.prototype = Object.create(palette.Palette.prototype, {
		addEventListener: {
			value: addEventListener,
			enumerable: true,
			configurable: true,
			writable: true
		}
	});

	return textpalette;
});
