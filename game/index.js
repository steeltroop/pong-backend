const { ballData, userPaddleData, partnerPaddleData } = require("./data");
const { userPaddleCollision, partnerPaddleCollision } = require("./paddleCollision");

const server = (canvas, reset, moderator) => {
  if (!canvas) {
    return { ballData, userPaddleData, partnerPaddleData };
  };

  if (reset) {
    ballData.x = canvas.width / 2;
    ballData.y = canvas.height / 2;
    ballData.dx = 0;
    ballData.dy = 5;
    userPaddleData.x = canvas.width / 2 - userPaddleData.width / 2;
    partnerPaddleData.x = canvas.width / 2 - partnerPaddleData.width / 2;

    return { ballData, userPaddleData, partnerPaddleData };
  }

  if (!moderator) {
    return { ballData };
  }

  ballData.x += ballData.dx;
  ballData.y += ballData.dy;

  if (ballData.y - ballData.radius < 0) {
    ballData.dx = 0;
    ballData.dy = -5;
    ballData.x = canvas.width / 2;
    ballData.y = canvas.height / 2;

    return { ballData, end: true };
  }

  if (ballData.y > canvas.height - ballData.radius) {
    ballData.dx = 0;
    ballData.dy = 5;
    ballData.x = canvas.width / 2;
    ballData.y = canvas.height / 2;

    return { ballData, end: true };
  }

  if (ballData.x - ballData.radius < 0 || ballData.x + ballData.radius > canvas.width) {
    ballData.dx *= -1;
  }

  userPaddleCollision();
  partnerPaddleCollision(canvas);

  return { ballData };
};

module.exports = server;
