// document.getElementById("timebased").addEventListener("click",function(event){
//     if(document.getElementById("timebased").value == 0){
//       var s = function(p){
//         p.mic1;
//         p.yslider;
//         p.xslider;
//         p.buttonx1;
//         p.buttony1;
//         p.buttonx2;
//         p.buttony2;
//         p.bg;
//         p.img;
//         p.setup = function(){
          
//           p.createCanvas(window.innerWidth-100,window.innerHeight-250);
//           p.text("abc",100.100);
//           p.xaxis1=p.createP('Sound Time Base');
//           p.xaxis1.style('padding-left:40%');
          
//           console.log("in1");
//           p.mic1 = new p5.AudioIn();
//           console.log("in");
//           p.mic1.start();
//           p.fft = new p5.FFT();
//           p.fft.setInput(p.mic1);
//           p.buttony1=p.createButton('');
//           p.buttony1.id('timebtny1');
//           p.yslider=p.createSlider(0,5,0.5,0.05);
//           p.yslider.id('timeyslider');
//           p.yslider.style('margin-top:3%');
//           p.buttony2=p.createButton('');
//           p.buttony2.id('timebtny2');
//           p.buttonx1=p.createButton('');
//           p.buttonx1.id('timebtnx1');
//           p.xslider=p.createSlider(1,5,0.5,0.05);
//           p.xslider.id('timexslider');
//           p.xslider.style('margin-top:3%');
//           p.buttonx2=p.createButton('');
//           p.buttonx2.id('timebtnx2');
//         //   drawText("asfas",50,760);
//             p.txt = p.createDiv('This is an HTML string!');
//             p.txt.position(50, 850);
//           p.bg=p.loadImage('images/bg.jpg');
  
//         };
//         p.draw = function(){
//           p.background(p.bg);
//           let waveform = p.fft.waveform();
//           p.noFill();
//           p.beginShape();
//           p.stroke(255);
  
//           for (let i = 0; i < waveform.length; i++){
//             let x = p.map(i*p.xslider.value(), 0, waveform.length, 0, p.width);
//             let y = p.map( waveform[i]*p.yslider.value(), -1, 1, 0, p.height);
//             p.vertex(x,y);
            
//           }
//           p.endShape();
//         //   p.stroke(200);
//         //   p.text("X Axis Scale:1 division =",60,780);
//         //   p.text(p.xslider.value()/20,215,720);
//         //   p.text("ms",250,720);
          
//         };
        
//         p.windowResized = function(){
//           p.resizeCanvas(window.innerWidth-100,window.innerHeight-200);
//         };
//       };
        
          
//       var myp5 = new p5(s,'one');
//       document.getElementById("timebased").style.visibility="hidden";
//       document.getElementById("timebased").style.display="none";
//       document.getElementById("timebased").style.width="0px";
//       document.getElementById("timebased").style.height="0px";
      
//       document.getElementById("freqbased").style.width="47px";
//       document.getElementById("freqbased").style.height="47px";
//       document.getElementById("freqbased").style.visibility="visible";
  
//     }
    
    
//   });
//   document.getElementById("freqbased").addEventListener("click",function(event){
//     if(document.getElementById("freqbased").value == 0){
      
  
//     }
   
    
//   });

