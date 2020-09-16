<template>
        <div :id="userMedia.id + '-audioVis'"></div>
</template>

<script>
  import p5 from 'p5';
  import 'p5/lib/addons/p5.sound';

  export default {
    name: 'AudioVisualizer',
    props: {
      userMedia: MediaStream,
      maxWidth: Number,
      maxHeight: Number,
    },

    data: () => ({
    }),
    
    methods: {
      createNewSketch: function (userMedia, maxWidth, maxHeight) {   
        let p5Back = function( sketch ) {
          let fft

          console.log(userMedia);
          sketch.setup = function () {
            sketch.createCanvas(maxWidth, maxHeight);

            //sketch.fill(255,255,255);
            sketch.noFill();
            console.log(userMedia);
            if (sketch.getAudioContext().state !== 'running') {
              sketch.getAudioContext().resume();
            }

            var audioCtx = sketch.getAudioContext();
            var source = audioCtx.createMediaStreamSource(userMedia);
            console.log(source);
            fft = new p5.FFT();
            fft.setInput(source);
            sketch.resizeCanvas(maxWidth, maxHeight);
         };
  
         sketch.draw = function () {
  
           let spectrum = fft.analyze();
        
           sketch.clear();

           sketch.stroke(255,255,255);
           sketch.beginShape();
           for (let i = 0; i < spectrum.length; i++) {
             sketch.vertex(i, sketch.map(spectrum[i], 0, 255, sketch.height, 0));
           }
           sketch.endShape();

         };
       
         sketch.windowResized = function () {
           sketch.resizeCanvas(maxWidth, maxHeight);
        };
        }
        return new p5( p5Back, userMedia.id.concat("-audioVis"));

        }
    },

    mounted() {
       if(this.userMedia.getAudioTracks()[0].enabled){ 
         this.createNewSketch(this.userMedia, this.maxWidth, this.maxHeight);
       }
       //var spectrum = require('@/js/frequency-spectrum.js');
       //spectrum.main.userMedia = this.userMedia;
       //console.log(spectrum.main);
       //new p5(spectrum.main);

    }
  }
    
  </script>
