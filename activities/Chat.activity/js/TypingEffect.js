const TypingEffect = {
	props: ["usersTyping"],
	template: `
		<div class="loader-container">
			<div class="dots" v-if="Object.keys(usersTyping).length > 0">
			  <span class="dot"></span>
			  <span class="dot"></span>
			  <span class="dot"></span>
			</div>
			<div>
			    <div v-html="typingString"></div>
			</div>
		<div>
	`,
	data() {
		return {
			l10n: {
				stringIs: "",
				stringAnd: "",
				stringAre: "",
				stringTyping: "",
			},
		};
	},
	created() {
		var vm = this;
		window.addEventListener(
			"localized",
			(e) => {
				e.detail.l10n.localize(vm.l10n);
			},
			{ once: true },
		);
	},
	computed: {
		typingString() {
			const l10n = this.l10n;
			let users = this.usersTyping;
			let keys = Object.keys(users);
			if (keys.length <= 0) {
				return "";
			} else if (keys.length === 1) {
				return `<strong>${users[keys[0]].name}</strong> ${l10n.stringIs} ${l10n.stringTyping}`;
			} else if (keys.length === 2) {
				return `<strong>${users[keys[0]].name}</strong> ${l10n.stringAnd} <strong>${users[keys[1]].name}</strong> ${l10n.stringAre} ${l10n.stringTyping}`;
			} else {
				const lastKey = keys.pop();
				console.log(keys, lastKey);
				const usersList = keys.map((key) => `<strong>${users[key].name}</strong>`).join(", ");
				return `${usersList}, ${l10n.stringAnd} <strong>${users[lastKey].name}</strong> ${l10n.stringAre} ${l10n.stringTyping}`;
			}
		},
	},
	methods: {},
};
