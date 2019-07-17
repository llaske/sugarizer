/* Text palette to enter text and to choose font */


define([
    'sugar-web/graphics/palette',
    'mustache'
  ], function(palette, mustache) {
  
    var fontpalette = {};
  
    /* We setup the palette with fonts */
    fontpalette.Fontpalette = function(invoker, primaryText) {
      palette.Palette.call(this, invoker, primaryText);
      this.getPalette().id = "fontpalette";
      this.fontChangeEvent = document.createEvent('CustomEvent');
      this.fontChangeEvent.initCustomEvent('fontChange', true, true, {
        'family': 'Arial'
      });
      this.template = '<center style="padding-top:6px ; "><table><tbody>' + '{{#rows}}' + '<tr>' + '{{#.}}' + '<td>' + '<button lineHeight="{{lineHeight}}" title="{{fontFamily}}" style="height:55px; width:55px; background-size:40px !important;  background: #fff url({{ icon }}) no-repeat center; "></button>' + '</td>' + '{{/.}}' + '</tr>' + '{{/rows}}' + '</tbody></table></center>' + '<br/>';
      var rows = [
        [{
          icon: 'icons/font-arial.svg',
          lineHeight: '0.7',
          fontFamily: 'Arial'
        }, {
          icon: 'icons/font-comic-sans.svg',
          lineHeight: '0.8',
          fontFamily: 'Comic Sans MS'
        }, {
          icon: 'icons/font-verdana.svg',
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
        that.popDown();
      }
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', function(e) {
          that.fontChangeEvent.detail.family = e.target.title;
          that.getPalette().dispatchEvent(that.fontChangeEvent);
          that.popDown();
        });
      }
      popDownOnButtonClick({
        target: buttons[0]
      });
    };
  
    var setFont = function (font) {
      var buttons = this.getPalette().querySelectorAll('button');
      for (var i = 0; i < buttons.length; i++) {
        if (font == buttons[i].title)
          buttons[i].style.border = '1px solid #f00';
        else
          buttons[i].style.border = '0px solid #000';
      }
    };
      
    var addEventListener = function(type, listener, useCapture) {
      return this.getPalette().addEventListener(type, listener, useCapture);
    };
  
    fontpalette.Fontpalette.prototype = Object.create(palette.Palette.prototype, {
      setFont: {
        value: setFont,
        enumerable: true,
        configurable: true,
        writable: true
      },
      addEventListener: {
        value: addEventListener,
        enumerable: true,
        configurable: true,
        writable: true
      }
    });
    return fontpalette;
  });
  