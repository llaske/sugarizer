// inputArgument -> numbers given to user
// targetResult -> desired result

var inputArguments = [5];
var inputArgumentsCopy = [5];
var targetResult;

"use strict";

function Expr () {}

Expr.prototype = {
	toStringUnder: function (precedence) {
		if (precedence > this.precedence) {
			return '('+this.toString()+')';
		}
		else {
			return this.toString();
		}
	}
};


function BinExpr (op) {
	this.op = op;
}

BinExpr.prototype = new Expr();

BinExpr.prototype.initBinExpr = function (left, right, value, generation) {
	this.left       = left;
	this.right      = right;
	this.value      = value;
	this.used       = left.used | right.used;
	this.id         = this.toId();
	this.generation = generation;
	return this;
};

BinExpr.prototype.toString = function () {
	var p = this.precedence;
	return this.left.toStringUnder(p) + ' ' + this.op + ' ' + this.right.toStringUnder(p);
};

BinExpr.prototype.toId = function () {
	return '('+this.left.toId()+this.op+this.right.toId()+')';
};


function Add () {}

Add.prototype = new BinExpr('+');

Add.prototype.precedence = 0;

Add.prototype.init = function (left, right, generation) {
	return this.initBinExpr(left, right, left.value + right.value, generation);
};


function Sub () {}

Sub.prototype = new BinExpr('-');

Sub.prototype.precedence = 1;

Sub.prototype.init = function (left, right, generation) {
	return this.initBinExpr(left, right, left.value - right.value, generation);
};


function Mul () {}

Mul.prototype = new BinExpr('*');

Mul.prototype.precedence = 3;

Mul.prototype.init = function (left, right, generation) {
	return this.initBinExpr(left, right, left.value * right.value, generation);
};


function Div () {}

Div.prototype = new BinExpr('/');

Div.prototype.precedence = 2;

Div.prototype.init = function (left, right, generation) {
	return this.initBinExpr(left, right, left.value / right.value, generation);
};


function Val () {}

Val.prototype = new Expr();

Val.prototype.op = '$';
Val.prototype.precedence = 4;

Val.prototype.init = function (value, index, generation) {
	this.value      = value;
	this.index      = index;
	this.used       = 1 << index;
	this.id         = this.toId();
	this.generation = generation;
	return this;
};

Val.prototype.toString = function () {
	return String(this.value);
};

Val.prototype.toId = Val.prototype.toStringUnder = Val.prototype.toString;


function isNormalizedAdd (left, right) {
	var ro = right.op;
	if (ro === '+' || ro === '-') {
		return false;
	}

	var lo = left.op;
	if (lo === '+') {
		return left.right.value <= right.value;
	}
	else if (lo === '-') {
		return false;
	}
	else {
		return left.value <= right.value;
	}
}

function isNormalizedSub (left, right) {
	var ro = right.op;
	if (ro === '+' || ro === '-') {
		return false;
	}

	var lo = left.op;
	if (lo === '-') {
		return left.right.value <= right.value;
	}
	else {
		return true;
	}
}

function isNormalizedMul (left, right) {
	var ro = right.op;
	if (ro === '*' || ro === '/') {
		return false;
	}

	var lo = left.op;
	if (lo === '*') {
		return left.right.value <= right.value;
	}
	else if (lo === '/') {
		return false;
	}
	else {
		return left.value <= right.value;
	}
}

function isNormalizedDiv (left, right) {
	var ro = right.op;
	if (ro === '*' || ro === '/') {
		return false;
	}

	var lo = left.op;
	if (lo === '/') {
		return left.right.value <= right.value;
	}
	else {
		return true;
	}
}

// function loadParameters(){
//     console.log("clicked solve button in index.html file");
//     for(var i=0;i<5;i++){
//         inputArguments[i]=document.getElementById("number"+(i+1)).value;
//         inputArgumentsCopy[i]=document.getElementById("number"+(i+1)).value;
//     }
//     targetResult = document.getElementById("target").value;
//     console.log(inputArguments);
//     console.log(targetResult);
//     solve();
// }

function solve(){
    var solvebutton = document.getElementById("solvebut");
    var stopbutton = document.getElementById("stopbut");
    var outputexpr = document.getElementById("outputexpr");

    var target = parseInt(document.getElementById("target").value,10);
    var targetResult = parseInt(document.getElementById("target").value,10);
    var numbers = [];
	
		if (isNaN(target)) {
			throw new TypeError("target is not a number");
		}

		if (target < 0) {
			throw new TypeError("target musst not be negative");
		}

		for (var i = 1; i <= 5; ++ i) {
			var str = document.getElementById("number"+i).value;
			var num = parseInt(str,10);
			if (isNaN(num)) {
				throw new TypeError("argument is not a number: "+str);
			}
			if (num <= 0) {
				throw new TypeError("illegal argument value: "+str);
			}
            numbers.push(num);
            inputArguments.push(num);
		}
		var unsortedNumbers = numbers.slice(0);
		// console.log(unsortedNumbers);
		numbers.sort(function (lhs,rhs) { return lhs - rhs; });
		inputArguments.sort(function (lhs,rhs) { return lhs - rhs; });
		outputexpr.innerHTML = "";
		// time.innerHTML = "";
		solvebutton.disabled = true;
		stopbutton.disabled = false;

		solutions(target, numbers, addExpr1);
		done();

    console.log("insolve3");
    console.log(targetResult);
    console.log(inputArguments);

    function addExpr1(expr){
        var li = document.createElement('li');
        li.appendChild(document.createTextNode(expr.toString()));
        outputexpr.appendChild(li);
    }

    function done(){
        solvebutton.disabled = false;
        stopbutton.disabled = true;
    }
}

function make (a, b, generation, addExpr) {
	var avalue = a.value;
	var bvalue = b.value;

	if (isNormalizedAdd(a, b)) {
		addExpr(new Add().init(a, b, generation));
	}
	else if (isNormalizedAdd(b, a)) {
		addExpr(new Add().init(b, a, generation));
	}

	if (avalue !== 1 && bvalue !== 1) {
		if (isNormalizedMul(a, b)) {
			addExpr(new Mul().init(a, b, generation));
		}
		else if (isNormalizedMul(b, a)) {
			addExpr(new Mul().init(b, a, generation));
		}
	}

	if (avalue > bvalue) {
		if (avalue - bvalue !== bvalue && isNormalizedSub(a, b)) {
			addExpr(new Sub().init(a, b, generation));
		}

		if (bvalue !== 1 && avalue % bvalue === 0 && avalue / bvalue !== bvalue && isNormalizedDiv(a, b)) {
			addExpr(new Div().init(a, b, generation));
		}
	}
	else if (bvalue > avalue) {
		if (bvalue - avalue !== avalue && isNormalizedSub(b, a)) {
			addExpr(new Sub().init(b, a, generation));
		}

		if (avalue !== 1 && bvalue % avalue === 0 && bvalue / avalue !== avalue && isNormalizedDiv(b, a)) {
			addExpr(new Div().init(b, a, generation));
		}
	}
	else if (bvalue !== 1) {
		if (isNormalizedDiv(a, b)) {
			addExpr(new Div().init(a, b, generation));
		}
		else if (isNormalizedDiv(b, a)) {
			addExpr(new Div().init(b, a, generation));
		}
	}
}

function make_half (a, b, generation, addExpr) {
	var avalue = a.value;
	var bvalue = b.value;

	if (isNormalizedAdd(a, b)) {
		addExpr(new Add().init(a, b, generation));
	}

	if (avalue !== 1 && bvalue !== 1) {
		if (isNormalizedMul(a, b)) {
			addExpr(new Mul().init(a, b, generation));
		}
	}

	if (avalue > bvalue) {
		if (avalue - bvalue !== bvalue && isNormalizedSub(a, b)) {
			addExpr(new Sub().init(a, b, generation));
		}

		if (bvalue !== 1 && avalue % bvalue === 0 && avalue / bvalue !== bvalue && isNormalizedDiv(a, b)) {
			addExpr(new Div().init(a, b, generation));
		}
	}
	else if (avalue === bvalue && bvalue !== 1) {
		if (isNormalizedDiv(a, b)) {
			addExpr(new Div().init(a, b, generation));
		}
	}
}

// function solutions(targetres,numberArgs,cb){
//     var numbercount = numberArgs.length;
//     var full_utilized = ~(~0<<numbercount);
//     var generation=0;
//     var segments = new Array(full_utilized);
//     for(var i=0;i<segments.length;i++){
//         segments[i]=[];

//     }
//     var exprs = [];
//     var has_single_number_solution = false;
//     for(var i=0;i<numberArgs.length;i++){
//         var number = numberArgs[i];
//         var expr = new Val().init(number,i,generation);
//         if(number == targetres){
//             if(!has_single_number_solution){
//                 has_single_number_solution=true;
//                 cb(expr);
//             }
//         }
//         else{
//             exprs.push(expr);
//             segments[expr.used-1].push(expr);
//         }
//     }
//     var unique_solutions = {};
//     function addExpr(expr){
//         if(expr.value===targetres){
//             if(unique_solutions[expr.id]!==true){
//                 unique_solutions[expr.id] = true;
//                 cb(expr);
//             }
//         }
//         else if(expr.used !== full_utilized){
//             exprs.push(expr);
//             segments[expr.used -1].push(expr);
//         }
//     }
//     console.log("uniques sols");
//     console.log(unique_solutions);

//     var lower = 0;
//     var upper = numbercount;
//     while(lower < upper){
//         var prev_generation = generation ++;
//         for(var b=lower;b<upper;++b){
//             var bexpr = exprs[b];
//             var bused = bexpr.used;
            
//             for(var aused=1;aused<=segments.length;++aused) {
//                 if((bused & aused) === 0){
//                     var segment = segments[aused-1];
//                     for(var i=0;i<segment.length;++i){
//                         var aexpr = segment[i];
                        
//                         if(aexpr.generation === prev_generation){
//                             make_half(aexpr,bexpr,generation,addExpr);
//                         }
//                         else{
//                             make(aexpr,bexpr,generation,addExpr);
//                         }
//                     }
//                 }
//             }
//         }
//         lower = upper;
//         upper = exprs.length;
//     }
// }
function solutions (target, numbers, cb) {
	var numcnt = numbers.length;
	var full_usage = ~(~0 << numcnt);
	var generation = 0;
	var segments = new Array(full_usage);
	for (var i = 0; i < segments.length; ++ i) {
		segments[i] = [];
	}

	var exprs = [];
	var has_single_number_solution = false;
	for (var i = 0; i < numbers.length; ++ i) {
		var num = numbers[i];
		var expr = new Val().init(num, i, generation);
		if (num === target) {
			if (!has_single_number_solution) {
				has_single_number_solution = true;
				cb(expr);
			}
		}
		else {
			exprs.push(expr);
			segments[expr.used - 1].push(expr);
		}
	}

	var uniq_solutions = {};

	function addExpr (expr) {
		if (expr.value === target) {
			if (uniq_solutions[expr.id] !== true) {
				uniq_solutions[expr.id] = true;
				cb(expr);
			}
		}
		else if (expr.used !== full_usage) {
			exprs.push(expr);
			segments[expr.used - 1].push(expr);
		}
	}
	console.log("uniques sols");
	console.log(uniq_solutions);

	var lower = 0;
	var upper = numcnt;
	while (lower < upper) {
		var prev_generation = generation ++;
		for (var b = lower; b < upper; ++ b) {
			var bexpr = exprs[b];
			var bused = bexpr.used;

			for (var aused = 1; aused <= segments.length; ++ aused) {
				if ((bused & aused) === 0) {
					var segment = segments[aused - 1];
					for (var i = 0; i < segment.length; ++ i) {
						var aexpr = segment[i];

						if (aexpr.generation === prev_generation) {
							make_half(aexpr, bexpr, generation, addExpr);
						}
						else {
							make(aexpr, bexpr, generation, addExpr);
						}
					}
				}
			}
		}

		lower = upper;
		upper = exprs.length;
	}
}

function loadParameters(){
    console.log("clicked solve button in index.html file");
    for(var i=0;i<5;i++){
        inputArguments[i]=document.getElementById("number"+(i+1)).value;
        inputArgumentsCopy[i]=document.getElementById("number"+(i+1)).value;
    }
    targetResult = document.getElementById("target").value;
    console.log(inputArguments);
    console.log(targetResult);
    solve();
}

function play(){
    var slot1=true;
    var slot2= true;
    var slot3=true;
    var slot4= true;
    var buffer1=null;
    var buffer2=null;
    var buffer3=null;
    var buffer4=null;
    var x=null;
    var sender1=null;
    var sender2=null;
    var counter=0;
    var opr=null;
    var y = null;
    var evaluate=false;
    console.log("clicked");
    document.getElementById("input1").addEventListener('click',function(){
        if(x==null){
            x=document.getElementById("input1").value;
            counter++;
            sender1="input1";

        }
        else{
            y=document.getElementById("input1").value;
            counter++;
            sender2="input1";
        }
    });
    document.getElementById("input3").addEventListener('click',function(){
        if(x==null){
            x=document.getElementById("input3").value;
            counter++;
            sender1="input3";

        }
        else{
            y=document.getElementById("input3").value;
            counter++;
            sender2="input3";
        }

        
    });
    document.getElementById("input2").addEventListener('click',function(){
        if(x==null){
            x=document.getElementById("input2").value;
            counter++;
            sender1="input2";
        }
        else{
            y=document.getElementById("input2").value;
            counter++;
            sender2="input2";
        }

        
    });
    
    document.getElementById("input4").addEventListener('click',function(){
        if(x==null){
            x=document.getElementById("input4").value;
            counter++;
            sender1="input4";
        }
        else{
            y=document.getElementById("input4").value;
            counter++;
            sender2="input4";
        }

        
    });
    document.getElementById("input5").addEventListener('click',function(){
        if(x==null){
            x=document.getElementById("input5").value;
            counter++;
            sender1="input5";

        }
        else{
            y=document.getElementById("input5").value;
            counter++;
            sender2="input5";

        }
        
    });
    document.getElementById("buffer1").addEventListener('click',function(){
        if(x==null){
            x=document.getElementById("buffer1").value;
            counter++;
            // sender1="input5";

        }
        else{
            y=document.getElementById("buffer1").value;
            counter++;
            // sender2="input5";

        }
    });
    document.getElementById("buffer4").addEventListener('click',function(){
        if(x==null){
            x=document.getElementById("buffer4").value;
            counter++;
            // sender1="input5";

        }
        else{
            y=document.getElementById("buffer4").value;
            counter++;
            // sender2="input5";

        }
    });
    document.getElementById("buffer2").addEventListener('click',function(){
        if(x==null){
            x=document.getElementById("buffer2").value;
            counter++;
            // sender1="input5";

        }
        else{
            y=document.getElementById("buffer2").value;
            counter++;
            // sender2="input5";

        }
    });
    document.getElementById("buffer3").addEventListener('click',function(){
        if(x==null){
            x=document.getElementById("buffer3").value;
            counter++;
            // sender1="input5";

        }
        else{
            y=document.getElementById("buffer3").value;
            counter++;
            // sender2="input5";

        }
    });
    document.getElementById("plus").addEventListener('click',function(){
        opr=document.getElementById("plus").value;
        counter++;
    });
    document.getElementById("minus").addEventListener('click',function(){
        opr=document.getElementById("minus").value;
        counter++;
    });
    document.getElementById("product").addEventListener('click',function(){
        opr=document.getElementById("product").value;
        counter++;
    });
    document.getElementById("division").addEventListener('click',function(){
        opr=document.getElementById("division").value;
        counter++;
    });
    document.getElementById("calc").addEventListener('click',function(){
        console.log(x,y,opr);
        if(opr == '+' ){
            var res= parseInt(x) + parseInt(y);
            x=null;
            y=null;
            counter=0;
            if(buffer1==null){
                document.getElementById("buffer1").innerHTML=res;
                document.getElementById("buffer1").value=res;
                buffer1=1;
            }
            else if(buffer2==null){
                document.getElementById("buffer2").innerHTML=res;
                document.getElementById("buffer2").value=res;
                buffer2=2;
            }
            else if(buffer3==null){
                document.getElementById("buffer3").innerHTML=res;
                document.getElementById("buffer3").value=res;
                buffer3=3;
            }
            else if(buffer4==null){
                document.getElementById("buffer4").innerHTML=res;
                document.getElementById("buffer4").value=res;
                buffer4=4;
            }
        }
        else if(opr == '-'){
            var res= parseInt(x) - parseInt(y);
            x=null;
            y=null;
            counter=0;
            if(buffer1==null){
                document.getElementById("buffer1").innerHTML=res;
                document.getElementById("buffer1").value=res;
                buffer1=1;
            }
            else if(buffer2==null){
                document.getElementById("buffer2").innerHTML=res;
                document.getElementById("buffer2").value=res;
                buffer2=2;
            }
            else if(buffer3==null){
                document.getElementById("buffer3").innerHTML=res;
                document.getElementById("buffer3").value=res;
                buffer3=3;
            }
            else if(buffer4==null){
                document.getElementById("buffer4").innerHTML=res;
                document.getElementById("buffer4").value=res;
                buffer4=4;
            }
        }
        else if(opr == '*'){
            var res= parseInt(x) * parseInt(y);
            x=null;
            y=null;
            counter=0;
            if(buffer1==null){
                document.getElementById("buffer1").innerHTML=res;
                document.getElementById("buffer1").value=res;
                buffer1=1;
            }
            else if(buffer2==null){
                document.getElementById("buffer2").innerHTML=res;
                document.getElementById("buffer2").value=res;
                buffer2=2;
            }
            else if(buffer3==null){
                document.getElementById("buffer3").innerHTML=res;
                document.getElementById("buffer3").value=res;
                buffer3=3;
            }
            else if(buffer4==null){
                document.getElementById("buffer4").innerHTML=res;
                document.getElementById("buffer4").value=res;
                buffer4=4;
            }
        }
        else if(opr == '/'){
            var res= parseInt(x) / parseInt(y);
            x=null;
            y=null;
            counter=0;
            if(buffer1==null){
                document.getElementById("buffer1").innerHTML=res;
                document.getElementById("buffer1").value=res;
                buffer1=1;
            }
            else if(buffer2==null){
                document.getElementById("buffer2").innerHTML=res;
                document.getElementById("buffer2").value=res;
                buffer2=2;
            }
            else if(buffer3==null){
                document.getElementById("buffer3").innerHTML=res;
                document.getElementById("buffer3").value=res;
                buffer3=3;
            }
            else if(buffer4==null){
                document.getElementById("buffer4").innerHTML=res;
                document.getElementById("buffer4").value=res;
                buffer4=4;
            }
        }
        if(sender1 == 'input1' ){
            document.getElementById("input1").value="";
            document.getElementById("input1").innerHTML="";

        }
        if(sender1 == 'input2' ){
            document.getElementById("input2").value="";
            document.getElementById("input2").innerHTML="";

        }
        if(sender1 == 'input3' ){
            document.getElementById("input3").value="";
            document.getElementById("input3").innerHTML="";

        }
        if(sender1 == 'input4' ){
            document.getElementById("input4").value="";
            document.getElementById("input4").innerHTML="";

        }
        if(sender1 == 'input5' ){
            document.getElementById("input5").value="";
            document.getElementById("input5").innerHTML="";
        }
        if(sender2 == 'input1' ){
            document.getElementById("input1").value="";
            document.getElementById("input1").innerHTML="";

        }
        if(sender2 == 'input2' ){
            document.getElementById("input2").value="";
            document.getElementById("input2").innerHTML="";

        }
        if(sender2 == 'input3' ){
            document.getElementById("input3").value="";
            document.getElementById("input3").innerHTML="";

        }
        if(sender2 == 'input4' ){
            document.getElementById("input4").value="";
            document.getElementById("input4").innerHTML="";

        }
        if(sender2 == 'input5' ){
            document.getElementById("input5").value="";
            document.getElementById("input5").innerHTML="";
        }
    });

    document.getElementById("submit").addEventListener('click',function(){
        if(document.getElementById("buffer4").value!=""){
            if(document.getElementById("buffer4").value == document.getElementById('targett').value){
                document.getElementById("resultt").innerHTML="Correct";
            }
            else{
                console.log("1");
                document.getElementById("resultt").innerHTML="inCorrect";
            }

        }
        else if(document.getElementById("buffer3").value!=""){
            if(document.getElementById("buffer3").value == document.getElementById('targett').value){
                document.getElementById("resultt").innerHTML="Correct";
            }
            else{
                console.log("2");
                document.getElementById("resultt").innerHTML="inCorrect";
            }

        }
        else if(document.getElementById("buffer2").value!=""){
            if(document.getElementById("buffer2").value == document.getElementById('targett').value){
                document.getElementById("resultt").innerHTML="Correct";
            }
            else{
                console.log("e;00");
                document.getElementById("resultt").innerHTML="inCorrect";
            }

        }
        else if(document.getElementById("buffer1").value!=""){
            if(document.getElementById("buffer1").value == document.getElementById('targett').value){
                document.getElementById("resultt").innerHTML="Correct";
            }
            else{
                console.log("4");
                document.getElementById("resultt").innerHTML="inCorrect";
            }

        }
    });
document.getElementById("slot1answer1").addEventListener('click',function(event){
    console.log(document.getElementById("slot1answer1").value="6");
    document.getElementById("slot1answer1").value=6;
});


    

}

