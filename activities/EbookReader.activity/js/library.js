
// Library item
var LibraryItem = {
	template: `
		<div class="col-xs-12 col-md-6 col-lg-4 library-col" v-on:click="onClick">
			<div class="media library-item">
				<div v-if="image" class="mr3 library-item-image" v-bind:style="'background-image: url('+prefix+image+')'"></div>
				<div v-else class="mr3 library-item-image" style="background-image: url(images/generic-book.png)"></div>
				<div class="media-body">
					<h5 class="mt-0">{{title}}</h5>
					{{author}}
				</div>
				<img v-if="image" v-bind:src="prefix+image" v-on:error="onImageError" style="visibility:hidden;width:0px;height:0px;"/>
			</div>
		</div>
		`,
	props: ['title', 'author', 'image', 'url', 'prefix'],
	methods: {
		onClick: function() {
			this.$emit('clicked');
		},
		onImageError: function() {
			this.$emit('imageerror');
		}
	}
}

// Library Viewer component
var LibraryViewer = {
	components: {'library-item': LibraryItem},
	template: `
		<div class="row">
			<library-item v-for="item in library.database" :key="item.file"
			 	v-bind:title="item.title"
				v-bind:author="item.author"
				v-bind:image="item.image"
				v-bind:url="item.file"
				v-bind:prefix="library.information.imageprefix"
				v-on:clicked="bookClicked(item)"
				v-on:imageerror="item.image=''">
			</library-item>
		</div>
	`,
	props: ['library'],
	methods: {
		bookClicked: function(book) {
			this.$emit('bookselected', book);
		}
	}
};
