const server = require("../game");
const { ballData, userPaddleData, partnerPaddleData } = require("../game/data");

const totalUserList = {};
const totalRoomList = {};
const waitingQue = [];
const canvas = {};

const LEFT = 37;
const RIGHT = 39;
const HALF = 2;
const PERCENTAGE = 100;

module.exports = (io) => {
  io.on("connection", (socket) => {
    socket.on("initialConnection", (username) => {
      totalUserList[socket.id] = username;

      io.to(socket.id).emit("connectSuccess", socket.id);

      if (waitingQue.length > 0) {
        const partner = waitingQue.shift();
        const roomKey = socket.id + partner.id;

        socket.join(roomKey);
        partner.join(roomKey);

        totalRoomList[socket.id] = roomKey;
        totalRoomList[partner.id] = roomKey;

        io.to(socket.id).emit("completeMatch", {
          isMatched: true,
          partner: {
            socketId: partner.id,
            name: totalUserList[partner.id]
          },
          webcam: {
            isCalling: true,
            isCallAccepted: false,
            callserSignal: null
          },
          gameBoard: {
            isModerator: true,
          }
        });

        io.to(partner.id).emit("completeMatch", {
          isMatched: true,
          partner: {
            socketId: socket.id,
            name: totalUserList[socket.id]
          }
        });
      } else {
        waitingQue.push(socket);
      }
    });

    socket.on("subtractWaitingQue", () => {
      waitingQue.shift();
    });

    socket.on("sendTextMessage", ({ text, userSocketId }) => {
      const roomKey = totalRoomList[userSocketId];
      const newChat = { userSocketId, text };

      io.sockets.in(roomKey).emit("sendTextMessage", newChat);
    });

    socket.on("leaveRoom", ({ userSocketId, partnerSocketId }) => {
      const roomKey = totalRoomList[userSocketId];

      io.to(userSocketId).emit("redirectHome");
      io.to(partnerSocketId).emit("partnerDisconnect");

      delete totalUserList[userSocketId];
      delete totalRoomList[userSocketId];

      socket.leave(roomKey);
    });

    socket.on("partnerDisconnect", () => {
      const roomKey = totalRoomList[socket.id];

      io.to(socket.id).emit("redirectHome");

      delete totalUserList[socket.id];
      delete totalRoomList[socket.id];

      socket.leave(roomKey);
    });

    socket.on("callUser", ({ partnerSocketId, signalData }) => {
      io.to(partnerSocketId).emit("callUser", signalData);
    });

    socket.on("acceptCall", ({ signalData, partnerSocketId }) => {
      io.to(partnerSocketId).emit("acceptCall", signalData);
    });

    socket.on("destroyPeer", ({ userSocketId, partnerSocketId }) => {
      io.to(userSocketId).emit("destroyPeer");
      io.to(partnerSocketId).emit("destroyPeer");
    });

    socket.on("refresh", () => {
      userPaddleData.x = canvas.width / HALF;
      partnerPaddleData.x = canvas.width / HALF;
    });

    socket.on("sendCanvas", ({ canvasWidth, canvasHeight }) => {
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      userPaddleData.y = canvas.height - userPaddleData.height - ballData.radius;
      partnerPaddleData.y = partnerPaddleData.height + ballData.radius;
      userPaddleData.x = (canvas.width / 2) - (userPaddleData.width / 2);
      partnerPaddleData.x = (canvas.width / 2) - (partnerPaddleData.width / 2);
    });

    socket.on("userKeyDown", ({ keyCode, partnerSocketId }) => {
      const distance = canvas.width / PERCENTAGE;

      if (keyCode === LEFT && userPaddleData.x <= 0) {
        userPaddleData.x = 0;
      } else if (keyCode === LEFT) {
        userPaddleData.x -= distance;
      }

      if (keyCode === RIGHT && userPaddleData.x + userPaddleData.width >= canvas.width) {
          userPaddleData.x = canvas.width - userPaddleData.width;
      } else if (keyCode === RIGHT) {
        userPaddleData.x += distance;
      }

      io.to(partnerSocketId).emit("userKeyDown", { keyCode, distance });
    });

    socket.on("partnerKeyDown", ({ keyCode, partnerSocketId }) => {
      const distance = canvas.width / PERCENTAGE;

      if (keyCode === LEFT && partnerPaddleData.x <= 0) {
        partnerPaddleData.x = 0;
      } else if (keyCode === LEFT) {
        partnerPaddleData.x -= distance;
      }

      if (keyCode === RIGHT && partnerPaddleData.x + partnerPaddleData.width >= canvas.width) {
          partnerPaddleData.x = canvas.width - partnerPaddleData.width;
      } else if (keyCode === RIGHT) {
        partnerPaddleData.x += distance;
      }

      io.to(partnerSocketId).emit("partnerKeyDown", { keyCode, distance });
    });

    socket.on("userKeyUp", ({ partnerSocketId }) => {
      io.to(partnerSocketId).emit("userKeyUP");
    });

    socket.on("partnerKeyUp", ({ partnerSocketId }) => {
      io.to(partnerSocketId).emit("partnerKeyUP");
    });

    socket.on("moveBall", (isModerator) => {
      const roomKey = totalRoomList[socket.id];
      const result = server(canvas, isModerator);

      io.sockets.in(roomKey).emit("moveBall", result);
    });

    socket.on("startRound", () => {
      userPaddleData.x = (canvas.width / 2) - (userPaddleData.width / 2);
      partnerPaddleData.x = (canvas.width / 2) - (partnerPaddleData.width / 2);
    });
  });
};
