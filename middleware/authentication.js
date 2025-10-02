const jwt = require("jsonwebtoken");
const { UnauthenticatedError } = require("../errors");

const auth = async (req, res, next) => {
  // Get token from cookies instead of Authorization header
  const token = req.cookies?.token;

  if (!token) {
    throw new UnauthenticatedError("Authentication invalid");
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user data to request object
    req.user = {
      userId: payload.userId,
      name: payload.name,
      role: payload.role,
      email: payload.email,
    };

    next();
  } catch (error) {
    throw new UnauthenticatedError("Authentication invalid");
  }
};

module.exports = auth;
