const createError = require("http-errors");

module.exports.patch = async (req, res, next) => {
  try {
    const { email } = req.body;
    const currentUser = await User.findOne({ email });

    currentUser.winningPoint += 100;

    await currentUser.save();

    res
      .status(200)
      .json({
        status: "success"
      });
  } catch(err) {
    next(createError(500, err.message));
  }
};
