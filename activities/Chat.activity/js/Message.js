const Message = {
	props: ["id", "msg", "type", "name", "fill", "stroke", "sender", "index", "joinString", "leaveString"],
	template: `
		<div
			class="message"
			:class="{ 'sent': sender }"
			:style="{ '--fill': fill, '--stroke': stroke }"
		>
			<div v-if="name && type !== 'status'" class="msg-sender">{{ name }}</div>
			<div v-if="type === 'text'" class="msg-text">
				<div v-if="sender" class="msg-remove" @click="deleteMessage">&#10008;</div>
				{{ msg }}
			</div>
			<div v-else-if="type === 'image'" class="msg-img">
				<div v-if="sender" class="msg-remove" @click="deleteMessage">&#10008;</div>
				<img :src="msg" alt="Image" />
			</div>
			<div class="msg-tag" v-else>
				<span class="msg-tag-name">{{ name }}</span>
				<span>{{ msg === 1 ? " " + joinString : " " + leaveString }}</span>
			</div>
		</div>
	`,
	methods: {
		deleteMessage() {
			this.$emit("delete-msg", this.id);
		},
	},
};
