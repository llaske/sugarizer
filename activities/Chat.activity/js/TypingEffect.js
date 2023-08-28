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
				<span v-for="(user, userId) in usersTyping" :key="userId">{{user.name}}</span>
				<span style="font-weight: normal"> is typing ...</span>
			</div>
		<div>
	`,
	created() {
	},
	methods: {
	},
};
