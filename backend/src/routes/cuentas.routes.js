const express = require("express");
const router = express.Router();

const pool = require("../db");
const { requireAuth } = require("../middleware/auth.middleware");
const { requireAdmin } = require("../middleware/roles.middleware");

// ✅ Crear cuenta
router.post("/cuentas", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { nombre, descripcion = null, activa = 1 } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: "nombre es requerido" });
    }

    const [result] = await pool.query(
      `INSERT INTO cuentas (nombre, descripcion, activa)
       VALUES (?, ?, ?)`,
      [nombre, descripcion, activa ? 1 : 0]
    );

    return res.status(201).json({
      id: result.insertId,
      nombre,
      descripcion,
      activa: activa ? 1 : 0
    });
  } catch (e) {
    return res.status(500).json({ error: "Error creando cuenta", details: e.message });
  }
});

// ✅ Listar cuentas (por default solo activas)
router.get("/cuentas", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { incluir_inactivas } = req.query;

    let sql = `SELECT id, nombre, descripcion, activa, creado_en FROM cuentas`;
    const params = [];

    if (!incluir_inactivas) {
      sql += ` WHERE activa = 1`;
    }

    sql += ` ORDER BY id DESC`;

    const [rows] = await pool.query(sql, params);
    return res.json(rows);
  } catch (e) {
    return res.status(500).json({ error: "Error listando cuentas", details: e.message });
  }
});

// ✅ Desactivar cuenta (soft delete)
router.delete("/cuentas/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      `UPDATE cuentas SET activa = 0 WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Cuenta no encontrada" });
    }

    return res.json({ ok: true, id: Number(id), activa: 0 });
  } catch (e) {
    return res.status(500).json({ error: "Error eliminando cuenta", details: e.message });
  }
});

module.exports = router;
