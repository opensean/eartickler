<template>
  <v-container t fluid>
    <v-row justify="center" align="center">
      <answer-media-call v-if="incoming" :call="call" :useMedia="userMedia" :answerPrompt="answerPrompt"/> 
      <make-media-call v-if="outgoing" :peer="peer" :userMedia="userMedia" :remotePeerId="remotePeerId"/> 
      <video ref="video" id="video" autoplay></video>
      <audio-visualizer v-if="enableAudio"/>
    </v-row>
    <v-row justify="center" align="center">
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
                   @click="makeCall"
                  >
                    <v-icon center>{{ makeCallIcon }}</v-icon>
                  </v-btn>
          </template>

        </v-text-field>
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-switch @click="toggleAudio" v-model="enableAudio" value input-value="true">
        <template v-slot:prepend>
          <v-icon  >{{ enableAudioIcon }}</v-icon>
        </template>
      </v-switch>
      <v-switch @click="toggleVideo" v-model="enableVideo" value input-value="false">
        <template v-slot:prepend>
          <v-icon >{{ enableVideoIcon }}</v-icon>
        </template>
      </v-switch>
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
  import AnswerMediaCall from "@/components/AnswerMediaCall.vue";
  import MakeMediaCall from "@/components/MakeMediaCall.vue";
  import AudioVisualizer from "@/components/AudioVisualizer.vue";

  export default {
    name: 'P2P',
    components: {
      AnswerMediaCall,
      MakeMediaCall,
      AudioVisualizer
    },
    data: () => ({
       loading: false,
       peer: null,
       call: null,
       answerPrompt: true,
       toggleMedia: [],
       enableAudio: true,
       enableVideo: false,
       userMedia: null,
       userAudioStream: null,
       userVideoStream: null,
       mediaArgs:  {"audio": true, "video": false, "stream":null},
       remotePeerId: null,
       incoming: false,
       outgoing: false,
       messages: null,
       bannerMessage: null,
       makeCallIcon: mdiHumanGreetingProximity,
       enableAudioIcon: mdiMicrophoneOutline,
       enableVideoIcon: mdiVideoOutline,
    }),

    methods: {

      makeCall: function() {
        this.outgoing = true;
        this.messages = "connecting to ".concat(this.remotePeerId);
      },


      renderVideo: function(stream) {
        this.video = this.$refs.video;
        if (stream) {
          this.video.srcObject = stream;
        }
        else {
          this.video.pause();
          this.video.removeAttribute('src'); // empty source
          this.video.load();
        }
        
      },

      toggleAudio: function(){
        let arrAudio = this.userAudioStream.getAudioTracks();
        if (this.enableAudio) {
          for (let i = 0; i < arrAudio.length; i++){
              this.userMedia.addTrack(arrAudio[i]);
            }
        }
        else {
            for (let i = 0; i < arrAudio.length; i++){
              this.userMedia.removeTrack(arrAudio[i]);
            }
          }
      },

      toggleVideo: function(){
        let arrVideo = this.userVideoStream.getVideoTracks();
        if (this.enableVideo) {
          for (let i = 0; i < arrVideo.length; i++){
              this.userMedia.addTrack(arrVideo[i]);
            }
          this.renderVideo(this.userMedia);
        }
        else {
          for (let i = 0; i < arrVideo.length; i++){
              this.userMedia.removeTrack(arrVideo[i]);
            }
          this.renderVideo(this.userMedia);
          }
      },



    },
    
    computed: {
    },
    
    mounted() {
     navigator.mediaDevices.getUserMedia({"audio": true, "video": true})
        .then((stream) => {
          this.userMedia = stream;
          this.userAudioStream = new MediaStream(stream.getAudioTracks());
          this.userVideoStream = new MediaStream(stream.getVideoTracks());
          this.toggleAudio();
          this.toggleVideo();
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
        this.incoming = true;
        this.call = call;
      })
    }
  }
    
  </script>
