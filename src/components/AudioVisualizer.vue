<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12" id = "audioVis">
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import p5 from 'p5';
  import 'p5/lib/addons/p5.sound';

  export default {
    name: 'AudioVisualizer',
    props: {
      userAudio: MediaStream,
    },

    data: () => ({
    }),
    
    mounted() {
      let sketch = function(p) {
        let fft, canvas, fadeHeight, fadeIncrement, maxFadeHeight, userAudio
        p.setup = function () {
          canvas = p.createCanvas(p.windowWidth/3, p.windowHeight/8);
          canvas.parent('audioVis');

          //p.noFill();
          p.fill(255,255,255);
          //canvas.mousePressed(p.userStartAudio);
          //mic = new p5.AudioIn();
          //mic.start();
          console.log(userAudio);
          //if (p.getAudioContext().state !== 'running') {
          //  p.getAudioContext().resume();
         //}
         //mic.connect(); //need headphone or get ready for feedback
         fft = new p5.FFT();
         //fft.setInput(mic);
         fft.setInput(userAudio);
         fadeHeight = 0;
         maxFadeHeight = 225;
         fadeIncrement = 5;
         p.resizeCanvas(p.windowWidth/3, p.windowHeight/8);
       };
  
       p.draw = function () {
         // Get the overall volume (between 0 and 1.0)
         //let volume = mic.getLevel();
  
         let spectrum = fft.analyze();
         // If the volume > 0.1, the frequency spectrum is drawn
        //let threshold = 0.01;
        
    //    p.background(255, 204, 0);
         p.clear();
     
         if (fadeHeight > maxFadeHeight) {
           fadeHeight = maxFadeHeight;
         }

         if (fadeHeight < 0) {
           fadeHeight = 0;
         } 


  //    if (volume > 0) {    
         p.noFill();
         fadeHeight = fadeHeight - fadeIncrement;
         p.beginShape();
         for (let i = 0; i < spectrum.length; i++) {
           p.vertex(i, p.map(spectrum[i], 0, 255, p.height, 0));
         }
        }

      };

      sketch.userAudio = this.userAudio;
      console.log(sketch.userAudio);
      new p5(sketch);
       //var spectrum = require('@/js/frequency-spectrum.js');
       //spectrum.main.userAudio = this.userAudio;
       //console.log(spectrum.main);
       //new p5(spectrum.main);

    }
  }
    
  </script>
