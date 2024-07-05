const express = require('express');
const WebSocket = require('ws');
const robot = require('robotjs');
const jpeg = require('jpeg-js');

const app = express();
const server = app.listen(3000, () => console.log('Server started on port 3000'));
const wss = new WebSocket.Server({ server });

wss.on('connection', ws => {
  ws.on('message', message => {
    const { type, data } = JSON.parse(message);
    if (type === 'mouse') {
      robot.moveMouse(data.x, data.y);
      if (data.click) robot.mouseClick();
    } else if (type === 'keyboard') {
      robot.typeString(data.text);
    }
  });

  const sendScreenCapture = () => {
    const screen = robot.screen.capture(0, 0, robot.getScreenSize().width, robot.getScreenSize().height);
    const jpegImg = jpeg.encode({ data: screen.image, width: screen.width, height: screen.height }, 50);
    ws.send(jpegImg.data);
    setTimeout(sendScreenCapture, 100);
  };

  sendScreenCapture();
});

app.use(express.static('public'));
