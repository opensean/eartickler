<template>
  <v-container>
    <v-row justify="center">
      <video ref="video" id="video" autoplay></video>
    </v-row>
    <v-row justify="center">
      <v-col cols="6" id = "connect-to-peer">
        <v-text-field 
          label="Enter a peer id"
          clearable
          :messages="messages"
          v-model="peerId">
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
      <v-col cols="12">
      <v-progress-linear
        :active="loading"
        :indeterminate="loading"
        absolute
        top
      ></v-progress-linear>
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
  export default {
    name: 'P2P',

    data: () => ({
       loading: false,
       peer: null,
       peerId: null,
       messages: null,
       bannerMessage: null,
       makeConnectionIcon: mdiHumanGreetingProximity,
    }),

    methods: {
      connectToPeer: function() {
        this.loading = true;
        this.messages = "connecting to ".concat(this.peerId);
  
        let conn = this.peer.connect(this.peerId);
        
        conn.on('data', (data) => {
          this.messages = 'received: '.concat(JSON.stringify(data));
        });

        conn.on('open', () => {
          this.loading = false;
          conn.send('hi!');
        });
  
        navigator.mediaDevices.getUserMedia({video: true, audio: true})
        .then((stream) => {
          let call = this.peer.call(this.peerId, stream);
          call.on('stream', this.renderVideo);
          this.messages = "connected to ".concat(JSON.stringify(call.peer));
        })
        .catch((err) => {
          this.messages = 'Failed to get local stream'.concat(JSON.stringify(err));
        });
      },
      
      renderVideo: function(stream) {
        this.video = this.$refs.video;
        this.video.srcObject = stream;
      }

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
        navigator.mediaDevices.getUserMedia({video: true, audio: true})
        .then((stream) => {
          call.answer(stream); // Answer the call with an A/V stream.
          call.on('stream', this.renderVideo);
          this.messages = "connected to ".concat(JSON.stringify(call.peer));
        })
        .catch((err) => {
          console.error('Failed to get local stream', err);
        });
      });



    }
  }
    
  </script>
