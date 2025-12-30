const express = require("express");
const router = express.Router();

const pool = require("../db");
const { requireAuth } = require("../middleware/auth.middleware");
const { requireAdmin } = require("../middleware/roles.middleware");

// Registrar movimiento entre cuentas
router.post("/movimientos", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { cuenta_origen, cuenta_destino, monto, fecha, nota = null } = req.body;

    if (!cuenta_origen || !cuenta_destino || !monto || !fecha) {
      return res.status(400).json({
        error: "cuenta_origen, cuenta_destino, monto y fecha son requeridos"
      });
    }

    if (Number(monto) <= 0) {
      return res.status(400).json({ error: "El monto debe ser positivo" });
    }

    if (Number(cuenta_origen) === Number(cuenta_destino)) {
      return res.status(400).json({ error: "Las cuentas deben ser diferentes" });
    }

    const [result] = await pool.query(
      `INSERT INTO movimientos_cuentas (cuenta_origen, cuenta_destino, monto, fecha, nota)
       VALUES (?, ?, ?, ?, ?)`,
      [cuenta_origen, cuenta_destino, monto, fecha, nota]
    );

    return res.status(201).json({
      id: result.insertId,
      cuenta_origen: Number(cuenta_origen),
      cuenta_destino: Number(cuenta_destino),
      monto: Number(monto),
      fecha,
      nota
    });
  } catch (e) {
    return res.status(500).json({ error: "Error creando movimiento", details: e.message });
  }
});

// Listar movimientos
router.get("/movimientos", requireAuth, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, cuenta_origen, cuenta_destino, monto, DATE_FORMAT(fecha, '%Y-%m-%d') AS fecha, nota
       FROM movimientos_cuentas
       ORDER BY fecha DESC, id DESC`
    );

    return res.json(
      rows.map((row) => ({
        ...row,
        monto: Number(row.monto)
      }))
    );
  } catch (e) {
    return res.status(500).json({ error: "Error listando movimientos", details: e.message });
  }
});

module.exports = router;
