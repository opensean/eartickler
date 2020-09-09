<template>
  <v-container>
    <v-row justify="center">
      <answer-media-call v-if="incoming" :call="call" :answerPrompt="answerPrompt"/> 
      <make-media-call v-if="outgoing" :peer="peer" :remotePeerId="remotePeerId"/> 
    </v-row>
    <v-row justify="center">
      <v-col cols="6" id = "connect-to-peer">
        <v-text-field 
          label="Enter a peer id"
          clearable
          :messages="messages"
          v-model="remotePeerId">
          <template v-slot:append-outer>
                  <v-btn
                   outlined
                   rounded
                   @click="connectToPeer"
                  >
                    <v-icon center>{{ makeConnectionIcon }}</v-icon>
                  </v-btn>
          </template>
        </v-text-field>
      </v-col>
    </v-row>
    <v-row justify="center" class="text-center">
      <v-col col="6">
        {{ bannerMessage}}
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import Peer from 'peerjs';
  import { mdiHumanGreetingProximity } from '@mdi/js';
  import AnswerMediaCall from "@/components/AnswerMediaCall.vue";
  import MakeMediaCall from "@/components/MakeMediaCall.vue";

  export default {
    name: 'P2P',
    components: {
      AnswerMediaCall,
      MakeMediaCall
    },
    data: () => ({
       loading: false,
       peer: null,
       call: null,
       answerPrompt: true,
       remotePeerId: null,
       incoming: false,
       outgoing: false,
       messages: null,
       bannerMessage: null,
       makeConnectionIcon: mdiHumanGreetingProximity,
    }),

    methods: {

      connectToPeer: function() {
        this.outgoing = true;
        this.messages = "connecting to ".concat(this.remotePeerId);
      },
    },
    
    mounted() {
      // References 
      // https://glitch.com/~peerjs-video
      // https://github.com/peers/peerjs
   
      // Register with the peer server
      this.peer = new Peer({
      });

      this.peer.on('open', (id) => {
        console.log('My peer ID is: ' + id);
        this.bannerMessage = 'Your peer ID is ' + id;

      });
      
      this.peer.on('error', (error) => {
        console.error(error);
      });

      // Handle incoming data connection
      this.peer.on('connection', (conn) => {
        this.messages = 'incoming peer connection!';

        conn.on('data', (data) => {
          this.messages = 'received: '.concat(JSON.stringify(data));
        });
      
        conn.on('open', () => {
          conn.send('hello!');
        });
      });

      // Handle incoming voice/video connection
      this.peer.on('call', (call) => {
        this.loading = true;
        this.incoming = true;
        this.call = call;
      })
    }
  }
    
  </script>
