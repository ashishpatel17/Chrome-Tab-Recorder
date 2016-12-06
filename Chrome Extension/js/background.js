/*
  Name : Ashish M Patel
  last updated : 12/6/2016

  This background script is to capture the tab stream of tab where recording is active
  and send to server using socket.io

*/

(function(){
  // Manage the screen recoding status
  var statusObj = {
    // By default stop
    value: "stop",
    // Get the currunt status
    getStatus: function() {
      return this.value;
    },
    // can set the status of recordings
    setStatus: function(newStatus) {
      this.value = newStatus;
    }
  };

  var curruntActivetab = null;  // Hold the id of currunt active tab
  var recordingTabId = null;    // Hold the id of tab where recording is active
  var socketConnectionUrl = "ws://192.168.0.42:1337"; // Server socket url

  /*
   Chrome Tab change event fired every time when user switched to another tab
  */
  chrome.tabs.onActivated.addListener(function(tab){
    curruntActivetab = tab.tabId; // save currunt tab id
    /*
    if currunt tab id not equal to recordingTabId and status is start
    then pause the recording and set status to pause
    */
    if(tab.tabId != recordingTabId && statusObj.getStatus()=="start"){
        statusObj.setStatus("pause");
        mediaRecorder.pause();
    }
    /*
    if currunt tab id not to recordingTabId and status is pause
    then start the recording and set status to start
    */
    else if(tab.tabId == recordingTabId && statusObj.getStatus()=="pause"){
        statusObj.setStatus("start");
        mediaRecorder.resume();
    }
  })

  /*
    Chrome tab event executed while tab is closed
   */
  chrome.tabs.onRemoved.addListener(function(tab){
    // if closed tab is equal to recording tab then stop the recording
    if(recordingTabId == tab){
        statusObj.setStatus("stop");
    }
  })

  /*
    extension button event toggle start and stop of recording
   */
  chrome.browserAction.onClicked.addListener(function(request) {
    // toggle the status based on function condition
    updateRecorderStatus(statusObj.getStatus());
    if (statusObj.getStatus() == "stop") {
      statusObj.setStatus("stop");
    } else if (statusObj.getStatus() == "start") {
      recordingTabId = curruntActivetab;
      //Start recording on currunt tab
      startRecording();
    }
  });

  function startRecording() {
    // get the currunt tab object
    chrome.tabs.getSelected(null, function(tab) {
      // set the video recording constraints
      var constraints = {
        audio: false,
        video: true,
        videoConstraints: {
          mandatory: {
            chromeMediaSource: 'tab',
            maxWidth: 1280,
            maxHeight: 720,
            maxFrameRate: 15,
            minAspectRatio: 1.77,
            googLeakyBucket: true,
            googTemporalLayeredScreencast: true
          }
        }
      };
      // Chrome tab cature event which capture the video stream of currunt tab and send stream to handleCapture handler
      chrome.tabCapture.capture(constraints, handleCapture);
    });
  }

  // Chrome tab capture event handler recive the video stream as a MediaStream
  function handleCapture(MediaStream) {
    var recordedChunks = [];
    // Create socket connection using socket.io
    var socketio = io(socketConnectionUrl,{
      'reconnectionDelay': 1000,
      'reconnectionDelayMax' : 5000,
      'reconnectionAttempts': 5
    });
    // set to arraybuffer because data need to send would be an arraybuffer
    socketio.binaryType = 'arraybuffer';

    // Set the timestamp as a file name and send to server
    var id = new Date().getTime();
    socketio.emit('action', `{"status":"start","fileName":"${id}"}`);

    // create HTML5 mediaRecorder object and pass stream to that.
    var mediaRecorder = new MediaRecorder(MediaStream, {mimeType: 'video/webm'});
    // Start collecting the stream
    mediaRecorder.start();
    // ondataavailable event executed when it recive the stream
    mediaRecorder.ondataavailable = function(event) {
      if (event.data.size > 0) {
        // push blob to recordedChunks array
        recordedChunks.push(event.data);
      }
    };

    /*
       interval function execute every 5 seconds send the collected blob objects inside recordedChunks
       to the server
    */
    var sendRecordingInterval = setInterval(function(){
      if(recordedChunks.length>0){
            var tempChunks = [...recordedChunks];
            // clear recordedChunks array
            recordedChunks = [];
            //Convert blob object to array buffer.
            blobToArrayBufferConverter(tempChunks,function(arrBuffer){
                  // send array buffer to server
                 socketio.emit('message', arrBuffer);
            });
      }
    },5000);


    /*
        -Interval function check every time is status is set to stop . if yes
        -then stop the mediaRecorder and send remaining collected blob inside recordedChunks to server
        -and disconnect the connection
     */
    var checkRecorderStatus = setInterval(function() {
      if (statusObj.getStatus() == "stop") {
        clearInterval(checkRecorderStatus);
        MediaStream.getVideoTracks()[0].stop();
        mediaRecorder.stop();
        clearInterval(sendRecordingInterval);
        if(recordedChunks.length>0){
            blobToArrayBufferConverter(recordedChunks,function(arrBuffer){
                 socketio.emit('message', arrBuffer);
            });
           recordedChunks = [];
           socketio.disconnect();
        }
      }
    }, 100);
  }

  /*
      function to convert array of blob to array buffer
   */
  function blobToArrayBufferConverter(blobChunks,callback){
      var blob = new Blob(blobChunks, {type: 'video/webm'});
      var fileReader = new FileReader();
      fileReader.readAsArrayBuffer(blob);
      fileReader.onload  = function(progressEvent) {
          callback(this.result);
      }
  }

  /*
      Function to toggle the currunt status of recording
   */
  function updateRecorderStatus(curStatus) {
      if (curStatus == "stop") {
        statusObj.setStatus("start");
      } else if (curStatus == "start") {
        statusObj.setStatus("stop");
      }
  }

})();
