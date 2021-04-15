const jwt = require("jsonwebtoken");
const createError = require("http-errors");

module.exports.login = async (req, res, next) => {
  try {
    const { email, name } = req.body;

    const currentUser = await User.findOne({ email });
    if (!currentUser) await User.create(req.body);

    const token = jwt.sign({ email, name }, process.env.JWT_SECRET);

    res
      .cookie("authToken", token)
      .status(201)
      .json({ result: "success", message: "로그인에 성공했습니다" });
  } catch (err) {
    next(createError(500, "로그인에 실패했습니다"));
  }
};
