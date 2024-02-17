// Tutorial component based on bootstrap tour
var Tutorial = {
	template: '<div/>',
	
	methods: {
		localized: function(localization) {
			// Update the tutorial
		},

		show: function(options) {
			options = options || {};
			let steps = [];
			if (options.currentView === TemplateViewer && !options.editMode) {
				steps.push(
					{
						title: window.l10n.get("TutoExplainTitle"),
						intro: window.l10n.get("TutoExplainContent")
					}
				);
			}
			steps = steps.concat([
				{
					element: options.templatebutton,
					position: "bottom",
					title: window.l10n.get("TutoTemplateButtonTitle"),
					intro: window.l10n.get("TutoTemplateButtonContent")
				},
				{
					element: options.item,
					position: "right",
					title: options.editMode ? window.l10n.get("TutoEditorItemTitle") : window.l10n.get("TutoPlayerItemTitle"),
					intro: options.editMode ? window.l10n.get("TutoEditorItemContent") : window.l10n.get("TutoPlayerItemContent")
				}
			]);
			if (options.currentView === TemplateViewer && options.editMode) {
				steps.push(
					{
						element: options.insertimagebutton,
						position: "bottom",
						title: window.l10n.get("TutoInsertImageButtonTitle"),
						intro: window.l10n.get("TutoInsertImageButtonContent")
					}
				);
			}
			var settingsItemName = "stringTuto" + (options.editMode ? "Player" : "Editor") + (options.currentView === TemplateViewer ? "Template" : "Item") + "Button";
			steps = steps.concat([
				{
					element: options.settingsbutton,
					position: "bottom",
					title: window.l10n.get("TutoEditorTemplateButtonTitle"),
					intro: window.l10n.get("TutoEditorTemplateButtonContent")
				},
				{
					element: options.fullscreenbutton,
					position: "bottom",
					title: window.l10n.get("TutoFullscreenButtonTitle"),
					intro: window.l10n.get("TutoFullscreenButtonContent")
				}
			]);
			if (options.currentView !== TemplateViewer) {
				steps = steps.concat([
					{
						element: options.linesbutton,
						position: "bottom",
						title: window.l10n.get("TutoLinesButtonTitle"),
						intro: window.l10n.get("TutoLinesButtonContent")
					},
					{
						element: options.zoombutton,
						position: "bottom",
						title: window.l10n.get("TutoZoomButtonTitle"),
						intro: window.l10n.get("TutoZoomButtonContent")
					},
					{
						element: options.backbutton,
						position: "right",
						title: window.l10n.get("TutoBackButtonTitle"),
						intro: window.l10n.get("TutoBackButtonContent")
					},
					{
						element: options.editoraddbutton,
						position: "left",
						title: window.l10n.get("TutoEditorAddButtonTitle"),
						intro: window.l10n.get("TutoEditorAddButtonContent")
					},
					{
						element: options.editorremovebutton,
						position: "left",
						title: window.l10n.get("TutoEditorRemoveButtonTitle"),
						intro: window.l10n.get("TutoEditorRemoveButtonContent")
					},
					{
						element: options.editoraddpathbutton,
						position: "left",
						title: window.l10n.get("TutoEditorAddPathButtonTitle"),
						intro: window.l10n.get("TutoEditorAddPathButtonContent")
					},
					{
						element: options.editorremovepathbutton,
						position: "left",
						title: window.l10n.get("TutoEditorRemovePathButtonTitle"),
						intro: window.l10n.get("TutoEditorRemovePathButtonContent")
					},
					{
						element: options.restartbutton,
						position: "left",
						title: window.l10n.get("TutoRestartButtonTitle"),
						intro: window.l10n.get("TutoRestartButtonContent")
					},
					{
						element: options.nextbutton,
						position: "left",
						title: window.l10n.get("TutoNextButtonTitle"),
						intro: window.l10n.get("TutoNextButtonContent")
					}
				]);
			}
            
			steps = steps.filter((step) => !('element' in step) || (step['element'] && step['element'].style.display != 'none'));

			introJs().setOptions({
				tooltipClass: 'customTooltip',
				steps: steps,
				prevLabel: window.l10n.get("PrevShort"),
				nextLabel: window.l10n.get("NextShort"),
				exitOnOverlayClick: false,
				nextToDone: false,
				showBullets: false
			}).start();	
		}
	}
};
