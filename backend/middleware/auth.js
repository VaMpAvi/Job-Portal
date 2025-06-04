const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(403).json({ error: "No token provided" });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(403).json({ error: "Invalid token format" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ error: "Invalid token" });
    }
  } catch (error) {
    res.status(500).json({ error: "Authentication failed" });
  }
};

exports.checkRole = (role) => (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({ error: "No user found in request" });
  }
  
  if (req.user.role !== role) {
    return res.status(403).json({ error: `Access denied. Must be ${role}` });
  }
  next();
};
