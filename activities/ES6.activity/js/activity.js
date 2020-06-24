// Rebase require directory
requirejs.config({
	baseUrl: "lib",
	paths: {
		activity: "../js"
	}
});

// Assert component
var AssertItem = {
	template: `
		<h3 :style="{ color: computeStyle() }"">{{label}}</32>
	`,
	props: [ 'label', 'expr' ],
	data: function() {
		return {
			label: '',
			expr: false
		}
	},
	methods: {
		computeStyle: function() {
			return this.expr?"green":"red";
		}
	}
}

// Few ES6 declaration
let g = 100;
const rate = 0.1;


// Vue main app
var app = new Vue({
	el: '#app',
	components: {
		'assert': AssertItem
	},
	data: {
		asserts: []
	},
	methods: {
		initialized: function(message="hi") {
			var vm = this;
			let v = 12;

			// Default parameter value
			vm.assert("message=='hi'", message=='hi');

			// Let declaration
			vm.assert("g==100", g==100);
			vm.assert("rate==0.1", rate==0.1);
			vm.assert("window.g==undefined", (window.g==undefined));
			vm.assert("v==12", v==12);
			if (true) {
				let v = 36;
				vm.assert("v==32", v==36);
			}
			vm.assert("v==12", v==12);

			// Spread parameters
			vm.assert("function(...)", (function(one,two,...rest){ return rest;})(1,2,3,4,5).length==3);

			// Spread array
			const odd = [1,3,5];
			const combined = [2,4,6, ...odd];
			vm.assert("[...]", combined.length==6);

			// Spread object
			const circle = {
				radius: 10
			};
			const coloredCircle = {
				...circle,
				color: 'black'
			};
			vm.assert("{...}", coloredCircle.radius==10 && coloredCircle.color=='black');

			// Literal declaration
			let name = 'hello';
			let status = 2;
			let myobject = {
				name,
				status,
				[name]: 'h'
			};
			vm.assert("{literal}", myobject.name=='hello'&&myobject.status==2&&myobject.hello=='h');

			// for or
			let numbers = [6, 7, 8];
			numbers.foo = "foo";
			let count = 0;
			for (let i of numbers) {
				count++;
			}
			vm.assert("for of", count==3);

			// Octal & binary
			let c = 0o51;
			let f = 0b111;
			vm.assert("0o51==41", c==41);
			vm.assert("0b111==7", f==7);

			// String
			let price = 8.99, tax = 0.1;
			var netPrice = `Net Price:$${(price * (1 + tax)).toFixed(2)}`;
			vm.assert("netPrice==$9.89", netPrice=='Net Price:$9.89');

			// Destructuring
			let [x,y,z] = [50,60,70];
			vm.assert("[x,y,z]==[50,60,70]", x==50&&y==60&&z==70);
			let a = 10, b = 20;
			[a, b] = [b, a];
			vm.assert("swap", a==20&&b==10);
			let myperson = {firstname: 'John', lastname: 'Doe', age: 30};
			let {
				firstname,
				lastname,
				age
			} = myperson;
			vm.assert("destructuring", firstname=='John'&&lastname=='Doe'&&age==30);
		},

		assert: function(label, expr) {
			this.asserts.push({label:label, expr: expr});
		}
	}
});
