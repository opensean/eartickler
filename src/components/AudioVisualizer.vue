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
            fft = new p5.FFT();
            fft.setInput(source);
            //sketch.resizeCanvas(maxWidth, maxHeight);
         };
  
         sketch.draw = function () {
  
           let spectrum = fft.analyze();
        
           sketch.clear();

           sketch.stroke(255,255,255);
           sketch.beginShape();
           /// spectrum.length defaults tp 1024
           for (let i = 0; i < spectrum.length; i++) {
             sketch.vertex(sketch.map(i, 0, 1024, 10, sketch.width- 30),  sketch.map(spectrum[i], 0, 255, sketch.height, 30));
           }
           sketch.endShape();

         };
       
        //sketch.windowResized = function () {
        //   sketch.resizeCanvas(maxWidth, maxHeight);
        //};
        }
        return new p5( p5Back, userMedia.id.concat("-audioVis"));

        }
    },

    mounted() {
       this.createNewSketch(this.userMedia, this.maxWidth, this.maxHeight);

    }
  }
    
  </script>
