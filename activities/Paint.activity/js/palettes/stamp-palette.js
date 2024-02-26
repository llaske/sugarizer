/* Stamp palette to pick a stamp */

define([
  'sugar-web/graphics/palette',
  'mustache'
], function (palette, mustache) {
  var stamppalette = {};

  /* We setup the palette with stamps */
  function getRows() {
    var platform = 'webkit';
    var isFirefox = typeof InstallTrigger !== 'undefined';
    if (isFirefox) {
      platform = 'gecko';
    }
    var rows = [
      [
        {
          stampBase: 'stamps/heart-{platform}.svg',
          proportionnal: true
        },
        {
          stampBase: 'stamps/star-{platform}.svg',
          proportionnal: true
        },
        {
          stampBase: 'stamps/square-{platform}.svg',
          proportionnal: false
        }
      ],
      [
        {
          stampBase: 'stamps/circle-{platform}.svg',
          proportionnal: true
        },
        {
          stampBase: 'stamps/triangle-{platform}.svg',
          proportionnal: true
        },
        {
          stampBase: 'stamps/flower-{platform}.svg',
          proportionnal: true
        }
      ]
    ];
    for (var i = 0; i < rows.length; i++) {
      for (var j = 0; j < rows[i].length; j++) {
        rows[i][j].stamp = rows[i][j].stampBase.replace('{platform}', platform);
      }
    }
    return rows;
  }

  stamppalette.StampPalette = function (invoker, primaryText) {
    palette.Palette.call(this, invoker, primaryText);
    this.stampChangeEvent = document.createEvent('CustomEvent');
    this.stampChangeEvent.initCustomEvent('stampChange', true, true, {});
    this.template = '<tbody>' + '{{#rows}}' + '<tr>' + '{{#.}}' + '<td>' + '<button base="{{stampBase}}" proportionnal="{{proportionnal}}" value="{{stamp}}" style="height:55px; width:55px; background-size:40px; background-image: url({{ stamp }}); background-repeat: no-repeat; background-position: center; "></button>' + '</td>' + '{{/.}}' + '</tr>' + '{{/rows}}' + '</tbody>';
    var stampsElem = document.createElement('table');
    stampsElem.className = 'stamps';
    var stampsData = { rows: getRows() };
    stampsElem.innerHTML = mustache.render(this.template, stampsData);
    this.setContent([stampsElem]);
    // Pop-down the palette when a item in the menu is clicked.
    var buttons = stampsElem.querySelectorAll('button');
    this.buttons = buttons;
    var that = this;
    function popDownOnButtonClick(event) {
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].style.border = '0px solid #000';
      }
      event.target.style.border = '1px solid #f00';
      that.stampChangeEvent.detail.proportionnal = event.target.getAttribute('proportionnal');
      that.stampChangeEvent.detail.stampBase = event.target.getAttribute('base');
      that.stampChangeEvent.detail.stamp = event.target.value;
      that.getPalette().dispatchEvent(that.stampChangeEvent);
      that.popDown();
    }
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', popDownOnButtonClick);
    }
  };

  var setStamp = function (index) {
    // Click the nth button
    var event = document.createEvent('MouseEvents');
    event.initEvent('click', true, true);
    this.buttons[index].dispatchEvent(event);
  };

  var addEventListener = function (type, listener, useCapture) {
    return this.getPalette().addEventListener(type, listener, useCapture);
  };

  stamppalette.StampPalette.prototype = Object.create(palette.Palette.prototype, {
    setStamp: {
      value: setStamp,
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
  return stamppalette;
});
