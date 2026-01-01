// Read Aloud Voice helpers
function pickBestVoice(preferredGender) {
    const voices = window.speechSynthesis.getVoices();
    if (!voices || !voices.length) return null;

    const femaleKeywords = [
        "female", "woman", "zira", "aria", "jenny", "sonia",
        "heera", "susan", "samantha", "google uk english female"
    ];

    const maleKeywords = [
        "male", "man", "alex", "david", "mark", "fred"
    ];

    if (preferredGender === "female") {
        const female = voices.find(v =>
            femaleKeywords.some(k =>
                v.name.toLowerCase().includes(k)
            )
        );
        if (female) return female;
    }

    if (preferredGender === "male") {
        const male = voices.find(v =>
            maleKeywords.some(k =>
                v.name.toLowerCase().includes(k)
            )
        );
        if (male) return male;
    }

    return voices.find(v => v.lang.startsWith("en")) || voices[0];
}

// Rebase require directory
requirejs.config({
	baseUrl: "lib"
});

// Default library url
var defaultUrlLibrary = "https://sugarizer.org/content/books.php";

// Vue main app
var app = new Vue({
	el: '#app',
	components: { 'ebook-reader': EbookReader, 'library-viewer': LibraryViewer, 'toolbar': Toolbar, 'localization': Localization, 'popup': Popup, 'tutorial': Tutorial },
	data: {
		currentBook: null,
		currentEpub: null,
		currentView: LibraryViewer,
		currentLibrary: {database: []},
		timer: null,
		isSpeaking: false,
		isPaused: false,
	    utterance: null,
		currentChunks: [],
		currentChunkIndex: 0,
		selectedSpeechVoice: "female",
		lastSpokenText: "",
		lastBoundaryIndex: 0,
		speechSessionId: 0,
		resumeBaseIndex: 0,
		voicePalette: null,
	},

	created: function() {
		requirejs(["sugar-web/activity/activity", "sugar-web/env","sugar-web/graphics/palette"], function(activity, env,palette) {
			// Initialize Sugarizer
			window.SugarPalette = palette;
			activity.setup();
		});
	},

	mounted: function() {
		// Load last library from Journal
		var vm = this;
		requirejs(["sugar-web/activity/activity", "sugar-web/env"], function(activity, env) {
			env.getEnvironment(function(err, environment) {
					// Use buddy color for background
					env.getEnvironment(function(err, environment) {
						document.getElementById("canvas").style.backgroundColor = environment.user.colorvalue.fill;
					});

				// Load context
				if (environment.objectId) {
					activity.getDatastoreObject().loadAsText(function(error, metadata, data) {
						if (error==null && data!=null) {
							var parsed = JSON.parse(data);
							if (parsed.speechGender) {
								vm.selectedSpeechVoice = parsed.speechGender;
							}
							vm.currentLibrary = parsed.library;
							if (parsed.current !== undefined) {
								vm.currentBook = vm.currentLibrary.database[parsed.current];
								vm.currentEpub = ePub(vm.currentLibrary.information.fileprefix+vm.currentBook.file);
								vm.currentView = EbookReader;
							} else if (vm.currentLibrary.database.length == 0) {
								vm.loadLibrary(defaultUrlLibrary);
							}
							document.getElementById("spinner").style.visibility = "hidden";
						}
					});
				} else {
					vm.loadLibrary(defaultUrlLibrary);
					// Fix in case of accidental exit
					vm.saveContextToJournal();
				}
			});
		});

		this.$refs.toolbar.$on("read-aloud-clicked", this.toggleReadAloud);

		// Handle resize
		window.addEventListener("resize", function() {
			vm.onResize();
		});

		// Handle unfull screen buttons (b)
		document.getElementById("unfullscreen-button").addEventListener('click', function() {
			vm.unfullscreen();
		});
	},

	updated: function() {
		if (this.currentView === EbookReader) {
			this.$refs.view.render(this.currentEpub, this.currentBook.location);
		}
	},

	methods: {

		localized: function() {
			this.$refs.toolbar.localized(this.$refs.localization);
			this.$refs.tutorial.localized(this.$refs.localization);
		},

		loadLibrary: function(url) {
			var vm = this;
			vm.currentLibrary = {database: []};
			defaultUrlLibrary = url;
			document.getElementById("spinner").style.visibility = "visible";
			axios.get(url+"?lang="+vm.$refs.localization.code)
				.then(function(response) {
					vm.currentLibrary = response.data;
					document.getElementById("spinner").style.visibility = "hidden";
					document.getElementById("cloudwarning").style.visibility = "hidden";
				})
				.catch(function(error) {
					document.getElementById("spinner").style.visibility = "hidden";
					document.getElementById("cloudwarning").style.visibility = "visible";
				});
		},

		saveContext: function() {
			if (this.currentView === EbookReader) {
				if (this.$refs.view.getLocation()) {
					this.currentBook.location = this.$refs.view.getLocation();
				}
			} else {
				this.currentLibrary = this.$refs.view.library;
			}
		},

		switchView: function() {
			this.saveContext();
			if (this.currentView === EbookReader) {
				this.currentView = LibraryViewer;
			} else {
				if (this.currentBook) {
					this.currentView = EbookReader;
				}
			}
		},

		showContents: function() {
			this.$refs.view.goToPage(this.currentEpub.contents);
		},

		// Handle fullscreen mode
		fullscreen: function() {
			document.getElementById("main-toolbar").style.opacity = 0;
			document.getElementById("canvas").style.top = "0px";
			document.getElementById("unfullscreen-button").style.visibility = "visible";
			if (this.currentView === EbookReader) {
				var reader = this.$refs.view;
				reader.render(this.currentEpub, reader.getLocation());
			}
		},
		unfullscreen: function() {
			document.getElementById("main-toolbar").style.opacity = 1;
			document.getElementById("canvas").style.top = "55px";
			document.getElementById("unfullscreen-button").style.visibility = "hidden";
			if (this.currentView === EbookReader) {
				var reader = this.$refs.view;
				reader.render(this.currentEpub, reader.getLocation());
			}
		},

		// Handling popup settings
		setLibraryUrl: function() {
			var titleOk = this.$refs.localization.get("Ok"),
				titleCancel = this.$refs.localization.get("Cancel"),
				titleSettings = this.$refs.localization.get("Settings"),
				titleUrl = this.$refs.localization.get("Url");
			this.$refs.settings.show({
				content: `
					<div id='popup-toolbar' class='toolbar' style='padding: 0'>
						<button class='toolbutton pull-right' id='popup-ok-button' title='`+titleOk+`' style='outline:none;background-image: url(lib/sugar-web/graphics/icons/actions/dialog-ok.svg)'></button>
						<button class='toolbutton pull-right' id='popup-cancel-button' title='`+titleCancel+`' style='outline:none;background-image: url(lib/sugar-web/graphics/icons/actions/dialog-cancel.svg)'></button>
						<div style='position: absolute; top: 20px; left: 60px;'>`+titleSettings+`</div>
					</div>
					<div id='popup-container' style='width: 100%; overflow:auto'>
						<div class='popup-label'>`+titleUrl+`</div>
						<input id='input' class='popup-input'/>
					</div>`,
				closeButton: false,
				modalStyles: {
					backgroundColor: "white",
					height: "160px",
					width: "600px",
					maxWidth: "90%"
				}
			});
		},
		settingsShown: function() {
			var vm = this;
			document.getElementById('popup-container').style.height = (document.getElementById("popup-toolbar").parentNode.offsetHeight - 55*2) + "px";
			document.getElementById('popup-ok-button').addEventListener('click', function() {
				vm.$refs.settings.close(true);
			});
			document.getElementById('popup-cancel-button').addEventListener('click', function() {
				vm.$refs.settings.close();
			});
			document.getElementById('input').value = defaultUrlLibrary;
		},
		settingsClosed: function(result) {
			if (result) {
				this.loadLibrary(document.getElementById('input').value);
			}
			this.$refs.settings.destroy();
		},

		// Handle events
		onBookSelected: function(book) {
			if (this.currentView === LibraryViewer) {
				// Load book
				var vm = this;
				vm.currentBook = book;
				Vue.set(book, 'spinner', true);
				vm.currentEpub = new ePub.Book();
				var xhr = new XMLHttpRequest();
				xhr.open("GET", vm.currentLibrary.information.fileprefix+vm.currentBook.file, true);
				xhr.responseType = "arraybuffer";
				xhr.onload = function() {
					vm.currentEpub.open(this.response).then(function() {
						vm.currentEpub.loaded.navigation.then(function(sections) {
							sections.forEach(function(section) {
								if(section.label.toUpperCase().trim() == "CONTENTS") {
									vm.currentEpub.contents = section.href;
								}
							});
						});
						vm.currentView = EbookReader;
						book.spinner = false;
					}, function() {
						console.log("Error loading "+vm.currentLibrary.information.fileprefix+vm.currentBook.file);
						book.spinner = false;
					});
				};
				xhr.send();
			}
		},

		onResize: function() {
			var vm = this;
			if (vm.currentView === EbookReader) {
				var reader = vm.$refs.view;
				if (this.timer) {
					window.clearTimeout(this.timer);
				}
				this.timer = window.setTimeout(function() {
					vm.currentBook.location = reader.getLocation();
					reader.render(vm.currentEpub, vm.currentBook.location);
					this.timer = null;
				}, 500);
			}
		},

		toggleReadAloud: function() {
			if (!('speechSynthesis' in window)) {
				return;
			}

			if (this.isSpeaking) {
				this.speechSessionId++;

				window.speechSynthesis.cancel();

				this.isSpeaking = false;
				this.isPaused = true;
				return;
			}

			if (this.isPaused) {

				let remaining =
					this.lastSpokenText.slice(this.lastBoundaryIndex);
				this.resumeBaseIndex = this.lastBoundaryIndex;

				if (!remaining.trim()) {
					this.currentChunkIndex++;
					this.lastBoundaryIndex = 0;
					this.startReadingCurrentPage();
					return;
				}

				this.utterance = new SpeechSynthesisUtterance(remaining);

				const voice = pickBestVoice(this.selectedSpeechVoice);
				if (voice) {
					this.utterance.voice = voice;
					this.utterance.lang = voice.lang;
				}

				this.utterance.rate = 0.95;
				this.utterance.pitch = 1.0;

				this.utterance.onboundary = (event) => {
					if (event.name === "word") {
						this.lastBoundaryIndex =
							this.resumeBaseIndex + event.charIndex;
					}
				};

				this.utterance.onend = () => {
					this.currentChunkIndex++;
					this.lastBoundaryIndex = 0;

					const speakNext = () => {
						if (!this.isSpeaking) return;
						if (this.currentChunkIndex >= this.currentChunks.length) {
							this.isSpeaking = false;
							return;
						}

						this.lastSpokenText =
							this.currentChunks[this.currentChunkIndex];

						this.utterance = new SpeechSynthesisUtterance(this.lastSpokenText);

						this.utterance.onboundary = (e) => {
							if (e.name === "word") {
								this.lastBoundaryIndex = e.charIndex;
							}
						};

						const voice = pickBestVoice(this.selectedSpeechVoice);
						if (voice) {
							this.utterance.voice = voice;
							this.utterance.lang = voice.lang;
						}

						this.utterance.rate = 0.95;
						this.utterance.pitch = 1.0;

						this.utterance.onend = speakNext;

						window.speechSynthesis.speak(this.utterance);
					};

					speakNext();
				};

				window.speechSynthesis.speak(this.utterance);

				this.isSpeaking = true;
				this.isPaused = false;
				return;
			}

			window.speechSynthesis.cancel();
			this.speechSessionId++;
			this.isSpeaking = true;
			this.isPaused = false;
			this.utterance = null;
			this.currentChunks = [];
			this.currentChunkIndex = 0;

			if (window.speechSynthesis.getVoices().length === 0) {
				window.speechSynthesis.addEventListener('voiceschanged', () => {
					this.startReadingCurrentPage();
				}, { once: true });
				return;
			}

			setTimeout(() => {
				this.startReadingCurrentPage();
			}, 800);
		},

        startReadingCurrentPage: function() {
            const rendition = this.$refs.view.rendition;
			const sessionId = this.speechSessionId;
            if (!rendition) {
                this.isSpeaking = false;
                return;
            }

            let storyText = "";

            rendition.views().forEach(view => {
                const manager = rendition.manager;
                const mapping = manager.mapping;
                const layout = mapping.layout;

                const { divisor, gap, columnWidth } = layout;

                const container = manager.container.getBoundingClientRect();
                const position = view.position();
                const offset = container.left;
                const viewStart = offset - position.left;

                for (let i = 0; i < divisor; i++) {
                    const start = viewStart + (columnWidth + gap) * i;
                    const end = start + columnWidth + gap;

                    const startRange = mapping.findStart(
                        view.document.body,
                        start,
                        end
                    );
                    const endRange = mapping.findEnd(
                        view.document.body,
                        start,
                        end
                    );

                    if (!startRange || !endRange) continue;

                    const range = document.createRange();
                    range.setStart(
                        startRange.startContainer,
                        startRange.startOffset
                    );
                    range.setEnd(
                        endRange.endContainer,
                        endRange.endOffset
                    );

                    const text = range.toString().trim();
                    if (text) storyText += text + " ";
                }
            });

            storyText = storyText.trim();

            if (!storyText) {
                this.isSpeaking = false;
                return;
            }

            const maxLength = 200;
            const chunks = [];
            let temp = storyText;
            while (temp.length > maxLength) {
                let cut = temp.lastIndexOf('.', maxLength);
                if (cut === -1) cut = temp.lastIndexOf(' ', maxLength);
                if (cut === -1) cut = maxLength;
                chunks.push(temp.substring(0, cut + 1).trim());
                temp = temp.substring(cut + 1).trim();
            }
            if (temp) chunks.push(temp);

            this.currentChunks = chunks;

			const speakNext = () => {
				if (sessionId !== this.speechSessionId) return;

				if (!this.isSpeaking) return;

                if (this.currentChunkIndex >= this.currentChunks.length) {
                    this.isSpeaking = false;
                    this.currentChunks = [];
                    this.currentChunkIndex = 0;
                    return;
                }

				this.lastSpokenText =
					this.currentChunks[this.currentChunkIndex];

				this.lastBoundaryIndex = 0;

				this.utterance = new SpeechSynthesisUtterance(
					this.lastSpokenText
				);

				this.utterance.onboundary = (event) => {
					if (event.name === "word") {
						this.lastBoundaryIndex = event.charIndex;
					}
				};
				const voice = pickBestVoice(this.selectedSpeechVoice);

				if (voice) {
					this.utterance.voice = voice;
					this.utterance.lang = voice.lang;
				}

				this.utterance.rate = 0.95;
				this.utterance.pitch = 1.0;

				this.utterance.onend = () => {
					if (sessionId !== this.speechSessionId) return;
					this.currentChunkIndex++;
					speakNext();
				};

                this.utterance.onerror = () => {
                    this.isSpeaking = false;
                };

                window.speechSynthesis.speak(this.utterance);
            };

            speakNext();
        },

		showVoicePalette: function(anchorEl) {
			if (this.voicePalette && this.voicePalette.isShown) {
				this.voicePalette.popDown();
				this.voicePalette = null;
				return;
			}

			const palette = new SugarPalette.Palette(anchorEl);
			this.voicePalette = palette;

			const container = document.createElement("div");
			container.className = "voice-palette";
			container.style.background = "#000";
			container.style.color = "#fff";
			container.style.padding = "6px 8px 8px";
			container.style.borderRadius = "6px";
			container.style.display = "flex";
			container.style.flexDirection = "column";

			const header = document.createElement("div");
			header.textContent = "Select voice";
			header.style.fontWeight = "bold";
			header.style.fontSize = "12px";
			header.style.margin = "0 0 4px 0";
			container.appendChild(header);

			const options = [
				{ id: "female", label: "Female voice" },
				{ id: "male", label: "Male voice" }
			];

			options.forEach(opt => {
				const item = document.createElement("div");
				item.textContent = opt.label;
				item.dataset.voiceId = opt.id;

				if (this.selectedSpeechVoice === opt.id) {
					item.classList.add("selected");
				}

				item.onclick = () => {
					this.selectedSpeechVoice = opt.id;

					window.speechSynthesis.cancel();

					if (this.isSpeaking) {
						this.isSpeaking = false;
						this.isPaused = false;
						this.toggleReadAloud();
					}

					container.querySelectorAll("div:not(:first-child)").forEach(el => {
						el.classList.toggle(
							"selected",
							el.dataset.voiceId === this.selectedSpeechVoice
						);
					});

					palette.popDown();
				};

				container.appendChild(item);
			});

			palette.setContent([container]);

			palette.popUp();
			palette.isShown = true;
			palette.palette.style.width = "auto";
			palette.palette.style.maxWidth = "fit-content";

			const paletteEl = palette.palette;
			paletteEl.style.padding = "0";
			paletteEl.style.margin = "0";
			paletteEl.style.minHeight = "unset";
			paletteEl.style.height = "auto";
			paletteEl.style.background = "transparent";

			const originalPopDown = palette.popDown.bind(palette);
			palette.popDown = () => {
				originalPopDown();
				palette.isShown = false;
				this.voicePalette = null;
			};
		},
		
		onHelp: function() {
			var options = {};
			options.switchbutton = this.$refs.toolbar.$refs.switchbutton.$el;
			options.contentsbutton = null;
			if (this.$refs.toolbar.$refs.contentsbutton) {
				options.contentsbutton = this.$refs.toolbar.$refs.contentsbutton.$el;
			}
			options.settingsbutton = this.$refs.toolbar.$refs.settings.$el;
			options.fullscreenbutton = this.$refs.toolbar.$refs.fullscreen.$el;
			if (this.currentView === LibraryViewer && this.$refs.view.$refs.item0 && this.$refs.view.$refs.item0[0]) {
				options.book = this.$refs.view.$refs.item0[0].$el;
			} else if (this.currentView === EbookReader) {
				options.prevbutton = document.getElementById("left");
				options.nextbutton = document.getElementById("right");
			}
			options.readaloudbutton = this.$refs.toolbar.$refs.readAloudButton.$el;
			options.voicebutton = this.$refs.toolbar.$refs.languageButton.$el;
			this.$refs.tutorial.show(options);
		},

		saveContextToJournal: function() {
			// Save current library in Journal on Stop
			var vm = this;
			vm.saveContext();
			requirejs(["sugar-web/activity/activity"], function(activity) {
				console.log("writing...");
				var context = {
					library: { information:vm.currentLibrary.information, database:vm.currentLibrary.database }
				};
				if (vm.selectedSpeechVoice) {
					context.speechGender = vm.selectedSpeechVoice;
				}
				if (vm.currentView === EbookReader) {
					context.current = vm.currentLibrary.database.indexOf(vm.currentBook);
				}
				var jsonData = JSON.stringify(context);
				activity.getDatastoreObject().setDataAsText(jsonData);
				activity.getDatastoreObject().save(function(error) {
					if (error === null) {
						console.log("write done.");
					} else {
						console.log("write failed.");
					}
				});
			});
		},

		onStop: function() {
			window.speechSynthesis.cancel();
			this.utterance = null;
			this.isSpeaking = false;
			this.isPaused = false;
			this.currentChunks = [];
			this.currentChunkIndex = 0;
			this.saveContextToJournal();
		}
	}
});
