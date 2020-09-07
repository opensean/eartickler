<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="6" id = "connect-to-peer">
        <v-text-field 
          label="Enter a peer id"
          clearable
          :append-outer-icon="makeConnectionIcon"></v-text-field>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import Peer from 'peerjs';
  import { mdiHumanGreetingProximity } from '@mdi/js';
  export default {
    name: 'P2P',

    data: () => ({
       myPeerId: null,
       makeConnectionIcon: mdiHumanGreetingProximity,
    }),
    
    mounted() {
      this.myPeerId = new Peer();
      console.log(this.myPeerId);

    }
  }
    
  </script>
