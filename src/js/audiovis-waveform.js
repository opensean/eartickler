// frequency-spectrum.js 
import p5 from 'p5'

export function main(p) {
  
  
  let mic, fft, canvas;
  
  p.setup = function () {
      canvas = p.createCanvas(p.windowWidth/3, p.windowHeight/3);
      canvas.parent('audioVis');

      //p.noFill();
      p.fill(255,255,255);
      p.textSize(p.windowWidth / 40);
      p.textAlign(p.LEFT, p.CENTER);
      canvas.mousePressed(p.userStartAudio);
      mic = new p5.AudioIn();
      mic.start();
      mic.connect(); //need headphone or get ready for feedback
      fft = new p5.FFT();
      fft.setInput(mic);
  };
  
  p.draw = function () {
      // Get the overall volume (between 0 and 1.0)
      let volume = mic.getLevel();
      let threshold = 0.01;
      p.clear(); 
      if (volume > threshold) {    
        var waveform = fft.waveform();
        for (var i = 0; i < waveform.length; i++) {
            var x = p.map(i, 0, waveform.length, 0, p.width/3);
            var y = p.map(waveform[i], 0, 255, p.height, 0);
            p.ellipse(x, y, 5, 5);
        }
    
      }
      else if (volume > 0) {
          p.line(0,255,p.width,255);
          p.stroke(255,255,255);
      }
      else {
        p.text("Click here to start audio", 0, 225);
        p.line(0,255,p.width,255);
        p.stroke(255,255,255);
      }
      
      
      
  };
  
  p.windowResized = function () {
      p.resizeCanvas(p.windowWidth/3, p.windowHeight/3);
  };
}

