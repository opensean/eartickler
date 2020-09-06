<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12" id = "connect-to-peer">
        <v-text-field 
          label="Enter a peer id"
          clearable
          :append-outer-icon='mdi-microphone'></v-text-field>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import Peer from 'peerjs';

  export default {
    name: 'P2P',

    data: () => ({
       myPeerId: null
    }),
    
    mounted() {
      this.myPeerId = new Peer();
      console.log(this.myPeerId);

    }
  }
    
  </script>
