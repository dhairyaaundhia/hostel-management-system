const { verifyToken } = require("../utils/auth");

exports.protect = (req, res, next) => {
  let token;

  // Token should come in header: Authorization: Bearer <token>
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({
        success: false,
        errors: [{ msg: "No token, authorization denied" }],
      });
  }

  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      return res
        .status(401)
        .json({ success: false, errors: [{ msg: "Token is not valid" }] });
    }
    req.user = decoded; // decoded has userId & isAdmin
    next();
  } catch (err) {
    res
      .status(401)
      .json({ success: false, errors: [{ msg: "Token is not valid" }] });
  }
};
