function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) {
      return res.status(403).json({ error: "Acceso denegado" });
    }
    return next();
  };
}

const requireAdmin = requireRole("admin");

module.exports = { requireRole, requireAdmin };
