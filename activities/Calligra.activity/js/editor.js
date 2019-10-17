// Editor component
var Editor = {
	template: `
		<div>
			<div id="area" class="editor-area">
				<img class="" v-bind:src="item.image"></img>
			</div>
		</div>`,
	props: ['item'],
	methods: {
	}
};
