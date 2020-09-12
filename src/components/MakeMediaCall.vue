// MakeMediaCall.vue

<template>
<v-container>  
      <v-progress-linear
        :active="loading"
        :indeterminate="loading"
        absolute
        top
      ></v-progress-linear>
  <v-row justify="center">
      <v-col cols="12">
      <v-progress-linear
        :active="loading"
        :indeterminate="loading"
        absolute
        top
      ></v-progress-linear>
      </v-col>

  <video ref="video" id="video" autoplay></video>
  </v-row>
</v-container>
</template>
 
<script>
  export default {
   props: {
     peer: {
       type: Object,
     },
     userMedia: {
       type: MediaStream,
     },
     remotePeerId: {
     }
   },
   
   data: () => ({
     loading: true,
   }),

  
   mounted () {
        let conn = this.peer.connect(this.remotePeerId);
        
        conn.on('data', (data) => {
          this.messages = 'received: '.concat(JSON.stringify(data));
        });

        conn.on('open', () => {
          conn.send('hi!');
        });  
 
        let call = this.peer.call(this.remotePeerId, this.userMedia);
        call.on('stream', this.renderVideo);
        
        this.messages = "connected to ".concat(JSON.stringify(call.peer));
        this.loading = false;
   },

   methods: {

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
