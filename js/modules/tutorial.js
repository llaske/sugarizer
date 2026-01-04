define(function () {
  let tutorial = {};
  let i18next;
  let constant = {
    iconsPath: "./icons/",
  };

  const getElement = function (name) {
    return document.getElementById(name);
  };

  let previous;
  let next;

  async function renderIconToHTML(template) {
    const iconId = crypto.randomUUID(); //random id
    const container = document.createElement("div");
    container.id = iconId;

    const iconRef = Vue.ref(null);

    // Modifying the template to add a ref and parent to the icon
    const templateWithRef = template.replace(
      "<icon ",
      `<icon :parent=parent :id=id ref="iconRef" `
    );
    const TemplateWrapper = {
      template: `<div id=${iconId}>${templateWithRef}</div>`,
      setup() {
        return { iconRef, parent: container, id: iconId };
      },
    };

    const app = Vue.createApp(TemplateWrapper);
    app.component("icon", Icon);
    const vm = app.mount(container);

    if (vm.$refs.iconRef) {
      await vm.$refs.iconRef.wait();
    }
    return container.outerHTML;
  }

  const views = {
    [sugarizer.constant.homeview]: async function () {
      const buddycolor = sugarizer.modules.settings.getUser().color;
      const ownerIcon = await renderIconToHTML(`
			<icon 
				svgfile="${constant.iconsPath + "owner-icon.svg"}"
				:color="${buddycolor}"
				disableHoverEffect=true
			></icon>
		`);
      const journalIcon = await renderIconToHTML(`
			<icon 
				svgfile="${constant.iconsPath + "activity-journal.svg"}"
				:color="${buddycolor}"
				disableHoverEffect=true
				isNative=true
			></icon>
		`);
      const assignmentIcon = await renderIconToHTML(`
			<icon 
				svgfile="${constant.iconsPath + "assignment.svg"}"
				:color="${buddycolor}"
				disableHoverEffect=true
				isNative=true
			></icon>
		`);
      const cloudWarningIcon = await renderIconToHTML(`
			<icon 
				svgfile="${constant.iconsPath + "cloud-warning.svg"}"
				disableHoverEffect=true
				isNative=true
			></icon>
		`);
      const sharedNotesIcon = await renderIconToHTML(`
			<icon 
				svgfile="./activities/SharedNotes.activity/activity/activity-icon.svg"
				isNative=true
				disableHoverEffect=true
			></icon>
		`);
      tutorial.activityId = "org.olpcfrance.sharednotes";

      return [
        {
          title: i18next.t("TutoInitMainTitle"),
          intro: ownerIcon + i18next.t("TutoInitMainContent"),
        },
        {
          element: getElement("buddy"),
          position: "right",
          title: i18next.t("TutoUserTitle"),
          intro: i18next.t("TutoUserContent"),
        },
        {
          element: document.querySelector("#homescreen .home-icon"),
          position: "bottom",
          title: i18next.t("TutoActivityTitle"),
          intro: i18next.t("TutoActivityContent"),
        },
        {
          element: getElement("journal-btn"),
          position: "right",
          title: i18next.t("TutoJournalTitle"),
          intro: journalIcon + i18next.t("TutoJournalContent"),
        },
        {
          element: getElement("view_home_button"),
          position: "bottom",
          title: i18next.t("TutoFavoriteTitle"),
          intro: i18next.t("TutoFavoriteContent"),
        },
        {
          element: getElement("view_neighborhood_button"),
          position: "bottom",
          title: i18next.t("TutoNeighborTitle"),
          intro: i18next.t("TutoNeighborContent"),
        },
        {
          element: getElement("view_list_button"),
          position: "bottom",
          title: i18next.t("TutoListTitle"),
          intro: i18next.t("TutoListContent"),
        },
        {
          element: getElement("assignment-icon"),
          position: "bottom",
          title: i18next.t("TutoShowAssignmentTitle"),
          intro: assignmentIcon + i18next.t("TutoShowAssignmentContent"),
        },
        {
          element: getElement("toolbar-offline-btn"),
          position: "bottom",
          title: i18next.t("TutoOfflineTitle"),
          intro: cloudWarningIcon + i18next.t("TutoOfflineContent"),
        },
        {
          title: i18next.t("TutoRunTitle"),
          intro: sharedNotesIcon + i18next.t("TutoRunContent"),
        },
      ];
    },

    [sugarizer.constant.listview]: function () {
      return [
        {
          element: getElement("view_home_button"),
          position: "bottom",
          title: i18next.t("TutoFavoriteTitle"),
          intro: i18next.t("TutoFavoriteContent"),
        },
        {
          element: getElement("view_neighborhood_button"),
          position: "bottom",
          title: i18next.t("TutoNeighborTitle"),
          intro: i18next.t("TutoNeighborContent"),
        },
        {
          element: getElement("view_list_button"),
          position: "bottom",
          title: i18next.t("TutoListTitle"),
          intro: i18next.t("TutoListContent"),
        },
        {
          element: document.querySelector(
            ".listview_left >.icon:first-of-type"
          ),
          position: "bottom",
          title: i18next.t("TutoFavswitchTitle"),
          intro: i18next.t("TutoFavswitchContent"),
        },
        {
          element: getElement("searchfield"),
          position: "bottom",
          title: i18next.t("TutoSearchTitle"),
          intro: i18next.t("TutoSearchContent"),
        },
      ];
    },

    [sugarizer.constant.activities]: async function ({ activities }) {
      const buddycolor = sugarizer.modules.settings.getUser().color;
      const stepPromises = activities.map(async (activity) => {
        const iconHTML = await renderIconToHTML(`
            <icon 
                svgfile="${activity.directory + "/" + activity.icon}"
				:color="${buddycolor}"
                disableHoverEffect=true
				isNative=true
            ></icon>
        `);

        return {
          title: i18next.t("NameActivity", { name: activity.name }),
          intro:
            iconHTML +
            i18next.t(
              `TutoActivity${activity.directory.match(
                /activities\/([^.]+)/
              )[1]}activity`
            ),
        };
      });

      return Promise.all(stepPromises);
    },

    [sugarizer.constant.journal]: async function () {
      return [
        {
          title: i18next.t("TutoJournalIntroTitle"),
          intro: i18next.t("TutoJournalIntroContent"),
        },
        {
          element: document.querySelector("#journal-listview .activity-icon"),
          position: "bottom",
          title: i18next.t("TutoJournalActivityTitle"),
          intro: i18next.t("TutoJournalActivityContent"),
        },
        {
          element: document.querySelector("#journal-listview .activity-name"),
          position: "bottom",
          title: i18next.t("TutoJournalTitleTitle"),
          intro: i18next.t("TutoJournalTitleContent"),
        },
        {
          element: document.querySelector("#journal-listview .journal-star"),
          position: "bottom",
          title: i18next.t("TutoJournalFavoriteTitle"),
          intro: i18next.t("TutoJournalFavoriteContent"),
        },
        {
          element: document.querySelector(
            "#journal-listview .journal-checkbox"
          ),
          position: "bottom",
          title: i18next.t("TutoJournalCheckTitle"),
          intro: i18next.t("TutoJournalCheckContent"),
        },
        {
          element: getElement("timeitem"),
          position: "bottom",
          title: i18next.t("TutoJournalTimeTitle"),
          intro: i18next.t("TutoJournalTimeContent"),
        },
        {
          element: getElement("searchField"),
          position: "bottom",
          title: i18next.t("TutoJournalSearchTitle"),
          intro: i18next.t("TutoJournalSearchContent"),
        },
        {
          element: getElement("favoritebutton"),
          position: "bottom",
          title: i18next.t("TutoJournalFavButtonTitle"),
          intro: i18next.t("TutoJournalFavButtonContent"),
        },
        {
          element: getElement("assignmentbutton"),
          position: "top",
          title: i18next.t("TutoAssignmentFilterButtonTitle"),
          intro: i18next.t("TutoAssignmentFilterButtonContent"),
        },
        {
          element: getElement("typepalette"),
          position: "bottom",
          title: i18next.t("TutoJournalTypeTitle"),
          intro: i18next.t("TutoJournalTypeContent"),
        },
        {
          element: getElement("datepalette"),
          position: "bottom",
          title: i18next.t("TutoJournalTimeButtonTitle"),
          intro: i18next.t("TutoJournalTimeButtonContent"),
        },
        {
          element: getElement("sortpalette"),
          position: "bottom",
          title: i18next.t("TutoJournalSortButtonTitle"),
          intro: i18next.t("TutoJournalSortButtonContent"),
        },
        {
          element: getElement("fromdevicebutton"),
          position: "bottom",
          title: i18next.t("TutoJournalFromDeviceButtonTitle"),
          intro: i18next.t("TutoJournalFromDeviceButtonContent"),
        },
        {
          element: document.querySelector(".assgn-icon"),
          position: "bottom",
          title: i18next.t("TutoAssignmentButtonTitle"),
          intro: i18next.t("TutoAssignmentButtonContent"),
        },
        {
          element: document.querySelector(".assgn-inst"),
          position: "bottom",
          title: i18next.t("TutoAssignmentInstructionTitle"),
          intro: i18next.t("TutoAssignmentInstructionContent"),
        },
        {
          element: document.querySelector(".assgn-submit"),
          position: "bottom",
          title: i18next.t("TutoAssignmentSubmitTitle"),
          intro: i18next.t("TutoAssignmentSubmitContent"),
        },
        {
          element: getElement("journallocal"),
          position: "top",
          title: i18next.t("TutoJournalLocalTitle"),
          intro: i18next.t("TutoJournalLocalContent"),
        },
        {
          element: getElement("cloudonebutton"),
          position: "top",
          title: i18next.t("TutoJournalCloudOneTitle"),
          intro: i18next.t("TutoJournalCloudOneContent"),
        },
        {
          element: getElement("cloudallbutton"),
          position: "top",
          title: i18next.t("TutoJournalCloudAllTitle"),
          intro: i18next.t("TutoJournalCloudAllContent"),
        },
        {
          element: getElement("journal_home_button"),
          position: "bottom",
          title: i18next.t("TutoGotoHomeTitle"),
          intro: i18next.t("TutoGotoHomeContent"),
        },
      ];
    },

    [sugarizer.constant.neighborhood]: function () {
      return [
        {
          title: i18next.t("TutoNeighborIntroTitle"),
          intro: window.sugarizerOS
            ? i18next.t("TutoNeighborIntroContent2")
            : i18next.t("TutoNeighborIntroContent"),
        },
        {
          element: document.querySelector(".neighborhood >.user-icon"),
          position: "right",
          title: i18next.t("TutoNeighborUserTitle"),
          intro: i18next.t("TutoNeighborUserContent"),
        },
        {
          element: getElement("u-network-server"),
          position: "auto",
          title: i18next.t("TutoNeighborServerTitle"),
          intro: i18next.t("TutoNeighborServerContent"),
        },
        {
          element: document.querySelector(
            ".neighborhood .user-icon:not(:first-child):not(#u-network-server)"
          ),
          position: "auto",
          title: i18next.t("TutoNeighborOtherTitle"),
          intro: i18next.t("TutoNeighborOtherContent"),
        },
        {
          element: document.querySelector(".activity-icon"),
          position: "auto",
          title: i18next.t("TutoNeighborActivityTitle"),
          intro: i18next.t("TutoNeighborActivityContent"),
        },
        {
          element: getElement("view_home_button"),
          position: "bottom",
          title: i18next.t("TutoGotoHomeTitle"),
          intro: i18next.t("TutoGotoHomeContent"),
        },
      ];
    },

    [sugarizer.constant.firstscreen]: async function () {
      const ownerIcon = await renderIconToHTML(`
        <icon 
          svgfile="${constant.iconsPath + "owner-icon.svg"}"
		  color="20"
          disableHoverEffect=true
        ></icon>
      `);

      return [
        {
          title: i18next.t("TutoInitIntroTitle"),
          intro: ownerIcon + i18next.t("TutoInitIntroTitleIntroContent"),
        },
        {
          element: getElement("newuser-icon"),
          position: "left",
          title: i18next.t("TutoInitNewUserTitle"),
          intro: i18next.t("TutoInitNewUserContent"),
        },
        {
          element: getElement("login-icon"),
          position: "right",
          title: i18next.t("TutoInitLoginTitle"),
          intro: i18next.t("TutoInitLoginContent"),
        },
        {
          element: document.querySelector(".previoususer"),
          position: "bottom",
          title: i18next.t("TutoInitHistoryTitle"),
          intro: i18next.t("TutoInitHistoryContent"),
        },
        {
          element: getElement("help-icon"),
          position: "bottom",
          title: i18next.t("TutoInitHelpTitle"),
          intro: i18next.t("TutoInitHelpContent"),
        },
        {
          element: getElement("stop-icon"),
          position: "bottom",
          title: i18next.t("TutoInitStopTitle"),
          intro: i18next.t("TutoInitStopContent"),
        },
      ];
    },

    [sugarizer.constant.authscreen]: async function ({ index, createMode }) {
      //based on index
      const tutorialSteps = [
        [
          {
            element: getElement("serverbox"),
            position: "bottom",
            title: i18next.t("TutoInitServerTitle"),
            intro: i18next.t("TutoInitServerContent"),
          },
          previous,
          next,
        ],
        [
          {
            element: getElement("namebox"),
            position: "bottom",
            title: createMode
              ? i18next.t("TutoInitNameNewTitle")
              : i18next.t("TutoInitNameTitle"),
            intro: createMode
              ? i18next.t("TutoInitNameNewContent")
              : i18next.t("TutoInitNameContent"),
          },
          previous,
          next,
        ],
        [
          {
            element: getElement("passbox"),
            position: "right",
            title: createMode
              ? i18next.t("TutoInitPasswordNewTitle")
              : i18next.t("TutoInitPasswordTitle"),
            intro: createMode
              ? i18next.t("TutoInitPasswordNewContent")
              : i18next.t("TutoInitPasswordContent"),
          },
          previous,
          next,
        ],
        [
          {
            element: getElement("buddy_icon"),
            position: "right",
            title: i18next.t("TutoInitColorTitle"),
            intro: i18next.t("TutoInitColorContent"),
          },
          previous,
          next,
        ],
        [
          {
            title: i18next.t("TutoInitCookieTitle"),
            intro: i18next.t("TutoInitCookieContent"),
          },
          {
            element: getElement("previous"),
            position: "top",
            title: i18next.t("TutoInitDeclineTitle"),
            intro: i18next.t("TutoInitDeclineContent"),
          },
          {
            element: getElement("next"),
            position: "top",
            title: i18next.t("TutoInitAcceptTitle"),
            intro: i18next.t("TutoInitAcceptContent"),
          },
        ],
      ];

      const steps = tutorialSteps[index] || [];
      return steps;
    },
  };

  tutorial.startTutorial = async function (viewName, viewOptions = {}) {
    i18next = sugarizer.modules.i18next;
    previous = {
      element: getElement("previous"),
      position: "top",
      title: i18next.t("TutoInitPreviousTitle"),
      intro: i18next.t("TutoInitPreviousContent"),
    };

    next = {
      element: getElement("next"),
      position: "top",
      title: i18next.t("TutoInitNextTitle"),
      intro: i18next.t("TutoInitNextContent"),
    };

    tutorial.activityId = null;
    const viewTutSteps = await views[viewName](viewOptions);

    if (!viewTutSteps) {
      console.error("Tutorial not found for view: " + viewName);
      return;
    }
    const filteredSteps = viewTutSteps.filter((step) => {
      return step.element !== null; //if element field is there but the element cannot be found
    });

    const intro = introJs();
    intro.setOptions({
      steps: filteredSteps,
      nextLabel: i18next.t("TutoNext"),
      prevLabel: i18next.t("TutoPrev"),
      doneLabel: i18next.t("TutoEnd"),
      tooltipClass: "customTooltip",
      showBullets: false,
      exitOnOverlayClick: false,
      exitOnEsc: false,
      disableInteraction: true,
    });

    const index = viewOptions.startFromIndex;
    if (index !== undefined && index > 0) {
      intro.goToStepNumber(index + 1).start();
    } else {
      intro.start();
    }

    return intro;
  };

  return tutorial;
});
