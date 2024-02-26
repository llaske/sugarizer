define(["sugar-web/activity/activity", "webL10n", "sugar-web/datastore", "sugar-web/graphics/colorpalette", "zoompalette", "sugar-web/graphics/presencepalette", "humane", "fontpalette", "tutorial", "sugar-web/env"], function (activity, webL10n, datastore, colorpalette, zoompalette, presencepalette, humane, textpalette, tutorial, env, l10n) {
	var defaultColor = '#FFF29F';
	var isShared = false;
	var isHost = false;
	var network = null;
	var connectedPeople = {};
	var xoLogo = '<?xml version="1.0" ?><!DOCTYPE svg  PUBLIC \'-//W3C//DTD SVG 1.1//EN\'  \'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\' [<!ENTITY stroke_color "#010101"><!ENTITY fill_color "#FFFFFF">]><svg enable-background="new 0 0 55 55" height="55px" version="1.1" viewBox="0 0 55 55" width="55px" x="0px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" y="0px"><g display="block" id="stock-xo_1_"><path d="M33.233,35.1l10.102,10.1c0.752,0.75,1.217,1.783,1.217,2.932   c0,2.287-1.855,4.143-4.146,4.143c-1.145,0-2.178-0.463-2.932-1.211L27.372,40.961l-10.1,10.1c-0.75,0.75-1.787,1.211-2.934,1.211   c-2.284,0-4.143-1.854-4.143-4.141c0-1.146,0.465-2.184,1.212-2.934l10.104-10.102L11.409,24.995   c-0.747-0.748-1.212-1.785-1.212-2.93c0-2.289,1.854-4.146,4.146-4.146c1.143,0,2.18,0.465,2.93,1.214l10.099,10.102l10.102-10.103   c0.754-0.749,1.787-1.214,2.934-1.214c2.289,0,4.146,1.856,4.146,4.145c0,1.146-0.467,2.18-1.217,2.932L33.233,35.1z" fill="&fill_color;" stroke="&stroke_color;" stroke-width="3.5"/><circle cx="27.371" cy="10.849" fill="&fill_color;" r="8.122" stroke="&stroke_color;" stroke-width="3.5"/></g></svg>';

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!'], function (doc) {

		// Initialize the activity.
		activity.setup();

		// Handle toolbar mode switch
		var currentMode = 0;
		var nodetextButton = document.getElementById("nodetext-button");
		var linkButton = document.getElementById("link-button");
		var removeButton = document.getElementById("delete-button");
		var switchMode = function(newMode) {
			currentMode = newMode;
			nodetextButton.classList.remove('active');
			linkButton.classList.remove('active');
			removeButton.classList.remove('active');
			if (newMode == 0) nodetextButton.classList.add('active');
			else if (newMode == 1) linkButton.classList.add('active');
			else if (newMode == 2) removeButton.classList.add('active');
			hideSubToolbar();
			if (lastSelected != null) {
				unselectAllNode();
				lastSelected = null;
			}
		}
		nodetextButton.addEventListener('click', function () { switchMode(0); }, true);
		linkButton.addEventListener('click', function () { switchMode(1); lastSelected = null; }, true);
		removeButton.addEventListener('click', function () { switchMode(2); }, true);
		var zoomButton = document.getElementById("zoom-button");
		zoomPalette = new zoompalette.zoomPalette(zoomButton);
		zoomPalette.addEventListener('pop', function(e) {
			hideSubToolbar();
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
				title: type.charAt(0).toUpperCase() + type.slice(1) + " LabyrinthJS",
				activity: "org.olpcfrance.MediaViewerActivity",
				timestamp: new Date().getTime(),
				creation_time: new Date().getTime(),
				file_size: 0
			};
			datastore.create(metadata, function() {
				humane.log(webL10n.get('LabyrinthImage'));
				console.log("export done.")
			}, inputData);
		});

		// Handle sub toolbar
		var subToolbar = document.getElementById("sub-toolbar");
		var textValue = document.getElementById("textvalue");
		var erasetextButton = document.getElementById("erasetext-button");
		var boldButton = document.getElementById("bold-button");
		var italicButton = document.getElementById("italics-button");
		var foregroundButton = document.getElementById("foreground-button");
		foregroundPalette = new colorpalette.ColorPalette(foregroundButton);
		foregroundPalette.setColor('rgb(0, 0, 0)');
		var ignoreForegroundEvent = false; // HACK: Need because SetColor itself raise an event
		var backgroundButton = document.getElementById("background-button");
		backgroundPalette = new colorpalette.ColorPalette(backgroundButton);
		backgroundPalette.setColor('rgb(255, 255, 255)');
		var ignoreBackgroundEvent = false;
		var fontMinusButton = document.getElementById("fontminus-button");
		var fontPlusButton = document.getElementById("fontplus-button");
		var fontButton = document.getElementById("font-button");
		fontPalette = new textpalette.TextPalette(fontButton);
		var helpButton = document.getElementById("help-button");
		helpButton.addEventListener('click', function(e) {
			tutorial.setElement("activity", document.getElementById("activity-button"));
			tutorial.setElement("stop", document.getElementById("stop-button"));
			tutorial.setElement("undo", document.getElementById("undo-button"));
			tutorial.setElement("redo", document.getElementById("redo-button"));
			tutorial.setElement("node", nodetextButton);
			tutorial.setElement("link", linkButton);
			tutorial.setElement("remove", removeButton);
			tutorial.setElement("png", pngButton);
			tutorial.setElement("zoom", zoomButton);
			tutorial.setElement("textvalue", textValue);
			tutorial.setElement("bold", boldButton);
			tutorial.setElement("italic", italicButton);
			tutorial.setElement("foreground", foregroundButton);
			tutorial.setElement("background", backgroundButton);
			tutorial.setElement("font", fontButton);
			tutorial.setElement("fontminus", fontMinusButton);
			tutorial.setElement("fontplus", fontPlusButton);
			tutorial.setElement("board", document.getElementById('canvas'));
			if (cy) {
				var selected = lastSelected;
				if (!selected) {
					var nodes = cy.elements("node");
					if (nodes.length > 0) {
						selected = nodes[0];
						lastSelected = selected;
						selectNode(selected);
					}
				}
				if (selected) {
					showSubToolbar(selected);
				}
			}
			tutorial.start();
		});

		foregroundPalette.addEventListener('colorChange', function(e) {
			if (!ignoreForegroundEvent) {
				lastSelected.style('color', e.detail.color);
				lastSelected.data('color', e.detail.color);
				pushState();
			}
			ignoreForegroundEvent = false;
		});

		backgroundPalette.addEventListener('colorChange', function(e) {
			if (!ignoreBackgroundEvent) {
				lastSelected.style('background-color', e.detail.color);
				lastSelected.data('background-color', e.detail.color);
				pushState();
			}
			ignoreBackgroundEvent = false;
		});

		fontPalette.addEventListener('fontChange', function(e) {
			var newfont = e.detail.family;
			lastSelected.data('font-family', newfont);
			lastSelected.removeClass('arial-text comic-text verdana-text');
			updateNodeText(lastSelected);
			if (newfont == 'Arial') lastSelected.addClass('arial-text');
			else if (newfont == 'Comic Sans MS') lastSelected.addClass('comic-text');
			else if (newfont == 'Verdana') lastSelected.addClass('verdana-text');
			pushState();
		});

		textValue.addEventListener('input', function() {
			if(textValue.value.length > 0)
				$("#erasetext-button").show();
			else
				$("#erasetext-button").hide();
			updateNodeText(lastSelected, textValue.value);
			pushState();
		});

		erasetextButton.addEventListener('click', function() {
			textValue.value = "";
			textValue.focus();
			updateNodeText(lastSelected, textValue.value);
			$("#erasetext-button").hide();
			pushState();
		});

		boldButton.addEventListener('click', function () {
			lastSelected.toggleClass('bold-text');
			if (lastSelected.hasClass('bold-text')) {
				boldButton.classList.add('active');
			} else {
				boldButton.classList.remove('active');
			}
			updateNodeText(lastSelected);
			pushState();
		});
		italicButton.addEventListener('click', function () {
			lastSelected.toggleClass('italic-text');
			if (lastSelected.hasClass('italic-text')) {
				italicButton.classList.add('active');
			} else {
				italicButton.classList.remove('active');
			}
			updateNodeText(lastSelected);
			pushState();
		});

		fontMinusButton.addEventListener('click', function() {
			lastSelected.data('font-size', Math.max(6, lastSelected.data('font-size')-2));
			updateNodeText(lastSelected);
			pushState();
		});

		fontPlusButton.addEventListener('click', function() {
			lastSelected.data('font-size', Math.min(100, lastSelected.data('font-size')+2));
			updateNodeText(lastSelected);
			pushState();
		});

		var showSubToolbar = function(node) {
			zoomPalette.popDown();
			subToolbar.style.visibility = "visible";
			textValue.value = node.style()["content"];
			if (node.hasClass('bold-text')) {
				boldButton.classList.add('active');
			} else {
				boldButton.classList.remove('active');
			}
			if (node.hasClass('italic-text')) {
				italicButton.classList.add('active');
			} else {
				italicButton.classList.remove('active');
			}
			ignoreForegroundEvent = true;
			foregroundPalette.setColor(node.style()['color']);
			ignoreBackgroundEvent = true;
			backgroundPalette.setColor(node.style()['background-color']);
			fontPalette.setFont(node.data('font-family'));
		}
		var hideSubToolbar = function() {
			subToolbar.style.visibility = "hidden";
			backgroundPalette.popDown();
			foregroundPalette.popDown();
			fontPalette.popDown();
		}

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

		// Handle localization
		window.addEventListener('localized', function() {
			env.getEnvironment(function(err, environment) {
				var defaultLanguage = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language;
				var language = environment.user ? environment.user.language : defaultLanguage;
				if (webL10n.language.code != language) {
					webL10n.language.code = language;
				};
				var oldDefaultText = defaultText;
				defaultText = webL10n.get("YourNewIdea");
				nodetextButton.title = webL10n.get("nodetextTitle");
				linkButton.title = webL10n.get("linkButtonTitle");
				removeButton.title = webL10n.get("removeButtonTitle");
				undoButton.title = webL10n.get("undoButtonTitle");
				redoButton.title = webL10n.get("redoButtonTitle");
				zoomButton.title = webL10n.get("zoomButtonTitle");
				foregroundButton.title = webL10n.get("foregroundButtonTitle");
				backgroundButton.title = webL10n.get("backgroundButtonTitle");
				textValue.placeholder = webL10n.get("typeText");
				boldButton.title = webL10n.get("boldButtonTitle");
				italicButton.title = webL10n.get("italicButtonTitle");
				fontMinusButton.title = webL10n.get("fontMinusButtonTitle");
				fontPlusButton.title = webL10n.get("fontPlusButtonTitle");
				fontButton.title = webL10n.get("fontButtonTitle");
				pngButton.title = webL10n.get("pngButtonTitle");
				if (cy) {
					var nodes = cy.elements("node");
					for(var i = 0; i < nodes.length ; i++) {
						var node = nodes[i];
						if (node.data('content') == oldDefaultText) {
							node.data('content', defaultText);
							node.style({'content': defaultText});
						}
					}
				}
			});
		}, false);

		// --- Cytoscape handling

		// Initialize board
		cy = cytoscape({
			container: document.getElementById('cy'),

			ready: function() {
				// Create first node and select id
				var firstNode = createNode(defaultText, getCenter());
				firstNode.select();
				selectNode(firstNode);
				lastSelected = firstNode;
				showSubToolbar(firstNode);
				pushState();

				// Load world
				loadGraph();
			},

			style: [
				{
					selector: '.standard-node',
					css: {
						'text-valign': 'center',
						'text-halign': 'center',
						'border-color': 'darkgray',
						'border-width': '1px',
						'shape': 'roundrectangle'
					}
				},
				{
					selector: '.bold-text',
					css: {
						'font-weight': 'bold'
					}
				},
				{
					selector: '.italic-text',
					css: {
						'font-style': 'italic'
					}
				},
				{
					selector: '.arial-text',
					css: {
						'font-family': 'Arial'
					}
				},
				{
					selector: '.comic-text',
					css: {
						'font-family': 'Comic Sans MS'
					}
				},
				{
					selector: '.verdana-text',
					css: {
						'font-family': 'Verdana'
					}
				},
				{
				selector: 'edge',
					style: {
						 'width': 3
					}
				}
			]
		});

		// Event: a node is selected
		cy.on('tap', 'node', function() {
			if (currentMode == 2) {
				deleteNode(this);
				pushState();
				if (lastSelected == this) lastSelected = null;
				return;
			} else if (currentMode == 1) {
				if (lastSelected != null && lastSelected != this) {
					createEdge(lastSelected, this);
					pushState();
				}
				lastSelected = this;
				return;
			} else {
				if (isSelectedNode(this)) {
					unselectNode(this);
					hideSubToolbar();
				} else {
					selectNode(this);
					showSubToolbar(this);
					if (textValue.value == defaultText)
						textValue.setSelectionRange(0, textValue.value.length);
					else
						textValue.setSelectionRange(textValue.value.length, textValue.value.length);
				}
				lastSelected = this;
			}
		});

		// Event: a node is unselected
		cy.on('unselect', 'node', function() {
			unselectNode(this);
		});

		// Event: an edge is selected
		cy.on('select', 'edge', function() {
			if (currentMode == 2) {
				deleteEdge(this);
				pushState();
				return;
			}
			hideSubToolbar();
		});

		// Event: tap on the board
		cy.on('tap', function(e){
			if (e.cyTarget === cy) {
				if (currentMode == 0) {
					var newNode = createNode(defaultText, e.cyPosition);
					if (lastSelected != null) {
						createEdge(lastSelected, newNode);
						unselectNode(lastSelected);
					}
					pushState();
					newNode.select();
					selectNode(newNode);
					lastSelected = newNode;
					showSubToolbar(newNode);
				}
			}
		});

		// Event: elements moved
		cy.on('free', 'node', function(e) {
			pushState();
		});

		// --- Node and edge handling functions
		var nodeCount = 0;
		var edgeCount = 0;
		var defaultFontFamily = "Arial";
		var defaultFontSize = 16;
		var lastSelected = null;
		var defaultText = "<Your new idea>";

		// Create a new node with text and position
		var createNode = function(text, position) {
			var size = computeStringSize(text, defaultFontFamily, defaultFontSize, false, false);
			cy.add({
				group: 'nodes',
				nodes: [
					{
						data: {
							id: 'n'+(++nodeCount),
							'font-family': defaultFontFamily,
							'font-size': defaultFontSize,
							'font-weight': 'normal',
							'content': text,
							'color': 'rgb(0, 0, 0)',
							'background-color': 'rgb(255, 255, 255)'
						},
						position: {
							x: position.x,
							y: position.y
						}
					}
				]
			});
			var newnode = cy.getElementById('n'+nodeCount);
			newnode.style({
				'content': text,
				'width': size.width,
				'height': size.height,
				'color': 'rgb(0, 0, 0)',
				'font-family': 'Arial',
				'font-size': defaultFontSize+'px',
				'background-color': 'rgb(255, 255, 255)'
			});
			newnode.addClass('standard-node');
			return newnode;
		}

		// Update node text and change size
		var updateNodeText = function(node, text) {
			if (text === undefined) text = node.style()['content'];
			else node.data('content', text);
			var fontSize = node.data('font-size');
			var fontFamily = node.data('font-family');
			var size = computeStringSize(text, fontFamily, fontSize, node.hasClass('bold-text'), node.hasClass('italic-text'));
			node.style({
				'content': text,
				'font-size': fontSize+'px',
				'font-family': fontFamily,
				'width': size.width,
				'height': size.height
			});
		}

		// Test if node is selected
		var isSelectedNode = function(node) {
			return node.style()['border-style'] == 'dashed';
		}

		// Set node as selected
		var selectNode = function(node) {
			node.style({
				'border-color': 'black',
				'border-style': 'dashed',
				'border-width': '4px'
			});
		}

		// Set node as unselected
		var unselectNode = function(node) {
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
			cy.remove(node);
		}

		// Create a new edge between two nodes
		var createEdge = function(n1, n2) {
			cy.add({
				group: 'nodes',
				edges: [
					{ data: { id: 'e'+(++edgeCount), source: n1.id(), target: n2.id() } }
				]
			});
		}

		// Remove an edge
		var deleteEdge = function(edge) {
			cy.remove(edge);
		}

		// --- Utility functions
		// HACK: dynamically compute need size putting the string in a hidden div element
		var computeStringSize = function(text, fontfamily, fontsize, bold, italic) {
			var computer = document.getElementById("fontsizecomputer");
			computer.innerHTML = text.replace("<","&lt;").replace(">","&gt;");
			computer.style.fontFamily = fontfamily;
			computer.style.fontSize = fontsize+"px";
			if (bold) computer.style.fontWeight = "bold";
			else computer.style.fontWeight = "normal";
			if (italic) computer.style.fontStyle = "italic";
			else computer.style.fontStyle = "normal";
			return {width: (computer.clientWidth+fontsize)+"px", height: (computer.clientHeight+fontsize)+"px"};
		}

		// Get center of drawing zone
		var getCenter = function() {
			var canvas = document.getElementById("canvas");
			var center = {x: canvas.clientWidth/2, y: canvas.clientHeight/2};
			return center;
		}

		// Load graph from datastore
		var loadGraph = function() {
			var datastoreObject = activity.getDatastoreObject();
			datastoreObject.loadAsText(function (error, metadata, data) {
				if (data == null)
					return;
				displayGraph(JSON.parse(data));
				reinitState();
				pushState();
			});
		}

		// Save graph to datastore
		var saveGraph = function(callback) {
			var datastoreObject = activity.getDatastoreObject();
			var jsonData = getGraph();
			datastoreObject.setDataAsText(JSON.stringify(jsonData));
			datastoreObject.save(callback);
		}

		// Get a deep copy of current Graph
		var deepCopy = function(o) {
			var copy = o,k;
			if (o && typeof o === 'object') {
				copy = Object.prototype.toString.call(o) === '[object Array]' ? [] : {};
				for (k in o) {
					copy[k] = deepCopy(o[k]);
				}
			}
			return copy;
		}
		var getGraph = function() {
			return deepCopy(cy.json());
		}

		// Display a saved graph
		var displayGraph = function(graph) {
			// Destroy the graph
			cy.remove("node");
			cy.remove("edge");
			hideSubToolbar();
			lastSelected = null;

			// Recreate nodes and set styles and text
			cy.add({
				group: 'nodes',
				nodes: graph.elements.nodes
			});
			var nodes = cy.collection("node");
			var maxCount = 0;
			for (var i = 0 ; i < nodes.length ; i++) {
				var newnode = nodes[i];
				updateNodeText(newnode, newnode.data('content'));
				newnode.style('color', newnode.data('color'));
				newnode.style('background-color', newnode.data('background-color'));
				var id = newnode.data('id').substr(1);
				if (id > maxCount) maxCount = id;
			}
			nodeCount = maxCount+1;

			// Recreate edges
			maxCount = 0;
			if (graph.elements.edges) {
				cy.add({
					group: 'edges',
					edges: graph.elements.edges
				});
				var edges = cy.collection("edge");
				for (var i = 0 ; i < edges.length ; i++) {
					var id = edges[i].data('id').substr(1);
					if (id > maxCount) maxCount = id;
				}
			}
			edgeCount = maxCount+1;
		}

		// Do/Undo handling
		var stateHistory = [];
		var stateIndex = 0;
		var maxHistory = 30;
		var undoButton = document.getElementById("undo-button");
		undoButton.addEventListener('click', function () { undoState(); }, true);
		var redoButton = document.getElementById("redo-button");
		redoButton.addEventListener('click', function () { redoState(); }, true);

		var reinitState = function() {
			stateHistory = [];
			stateIndex = 0;
		}

		var pushState = function(fromNetwork) {
			if (stateIndex < stateHistory.length - 1) {
				var stateCopy = [];
				for (var i = 0 ; i < stateIndex + 1; i++)
					stateCopy.push(stateHistory[i]);
				stateHistory = stateCopy;
			}
			var stateLength = stateHistory.length - 1;
			var currentState = getGraph();
			if (stateLength < maxHistory) stateHistory.push(currentState);
			else {
				for (var i = 0 ; i < stateLength-1 ; i++) {
					stateHistory[i] = stateHistory[i+1];
				}
				stateHistory[stateLength-1] = currentState;
			}
			stateIndex = stateHistory.length - 1;
			if (isShared && !fromNetwork) {
				sendMessage({
					action: 'updateBoard',
					data: getGraph()
				});
			}
			updateStateButtons();
		}

		var undoState = function(fromNetwork) {
			if (stateHistory.length < 1 || (stateHistory.length >= 1 && stateIndex == 0)) return;
			displayGraph(stateHistory[--stateIndex]);
			if (isShared && !fromNetwork) {
				sendMessage({
					action: 'undoBoard'
				});
			}
			updateStateButtons();
		}

		var redoState = function(fromNetwork) {
			if (stateIndex+1 >= stateHistory.length) return;
			displayGraph(stateHistory[++stateIndex]);
			if (isShared && !fromNetwork) {
				sendMessage({
					action: 'redoBoard'
				});
			}
			updateStateButtons();
		}

		var updateStateButtons = function() {
			var stateLength = stateHistory.length;
			undoButton.disabled = (stateHistory.length < 1 || (stateHistory.length >= 1 && stateIndex == 0));
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
		var networkButton = document.getElementById("network-button");
		var presence = new presencepalette.PresencePalette(networkButton, undefined);
		networkButton.addEventListener('click', function(e) {
			hideSubToolbar();
		});

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
					network.createSharedActivity('org.olpc-france.labyrinthjs', function(groupId) {});
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
					displayGraph(msg.content.data);
					break;

				case 'updateBoard':
					// Board change received
					displayGraph(msg.content.data);
					pushState(true);
					break;

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
			var html = "<img style='height:30px;' src='" + generateXOLogoWithColor(msg.user.colorvalue) + "'>";
			if (msg.move === 1) {
				humane.log(html + webL10n.get("PlayerJoin",{user: userName}));
				if (isHost) {
					sendMessage({
						action: 'initialBoard',
						data: getGraph()
					});
				}
			} else if (msg.move === -1) {
				humane.log(html + webL10n.get("PlayerLeave",{user: userName}));
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
			console.log("ehy00");
			shareActivity();
			presence.setShared(true);
		}

	});
});
