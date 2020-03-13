// inputArgument -> numbers given to user
//targetResult -> desired result

var inputArguments = [5];
var inputArgumentsCopy = [5];
var targetResult;

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

function solve(){
    var solvebutton = document.getElementById("solvebtn");
    var stopbutton = document.getElementById("stopbut");
    var outputexpr = document.getElementById("outputexpr");
    inputArguments.sort(function(lhs,rhs) { return lhs - rhs;});
    console.log("sorted input arguments");
    console.log(inputArguments);

    outputexpr.innerHTML="";
    solvebutton.innerHTML = "";
    stopbutton.disabled = false;
    solutions(targetResult,inputArguments,addExprLi);
    done();

    function addExprLi(expr){
        var li = document.createElement('li');
        li.appendChild(document.createTextNode(expr.toString()));
        outputexpr.appendChild(li);
    }

    function done(){
        solvebutton.disabled = false;
        stopbutton.disabled = true;
    }
}

function solutions(targetres,numberArgs,cb){
    var numbercount = numberArgs.length;
    var fill_utilized = ~(~0<<numbercount);
    var generation=0;
    var segments = new Array(fill_utilized);
    for(var i=0;i<segments.length;i++){
        segments[i]=[];

    }
    
}
