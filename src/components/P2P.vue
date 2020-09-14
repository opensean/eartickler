<template>
  <v-container t fluid>
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
    <v-row justify="center" align="center">
      <v-col cols="6">
        <video ref="videolocal" id="videolocal" autoplay></video>
      </v-col>
      <v-col cols="6" v-if="call" >
        <video ref="videoremote" id="videoremote" autoplay></video>
      </v-col>
    </v-row>
    <v-row justify="center" align="center">
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
                   @click="makeMediaCall"
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
  //import AnswerMediaCall from "@/components/AnswerMediaCall.vue";
  //import MakeMediaCall from "@/components/MakeMediaCall.vue";
  import AudioVisualizer from "@/components/AudioVisualizer.vue";

  export default {
    name: 'P2P',
    components: {
      AudioVisualizer
    },
    data: () => ({
       loading: false,
       peer: null,
       call: null,
       connection: null,
       answerPrompt: true,
       toggleMedia: [],
       enableAudio: true,
       enableVideo: false,
       userMedia: null,
       userAudioStream: null,
       userVideoStream: null,
       showAnswerPrompt: false,
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
          this.renderVideo(stream, "remote");
          this.messages = "connected to ".concat(JSON.stringify(this.call.peer));
          this.loading = false;
          this.remoteStream = stream;
          this.remoteStream.renderVideo = this.renderVideo;
          this.remoteStream.onremovetrack = function (event) {
            console.log(event);
            this.renderVideo(null, "remote");
          }
          this.remoteStream.onaddtrack = function (event) {
            console.log(event);
            //check for event.kind audio or video?
            this.renderVideo(this.remoteStream, "remote");
          }

          console.log(this.remoteStream);
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
        this.messages = "connecting to ".concat(JSON.stringify(this.call.peer));
        this.call.on('stream', (stream) => {
          this.renderVideo(stream, "remote");
          this.loading = false;
          this.messages = "connected to ".concat(JSON.stringify(this.call.peer));
          this.remoteStream = stream;
          //this.remoteStream.renderVideo = this.renderVideo;
          this.remoteStream.onremovetrack = this.handleRemoveRemoteTrack;
          this.remoteStream.onaddtrack = this.handleAddRemoteTrack;

          console.log(this.remoteStream);
        });
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
      
      handleRemoveRemoteTrack: function(event) {
            console.log('${event.track.kind} track removed');
            if(event.track.kind == "video") {
              this.renderVideo(this.remoteStream, "remote");
            }
      },
      handleAddRemoteTrack: function(event) {
            console.log('${event.track.kind} track added');
            if(event.track.kind == "video") {
              this.renderVideo(this.remoteStream, "remote");
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
        this.showAnswerPrompt = true;
        console.log(call);
        this.call = call;

      })
    }
  }
    
  </script>
