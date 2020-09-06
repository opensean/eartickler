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

    data: () => ({
    }),
    
    mounted() {
       var spectrum = require('@/js/frequency-spectrum.js');
       new p5(spectrum.main);

    }
  }
    
  </script>
