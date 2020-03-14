document.getElementById("1").innerHTML=Math.floor(Math.random() * 10);
document.getElementById("2").innerHTML=Math.floor(Math.random() * 10);
document.getElementById("3").innerHTML=Math.floor(Math.random() * 10);
document.getElementById("4").innerHTML=Math.floor(Math.random() * 10);
document.getElementById("5").innerHTML=Math.floor(Math.random() * 10);
document.getElementById("res").innerHTML=Math.floor(Math.random() * 10);

var x1=document.getElementById("1");
var x2=document.getElementById("2");
var x3=document.getElementById("3");
var x4=document.getElementById("4");
var x5=document.getElementById("5");
var xr=document.getElementById("res");

var p1=x1.innerHTML,p2=x2.innerHTML,p3=x3.innerHTML,p4=x4.innerHTML,p5=x5.innerHTML;

var op1=null ,op2=null,res=null,flag=0,operator=null;


function select1(){
    if(op1==null){
        op1=x1;
    }
    else{
        op2=x1;
    }
        
}
function select2(){
    if(op1==null){
        op1=x2;
    }
    else{
        op2=x2;
    }
        
}
function select3(){
    if(op1==null){
        op1=x3;
    }
    else{
        op2=x3;
    }
        
}
function select4(){
    if(op1==null){
        op1=x4;
    }
    else{
        op2=x4;
    }
        
}
function select5(){
    if(op1==null){
        op1=x5;
    }
    else{
        op2=x5;
    }
        
}

function add(){
    operator="+"
    if(op1!=null&&op2!=null){
        res=parseInt(op1.innerHTML)+parseInt(op2.innerHTML);
        submit();
        op1=null;
        op2=null;
    }
    console.log(res)
}
function sub(){
    operator="-"
    if(op1!=null&&op2!=null){
        res=parseInt(op1.innerHTML)-parseInt(op2.innerHTML);
        submit();
        op1=null;
        op2=null;
    }
    console.log(res)
}
function mul(){
    operator="*"
    if(op1!=null&&op2!=null){
        res=parseInt(op1.innerHTML)*parseInt(op2.innerHTML);
        submit();
        op1=null;
        op2=null;
    }
    console.log(res)
}
function div(){
    operator="/"
    if(op1!=null&&op2!=null){
        res=Math.floor(parseInt(op1.innerHTML)/parseInt(op2.innerHTML));
         submit();
        op1=null;
        op2=null;
    }
    console.log(res)
}

function submit(){
    if(flag==0){
    document.getElementById("res1-a").innerHTML=op1.innerHTML;
    document.getElementById("res2-a").innerHTML=operator;
    document.getElementById("res3-a").innerHTML=op2.innerHTML;
    document.getElementById("res4-a").innerHTML=res;
    document.getElementById("eq-a").innerHTML="=";
    flag=1;
    op1.innerHTML=res
    op2.innerHTML=null
    return;
    }
    if(flag==1){
        document.getElementById("res1-b").innerHTML=op1.innerHTML;
        document.getElementById("res2-b").innerHTML=operator;
        document.getElementById("res3-b").innerHTML=op2.innerHTML;
        document.getElementById("res4-b").innerHTML=res;
        document.getElementById("eq-b").innerHTML="=";
        flag=2;
        op1.innerHTML=res
        op2.innerHTML=null
        return;
        }
     if(flag==2){
            document.getElementById("res1-c").innerHTML=op1.innerHTML;
            document.getElementById("res2-c").innerHTML=operator;
            document.getElementById("res3-c").innerHTML=op2.innerHTML;
            document.getElementById("res4-c").innerHTML=res;
            document.getElementById("eq-c").innerHTML="=";
            flag=3;
            op1.innerHTML=res
            op2.innerHTML=null
            return;
            }
       if(flag==3){
                document.getElementById("res1-d").innerHTML=op1.innerHTML;
                document.getElementById("res2-d").innerHTML=operator;
                document.getElementById("res3-d").innerHTML=op2.innerHTML;
                document.getElementById("res4-d").innerHTML=res;
                document.getElementById("eq-d").innerHTML="=";
                flag=4;
                if(document.getElementById("res4-d").innerHTML==document.getElementById("res").innerHTML){
                       var x = document.createElement("h1");
                       x.innerHTML="You Won ";
                       document.getElementById("msg").appendChild(x);
                       document.getElementById("msg").style.display="block";
                }
                op1.innerHTML=res
                op2.innerHTML=null
                return;
    }
}

function reset(){
    op1=null;
    op2=null;
    document.getElementById("res1-a").innerHTML=null;
    document.getElementById("res2-a").innerHTML=null;
    document.getElementById("res3-a").innerHTML=null;
    document.getElementById("res4-a").innerHTML=null;

    document.getElementById("res1-b").innerHTML=null;
    document.getElementById("res2-b").innerHTML=null;
    document.getElementById("res3-b").innerHTML=null;
    document.getElementById("res4-b").innerHTML=null;
    document.getElementById("res1-c").innerHTML=null;
    document.getElementById("res2-c").innerHTML=null;
    document.getElementById("res3-c").innerHTML=null;
    document.getElementById("res4-c").innerHTML=null;
    document.getElementById("res1-d").innerHTML=null;
    document.getElementById("res2-d").innerHTML=null;
    document.getElementById("res3-d").innerHTML=null;
    document.getElementById("res4-d").innerHTML=null;
    document.getElementById("eq-a").innerHTML=null;
    document.getElementById("eq-b").innerHTML=null;
    document.getElementById("eq-c").innerHTML=null;
    document.getElementById("eq-d").innerHTML=null;
    x1.innerHTML=p1;
    x2.innerHTML=p2;
    x3.innerHTML=p3;
    x4.innerHTML=p4;
    x5.innerHTML=p5;
    flag=0;
}
