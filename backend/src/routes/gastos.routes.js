const express = require("express");
const router = express.Router();

const pool = require("../db");
const { requireAuth } = require("../middleware/auth.middleware");

async function obraActiva(obraId) {
  const [rows] = await pool.query(
    `SELECT id, estado FROM obras WHERE id = ? LIMIT 1`,
    [obraId]
  );
  if (rows.length === 0) {
    return { ok: false, error: "Obra no encontrada" };
  }
  if (rows[0].estado !== "activa") {
    return { ok: false, error: "No se pueden registrar gastos en obras terminadas" };
  }
  return { ok: true };
}

async function ensureObraAsignada(req, obraId) {
  if (req.user.rol !== "residente") return true;
  const [rows] = await pool.query(
    `SELECT 1 FROM usuarios_obras WHERE usuario_id = ? AND obra_id = ? LIMIT 1`,
    [req.user.id, obraId]
  );
  return rows.length > 0;
}

// ✅ Crear gasto
router.post("/gastos", requireAuth, async (req, res) => {
  try {
    const {
      obra_id,
      fecha,
      monto,
      cuenta_id,
      partida,
      descripcion = null,
      concepto = null,
      comprobante_url = null
    } = req.body;

    if (!obra_id || !fecha || monto == null || !cuenta_id || !partida) {
      return res.status(400).json({
        error: "obra_id, fecha, monto, cuenta_id y partida son requeridos"
      });
    }

    if (Number(monto) <= 0) {
      return res.status(400).json({ error: "El monto debe ser positivo" });
    }

    const allowed = await ensureObraAsignada(req, obra_id);
    if (!allowed) {
      return res.status(403).json({ error: "No tienes acceso a esta obra" });
    }

    const obraCheck = await obraActiva(obra_id);
    if (!obraCheck.ok) {
      return res.status(400).json({ error: obraCheck.error });
    }

    const usuario_id = req.user.id;

    const [result] = await pool.query(
      `INSERT INTO gastos (obra_id, fecha, monto, cuenta_id, partida, descripcion, comprobante_url, usuario_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        obra_id,
        fecha,
        monto,
        cuenta_id,
        partida,
        descripcion ?? concepto,
        comprobante_url,
        usuario_id
      ]
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
      descripcion: descripcion ?? concepto,
      comprobante_url,
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

    if (req.user.rol === "residente") {
      where.push("obra_id IN (SELECT obra_id FROM usuarios_obras WHERE usuario_id = ?)");
      params.push(req.user.id);
    }

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
        comprobante_url,
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

// ✅ Eliminar gasto (físico) - solo admin
router.delete("/gastos/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.rol !== "admin") {
      return res.status(403).json({ error: "Acceso denegado" });
    }

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
