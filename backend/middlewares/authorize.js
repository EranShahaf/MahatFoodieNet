// middlewares/authorize.js
export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
      const userRoles = req.user?.roles || [];
      const username = req.user?.username || "Unknown";
      const ok = allowedRoles.some((r) => userRoles.includes(r));
      if (!ok) {
        console.log(`[AUTHORIZE MIDDLEWARE] ${new Date().toISOString()} | Authorization failed: User ${username} (roles: ${userRoles.join(", ")}) lacks required roles: ${allowedRoles.join(", ")} - ${req.method} ${req.originalUrl}`);
        return res.status(403).json({ message: "Forbidden — insufficient role" });
      }
      console.log(`[AUTHORIZE MIDDLEWARE] ${new Date().toISOString()} | Authorization successful: User ${username} (roles: ${userRoles.join(", ")}) - ${req.method} ${req.originalUrl}`);
      next();
    };
  };
  