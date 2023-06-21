// Rebase require directory
requirejs.config({
	baseUrl: "lib",
	paths: {
		activity: "../js"
	}
});

const activity = {
	"id": "org.olpcfrance.Gridpaint",
	"name": "Grid Paint from v2",
	"version": 2,
	"directory": "activities/Gridpaint.activity",
	"icon": "activity/activity-icon.svg",
	"favorite": true,
	"activityId": null
};

const app = Vue.createApp({
	components: {
		"icon": Icon,
		"firstscreen": FirstScreen,
	},
	data() {
		return {
			message: "",
			isFirstScreen: true,
		}
	},
	mounted() {
	},
	methods: {
		iconClicked() {
			let location = activity.directory+"/index.html?aid="+activity.activityId+"&a="+activity.id+"&n="+activity.name;
			document.location.href = location;
		},
		homeClicked() {
			let location = "../index.html";
			document.location.href = location;
		},
		setIsFirstScreen(value) {
			this.isFirstScreen = value;
		},
	},
});

app.mount('#app');