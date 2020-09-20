<template>
  <v-container fluid>
      <v-progress-linear
        :active="loading"
        :indeterminate="loading"
        absolute
        top
      ></v-progress-linear>
    <v-row justify="center">  
      <v-card
        class="mx-auto"
        v-if="showAnswerPrompt"
      >
        <v-card-text>
          <div>Incoming connection from {{ call.peer }}</div>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="answerMediaCall" text>Accept</v-btn>
          <v-btn text>Decline</v-btn>
        </v-card-actions>
      </v-card>
    </v-row>
    <v-row dense>
      <v-col cols="12">
        <track v-if="userMedia" :enableAudio="enableAudio" :enableVideo="enableVideo" :local=true :userMedia="userMedia" :call="call" />
      </v-col>
      <v-col cols = "12" v-for="p in remotePeers" :key="p.peer" >
        <track :local=false :enableAudio="enableAudio" :enableVideo="enableVideo" :userMedia="p.stream" :call="call" />
      </v-col>
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
                   fab
                   @click="makeMediaCall"
                  >
                    <v-icon center>{{ makeCallIcon }}</v-icon>
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
  import { mdiMicrophoneOutline } from '@mdi/js';
  import { mdiVideoOutline } from '@mdi/js';
  //import AnswerMediaCall from "@/components/AnswerMediaCall.vue";
  //import MakeMediaCall from "@/components/MakeMediaCall.vue";
  import Track from "@/components/Track.vue";

  export default {
    name: 'P2P',
    components: {
      Track
    },
    data: () => ({
       loading: false,
       peer: null,
       call: null,
       connection: null,
       answerPrompt: true,
       userMedia: null,
       enableAudio: false,
       enableVideo: false,
       showAnswerPrompt: false,
       remotePeers: {},
       remotePeerId: null,
       messages: null,
       bannerMessage: null,
       makeCallIcon: mdiHumanGreetingProximity,
       enableAudioIcon: mdiMicrophoneOutline,
       enableVideoIcon: mdiVideoOutline,
    }),

    methods: {
      answerMediaCall: function () {
        this.showAnswerPrompt = false;
        this.call.answer(this.userMedia); // Answer the call with an A/V stream.
        this.messages = "connecting to ".concat(JSON.stringify(this.call.peer));
        this.call.on('stream', (stream) => {
          this.remotePeers[this.call.peer] = {"stream":stream, "peer":this.call.peer};
          console.log(this.remotePeers);
          this.messages = "connected to ".concat(JSON.stringify(this.call.peer));
          this.loading = false;
        });
      },

      makeMediaCall: function() {
        this.loading = true;
        this.connection = this.peer.connect(this.remotePeerId);
        
        this.connection.on('data', (data) => {
          this.messages = 'received: '.concat(JSON.stringify(data));
        });

        this.connection.on('open', () => {
          this.connection.send('hi!');
        });  
 
        this.call = this.peer.call(this.remotePeerId, this.userMedia);
        this.call.on('stream', (stream) => {
          this.remotePeers[this.call.peer] = {"stream":stream, "peer":this.call.peer};
          console.log(this.remotePeers);
          this.messages = "connected to ".concat(JSON.stringify(this.call.peer));
          this.loading = false;
        });
        this.messages = "connecting to ".concat(JSON.stringify(this.call.peer));

      },

      initMedia: function () {
        let audio = this.userMedia.getAudioTracks()[0];
        let video = this.userMedia.getVideoTracks()[0];
        if (this.enableAudio) {
          audio.enabled = true;
        }
        else {
          audio.enabled = false;
        }
        
        if (this.enableVideo) {
          video.enabled = true;
        }
        else {
          video.enabled = false;
        }


      }

    },
    
    computed: {
    },
    
    mounted() {
     navigator.mediaDevices.getUserMedia({"audio": true, "video": true})
        .then((stream) => {
          this.userMedia = stream;
          this.initMedia();
        });

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
        this.showAnswerPrompt = true;
        console.log(call);
        this.call = call;

      })
    }
  }
    
  </script>
