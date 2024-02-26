/* Text palette to enter text and to choose font */


define([
  'sugar-web/graphics/palette',
  'mustache'
], function(palette, mustache) {

  var textpalette = {};

  /* We setup the palette with fonts */
  textpalette.TextPalette = function(invoker, primaryText) {
    palette.Palette.call(this, invoker, primaryText);
    this.template = '<input id="text-input" value="Paint" type="text" style="margin:10px;">' + '<center><table><tbody>' + '{{#rows}}' + '<tr>' + '{{#.}}' + '<td>' + '<button lineHeight="{{lineHeight}}" fontFamily="{{fontFamily}}" style="height:55px; width:55px; background-size:40px !important;  background: #fff url({{ icon }}) no-repeat center; "></button>' + '</td>' + '{{/.}}' + '</tr>' + '{{/rows}}' + '</tbody></table></center>' + '<br/>';
    var rows = [
      [{
        icon: 'icons/text/arial.svg',
        lineHeight: '0.7',
        fontFamily: 'Arial'
      }, {
        icon: 'icons/text/comic-sans.svg',
        lineHeight: '0.8',
        fontFamily: 'Comic Sans MS'
      }, {
        icon: 'icons/text/verdana.svg',
        lineHeight: '0.8',
        fontFamily: 'Verdana'
      }]
    ];
    var textsElem = document.createElement('div');
    textsElem.innerHTML = mustache.render(this.template, {
      rows: rows
    });
    this.setContent([textsElem]);
    var buttons = textsElem.querySelectorAll('button');
    var that = this;

    function popDownOnButtonClick(event) {
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].style.border = '0px solid #000';
      }
      event.target.style.border = '1px solid #f00';
      PaintApp.modes.Text.fontFamily = event.target.getAttribute('fontFamily');
      PaintApp.modes.Text.lineHeight = event.target.getAttribute('lineHeight');
      that.popDown();
    }
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', popDownOnButtonClick);
    }
    popDownOnButtonClick({
      target: buttons[0]
    });
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
