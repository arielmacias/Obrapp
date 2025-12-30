const express = require("express");
const router = express.Router();

const pool = require("../db");
const { requireAuth } = require("../middleware/auth.middleware");
const { requireAdmin } = require("../middleware/roles.middleware");

async function ensureObraAsignada(req, obraId) {
  if (req.user.rol !== "residente") return true;
  const [rows] = await pool.query(
    `SELECT 1 FROM usuarios_obras WHERE usuario_id = ? AND obra_id = ? LIMIT 1`,
    [req.user.id, obraId]
  );
  return rows.length > 0;
}

// Registrar pago (admin)
router.post("/pagos", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { obra_id, fecha, monto, cuenta_id, descripcion = null } = req.body;

    if (!obra_id || !fecha || monto == null || !cuenta_id) {
      return res.status(400).json({
        error: "obra_id, fecha, monto y cuenta_id son requeridos"
      });
    }

    if (Number(monto) <= 0) {
      return res.status(400).json({ error: "El monto debe ser positivo" });
    }

    const [result] = await pool.query(
      `INSERT INTO pagos (obra_id, fecha, monto, cuenta_id, descripcion)
       VALUES (?, ?, ?, ?, ?)`,
      [obra_id, fecha, monto, cuenta_id, descripcion]
    );

    return res.status(201).json({
      id: result.insertId,
      obra_id,
      fecha,
      monto: Number(monto),
      cuenta_id,
      descripcion
    });
  } catch (e) {
    return res.status(500).json({ error: "Error creando pago", details: e.message });
  }
});

// Historial de pagos por obra
router.get("/pagos", requireAuth, async (req, res) => {
  try {
    const { obra_id } = req.query;

    if (req.user.rol === "residente") {
      if (!obra_id) {
        return res.status(400).json({ error: "obra_id es requerido para residentes" });
      }
      const allowed = await ensureObraAsignada(req, obra_id);
      if (!allowed) {
        return res.status(403).json({ error: "No tienes acceso a esta obra" });
      }
    }

    const where = [];
    const params = [];
    if (obra_id) {
      where.push("obra_id = ?");
      params.push(obra_id);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [rows] = await pool.query(
      `SELECT id, obra_id, DATE_FORMAT(fecha, '%Y-%m-%d') AS fecha, monto, cuenta_id, descripcion
       FROM pagos
       ${whereSql}
       ORDER BY fecha DESC, id DESC`,
      params
    );

    return res.json(
      rows.map((row) => ({
        ...row,
        monto: Number(row.monto)
      }))
    );
  } catch (e) {
    return res.status(500).json({ error: "Error listando pagos", details: e.message });
  }
});

module.exports = router;
