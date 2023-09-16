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
	created() {},
	computed: {
		typingString() {
			let users = this.usersTyping;		
			let keys = Object.keys(users);
			if (keys.length <= 0) {
				return "";
			} else if (keys.length === 1) {
				return `<strong>${users[keys[0]].name}</strong> is typing`;
			} else if (keys.length === 2) {
				return `<strong>${users[keys[0]].name}</strong> and <strong>${users[keys[1]].name}</strong> are typing`;
			} else {
				const lastKey = keys.pop();
				console.log(keys, lastKey);
				const usersList = keys.map((key) => `<strong>${users[key].name}</strong>`).join(", ");
				return `${usersList}, and <strong>${users[lastKey].name}</strong> are typing`;
			}
		},
	},
	methods: {},
};
