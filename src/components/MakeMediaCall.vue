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
     mediaArgs: {
       type: Object,
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
 
        navigator.mediaDevices.getUserMedia(this.mediaArgs)
        .then((stream) => {
          let call = this.peer.call(this.remotePeerId, stream);
          call.on('stream', this.renderVideo);
          this.messages = "connected to ".concat(JSON.stringify(call.peer));
        })
        .catch((err) => {
          this.messages = 'Failed to get local stream'.concat(JSON.stringify(err));
        })
        .finally(() => {
          this.loading = false;
        });
   },

   methods: {

      renderVideo: function(stream) {
        this.video = this.$refs.video;
        this.video.srcObject = stream;
      }

    }
  }
</script>
