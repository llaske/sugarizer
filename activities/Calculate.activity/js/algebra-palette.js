define(["sugar-web/graphics/palette", "mustache"],
  function(palette, mustache) {

      var algebrapalette = {};
      var isIos = (navigator.userAgent.match(/iPad|iPhone|iPod/g) ? true : false )

    algebrapalette.algebraPalette = function(invoker, primaryText) {
      palette.Palette.call(this, invoker, primaryText);

      this.algebraChangeEvent = document.createEvent("CustomEvent");
      this.algebraChangeEvent.initCustomEvent('algebraClick', true, true, {});

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

      var algebraElem = document.createElement('table');
      algebraElem.className = "algebras";
      var algebraData = {
        rows: [
          [{
            title: "EXP",
            value: "exp(",
            backgroundSvg: "icons/algebra-exp.svg"
          }, {
            title: "LN",
            value: "log(",
            backgroundSvg: "icons/algebra-ln.svg"
          }, {
            title: "SQRT",
            value: "sqrt(",
            backgroundSvg: "icons/algebra-sqrt.svg"
          }],
          [{
            title: "X",
            value: "x",
            backgroundSvg: "icons/algebra-x.svg"
          }, {
            title: "POW",
            value: "^",
            backgroundSvg: "icons/algebra-xpowy.svg"
          },
          {
            title: "PI",
            value: "3.14159",
            backgroundSvg: "icons/constants-pi.svg"
          }],
          [{
            title: "F(X)",
            value: "f(x)=",
            backgroundSvg: "icons/plot.svg"
          }]
        ]
      };

      algebraElem.innerHTML = mustache.render(this.template, algebraData);
      this.setContent([algebraElem]);

      // Pop-down the palette when a item in the menu is clicked.

      this.buttons = algebraElem.querySelectorAll('button');

      var that = this;

      function popDownOnButtonClick(event) {
        that.algebraChangeEvent.detail.value = event.target.value;
        that.getPalette().dispatchEvent(that.algebraChangeEvent);
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

    algebrapalette.algebraPalette.prototype =
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

    return algebrapalette;

  });
