const express = require("express");
const router = express.Router();

const pool = require("../db");
const { requireAuth } = require("../middleware/auth.middleware");

// ✅ Crear gasto
router.post("/gastos", requireAuth, async (req, res) => {
  try {
    const { obra_id, fecha, monto, cuenta_id, partida, descripcion = null } = req.body;

    if (!obra_id || !fecha || monto == null || !cuenta_id || !partida) {
      return res.status(400).json({
        error: "obra_id, fecha, monto, cuenta_id y partida son requeridos"
      });
    }

    const usuario_id = req.user.id;

    const [result] = await pool.query(
      `INSERT INTO gastos (obra_id, fecha, monto, cuenta_id, partida, descripcion, usuario_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [obra_id, fecha, monto, cuenta_id, partida, descripcion, usuario_id]
    );

    // (Opcional) asegurar tipo numérico en la respuesta
    const montoNum = Number(monto);

    return res.status(201).json({
      id: result.insertId,
      obra_id,
      fecha, // aquí recibes YYYY-MM-DD desde el body
      monto: Number.isFinite(montoNum) ? montoNum : monto,
      cuenta_id,
      partida,
      descripcion,
      usuario_id
    });
  } catch (e) {
    return res.status(500).json({ error: "Error creando gasto", details: e.message });
  }
});

// ✅ Listar gastos (filtros + paginación + total) + FIX monto numérico + fecha limpia
router.get("/gastos", requireAuth, async (req, res) => {
  try {
    const { obra_id, cuenta_id, desde, hasta, limit, offset } = req.query;

    // Defaults seguros + saneamiento
    const parsedLimit = parseInt(limit || "50", 10);
    const parsedOffset = parseInt(offset || "0", 10);

    const _limit = Math.min(Number.isFinite(parsedLimit) ? parsedLimit : 50, 200); // max 200
    const _offset = Math.max(Number.isFinite(parsedOffset) ? parsedOffset : 0, 0);

    // Validación básica de fechas (si vienen)
    const isValidDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s);
    if (desde && !isValidDate(desde)) {
      return res.status(400).json({ error: "Formato inválido en 'desde'. Usa YYYY-MM-DD" });
    }
    if (hasta && !isValidDate(hasta)) {
      return res.status(400).json({ error: "Formato inválido en 'hasta'. Usa YYYY-MM-DD" });
    }

    // WHERE dinámico
    const where = [];
    const params = [];

    if (obra_id) { where.push("obra_id = ?"); params.push(obra_id); }
    if (cuenta_id) { where.push("cuenta_id = ?"); params.push(cuenta_id); }
    if (desde) { where.push("fecha >= ?"); params.push(desde); }
    if (hasta) { where.push("fecha <= ?"); params.push(hasta); }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    // Query data
    const [rows] = await pool.query(
      `
      SELECT
        id,
        obra_id,
        DATE_FORMAT(fecha, '%Y-%m-%d') AS fecha,
        monto,
        cuenta_id,
        partida,
        descripcion,
        usuario_id
      FROM gastos
      ${whereSql}
      ORDER BY fecha DESC, id DESC
      LIMIT ? OFFSET ?
      `,
      [...params, _limit, _offset]
    );

    // FIX: convertir DECIMAL (monto) a number para evitar bugs en frontend/cálculos
    const data = rows.map(r => ({
      ...r,
      monto: Number(r.monto)
    }));

    // Query total
    const [[totalRow]] = await pool.query(
      `SELECT COUNT(*) AS total FROM gastos ${whereSql}`,
      params
    );

    return res.status(200).json({
      total: totalRow.total,
      limit: _limit,
      offset: _offset,
      data
    });
  } catch (e) {
    return res.status(500).json({ error: "Error listando gastos", details: e.message });
  }
});

// ✅ Eliminar gasto (físico)
router.delete("/gastos/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(`DELETE FROM gastos WHERE id = ?`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Gasto no encontrado" });
    }

    return res.json({ ok: true, id: Number(id) });
  } catch (e) {
    return res.status(500).json({ error: "Error eliminando gasto", details: e.message });
  }
});

module.exports = router;
