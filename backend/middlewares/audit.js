// middlewares/audit.js
export const auditMiddleware = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.originalUrl;
  
    // Request body (for POST/PUT)
    const body = req.body && Object.keys(req.body).length ? JSON.stringify(req.body) : null;
  
    // User info if authenticated (req.user set by authenticate middleware)
    const user = req.user ? `${req.user.username} [id: ${req.user.sub}]` : "Anonymous";
  
    // Log format
    console.log(`[AUDIT] ${timestamp} | ${method} ${url} | User: ${user}${body ? ` | Body: ${body}` : ""}`);
  
    next();
  };
  