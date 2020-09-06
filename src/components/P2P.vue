<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12" id = "makecall">
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import Peer from 'peerjs';

  export default {
    name: 'P2P',

    data: () => ({
    }),
    
    mounted() {
      const peer = new Peer();
      console.log(peer);

    }
  }
    
  </script>
