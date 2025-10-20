// middlewares/authorize.js
export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
      const userRoles = req.user?.roles || [];
      const ok = allowedRoles.some((r) => userRoles.includes(r));
      if (!ok) return res.status(403).json({ message: "Forbidden — insufficient role" });
      next();
    };
  };
  