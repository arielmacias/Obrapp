const express = require("express");
const router = express.Router();

const pool = require("../db");
const { requireAuth } = require("../middleware/auth.middleware");
const { requireAdmin } = require("../middleware/roles.middleware");

// Listar usuarios (opcional filtrar por rol)
router.get("/usuarios", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { rol } = req.query;
    const where = [];
    const params = [];

    if (rol) {
      where.push("rol = ?");
      params.push(rol);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [rows] = await pool.query(
      `SELECT id, nombre, correo, rol, activo
       FROM usuarios
       ${whereSql}
       ORDER BY nombre ASC`,
      params
    );

    return res.json(rows);
  } catch (e) {
    return res.status(500).json({ error: "Error listando usuarios", details: e.message });
  }
});

module.exports = router;
