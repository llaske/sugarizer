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
		<h3 :class="computeClass()">{{label}}</h3>
	`,
	props: [ 'label', 'expr' ],
	data: function() {
		return {
			label: '',
			expr: false
		}
	},
	methods: {
		computeClass: function() {
			return this.expr?"class-success":"class-fail";
		}
	}
}

// Few ES6 declaration
let g = 100;
const rate = 0.1;
class Animal {
	constructor(type) {
		this.type = type;
	}
	identify() {
		return this.type;
	}
	get AnimalType() {
		return this.type;
	}
}
function* generate() {
	yield 10;
	yield 20;
}
function makePromise(value) {
	return new Promise(function(resolve, reject) {
		if (value) {
			resolve();
		} else {
			reject();
		}
	});
}
let chars = new Set(['a', 'a', 'b', 'c', 'c']);
var numbersArray = [4, 9, 16, 25, 29];
function myFunction(value, index, array) {
	return value > 18;
}




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

			// Modules
			vm.assert("modules", window.myModule&&window.myModule.message=="module"&&window.myModule.log()=="log");

			// Classes
			let cat = new Animal('Cat');
			vm.assert("classes", cat.identify()=='Cat'&&cat.AnimalType=='Cat');

			// Arrow
			let hello = (name) => "hello "+name+"!";
			vm.assert("arrow", hello("world")=="hello world!");

			// Generator
			let gen = generate();
			vm.assert("generator", gen.next().value==10&&gen.next().value==20);

			// Promises
			makePromise(true).then(function() {
				vm.assert("promise1", true);
			}, function() {
				vm.assert("promise1", false);
			}).finally(function() {
				vm.assert("promise1b", true);
			});
			makePromise(false).then(function() {
				vm.assert("promise2", false);
			}, function() {
				vm.assert("promise2", true);
			}).finally(function() {
				vm.assert("promise2b", true);
			});

			// Set
			vm.assert("Set", chars.has('a')&&chars.has('c')&&!chars.has('d'));

			// Array.find
			vm.assert("Array.find",numbersArray.find(myFunction)==25&&numbersArray.findIndex(myFunction)==3);

			// Numbers
			vm.assert("Numbers",isNaN("Hello")&&5**2==25&&!isFinite(10/0)&&isFinite(10/1));
		},

		assert: function(label, expr) {
			this.asserts.push({label:label, expr: expr});
		}
	}
});
