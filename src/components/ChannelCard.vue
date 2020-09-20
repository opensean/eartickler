<template>
  <v-card class="mx-auto">
    <v-row >
    <v-col cols = "1"  class = "pl-5" >
      <v-switch @click="toggleAudio" :disabled="remote" v-model="switchAudio" value input-value="false">
        <template v-slot:prepend>
          <v-icon  >{{ enableAudioIcon }}</v-icon>
        </template>
      </v-switch>
      <v-switch @click="toggleVideo" :disabled="remote" v-model="switchVideo" value input-value="false">
        <template v-slot:prepend>
          <v-icon >{{ enableVideoIcon }}</v-icon>
        </template>
      </v-switch>
    </v-col>
    <v-col cols = "1" class = "pa-5">
      <v-slider
        v-model="volume"
        min=0
        max=100
        vertical
        :label="volumeStr"
        @change="adjustGain"
      >
        <template v-slot:prepend align="center">
          <v-icon >{{ volumeLow }}</v-icon>
        </template>
        <template v-slot:append>
          <v-icon >{{ volumeUp }}</v-icon>
        </template>
      </v-slider>
    </v-col>
    <v-col cols = "3" :ref="userMedia.id + '-videoCol'">
        <video :width="videoWidth" :ref="userMedia.id" :id="userMedia.id" autoplay muted ></video>
    </v-col>

    <v-col cols = "7" :ref="userMedia.id + '-audoVisCol'" >
      <audio-visualizer  :maxWidth="audioWidth" :maxHeight="audioHeight" :userMedia="userMedia" :key="audioComp" />
    </v-col>

  </v-row>
  </v-card>
</template>

<script>
  import AudioVisualizer from "@/components/AudioVisualizer.vue";
  import { mdiMicrophoneOutline } from '@mdi/js';
  import { mdiVideoOutline } from '@mdi/js';
  import { mdiVolumeMinus } from '@mdi/js';
  import { mdiVolumePlus } from '@mdi/js';
  
  export default {
    name: 'Channel',
    components: {
      AudioVisualizer,
    },

    props: {
      userMedia: MediaStream,
      call: Object,
      local: Boolean,
      enableAudio: Boolean,
      enableVideo: Boolean,

    },
    computed: {
      remote: function () {
        if(this.local){
          return false;
        }
        else{
          return true;
        }
      },
      
      volumeStr: function (){
        return this.volume.toString();
      },

      audioCtx: function (){
        return new (window.AudioContext || window.webkitAudioContext)();
      },
      
      audioSrc: function (){
         return this.audioCtx.createMediaStreamSource(this.userMedia);
      },

      gainNode: function (){
        return this.audioCtx.createGain();
      }



    },
    created() {
      window.addEventListener("resize", this.resizeEventHandler);
    },

    destroyed() {
      window.removeEventListener("resize", this.resizeEventHandler);
    },

    data: () => ({
       audioWidth: 100,
       audioHeight: 200,
       audioComp: 0,
       volume: 20,
       videoWidth: 100,
       enableAudioIcon: mdiMicrophoneOutline,
       enableVideoIcon: mdiVideoOutline,
       switchAudio: false,
       switchVideo: false,
       volumeUp: mdiVolumePlus,
       volumeLow: mdiVolumeMinus,
    }),
    
    methods: {
      adjustGain: function(){
        this.gainNode.gain.setValueAtTime(this.volume/100, this.audioCtx.currentTime);

      },

      resizeEventHandler: function(e) {
        console.log(e);
        this.videoWidth = this.$refs[this.userMedia.id.concat("-videoCol")].clientWidth;
        this.audioWidth = this.$refs[this.userMedia.id.concat("-audoVisCol")].clientWidth;
        //this.audioHeight = this.$refs[this.userMedia.id.concat("-audoVisCol")].clientHeight;
        console.log(this.audioWidth);
        console.log(this.audioHeight);
        this.audioComp += 1;
      },

      toggleAudio: function(){
        let track = this.userMedia.getAudioTracks()[0];
        if(this.call){
          var sender =  this.call.peerConnection.getSenders().find(function(s) {
            return s.track.kind == track.kind;
          });
          console.log('found sender:', sender);
        }
        if (this.switchAudio) {
          if (sender){
              console.log("enable video track");
              sender.track.enabled = true;
              console.log(sender);
          }
          track.enabled = true;
          this.audioComp += 1;
        }
        else {
          if(sender){
              console.log("disable video track");
              //sender.replaceTrack();
              sender.track.enabled = false;
              console.log(sender);
          }
          track.enabled = false;
        }
      },

      toggleVideo: function(){
        let track = this.userMedia.getVideoTracks()[0];
        console.log(track);
        if(this.call){
          var sender =  this.call.peerConnection.getSenders().find(function(s) {
            return s.track.kind == track.kind;
          });
          console.log('found sender:', sender);
        }
        if (this.switchVideo) {
          if (sender){
              console.log("enable video track");
              sender.track.enabled = true;
              console.log(sender);
          }
          track.enabled = true;
          this.renderVideo(this.userMedia);
        }
        else {
          if(sender){
              console.log("disable video track");
              //sender.replaceTrack();
              sender.track.enabled = false;
              console.log(sender);
          }
          track.enabled = false;
          this.renderVideo(this.userMedia);
        }
      },

      renderVideo: function(stream) {
        this.video = this.$refs[stream.id];
        
        if (stream.getVideoTracks()[0].enabled) {
          this.video.srcObject = stream;
        }
        else {
          this.video.pause();
          this.video.removeAttribute('src'); // empty source
          this.video.load();
        }
        
      },
 

    },

    mounted() {
      console.log(this.userMedia);   
      this.renderVideo(this.userMedia);
      this.resizeEventHandler("mounted");
      this.audioSrc.connect(this.gainNode);
      this.gainNode.connect(this.audioCtx.destination);
    }
  }
    
  </script>
