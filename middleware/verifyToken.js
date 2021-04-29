const createError = require("http-errors");

module.exports = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === "test") return next();

    const token = req.cookie["authToken"];

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.find(decodedToken.email);

    if (user) {
      next();
    } else {
      res
        .status(204)
        .json({
          result: "failure",
          message: "user not found"
        });
    }
  } catch{
    next(createError(500, err.message));
  }
};
