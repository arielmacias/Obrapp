const express = require("express");
const router = express.Router();

const pool = require("../db");
const { requireAuth } = require("../middleware/auth.middleware");

async function ensureObraAsignada(req, obraId) {
  if (req.user.rol !== "residente") return true;
  const [rows] = await pool.query(
    `SELECT 1 FROM usuarios_obras WHERE usuario_id = ? AND obra_id = ? LIMIT 1`,
    [req.user.id, obraId]
  );
  return rows.length > 0;
}

async function getObra(obraId) {
  const [rows] = await pool.query(
    `SELECT id, porcentaje_honorarios, estado FROM obras WHERE id = ? LIMIT 1`,
    [obraId]
  );
  return rows[0];
}

function defaultRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 6);
  const toDate = (d) => d.toISOString().slice(0, 10);
  return { fecha_inicio: toDate(start), fecha_fin: toDate(end) };
}

// Generar estimación semanal
router.post("/estimaciones", requireAuth, async (req, res) => {
  try {
    const { obra_id, fecha_inicio, fecha_fin } = req.body;

    if (!obra_id) {
      return res.status(400).json({ error: "obra_id es requerido" });
    }

    const allowed = await ensureObraAsignada(req, obra_id);
    if (!allowed) {
      return res.status(403).json({ error: "No tienes acceso a esta obra" });
    }

    const obra = await getObra(obra_id);
    if (!obra) {
      return res.status(404).json({ error: "Obra no encontrada" });
    }
    if (obra.estado !== "activa") {
      return res.status(400).json({ error: "No se puede generar estimación en obras terminadas" });
    }

    const range = {
      fecha_inicio: fecha_inicio,
      fecha_fin: fecha_fin
    };
    if (!range.fecha_inicio || !range.fecha_fin) {
      Object.assign(range, defaultRange());
    }

    const [gastos] = await pool.query(
      `SELECT id, monto
       FROM gastos
       WHERE obra_id = ? AND fecha BETWEEN ? AND ?`,
      [obra_id, range.fecha_inicio, range.fecha_fin]
    );

    const total_gastos = gastos.reduce((sum, g) => sum + Number(g.monto), 0);
    const honorarios = (total_gastos * Number(obra.porcentaje_honorarios)) / 100;
    const total_estimacion = total_gastos + honorarios;

    const [result] = await pool.query(
      `INSERT INTO estimaciones (obra_id, fecha_inicio, fecha_fin, total_gastos, honorarios, total_estimacion)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        obra_id,
        range.fecha_inicio,
        range.fecha_fin,
        total_gastos,
        honorarios,
        total_estimacion
      ]
    );

    const estimacionId = result.insertId;

    if (gastos.length > 0) {
      const values = gastos.map((g) => [estimacionId, g.id]);
      await pool.query(
        `INSERT INTO estimaciones_gastos (estimacion_id, gasto_id) VALUES ?`,
        [values]
      );
    }

    return res.status(201).json({
      id: estimacionId,
      obra_id,
      fecha_inicio: range.fecha_inicio,
      fecha_fin: range.fecha_fin,
      total_gastos,
      honorarios,
      total_estimacion
    });
  } catch (e) {
    return res.status(500).json({ error: "Error generando estimación", details: e.message });
  }
});

// Listar estimaciones por obra
router.get("/estimaciones", requireAuth, async (req, res) => {
  try {
    const { obra_id } = req.query;
    if (!obra_id) {
      return res.status(400).json({ error: "obra_id es requerido" });
    }

    const allowed = await ensureObraAsignada(req, obra_id);
    if (!allowed) {
      return res.status(403).json({ error: "No tienes acceso a esta obra" });
    }

    const [rows] = await pool.query(
      `SELECT id, obra_id, DATE_FORMAT(fecha_inicio, '%Y-%m-%d') AS fecha_inicio,
              DATE_FORMAT(fecha_fin, '%Y-%m-%d') AS fecha_fin, total_gastos, honorarios, total_estimacion,
              creado_en
       FROM estimaciones
       WHERE obra_id = ?
       ORDER BY fecha_inicio DESC, id DESC`,
      [obra_id]
    );

    return res.json(
      rows.map((row) => ({
        ...row,
        total_gastos: Number(row.total_gastos),
        honorarios: Number(row.honorarios),
        total_estimacion: Number(row.total_estimacion)
      }))
    );
  } catch (e) {
    return res.status(500).json({ error: "Error listando estimaciones", details: e.message });
  }
});

// Detalle de estimación con gastos
router.get("/estimaciones/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT id, obra_id, DATE_FORMAT(fecha_inicio, '%Y-%m-%d') AS fecha_inicio,
              DATE_FORMAT(fecha_fin, '%Y-%m-%d') AS fecha_fin, total_gastos, honorarios, total_estimacion,
              creado_en
       FROM estimaciones
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Estimación no encontrada" });
    }

    const estimacion = rows[0];
    const allowed = await ensureObraAsignada(req, estimacion.obra_id);
    if (!allowed) {
      return res.status(403).json({ error: "No tienes acceso a esta obra" });
    }

    const [gastos] = await pool.query(
      `SELECT g.id, DATE_FORMAT(g.fecha, '%Y-%m-%d') AS fecha, g.monto, g.partida, g.descripcion, g.comprobante_url
       FROM estimaciones_gastos eg
       INNER JOIN gastos g ON g.id = eg.gasto_id
       WHERE eg.estimacion_id = ?
       ORDER BY g.fecha DESC, g.id DESC`,
      [id]
    );

    return res.json({
      ...estimacion,
      total_gastos: Number(estimacion.total_gastos),
      honorarios: Number(estimacion.honorarios),
      total_estimacion: Number(estimacion.total_estimacion),
      gastos: gastos.map((g) => ({
        ...g,
        monto: Number(g.monto)
      }))
    });
  } catch (e) {
    return res.status(500).json({ error: "Error obteniendo estimación", details: e.message });
  }
});

module.exports = router;
