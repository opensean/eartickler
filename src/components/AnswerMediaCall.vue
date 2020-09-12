// AnswerMediaCall.vue

<template>
<v-container>
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
  <video ref="video" id="video" autoplay></video>
  </v-row>
</v-container>
</template>
 
<script>
  export default {
   props: {
     call: {
       type: Object,
     },
     userMedia: {
       type: MediaStream,
     },
     answerPrompt: {
       type: Boolean,
     }
   },
   
   data: () => ({
     loading: true,
     showAnswerPrompt: false
   }),
   
   mounted (){
     if (this.answerPrompt){
       this.showAnswerPrompt = true;
     }

  },
  
   methods: {

      answerMediaCall: function () {
        this.showAnswerPrompt = false;
        this.call.answer(this.userMedia); // Answer the call with an A/V stream.
        this.call.on('stream', this.renderVideo);
        this.messages = "connected to ".concat(JSON.stringify(this.call.peer));
        this.loading = false;
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

    }
  }
</script>
