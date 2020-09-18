<template>
  <v-card class="mx-auto">
    <v-row >
    <v-col cols = "4" :ref="userMedia.id + '-videoCol'">
        <video :width="videoWidth" :ref="userMedia.id" :id="userMedia.id" autoplay></video>
    </v-col>
    <v-col cols = "8" :ref="userMedia.id + '-audoVisCol'" >
      <audio-visualizer  v-if="enableAudio" :maxWidth="audioWidth" :maxHeight="audioHeight" :userMedia="userMedia" :key="audioComp" />
    </v-col>
    <v-col cols = "12" class=" pt-0" >
      <v-card-actions v-if="local">
      <v-switch @click="toggleAudio" v-model="enableAudio" value input-value="false">
        <template v-slot:prepend>
          <v-icon  >{{ enableAudioIcon }}</v-icon>
        </template>
      </v-switch>
      <v-switch @click="toggleVideo" v-model="enableVideo" value input-value="false">
        <template v-slot:prepend>
          <v-icon >{{ enableVideoIcon }}</v-icon>
        </template>
      </v-switch>
       </v-card-actions>
    </v-col>
  </v-row>
  </v-card>
</template>

<script>
  import AudioVisualizer from "@/components/AudioVisualizer.vue";
  import { mdiMicrophoneOutline } from '@mdi/js';
  import { mdiVideoOutline } from '@mdi/js';

  export default {
    name: 'CallCard',
    components: {
      AudioVisualizer,
    },

    props: {
      userMedia: MediaStream,
      call: Object,
      local: Boolean,

    },
    computed: {
//      audioWidth: function (){
//        return this.$refs[this.userMedia.id.concat("-audoVisCol")].clientWidth
//      }, 
//
//      audioHeight: function (){
//        return this.$refs[this.userMedia.id.concat("-audoVisCol")].clientHeight
//      },
//
//      videoWidth: function (){
//        if(this.enableVideo){
//
//          console.log(this.$refs[this.userMedia.id.concat("-videoCol")].clientWidth);
//          return this.$refs[this.userMedia.id.concat("-videoCol")].clientWidth
//        }
//        return 100;
//      },

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
       videoWidth: 100,
       enableAudio: false,
       enableVideo: false,
       enableAudioIcon: mdiMicrophoneOutline,
       enableVideoIcon: mdiVideoOutline,
    }),
    
    methods: {
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
        if (this.enableAudio) {
          if (sender){
              console.log("enable video track");
              sender.track.enabled = true;
              console.log(sender);
          }
          track.enabled = true;
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
        if (this.enableVideo) {
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
      if(this.local){
        this.enableAudio = false;
        this.enableAudio = false;
      }
      else{
        this.enableAudio = true;
        this.enableVideo = true;
        this.renderVideo(this.userMedia);
      }
      this.toggleAudio();
      this.toggleVideo();
      this.resizeEventHandler("mounted");
    }
  }
    
  </script>
