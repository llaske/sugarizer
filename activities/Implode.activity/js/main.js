var blockArray = [
    [0,0,0,0,0,0,0,0],
    [0,0,0,1,1,0,0,0],
    [0,0,0,1,1,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,3,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,11,11,0,0,0],
    [0,0,0,11,11,0,0,0],
];
var infoArray = [
    [0,0,0,0,0,0,0,0],
    [0,0,0,1,1,0,0,0],
    [0,0,0,1,1,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,3,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
];
var emptyPosition=[9,9,9,9,9,9,9,9];
function drawWorld(){
    document.getElementById("canvas").innerHTML += "";
    for(var y = 0;y < blockArray.length;y++){
        for(var x=0;x<blockArray[y].length;x++){
            if(blockArray[y][x] === 0){
                document.getElementById("canvas").innerHTML += "<div class='empty'></div>"
            }
            else if(blockArray[y][x] ==1){
                document.getElementById("canvas").innerHTML += "<div class='red'></div>"
            }
            else if(blockArray[y][x] ==2){
                document.getElementById("canvas").innerHTML += "<div class='green'></div>"
            }
            else if(blockArray[y][x] ==3){
                document.getElementById("canvas").innerHTML += "<div class='orange'></div>"
            }
            else if(blockArray[y][x] ==4){
                document.getElementById("canvas").innerHTML += "<div class='yellow'></div>"
            }
            else if(blockArray[y][x] >=5){
                document.getElementById("canvas").innerHTML += "<div class='purple'></div>"
            }
        }
        document.getElementById("canvas").innerHTML += "<br>"
    }
}

//randomFunction renders blocks with random colors randomly
// emptyPosition array keeps check for first block in a column for zero,
// if first block in a column is 0 all the blocks above it are zero ,
//  meaning no block/empty space
function randomFunction(){
var randomValue;
    for(var y = blockArray.length-1;y >=0;y--){

        for(var x=0;x<blockArray[y].length;x++){
            if(y==blockArray.length-1){
                blockArray[y][x]=Math.floor(Math.random() * 6)+1;
            }
            else{
                if(emptyPosition[x]==0){
                    blockArray[y][x]=0;
                }
                else{
                    randomValue=Math.floor(Math.random() * 6);
                    if(randomValue==0){
                        emptyPosition[x]=0;
                    }
                    blockArray[y][x]=randomValue;
                }
            }
        }
    }
    // console.log(p);
}

infoArray[0][0]={'top':1,'bottom':2,'l':4,'r':3};
console.log(infoArray[1][3]);


var dic = {};
dic['hel']=1;
console.log(dic);
randomFunction();
console.log(blockArray);
console.log(emptyPosition);
// drawWorld();
