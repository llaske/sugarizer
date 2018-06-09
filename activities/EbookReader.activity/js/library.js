
// Library item
var LibraryItem = {
	template: `
		<div class="col-xs-12 col-md-6 col-lg-4 library-col">
			<div class="media library-item">
				<div v-if="image" class="mr3 library-item-image" v-bind:style="'background-image: url('+image+')'"></div>
				<div v-else class="mr3 library-item-image" style="background-image: url(books/images/generic-book.png)"></div>
				<div class="media-body">
					<h5 class="mt-0">{{title}}</h5>
					{{author}}
				</div>
			</div>
		</div>
		`,
	props: ['title', 'author', 'image', 'url'],
	methods: {
		onClick: function() {
			this.$emit('clicked');
		},
		onImageError: function() {
			console.log("Error");
		}
	}
}

// Library Viewer component
var LibraryViewer = {
	components: {'library-item': LibraryItem},
	template: `
		<div class="row">
			<library-item v-for="item in library" :key="item.file"
			 	v-bind:title="item.title"
				v-bind:author="item.author"
				v-bind:image="item.image"
				v-bind:url="item.file">
			</library-item>
		</div>
	`,
	data: function() {
		return {
			library: constant.library.database,
		};
	},
	methods: {
	}
};
