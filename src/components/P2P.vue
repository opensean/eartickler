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
        <call-card v-if="userMedia" :local=true :userMedia="userMedia" :call="call" />
      </v-col>
      <v-col cols = "12" v-for="p in remotePeers" :key="p.peer" >
        <call-card :local=false  :userMedia="p.stream" :call="call" />
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
  import CallCard from "@/components/CallCard.vue";

  export default {
    name: 'P2P',
    components: {
      CallCard
    },
    data: () => ({
       loading: false,
       peer: null,
       call: null,
       connection: null,
       answerPrompt: true,
       toggleMedia: [],
       userMedia: null,
       userAudioStream: null,
       userVideoStream: null,
       showAnswerPrompt: false,
       remotePeers: {},
       remoteStream: null,
       remotePeerId: null,
       outgoing: false,
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
          //this.$nextTick(() => {
            // Scroll Down
            //this.renderPeers();
          //});
          console.log(this.remotePeers);
          //this.renderVideo(stream, "remote");
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
          //this.$nextTick(() => {
            // Scroll Down
            //this.renderPeers();
          //});
          //this.renderVideo(stream, "remote");
          this.messages = "connected to ".concat(JSON.stringify(this.call.peer));
          this.loading = false;
        });
        this.messages = "connecting to ".concat(JSON.stringify(this.call.peer));

      },

      renderPeers: function (){
        for (var key in this.remotePeers) {
          console.log(key);
          console.log(this.$refs);
          let video = this.$refs[key][0];
          console.log(video);
          video.srcObject = this.remotePeers[key]["stream"];
        }

      },

      renderVideo: function(stream, user) {
        if (user == "local") {
          this.video = this.$refs.videolocal;
        }
        if (user == "remote") {
          this.video = this.$refs.videoremote;
        }
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

              //if(this.call){
                //this.call.peerConnection.removeTrack(arrAudio[i]);
              //}
            }
          }
      },

      toggleVideo: function(){
        let videoTrack = this.userVideoStream.getVideoTracks()[0];
        if(this.call){
          var sender =  this.call.peerConnection.getSenders().find(function(s) {
            return s.track.kind == videoTrack.kind;
          });
          console.log('found sender:', sender);
        }
        if (this.enableVideo) {
          this.userMedia.addTrack(videoTrack);
          if (sender){
              console.log("enable video track");
              sender.track.enabled = true;
              console.log(sender);
          }
          this.renderVideo(this.userMedia, "local");
        }
        else {
          this.userMedia.removeTrack(videoTrack);
          if(sender){
              console.log("disable video track");
              //sender.replaceTrack();
              sender.track.enabled = false;
              console.log(sender);
          }
          this.renderVideo(this.userMedia, "local");
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
          //this.toggleAudio();
          //this.toggleVideo();

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
