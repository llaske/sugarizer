define(["sugar-web/activity/activity","sugar-web/datastore","notepalette","zoompalette","sugar-web/graphics/presencepalette","humane","tutorial","sugar-web/env"], function (activity,datastore,notepalette,zoompalette,presencepalette,humane,tutorial,env) {
	var defaultColor = '#FFF29F';
	var isShared = false;
	var isHost = false;
	var network = null;
	var connectedPeople = {};
	var xoLogo = '<?xml version="1.0" ?><!DOCTYPE svg  PUBLIC \'-//W3C//DTD SVG 1.1//EN\'  \'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\' [<!ENTITY stroke_color "#010101"><!ENTITY fill_color "#FFFFFF">]><svg enable-background="new 0 0 55 55" height="55px" version="1.1" viewBox="0 0 55 55" width="55px" x="0px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" y="0px"><g display="block" id="stock-xo_1_"><path d="M33.233,35.1l10.102,10.1c0.752,0.75,1.217,1.783,1.217,2.932   c0,2.287-1.855,4.143-4.146,4.143c-1.145,0-2.178-0.463-2.932-1.211L27.372,40.961l-10.1,10.1c-0.75,0.75-1.787,1.211-2.934,1.211   c-2.284,0-4.143-1.854-4.143-4.141c0-1.146,0.465-2.184,1.212-2.934l10.104-10.102L11.409,24.995   c-0.747-0.748-1.212-1.785-1.212-2.93c0-2.289,1.854-4.146,4.146-4.146c1.143,0,2.18,0.465,2.93,1.214l10.099,10.102l10.102-10.103   c0.754-0.749,1.787-1.214,2.934-1.214c2.289,0,4.146,1.856,4.146,4.145c0,1.146-0.467,2.18-1.217,2.932L33.233,35.1z" fill="&fill_color;" stroke="&stroke_color;" stroke-width="3.5"/><circle cx="27.371" cy="10.849" fill="&fill_color;" r="8.122" stroke="&stroke_color;" stroke-width="3.5"/></g></svg>';

	// Manipulate the DOM only when it is ready.
	require(['domReady!'], function (doc) {

		// Initialize the activity.
		activity.setup();

		// Handle toolbar mode switch
		var currentMode = 0;
		var nodetextButton = document.getElementById("nodetext-button");
		var removeButton = document.getElementById("delete-button");
		var switchMode = function(newMode) {
			currentMode = newMode;
			nodetextButton.classList.remove('active');
			removeButton.classList.remove('active');
			saveAndFinishEdit();
			if (newMode == 0) nodetextButton.classList.add('active');
			else if (newMode == 1) removeButton.classList.add('active');
			if (lastSelected != null) {
				unselectAllNode();
				lastSelected = null;
			}
		}
		nodetextButton.addEventListener('click', function () { switchMode(0); }, true);
		removeButton.addEventListener('click', function () { switchMode(1); }, true);
		var colorButton = document.getElementById("color-button");
		colorPalette = new notepalette.NotePalette(colorButton);
		colorPalette.setColor('rgb(255, 242, 159)');
		colorPalette.addEventListener('colorChange', function(e) {
			if (isSelectedNode(lastSelected)) {
				pushState({
					redo: {action:"update", id:lastSelected.id(), color: e.detail.color},
					undo: {action:"update", id:lastSelected.id(), color: lastSelected.data('background-color')}
				});
				lastSelected.style('background-color', e.detail.color);
				lastSelected.data('background-color', e.detail.color);
			}
			textValue.style.backgroundColor = e.detail.color;
			defaultColor = e.detail.color;
		});
		var zoomButton = document.getElementById("zoom-button");
		zoomPalette = new zoompalette.zoomPalette(zoomButton);
		zoomPalette.addEventListener('pop', function(e) {
		});
		zoomPalette.addEventListener('zoom', function(e) {
			var action = e.detail.zoom;
			var currentZoom = cy.zoom();
			var zoomStep = 0.25;
			if (action == 0) {
				if (currentZoom != cy.minZoom() && currentZoom-zoomStep > cy.minZoom()) cy.zoom(currentZoom-zoomStep);
			} else if (action == 1) {
				if (currentZoom != cy.maxZoom()) cy.zoom(currentZoom+zoomStep);
			} else if (action == 2) {
				cy.fit();
			} else if (action == 3) {
				cy.center();
			}
		});
		var pngButton = document.getElementById("png-button");
		pngButton.addEventListener('click', function(e) {
			var inputData = cy.png();
			var mimetype = inputData.split(";")[0].split(":")[1];
			var type = mimetype.split("/")[0];
			var metadata = {
				mimetype: mimetype,
				title: type.charAt(0).toUpperCase() + type.slice(1) + " Shared Notes",
				activity: "org.olpcfrance.MediaViewerActivity",
				timestamp: new Date().getTime(),
				creation_time: new Date().getTime(),
				file_size: 0
			};
			datastore.create(metadata, function() {
				console.log("export done.")
			}, inputData);
		});
		var networkButton = document.getElementById("network-button");
		var presence = new presencepalette.PresencePalette(networkButton, undefined);

		// Handle graph save/world
		var stopButton = document.getElementById("stop-button");
		stopButton.addEventListener('click', function (event) {
			console.log("writing...");
			saveGraph(function (error) {
				if (error === null) {
					console.log("write done.");
				}
				else {
					console.log("write failed.");
				}
			});
		});

		// --- Node and edge handling functions
		var defaultFontFamily = "Arial";
		var defaultFontSize = 16;
		var lastSelected = null;
		var defaultText = "<Your content>";
		var textValue = document.getElementById("textvalue");
		var draggedPosition = null;
		textValue.addEventListener('click', function (event) {
			saveAndFinishEdit();
		});

		// Create a new node with text and position
		var createNode = function(id, text, position, color) {
			cy.add({
				group: 'nodes',
				nodes: [
					{
						data: {
							id: id,
							'content': text,
							'color': 'rgb(0, 0, 0)',
							'background-color': color
						},
						position: {
							x: position.x,
							y: position.y
						}
					}
				]
			});
			var newnode = cy.getElementById(id);
			newnode.style({
				'content': text,
				'background-color': color
			});
			newnode.addClass('standard-node');
			return newnode;
		}

		// Update node text and change size
		var updateNodeText = function(node, text) {
			if (node == null) return;
			var previous = node.data('content');
			if (text === undefined) text = node.style()['content'];
			else node.data('content', text);
			node.style({
				'content': text
			});
			if (previous != text) {
				pushState({
					redo: {action:"update", id:node.id(), text: text},
					undo: {action:"update", id:node.id(), text: previous}
				});
			}
		}

		// Test if node is selected
		var isSelectedNode = function(node) {
			if (node == null) return false;
			return node.style()['border-style'] == 'dashed';
		}

		// Set node as selected
		var selectNode = function(node) {
			if (node == null) return;
			node.style({
				'border-color': 'black',
				'border-style': 'dashed',
				'border-width': '4px'
			});
		}

		// Set node as unselected
		var unselectNode = function(node) {
			if (node == null) return;
			node.style({
				'border-color': 'darkgray',
				'border-style': 'solid',
				'border-width': '1px'
			});
		}

		// Unselect all node
		var unselectAllNode = function() {
			var nodes = cy.collection("node");
			for (var i = 0 ; i < nodes.length ; i++) {
				unselectNode(nodes[i]);
			}
		}

		// Delete node, linked edges are removed too
		var deleteNode = function(node) {
			if (node == null) return;
			cy.remove(node);
		}

		// --- Utility functions

		// Show edit field
		var showEditField = function(node) {
			var position = node.renderedPosition();
			var zoom = cy.zoom();
			textValue.value = node.data('content');
			textValue.style.visibility = "visible";
			textValue.style.backgroundColor = node.style().backgroundColor;
			var delta = 100 * zoom - 200 * zoom;
			textValue.style.left = (position.x + delta) + "px";
			textValue.style.top = (55 + position.y + delta) + "px";
			textValue.style.width = 190 * zoom + "px";
			textValue.style.height = 190 * zoom + "px";
			if (textValue.value == defaultText)
				textValue.setSelectionRange(0, textValue.value.length);
			else
				textValue.setSelectionRange(textValue.value.length, textValue.value.length);
			textValue.focus();
		}

		// Hide edit field
		var hideEditField = function() {
			textvalue.style.visibility = "hidden";
		}

		var saveAndFinishEdit = function() {
			if (lastSelected != null && isSelectedNode(lastSelected)) {
				updateNodeText(lastSelected, textValue.value);
				hideEditField();
				unselectNode(lastSelected);
			}
		}

		// Get center of drawing zone
		var getCenter = function() {
			var canvas = document.getElementById("canvas");
			var center = {x: canvas.clientWidth/2, y: canvas.clientHeight/2};
			return center;
		}

		// Generate a new id
		var newId = function() {
			var s = [];
			var hexDigits = "0123456789abcdef";
			for (var i = 0; i < 36; i++) {
				s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
			}
			s[14] = "4";
			s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
			s[8] = s[13] = s[18] = s[23] = "-";

			var uuid = s.join("");
			return uuid;
		}

		// Handle an update command from history or from the network
		var doAction = function(command) {
			if (command.action === undefined) return;
			else if (command.action == 'create') {
				// Create a new node
				createNode(command.id, command.text, command.position, command.color);
			} else if (command.action == 'delete') {
				// Get the node
				var node = cy.getElementById(command.id);
				if (node == null) return;

				// Delete it
				cy.remove(node);
			} else if (command.action == 'update') {
				// Get the node
				var node = cy.getElementById(command.id);
				if (node == null) return;

				// Update it
				if (command.text !== undefined) {
					node.data('content', command.text);
					node.style({'content': command.text});
				}
				if (command.color !== undefined) {
					node.data('background-color', command.color);
					node.style({'background-color': command.color});
				}
				if (command.position !== undefined) {
					node.position({
						x: command.position.x,
						y: command.position.y
					});
				}
			}
		}
		// Load graph from datastore
		var initGraph = function(graph) {
			if (graph == null)
				return;
			cy.remove("node");
			lastSelected = null;
			for(var i = 0 ; i < graph.length ; i++) {
				doAction(graph[i]);
			}
			hideEditField();
			reinitState();
		}
		var loadGraph = function() {
			var datastoreObject = activity.getDatastoreObject();
			datastoreObject.loadAsText(function (error, metadata, data) {
				initGraph(data);
			});
		}

		// Save graph to datastore, generate command to rebuild each node
		var getGraph = function() {
			var commands = [];
			var nodes = cy.elements("node");
			for(var i = 0; i < nodes.length ; i++) {
				var node = nodes[i];
				commands.push({
					action:"create", id:node.id(), text: node.data("content"), position: {x: node.position().x, y: node.position().y}, color: node.data("background-color")
				});
			}
			return commands;
		}
		var saveGraph = function(callback) {
			var datastoreObject = activity.getDatastoreObject();
			var commands = getGraph();
			datastoreObject.setDataAsText(commands);
			datastoreObject.save(callback);
		}

		// Do/Undo handling
		var stateHistory = [];
		var stateIndex = 0;
		var maxHistory = 30;
		var undoButton = document.getElementById("undo-button");
		undoButton.addEventListener('click', function () { saveAndFinishEdit(); undoState(); }, true);
		var redoButton = document.getElementById("redo-button");
		redoButton.addEventListener('click', function () { saveAndFinishEdit(); redoState(); }, true);

		var reinitState = function() {
			stateHistory = [];
			stateIndex = 0;
		}

		var pushState = function(state, fromNetwork) {
			if (stateIndex < stateHistory.length - 1) {
				var stateCopy = [];
				for (var i = 0 ; i < stateIndex + 1; i++)
					stateCopy.push(stateHistory[i]);
				stateHistory = stateCopy;
			}
			var stateLength = stateHistory.length - 1;
			var currentState = state;
			if (stateLength < maxHistory) stateHistory.push(currentState);
			else {
				for (var i = 0 ; i < stateLength ; i++) {
					stateHistory[i] = stateHistory[i+1];
				}
				stateHistory[stateHistory.length-1] = currentState;
			}
			stateIndex = stateHistory.length - 1;
			if (isShared && !fromNetwork) {
				sendMessage({
					action: 'updateBoard',
					data: state
				});
			}
			updateStateButtons();
		}

		var undoState = function(fromNetwork) {
			if (stateHistory.length < 1 || stateIndex < 0) return;
			var undo = stateHistory[stateIndex--].undo;
			doAction(undo);
			if (isShared && !fromNetwork) {
				sendMessage({
					action: 'undoBoard'
				});
			}
			updateStateButtons();
		}

		var redoState = function(fromNetwork) {
			if (stateIndex+1 >= stateHistory.length) return;
			var redo = stateHistory[++stateIndex].redo;
			doAction(redo);
			if (isShared && !fromNetwork) {
				sendMessage({
					action: 'redoBoard'
				});
			}
			updateStateButtons();
		}

		var updateStateButtons = function() {
			var stateLength = stateHistory.length;
			undoButton.disabled = (stateHistory.length < 1 || stateIndex < 0);
			redoButton.disabled = (stateIndex+1 >= stateLength);
		}

		// Users network list functions
		var generateXOLogoWithColor = function(color) {
			var coloredLogo = xoLogo;
			coloredLogo = coloredLogo.replace("#010101", color.stroke)
			coloredLogo = coloredLogo.replace("#FFFFFF", color.fill)
			return "data:image/svg+xml;base64," + btoa(coloredLogo);
		}
		var displayConnectedPeopleHtml = function() {
			var presenceUsersDiv = document.getElementById("presence-users");
			var html = "<hr><ul style='list-style: none; padding:0;'>"
			for (var key in connectedPeople) {
				html += "<li><img style='height:30px;' src='" + generateXOLogoWithColor(connectedPeople[key].colorvalue) + "'>" + connectedPeople[key].name + "</li>"
			}
			html += "</ul>"
			presenceUsersDiv.innerHTML = html
		}
		var displayConnectedPeople = function(users) {
			var presenceUsersDiv = document.getElementById("presence-users");
			if (!users || !presenceUsersDiv) {
				return;
			}
			network.listSharedActivityUsers(network.getSharedInfo().id, function(usersConnected) {
				connectedPeople = {};
				for (var i = 0; i < usersConnected.length; i++) {
					var userConnected = usersConnected[i];
					connectedPeople[userConnected.networkId] = userConnected;
				}
				displayConnectedPeopleHtml();
			});
		}

		// Handle activity sharing
		var shareActivity = function() {
			network = activity.getPresenceObject(function(error, network) {
				// Unable to join
				if (error) {
					console.log("error");
					return;
				}
				isShared = true;

				// Store settings
				userSettings = network.getUserInfo();
				console.log("connected");

				// Not found, create a new shared activity
				if (!window.top.sugar.environment.sharedId) {
					isHost = true;
					network.createSharedActivity('org.olpcfrance.sharednotes', function(groupId) {});
				}

				// Show a disconnected message when the WebSocket is closed.
				network.onConnectionClosed(function(event) {
					console.log(event);
					console.log("Connection closed");
				});

				// Display connection changed
				network.onSharedActivityUserChanged(function(msg) {
					onNetworkUserChanged(msg);
				});

				// Handle messages received
				network.onDataReceived(onNetworkDataReceived);
			});
		}

		var sendMessage = function(content) {
			try {
				network.sendMessage(network.getSharedInfo().id, {
					user: network.getUserInfo(),
					content: content
			});
			} catch (e) {}
		}

		var onNetworkDataReceived = function(msg) {
			// Ignore messages coming from ourselves
			if (network.getUserInfo().networkId === msg.user.networkId) {
			  return;
			}
			switch (msg.content.action) {
				case 'initialBoard':
					// Receive initial board from the host
					initGraph(msg.content.data);
					break;

				case 'updateBoard':
					// Board change received
					doAction(msg.content.data.redo);
					pushState(msg.content.data, true);
					break

				case 'undoBoard':
					// Undo board
					undoState(true);
					break;

				case 'redoBoard':
					// Redo board
					redoState(true);
					break;
			}
		}
		var onNetworkUserChanged = function(msg) {
			var userName = msg.user.name.replace('<', '&lt;').replace('>', '&gt;');
			var html = "<img style='height:30px;' src='" + generateXOLogoWithColor(msg.user.colorvalue) + "'>" + userName;
			if (msg.move === 1) {
				humane.log(html + " joined");
				if (isHost) {
					sendMessage({
						action: 'initialBoard',
						data: getGraph()
					});
				}
			} else if (msg.move === -1) {
				humane.log(html + " left");
			}
			network.listSharedActivities(function(activities) {
				for (var i = 0; i < activities.length; i++) {
					if (activities[i].id === network.getSharedInfo().id) {
						displayConnectedPeople(activities[i].users);
					}
				}
			});
		}

		// Handle presence palette
		presence.addEventListener('shared', function() {
			presence.popDown();
			shareActivity();
		});
		if (window.top && window.top.sugar && window.top.sugar.environment && window.top.sugar.environment.sharedId) {
			shareActivity();
			presence.setShared(true);
		}

		// Handle help
		var helpButton = document.getElementById("help-button");
		tutorial.setElement("activity", document.getElementById("activity-button"));
		tutorial.setElement("title", document.getElementById("title"));
		tutorial.setElement("network", networkButton);
		tutorial.setElement("help", helpButton);
		tutorial.setElement("shared", document.getElementById("shared-button"));
		tutorial.setElement("png", pngButton);
		tutorial.setElement("zoom", zoomButton);
		tutorial.setElement("color", colorButton);
		tutorial.setElement("add", nodetextButton);
		tutorial.setElement("remove", removeButton);
		tutorial.setElement("undo", document.getElementById("undo-button"));
		tutorial.setElement("redo", document.getElementById("redo-button"));
		tutorial.setElement("stop", stopButton);
		tutorial.setElement("node", document.getElementById('canvas'));
		helpButton.addEventListener('click', function (event) {
			tutorial.start();
		});
		env.getEnvironment(function(err, environment) {
			// Initial tutorial coming from home view
			if (environment.help) {
				setTimeout(function() {
					tutorial.start(tutorial.tourInit);
				}, 500);
			}
		});

		// Handle localization
		function getSettings(callback) {
			 var defaultSettings = {
				 name: "",
				 language: (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language
			 };
			 if (!env.isSugarizer()) {
				 callback(defaultSettings);
				 return;
			 }
			 loadedSettings = datastore.localStorage.getValue('sugar_settings');
			 callback(loadedSettings);
		 }
		window.addEventListener('localized', function() {
			datastore.localStorage.load(function() {
				getSettings(function(settings) { //globally setting language from sugar settings
					if (l10n_s.language.code != settings.language) {
						l10n_s.language.code = settings.language;
					};
					var oldDefaultText = defaultText;
					defaultText = l10n_s.get("YourNewIdea");
					nodetextButton.title = l10n_s.get("nodetextTitle");
					removeButton.title = l10n_s.get("removeButtonTitle");
					undoButton.title = l10n_s.get("undoButtonTitle");
					redoButton.title = l10n_s.get("redoButtonTitle");
					zoomButton.title = l10n_s.get("zoomButtonTitle");
					pngButton.title = l10n_s.get("pngButtonTitle");
					networkButton.title = l10n_s.get("networkButtonTitle");
					helpButton.title = l10n_s.get("helpButtonTitle");
					if (cy) {
						var nodes = cy.elements("node");
						for(var i = 0; i < nodes.length ; i++) {
							var node = nodes[i];
							if (node.data('content') == oldDefaultText) {
								node.data('content', defaultText);
								node.style({'content': defaultText});
							}
						}
						if (textValue && textValue.value == oldDefaultText) {
							textValue.value = defaultText;
							if (lastSelected) {
								showEditField(lastSelected);
							}
						}
					}
				});
			});
		}, false);

		// --- Cytoscape handling

		// Initialize board
		cy = cytoscape({
			container: document.getElementById('cy'),

			ready: function() {
				// Create first node and select id
				cy = this;
				var firstNode = createNode(newId(), defaultText, getCenter(), defaultColor);
				pushState({
					redo: {action:"create", id:firstNode.id(), text: firstNode.data("content"), position: {x: firstNode.position().x, y: firstNode.position().y}, color: defaultColor},
					undo: {action:"delete", id:firstNode.id()}
				});
				firstNode.select();
				selectNode(firstNode);
				showEditField(firstNode);
				lastSelected = firstNode;

				// Load world
				loadGraph();
			},

			style: [
				{
					selector: '.standard-node',
					css: {
						'width': '200px',
						'height': '200px',
						'text-valign': 'center',
						'text-halign': 'center',
						'border-color': 'darkgray',
						'border-width': '1px',
						'background-color': defaultColor,
						'text-wrap': 'wrap',
						'text-max-width': '200px',
						'shadow-color': 'black',
						'shadow-offset-x': '4px',
						'shadow-offset-y': '4px',
						'shadow-opacity': '0.5',
						'shape': 'rectangle'
					}
				}
			]
		});

		// Event: a node is selected
		cy.on('tap', 'node', function() {
			if (currentMode == 1) {
				pushState({
					redo: {action:"delete", id:this.id()},
					undo: {action:"create", id:this.id(), text: this.data("content"), position: {x: this.position().x, y: this.position().y}, color: defaultColor}
				});
				deleteNode(this);
				if (lastSelected == this) lastSelected = null;
				return;
			} else {
				if (!isSelectedNode(this)) {
					if (lastSelected != null) {
						updateNodeText(lastSelected, textValue.value);
						unselectNode(lastSelected);
					}
					selectNode(this);
					showEditField(this);
				}
				lastSelected = this;
			}
		});

		// Event: a node is unselected
		cy.on('unselect', 'node', function() {
			saveAndFinishEdit();
			unselectNode(this);
		});

		// Event: tap on the board
		cy.on('tap', function(e){
			if (e.cyTarget === cy) {
				if (currentMode == 0) {
					var newNode = createNode(newId(), defaultText, e.cyPosition, defaultColor);
					pushState({
						redo: {action:"create", id:newNode.id(), text: newNode.data("content"), position: {x: newNode.position().x, y: newNode.position().y}, color: defaultColor},
						undo: {action:"delete", id:newNode.id()}
					});
					newNode.select();
					selectNode(newNode);
					showEditField(newNode);
					lastSelected = newNode;
				}
			}
		});

		// Event: elements moved
		cy.on('drag', 'node', function(e) {
			saveAndFinishEdit();
			if (draggedPosition == null) {
				draggedPosition = {x: this.position().x, y: this.position().y};
			}
		});

		cy.on('free', 'node', function(e) {
			if (draggedPosition != null && (this.position().x != draggedPosition.x || this.position().y != draggedPosition.y)) {
				pushState({
					redo: {action:"update", id:this.id(), position: {x: this.position().x, y: this.position().y}},
					undo: {action:"update", id:this.id(), position: {x: draggedPosition.x, y: draggedPosition.y}}
				});
			}
			draggedPosition = null;
		});

		// Event: zoom
		cy.on('zoom', function() {
			saveAndFinishEdit();
		});

		// Event: move
		cy.on('pan', function() {
			saveAndFinishEdit();
		});
	});
});
