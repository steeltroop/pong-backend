const totalUserList = {};
const totalRoomList = {};
const waitingQue = [];

module.exports = (io) => {
  io.on("connection", (socket) => {
    socket.on("initialConnection", (username) => {
      totalUserList[socket.io] = username;
      io.to(socket.id).emit("connectSuccess", socket.id);
    });

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
          name: totlaUserList[partner.id]
        }
      });

      io.to(partner.id).emit("completeMatch", {
        isMatched: true,
        partner: {
          socketId: socket.id,
          name: totlaUserList[socket.id]
        }
      });
    } else {
      waitingQue.push(socket);
      io.to(socket.id).emit("completeMatch", {
        isMatched: true
      });
    }
  });
};
