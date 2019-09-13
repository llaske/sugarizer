define(["sugar-web/env", "webL10n"], function (env, webL10n) {

  var connectedPeople = {};
  var xoLogo = '<?xml version="1.0" ?><!DOCTYPE svg  PUBLIC \'-//W3C//DTD SVG 1.1//EN\'  \'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\' [<!ENTITY stroke_color "#010101"><!ENTITY fill_color "#FFFFFF">]><svg enable-background="new 0 0 55 55" height="55px" version="1.1" viewBox="0 0 55 55" width="55px" x="0px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" y="0px"><g display="block" id="stock-xo_1_"><path d="M33.233,35.1l10.102,10.1c0.752,0.75,1.217,1.783,1.217,2.932   c0,2.287-1.855,4.143-4.146,4.143c-1.145,0-2.178-0.463-2.932-1.211L27.372,40.961l-10.1,10.1c-0.75,0.75-1.787,1.211-2.934,1.211   c-2.284,0-4.143-1.854-4.143-4.141c0-1.146,0.465-2.184,1.212-2.934l10.104-10.102L11.409,24.995   c-0.747-0.748-1.212-1.785-1.212-2.93c0-2.289,1.854-4.146,4.146-4.146c1.143,0,2.18,0.465,2.93,1.214l10.099,10.102l10.102-10.103   c0.754-0.749,1.787-1.214,2.934-1.214c2.289,0,4.146,1.856,4.146,4.145c0,1.146-0.467,2.18-1.217,2.932L33.233,35.1z" fill="&fill_color;" stroke="&stroke_color;" stroke-width="3.5"/><circle cx="27.371" cy="10.849" fill="&fill_color;" r="8.122" stroke="&stroke_color;" stroke-width="3.5"/></g></svg>';

  var language;
  window.addEventListener('localized', function(e) {
      if (e.language != language) {
          setTimeout(function() {
            webL10n.language.code = language;
          }, 50);
      }
  });
  env.getEnvironment(function(err, environment) {
	  var defaultLanguage = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language;
	  language = environment.user ? environment.user.language : defaultLanguage;
	  webL10n.language.code = language;
  });

  function generateXOLogoWithColor(color) {
    var coloredLogo = xoLogo;
    coloredLogo = coloredLogo.replace("#010101", color.stroke)
    coloredLogo = coloredLogo.replace("#FFFFFF", color.fill)

    return "data:image/svg+xml;base64," + btoa(coloredLogo);
  }

  function displayConnectedPeopleHtml() {
    var presenceUsersDiv = document.getElementById("presence-users");
    var html = "<hr><ul style='list-style: none; padding:0;'>"
    for (var key in connectedPeople) {
      html += "<li><img style='height:30px;' src='" + generateXOLogoWithColor(connectedPeople[key].colorvalue) + "'>" + connectedPeople[key].name + "</li>"
    }
    html += "</ul>"
    presenceUsersDiv.innerHTML = html
  }

  function displayConnectedPeople(users) {
    var presenceUsersDiv = document.getElementById("presence-users");
    if (!users || !presenceUsersDiv) {
      return;
    }
    connectedPeople = {};
	PaintApp.data.presence.listSharedActivityUsers(PaintApp.data.presence.getSharedInfo().id, function(usersConnected) {
		connectedPeople = {};
		for (var i = 0; i < usersConnected.length; i++) {
			var userConnected = usersConnected[i];
			connectedPeople[userConnected.networkId] = userConnected;
		}
		displayConnectedPeopleHtml();
	});
  }

  /* Function to handle user enter/exit  */
  function onSharedActivityUserChanged(msg) {
    var userName = msg.user.name.replace('<', '&lt;').replace('>', '&gt;');
    var html = "<img style='height:30px;' src='" + generateXOLogoWithColor(msg.user.colorvalue) + "'>"
    if (msg.move === 1) {
      PaintApp.libs.humane.log(html + webL10n.get("PlayerJoin",{user: userName}))
    }

    if (msg.move === -1) {
      PaintApp.libs.humane.log(html + webL10n.get("PlayerLeave",{user: userName}))
    }

    PaintApp.data.presence.listSharedActivities(function(activities) {
      for (var i = 0; i < activities.length; i++) {
        if (activities[i].id === PaintApp.data.presence.getSharedInfo().id) {
          displayConnectedPeople(activities[i].users);
        }
      }
    });
  }


  function sendMessage(content) {
    var sharedId = window.top.sugar.environment.sharedId;
    if (!sharedId) {
      sharedId = PaintApp.data.presence.getSharedInfo().id
    }
    PaintApp.data.presence.sendMessage(sharedId, {
      user: PaintApp.data.presence.getUserInfo(),
      content: content
    });
  }

  /* Enabling an activity to be shared with the presenceObject */
  function shareActivity() {
    var activity = PaintApp.libs.activity;
    PaintApp.data.presence = activity.getPresenceObject(function(error, presence) {
      // Unable to join
      if (error) {
        console.log("error");
        return;
      }

      PaintApp.data.isShared = true;


      // Store settings
      userSettings = presence.getUserInfo();
      console.log("connected");

      // Not found, create a new shared activity
      if (!window.top.sugar.environment.sharedId) {
        presence.createSharedActivity('org.olpcfrance.PaintActivity', function(groupId) {});
      }

      // Show a disconnected message when the WebSocket is closed.
      presence.onConnectionClosed(function(event) {
        console.log(event);
        console.log("Connection closed");
      });

      // Display connection changed
      presence.onSharedActivityUserChanged(function(msg) {
        onSharedActivityUserChanged(msg);
      });

      // Handle messages received
      presence.onDataReceived(PaintApp.collaboration.onDataReceived);

      if (!PaintApp.data.isHost) {
        var lookForOtherUsersInterval = setInterval(function() {
            if (!PaintApp.data.presence.sharedInfo.users) {
              return;
            }
            displayConnectedPeople();
            if (!PaintApp.data.requestedData) {
              PaintApp.data.requestedData = true;
              sendMessage({
                action: "entranceToDataURLRequest " + PaintApp.data.presence.sharedInfo.users[0]
              })
            }
            clearInterval(lookForOtherUsersInterval)
          },
          500);
      }

    });
  }

  function compress(data) {
    if (PaintApp.data.isCompressEnabled) {
      return PaintApp.libs.lzstring.compressToUTF16(data);
    }
    return data;
  }

  function decompress(data) {
    if (PaintApp.data.isCompressEnabled) {
      return PaintApp.libs.lzstring.decompressFromUTF16(data);
    }
    return data;
  }

  function handlePath(msg) {
    ctx = PaintApp.elements.canvas.getContext('2d');
    ctx.beginPath();
    ctx.strokeStyle = msg.content.data.strokeStyle;
    ctx.lineCap = msg.content.data.lineCap;
    ctx.lineWidth = msg.content.data.lineWidth;
    ctx.moveTo(msg.content.data.from.x, msg.content.data.from.y);
    ctx.lineTo(msg.content.data.to.x, msg.content.data.to.y);
    ctx.stroke();
  }

  function handleText(msg) {
    ctx = PaintApp.elements.canvas.getContext('2d');
    ctx.font = msg.content.data.font;
    ctx.fillStyle = msg.content.data.fillStyle;
    ctx.textAlign = msg.content.data.textAlign;
    ctx.fillText(msg.content.data.text, msg.content.data.left, msg.content.data.top);

  }

  function handleDrawImage(msg) {
    ctx = PaintApp.elements.canvas.getContext('2d');
    var img = new Image();
    img.onload = function() {
      ctx.drawImage(img, msg.content.data.left, msg.content.data.top, msg.content.data.width, msg.content.data.height);
    };
    img.src = msg.content.data.src;
  }

  function handleDrawStamp(msg) {
    var platform = 'webkit';
    var isFirefox = typeof InstallTrigger !== 'undefined';
    if (isFirefox) {
      platform = 'gecko';
    }
    ctx = PaintApp.elements.canvas.getContext('2d');
    var stampURL = msg.content.data.stampBase.replace('{platform}', platform);
    var url = window.location.href.split('/');
    url.pop();
    url = url.join('/') + '/' + stampURL;
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.onload = function(e) {
      if (request.status === 200 || request.status === 0) {
        var stamp = PaintApp.modes.Stamp.changeColors(request.responseText, msg.content.data.color.fill, msg.content.data.color.stroke);
        var img = new Image();
        img.onload = function() {
          ctx.drawImage(img, msg.content.data.left, msg.content.data.top, msg.content.data.width, msg.content.data.height);
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(stamp);
      }
    };
    request.send(null);
  }

  function handleEntranceToDataURL(msg) {
    PaintApp.data.entranceToDataURL = true;
    PaintApp.clearCanvas();
    img = new Image();
    img.onload = function() {
      PaintApp.elements.canvas.getContext('2d').drawImage(img, 0, 0, msg.content.data.width, msg.content.data.height);
    };
    img.src = decompress(msg.content.data.src);

  }

  function handleToDataURL(msg) {
    PaintApp.clearCanvas();
    img = new Image();
    img.onload = function() {
      PaintApp.elements.canvas.getContext('2d').drawImage(img, 0, 0, msg.content.data.width, msg.content.data.height);
    };
    img.src = decompress(msg.content.data.src);

  }

  function handleClearCanvas(msg) {
    PaintApp.clearCanvas();
  }

  function handleSaveCanvas(msg) {
    if (PaintApp.data.isHost) {
      PaintApp.saveCanvas();
    }
  }

  function handleEntranceToDataURLRequest(msg) {
    try {
      PaintApp.data.presence.sendMessage(PaintApp.data.presence.getSharedInfo().id, {
        user: PaintApp.data.presence.getUserInfo(),
        content: {
          action: 'entranceToDataURL',
          data: {
            width: PaintApp.elements.canvas.width / window.devicePixelRatio,
            height: PaintApp.elements.canvas.height / window.devicePixelRatio,
            src: compress(PaintApp.elements.canvas.toDataURL())
          }
        }
      });
    } catch (e) {}
  }

  /* Handle data reception in shared activity */
  function onDataReceived(msg) {
    /* Ignore messages coming from ourselves */
    if (PaintApp.data.presence.getUserInfo().networkId === msg.user.networkId) {
      return;
    }

    PaintApp.tmp = msg;

    var userName = msg.user.name.replace('<', '&lt;').replace('>', '&gt;');
    var me = 'entranceToDataURLRequest ' + PaintApp.data.presence.getUserInfo().networkId
    switch (msg.content.action) {

      /* Request to draw points/line */
      case 'path':
        handlePath(msg)
        break;

        /* Request to draw text */
      case 'text':
        handleText(msg)
        break;

        /* Request to draw image */
      case 'drawImage':
        handleDrawImage(msg)
        break;

        /* Request to draw stamp */
      case 'drawStamp':
        handleDrawStamp(msg)
        break;

      case me:
        handleEntranceToDataURLRequest(msg)
        break;

        /* When entering inside the collaboration mode this message will be used to get the current paint  */
      case 'entranceToDataURL':
        handleEntranceToDataURL(msg)
        break;

        /* Request to redraw the canvas  */
      case 'toDataURL':
        handleToDataURL(msg)
        break;

        /* Request to clear the canvas  */
      case 'clearCanvas':
        handleClearCanvas(msg)
        break;

        /* Request to save the canvas  */
      case 'saveCanvas':
        handleSaveCanvas(msg)

        break;
    }
  }

  return {
    onDataReceived: onDataReceived,
    compress: compress,
    decompress: decompress,
    shareActivity: shareActivity,
    sendMessage: sendMessage,
    displayConnectedPeople: displayConnectedPeople
  }

})
