Chrome Tab Recorder
===================
This is the chrome extension which record user activity in form of video on the tab where recording is started and send the recorded chunks to the server.

----------


Features
-------------


 - Capture tab recording
 - Record in smaller chunks
 - convertion of block objects to array buffer
 - Send array buffer chunks to server using socket
 - Get chunks on server and generate a video file
 - Video recording pause and resume on tab change and stop recording on tab close



 Prerequisites
-------------

 - Tab Recorder Extension
 - Node server to create socket connection
 - Socket.io client js and server side node module



 Installing
-------------
The extension is not published on store yet so install it manually here are step to install
the chrome extension.
##### Installing Extesnsion

 - Open Chrome browser
 - Goto settings and switch to extension section.
 - Make sure developer mode option is checked
 - Click on Load Unpacked Extension Button and select the extension folder
 - Set the variable socketConnectionUrl in background.js with the connection url you have defined from server side

##### Server side

 - Install Node and Express
 - Install Socket.io Node module
 - Copy videoSocketConnectionManager.js file to your express project and use it in your express project.


  Build With
-------------

 - Chrome Tab Capture - [<i ></i> developer.chrome.com](https://developer.chrome.com/extensions/tabCapture)
 - HTML5 MediaRecorder API -  [<i ></i> www.w3.org](https://www.w3.org/TR/mediastream-recording/)
 - Socket.io -   [<i ></i> socket.io](http://socket.io/)



   Authour
-------------

 - Ashish M Patel

   License
-------------
This project is licensed under the MIT License
