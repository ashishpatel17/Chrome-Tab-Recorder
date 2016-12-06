module.exports = function(server){
  var http = require('http');
  var fs = require('fs');
  var io = require('socket.io');
  
  // Create Socket server and listen 1337 port
  var server = http.createServer(function(request, response) {});
  server.listen(1337, function() {});

  // pass server obj to socket.io listner
  var wIoSocket = io.listen(server);

  wIoSocket.sockets.on('connection', function (socket) {
      // holds the file name of each connection
      var fileName = "";
      // Recive the action message before recording contain file name and create the file
      socket.on('action', function (data) {
          var recData = JSON.parse(data);
          if(recData.status == "start"){
            fileName = recData.fileName;
            console.log("File created "+fileName);
            //create the file before start recording
            fs.appendFile(`recordedFiles/${fileName}.webm`,"", function (err) {});
          }
      })

      // Recive the arraybuffer data and save it to the created video file
      socket.on('message', function (data) {
            console.log("Data Recived and saved");
          fs.appendFile(`recordedFiles/${fileName}.webm`, new Buffer(data), function (err) {});
      });

      socket.on('connect', function () {});

      socket.on('disconnect', function () {
        console.log("Connection Close");
      });
  });
}
