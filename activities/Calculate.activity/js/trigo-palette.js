define(["sugar-web/graphics/palette", "mustache"],
  function(palette, mustache) {

      var trigopalette = {};
      var isIos = (navigator.userAgent.match(/iPad|iPhone|iPod/g) ? true : false )

    trigopalette.trigoPalette = function(invoker, primaryText) {
      palette.Palette.call(this, invoker, primaryText);

      this.trigoChangeEvent = document.createEvent("CustomEvent");
      this.trigoChangeEvent.initCustomEvent('trigoClick', true, true, {});

      this.template =
        '<tbody>' +
        '{{#rows}}' +
        '<tr>' +
        '{{#.}}' +
        '<td>' +
        '<button style="background:none; border-radius:0px; border:0px; margin:3px; width:55px; height:55px; background-image: url({{backgroundSvg}})" value="{{value}}"></button>' +
        '</td>' +
        '{{/.}}' +
        '</tr>' +
        '{{/rows}}' +
        '</tbody>';

      var trigoElem = document.createElement('table');
      trigoElem.className = "trigos";
      var trigoData = {
        rows: [
          [{
            title: "COS",
            value: "cos(",
            backgroundSvg: "icons/trigonometry-cos.svg"
          }, {
            title: "SIN",
            value: "sin(",
            backgroundSvg: "icons/trigonometry-sin.svg"
          }, {
            "title": "TAN",
            value: "tan(",
            backgroundSvg: "icons/trigonometry-tan.svg"
          }],
          [{
            "title": "ACOS",
            value: "acos(",
            backgroundSvg: "icons/trigonometry-acos.svg"
          }, {
            "title": "ASIN",
            value: "asin(",
            backgroundSvg: "icons/trigonometry-asin.svg"
          }, {
            "title": "ATAN",
            value: "atan(",
            backgroundSvg: "icons/trigonometry-atan.svg"
          }],
          [{
            "title": "COSH",
            value: "cosh(",
            backgroundSvg: "icons/trigonometry-cosh.svg"
          }, {
            "title": "SINH",
            value: "sinh(",
            backgroundSvg: "icons/trigonometry-sinh.svg"
          }, {
            "title": "TANH",
            value: "tanh(",
            backgroundSvg: "icons/trigonometry-tanh.svg"
          }]
        ]
      };

      trigoElem.innerHTML = mustache.render(this.template, trigoData);
      this.setContent([trigoElem]);

      // Pop-down the palette when a item in the menu is clicked.

      this.buttons = trigoElem.querySelectorAll('button');

      var that = this;

      function popDownOnButtonClick(event) {
        that.trigoChangeEvent.detail.value = event.target.value;
        that.getPalette().dispatchEvent(that.trigoChangeEvent);
        that.popDown();
      }

      for (var i = 0; i < this.buttons.length; i++) {
 	  if (isIos) {
	      this.buttons[i].addEventListener('touchstart', popDownOnButtonClick);
	  } else {
	      this.buttons[i].addEventListener('click', popDownOnButtonClick);
	  }
      }

    };

    var setColor = function(index) {
      // Click the nth button
      var event = document.createEvent("MouseEvents");
      event.initEvent("click", true, true);
      this.buttons[index].dispatchEvent(event);
    };

    var addEventListener = function(type, listener, useCapture) {
      return this.getPalette().addEventListener(type, listener, useCapture);
    };

    trigopalette.trigoPalette.prototype =
      Object.create(palette.Palette.prototype, {
        setColor: {
          value: setColor,
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

    return trigopalette;

  });
