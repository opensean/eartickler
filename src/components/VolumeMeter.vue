<template>
        <div :id="userMedia.id + '-volume-meter'"></div>
</template>

<script>
  import p5 from 'p5';
  import 'p5/lib/addons/p5.sound';

  export default {
    name: 'VolumeMeter',
    props: {
      audioCtx: AudioContext,
      userMedia: MediaStream,
      userMediaID: String,
      maxWidth: Number,
      maxHeight: Number,
    },

    data: () => ({
    }),
    
    methods: {
      createNewSketch: function (userMedia, maxWidth, maxHeight) {   
        let p5Back = function( sketch ) {
          let amplitude

          console.log(userMedia);
          sketch.setup = function () {
            sketch.createCanvas(maxWidth, maxHeight);

            if (sketch.getAudioContext().state !== 'running') {
              sketch.getAudioContext().resume();
            }
            var audioCtx = sketch.getAudioContext();
            var source = audioCtx.createMediaStreamSource(userMedia);
            amplitude = new p5.Amplitude();
            amplitude.setInput(source);
            
         };
  
         sketch.draw = function () {
           // Get the overall volume (between 0 and 1.0)
           let volume = amplitude.getLevel(); 
           let threshold = 0.1;
           // Graph the overall potential volume, w/ a line at the threshold
            let y = sketch.map(volume, 0, 0.5, maxHeight, 0);
            let ythreshold = sketch.map(threshold, 0, 0.5, maxHeight, 0);
          
            sketch.noStroke();
            sketch.fill(175);
            sketch.rect(0, 0, maxWidth, maxHeight);
            // Then draw a rectangle on the graph, sized according to volume
            sketch.fill('rgb(0,255,0)');
            sketch.rect(0, y, maxWidth, y);
            sketch.stroke(0);
            sketch.line(0, ythreshold, 19, ythreshold);        

         };
       
        }
        return new p5( p5Back, userMedia.id.concat("-volume-meter"));

        }
    },

    mounted() {
      this.createNewSketch(this.userMedia, this.maxWidth, this.maxHeight);

    }
  }
    
  </script>
