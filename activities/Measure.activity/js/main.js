// document.getElementById("timebased").addEventListener("click",function(event){
//     if(document.getElementById("timebased").value == 1){
//       var t = function(p){
//         p.mic2;
//         p.yslider;
//         p.xslider;
//         p.setup = function(){
//           p.createCanvas(800,500);
//           p.mic2 = new p5.AudioIn();
//           p.mic2.start();
//           p.fft = new p5.FFT();
//           p.fft.setInput(p.mic2);
//           let d = p.createDiv();
//           d.style('margin-left:6%;');
//           d.style('padding-left: 50px;');
//           d.style('transform-origin: 0 50% 0');
//           d.style('transform: rotate(' + ((360 / 4)) + 'deg);');
//           d.position(820, 200);
//           p.yslider=p.createSlider(0.2,2,0.5,0.05);
//           d.child(p.yslider);
//           p.xslider= p.createSlider(1,2,0.5,0.05);
//           d.child(p.xslider)
//           // console.log(p.yslider.value());
//           // sound.amp(0.2);
//         };
//         p.draw = function(){
//           p.background(220);
      
//           let spectrum = p.fft.analyze();
//           p.noStroke();
//           p.fill(255, 0, 255);
//           for (let i = 0; i< spectrum.length; i++){
//             let x = p.map(i*p.xslider.value(), 0, spectrum.length, 0, p.width);
//             let h = -p.height + p.map(spectrum[i]*p.yslider.value(), 0, 255, p.height, 0);
//             p.rect(x, p.height, p.width / spectrum.length, h )
//           }
//         };
        
//       };
//       // document.getElementById("two").style.display="block";
//       var myp5 = new p5(t,'two');
      
//       // document.getElementById("one").style.display="none";
//       // console.log("hello");
//       // document.getElementById("graph2").style.display="none";
//       document.getElementById("timebased").value =0;
//       // document.getElementById("timebased").innerHTML="STOP";
//     }
//     else{
//       var s = function(p){
//               p.mic1;
//               p.yslider;
//               p.xslider;
//               p.button;
//               p.setup = function(){
                
//                 p.createCanvas(800,500);
//                 console.log("in1");
//                 p.mic1 = new p5.AudioIn();
//                 console.log("in");
//                 p.mic1.start();
//                 p.fft = new p5.FFT();
//                 p.fft.setInput(p.mic1);
//                 p.yslider=p.createSlider(0,5,0.5,0.05);
//                 p.xslider=p.createSlider(1,5,0.5,0.05);
//                 // console.log(p.yslider.value());
//                 p.button=p.createButton('');
//               // sound.amp(0.2);
//               };
//               p.draw = function(){
//                 p.background(220);
//                 let waveform = p.fft.waveform();
//                 p.noFill();
//                 // p.fill(0,0,255)
//                 // console.log(waveform);
//                 p.beginShape();
//                 p.stroke(0);
//                 p.button.innerHtml=p.yslider.value();
//                 for (let i = 0; i < waveform.length; i++){
//                   let x = p.map(i*p.xslider.value(), 0, waveform.length, 0, p.width);
//                   let y = p.map( waveform[i]*p.yslider.value(), -1, 1, 0, p.height);
//                   p.vertex(x,y);
//                   // draw text on graph 
//                   // p.drawText(waveform[i]*p.yslider.value())
//                   // p.strokeWeight(1);
//                   // p.text('Modulator Frequency: ' + waveform[i]*p.yslider.value().toFixed(3) + ' Hz', 900, 900);
//                   // p.drawText = function(){
//                   //   p.strokeWeight(1);
//                   //   p.text('Modulator Frequency: ' + waveform[i]*p.yslider.value().toFixed(3) + ' Hz', 900, 900);
//                   //   console.log("frwa");
//                   // }
//                 }
//                 p.endShape();
                
//               };
//               // function drawText(modFreq) {
//               //   strokeWeight(1);
//               //   text('Modulator Frequency: ' + modFreq.toFixed(3) + ' Hz', 20, 20);
//               //   // text('Modulator Amplitude: ' + modAmp.toFixed(3), 20, 40);
//               // }
//             };
            
//             var myp5 = new p5(s,'one');
//             document.getElementById("timebased").style.display="none";
//             document.getElementById("freqbased").style.display="block";
//             // document.getElementById("graph").style.display="none";
//             // document.getElementById("two").style.display="none";
//             document.getElementById("timebased").value=1;
//     }
    
//   });
  
document.getElementById("timebased").addEventListener("click",function(event){
  if(document.getElementById("timebased").value == 0){
    var s = function(p){
      p.mic1;
      p.yslider;
      p.xslider;
      p.buttonx1;
      p.buttony1;
      p.buttonx2;
      p.buttony2;
      p.bg;
      p.img;
      p.setup = function(){
        
        p.createCanvas(window.innerWidth-100,window.innerHeight-250);
        
        p.xaxis1=p.createP('Sound Time Base');
        p.xaxis1.style('padding-left:40%');
        
        console.log("in1");
        p.mic1 = new p5.AudioIn();
        console.log("in");
        p.mic1.start();
        p.fft = new p5.FFT();
        p.fft.setInput(p.mic1);
        p.buttony1=p.createButton('');
        p.buttony1.id('timebtny1');
        p.yslider=p.createSlider(0,5,0.5,0.05);
        p.yslider.id('timeyslider');
        p.yslider.style('margin-top:3%');
        // p.xslider=p.createSlider(1,5,0.5,0.05);

        // console.log(p.yslider.value());
        p.buttony2=p.createButton('');
        p.buttony2.id('timebtny2');
        // p.createElement('br');
        p.buttonx1=p.createButton('');
        p.buttonx1.id('timebtnx1');
        p.xslider=p.createSlider(1,5,0.5,0.05);
        p.xslider.id('timexslider');
        p.xslider.style('margin-top:3%');

        // p.xslider.position(10,window.innerHeight-50);
        p.buttonx2=p.createButton('');
        p.buttonx2.id('timebtnx2');
        // let d = p.createDiv();
        // d.style('margin-left:6%;');
        // d.style('padding-left: 50px;');
        // d.style('transform-origin: 0 50% 0');
        // d.style('transform: rotate(' + ((360 / 4)) + 'deg);');
        // d.position(window.innerWidth-50, window.innerHeight/2);
        // d.child(p.button);
        // d.child(p.xslider);
        // d.child(p.yslider);
        // // let bg;
        // p.xslider.position(10,window.innerHeight);
        // p.yslider.position(10,window.innerHeight);
        p.bg=p.loadImage('images/bg.jpg');
      // sound.amp(0.2);
      };
      p.draw = function(){
        p.background(p.bg);
        let waveform = p.fft.waveform();
        p.noFill();
        // p.fill(0,0,255)
        // console.log(waveform);
        p.beginShape();
        p.stroke(255);
        // p.button.innerHtml=p.yslider.value();
        for (let i = 0; i < waveform.length; i++){
          let x = p.map(i*p.xslider.value(), 0, waveform.length, 0, p.width);
          let y = p.map( waveform[i]*p.yslider.value(), -1, 1, 0, p.height);
          p.vertex(x,y);
          // draw text on graph 
          // p.drawText(waveform[i]*p.yslider.value())
          // p.strokeWeight(1);
          // p.text('Modulator Frequency: ' + waveform[i]*p.yslider.value().toFixed(3) + ' Hz', 900, 900);
          // p.drawText = function(){
          //   p.strokeWeight(1);
          //   p.text('Modulator Frequency: ' + waveform[i]*p.yslider.value().toFixed(3) + ' Hz', 900, 900);
          //   console.log("frwa");
          // }
        }
        p.endShape();
        p.text("X Axis Scale:1 division =",60,80);
        // p.text(p.yslider.value(),60,60);
        p.text(p.xslider.value()/20,215,80);
        
        p.text("ms",250,80);
      };
      
      // function drawText(modFreq) {
      //   strokeWeight(1);
      //   text('Modulator Frequency: ' + modFreq.toFixed(3) + ' Hz', 20, 20);
      //   // text('Modulator Amplitude: ' + modAmp.toFixed(3), 20, 40);
      // }
      p.windowResized = function(){
        p.resizeCanvas(window.innerWidth-100,window.innerHeight-200);
      };
    };
      
        
    var myp5 = new p5(s,'one');
    document.getElementById("timebased").style.visibility="hidden";
    document.getElementById("timebased").style.display="none";
    document.getElementById("timebased").style.width="0px";
    document.getElementById("timebased").style.height="0px";
    
    document.getElementById("freqbased").style.width="47px";
    document.getElementById("freqbased").style.height="47px";
    document.getElementById("freqbased").style.visibility="visible";
    // document.getElementById("graph").style.display="none";
    // document.getElementById("two").style.display="none";
    // document.getElementById("freqbased").value=0;
  }
  // else{
  //   var t = function(p){
  //     p.mic2;
  //     p.yslider;
  //     p.xslider;
  //     p.setup = function(){
  //       p.createCanvas(800,500);
  //       p.mic2 = new p5.AudioIn();
  //       p.mic2.start();
  //       p.fft = new p5.FFT();
  //       p.fft.setInput(p.mic2);
  //       let d = p.createDiv();
  //       d.style('margin-left:6%;');
  //       d.style('padding-left: 50px;');
  //       d.style('transform-origin: 0 50% 0');
  //       d.style('transform: rotate(' + ((360 / 4)) + 'deg);');
  //       d.position(820, 200);
  //       p.yslider=p.createSlider(0.2,2,0.5,0.05);
  //       d.child(p.yslider);
  //       p.xslider= p.createSlider(1,2,0.5,0.05);
  //       d.child(p.xslider)
  //       // console.log(p.yslider.value());
  //       // sound.amp(0.2);
  //     };
  //     p.draw = function(){
  //       p.background(220);
    
  //       let spectrum = p.fft.analyze();
  //       p.noStroke();
  //       p.fill(255, 0, 255);
  //       for (let i = 0; i< spectrum.length; i++){
  //         let x = p.map(i*p.xslider.value(), 0, spectrum.length, 0, p.width);
  //         let h = -p.height + p.map(spectrum[i]*p.yslider.value(), 0, 255, p.height, 0);
  //         p.rect(x, p.height, p.width / spectrum.length, h )
  //       }
  //     };
      
  //   };
  //   // document.getElementById("two").style.display="block";
  //   var myp5 = new p5(t,'two');
    
  //   // document.getElementById("one").style.display="none";
  //   // console.log("hello");
  //   // document.getElementById("graph2").style.display="none";
  //   document.getElementById("timebased").value =0;
  //   // document.getElementById("timebased").innerHTML="STOP";
  // }
  
});
document.getElementById("freqbased").addEventListener("click",function(event){
  if(document.getElementById("freqbased").value == 0){
    var t = function(p){
      p.mic2;
      p.cnv;
      p.yslider;
      p.xslider;
      p.yaxis;
      p.xaxis;
      p.bg;
      p.px;
      p.py;
      p.setup = function(){
        // p.yaxis.style('transform: rotate(' + ((360 / 4)) + 'deg);');
        p.cnv=p.createCanvas(window.innerWidth-100,window.innerHeight-250);
        // p.cnv.style('padding-left:30px');
        p.xaxis=p.createP('x-asix');
        p.xaxis.style('padding-left:40%');
        p.mic2 = new p5.AudioIn();
        p.mic2.start();
        p.fft = new p5.FFT();
        p.fft.setInput(p.mic2);
        // let d = p.createDiv();
        // d.style('margin-left:6%;');
        // d.style('padding-left: 45px;');
        // d.style('transform-origin: 0 50% 0');
        // d.style('transform: rotate(' + ((360 / 4)) + 'deg);');
        // d.position( window.innerWidth-50,window.innerHeight/2.4);
        p.buttony1=p.createButton('');
        p.buttony1.id('freqbtny1');
        p.yslider=p.createSlider(0.2,2,0.5,0.05);
        p.yslider.id('freqyslider');
        p.buttony2=p.createButton('');
        p.buttony2.id('freqbtny2');
        // p.yslider.style('transform: rotate(' + ((360 / 4)) + 'deg);');
        // p.yslider.position(window.innerWidth,window.innerHeight/2);
        // p.yslider.style('transform: rotate(' + ((360 / 4)) + 'deg);')
        // p.yslider.style('margin-left:6%;');
        // p.yslider.style('padding-left: 45px;');
        // p.yslider.style('transform-origin: 0 50% 0');
        // d.child(p.yslider);
        p.buttonx2=p.createButton('');
        p.buttonx2.id('freqbtnx2');
        p.xslider= p.createSlider(1,2,0.5,0.05);
        p.xslider.id('freqxslider');
        p.xslider.style('margin-top:3%');
        p.buttonx1=p.createButton('');
        p.buttonx1.id('freqbtnx1');
        // p.px=p.createElement('h4','');
        // p.xslider.style('transform: rotate(' + ((360 / 4)) + 'deg);')
        // // d.child(p.xslider);
        // p.yslider.position(window.innerWidth-100,window.innerHeight/2.4);
        // p.xslider.position(window.innerWidth-90,window.innerHeight/2.4);
        // p.xslider.style('margin-left:6%;');
        // p.xslider.style('padding-left: 45px;');
        // p.xslider.style('transform-origin: 0 50% 0');
        p.bg = p.loadImage('images/bg.jpg');
        // console.log(p.yslider.value());
        // sound.amp(0.2);
      };
      p.draw = function(){
        p.background(p.bg);
    
        let spectrum = p.fft.analyze();
        p.noStroke();
        p.fill(255, 255, 255);
        for (let i = 0; i< spectrum.length; i++){
          let x = p.map(i*p.xslider.value(), 0, spectrum.length, 0, p.width);
          let h = -p.height + p.map(spectrum[i]*p.yslider.value(), 0, 255, p.height, 0);
          p.rect(x, p.height, p.width / spectrum.length, h )
          // p.text(p.yslider.value()*spectrum[i],60,60);
          // p.dy=p.createP(p.yslider.value()*spectrum[i])
          // p.dy.position(850,500);
          // p.px = p.createElement('h4',[p.yslider.value()*spectrum[i]]);
          // p.px.position()
        }
        p.stroke(255);
        p.text("X Axis Scale:1 division =",60,80);
        if(p.xslider.value()<=1.23){
          p.a=p.xslider.value()*10
        }
        else if(p.xslider.value()>1.23 && p.xslider.value()<=1.49){
          p.a=p.xslider.value()*50;
        }
        else if(p.xslider.value()>1.49 && p.xslider.value()<=1.69){
          p.a=p.xslider.value()*300;
        }
        else if(p.xslider.value()>1.69 && p.xslider.value()<=1.79){
          p.a=p.xslider.value()*600;
        }
        else{
          p.a=p.xslider.value()*1000;
        }
        p.text(p.a,215,80);
        p.text("Hz",250,80);
      
      };
      p.windowResized = function(){
        p.resizeCanvas(window.innerWidth-100,window.innerHeight-200);
      };
      
    };
    // document.getElementById("two").style.display="block";
    var myp5 = new p5(t,'two');
    document.getElementById("freqbased").style.visibility="hidden";
    document.getElementById("freqbased").style.display="none";
    document.getElementById("timebased2").style.visibility="visible";
    // document.getElementById("freqbased").value=1;
    // document.getElementById("one").style.display="none";
    // console.log("hello");
    // document.getElementById("graph2").style.display="none";
    // document.getElementById("timebased").value =0;
    document.getElementById("one").style.display="none";
    // document.getElementById("timebased").innerHTML="STOP";
  }
  // else{
  //   var t = function(p){
  //     p.mic2;
  //     p.yslider;
  //     p.xslider;
  //     p.setup = function(){
  //       p.createCanvas(800,500);
  //       p.mic2 = new p5.AudioIn();
  //       p.mic2.start();
  //       p.fft = new p5.FFT();
  //       p.fft.setInput(p.mic2);
  //       let d = p.createDiv();
  //       d.style('margin-left:6%;');
  //       d.style('padding-left: 50px;');
  //       d.style('transform-origin: 0 50% 0');
  //       d.style('transform: rotate(' + ((360 / 4)) + 'deg);');
  //       d.position(820, 200);
  //       p.yslider=p.createSlider(0.2,2,0.5,0.05);
  //       d.child(p.yslider);
  //       p.xslider= p.createSlider(1,2,0.5,0.05);
  //       d.child(p.xslider)
  //       // console.log(p.yslider.value());
  //       // sound.amp(0.2);
  //     };
  //     p.draw = function(){
  //       p.background(220);
    
  //       let spectrum = p.fft.analyze();
  //       p.noStroke();
  //       p.fill(255, 0, 255);
  //       for (let i = 0; i< spectrum.length; i++){
  //         let x = p.map(i*p.xslider.value(), 0, spectrum.length, 0, p.width);
  //         let h = -p.height + p.map(spectrum[i]*p.yslider.value(), 0, 255, p.height, 0);
  //         p.rect(x, p.height, p.width / spectrum.length, h )
  //       }
  //     };
      
  //   };
  //   // document.getElementById("two").style.display="block";
  //   var myp5 = new p5(t,'two');
    
  //   // document.getElementById("one").style.display="none";
  //   // console.log("hello");
  //   // document.getElementById("graph2").style.display="none";
  //   document.getElementById("timebased").value =0;
  //   // document.getElementById("timebased").innerHTML="STOP";
  // }
  
});



