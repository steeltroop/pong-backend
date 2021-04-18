const totalUserList = {};
const totalRoomList = {};
const waitingQue = [];

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
            isCallAccepted: false
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

    socket.on("sendTextMessage", ({ text, userSocketId }) => {
      const roomKey = totalRoomList[userSocketId];
      const newChat = { userSocketId, text };

      io.sockets.in(roomKey).emit("sendTextMessage", newChat);
    });

    socket.on("leaveRoom", ({ userSocketId, partnerSocketId }) => {
      const roomKey = totalRoomList[userSocketId];

      io.to(partnerSocketId).emit("partnerDisconnect");

      delete totalUserList[userSocketId];
      delete totalRoomList[userSocketId];

      socket.leave(roomKey);
    });

    socket.on("partnerDisconnect", () => {
      const roomKey = totalRoomList[socket.id];

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
  });
};
