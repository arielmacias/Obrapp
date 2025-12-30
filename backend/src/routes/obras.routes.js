const express = require("express");
const router = express.Router();

const pool = require("../db");
const { requireAuth } = require("../middleware/auth.middleware.js");
const { requireAdmin } = require("../middleware/roles.middleware.js");

async function ensureObraAsignada(req, res, obraId) {
  const [rows] = await pool.query(
    `SELECT 1 FROM usuarios_obras WHERE usuario_id = ? AND obra_id = ? LIMIT 1`,
    [req.user.id, obraId]
  );
  if (rows.length === 0) {
    res.status(403).json({ error: "No tienes acceso a esta obra" });
    return false;
  }
  return true;
}

//  Crear obra (solo admin)
router.post("/obras", requireAuth, requireAdmin, async (req, res) => {
  try {
    const {
      nombre,
      clave,
      direccion = null,
      cliente = null,
      responsable = null,
      fecha_inicio = null,
      porcentaje_honorarios = null,
      estado = "activa"
    } = req.body;

    if (!nombre || !clave || !cliente || !responsable || !fecha_inicio || porcentaje_honorarios == null) {
      return res.status(400).json({
        error: "nombre, clave, cliente, responsable, fecha_inicio y porcentaje_honorarios son requeridos"
      });
    }

    if (!/^[A-Za-z]{3}$/.test(clave)) {
      return res.status(400).json({ error: "clave debe tener 3 caracteres alfabéticos" });
    }

    const [result] = await pool.query(
      `INSERT INTO obras (nombre, clave, direccion, cliente, responsable, fecha_inicio, porcentaje_honorarios, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, clave.toUpperCase(), direccion, cliente, responsable, fecha_inicio, porcentaje_honorarios, estado]
    );

    return res.status(201).json({
      id: result.insertId,
      nombre,
      clave: clave.toUpperCase(),
      estado
    });
  } catch (e) {
    return res.status(500).json({ error: "Error creando obra", details: e.message });
  }
});

//  Listar obras
router.get("/obras", requireAuth, async (req, res) => {
  try {
    let rows = [];

    if (req.user.rol === "residente") {
      const [assigned] = await pool.query(
        `SELECT o.id, o.nombre, o.clave, o.direccion, o.cliente, o.responsable, o.fecha_inicio, o.porcentaje_honorarios, o.estado
         FROM obras o
         INNER JOIN usuarios_obras uo ON uo.obra_id = o.id
         WHERE uo.usuario_id = ?
         ORDER BY o.id DESC`,
        [req.user.id]
      );
      rows = assigned;
    } else {
      const [all] = await pool.query(
        `SELECT id, nombre, clave, direccion, cliente, responsable, fecha_inicio, porcentaje_honorarios, estado
         FROM obras
         ORDER BY id DESC`
      );
      rows = all;
    }

    return res.json(rows);
  } catch (e) {
    return res.status(500).json({ error: "Error listando obras", details: e.message });
  }
});

//  Detalle de obra por id
router.get("/obras/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT id, nombre, clave, direccion, cliente, responsable, fecha_inicio, porcentaje_honorarios, estado
       FROM obras
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Obra no encontrada" });
    }

    if (req.user.rol === "residente") {
      const ok = await ensureObraAsignada(req, res, id);
      if (!ok) return;
    }

    return res.json(rows[0]);
  } catch (e) {
    return res.status(500).json({ error: "Error obteniendo obra", details: e.message });
  }
});

//  Editar obra (update parcial)
router.put("/obras/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, clave, direccion, cliente, responsable, fecha_inicio, porcentaje_honorarios, estado } = req.body;

    if (clave && !/^[A-Za-z]{3}$/.test(clave)) {
      return res.status(400).json({ error: "clave debe tener 3 caracteres alfabéticos" });
    }

    const [result] = await pool.query(
      `UPDATE obras
       SET
         nombre = COALESCE(?, nombre),
         clave = COALESCE(?, clave),
         direccion = COALESCE(?, direccion),
         cliente = COALESCE(?, cliente),
         responsable = COALESCE(?, responsable),
         fecha_inicio = COALESCE(?, fecha_inicio),
         porcentaje_honorarios = COALESCE(?, porcentaje_honorarios),
         estado = COALESCE(?, estado)
       WHERE id = ?`,
      [
        nombre ?? null,
        clave ? clave.toUpperCase() : null,
        direccion ?? null,
        cliente ?? null,
        responsable ?? null,
        fecha_inicio ?? null,
        porcentaje_honorarios ?? null,
        estado ?? null,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Obra no encontrada" });
    }

    return res.json({ ok: true, id: Number(id) });
  } catch (e) {
    return res.status(500).json({ error: "Error actualizando obra", details: e.message });
  }
});

//  Terminar obra (PATCH)
router.patch("/obras/:id/terminar", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      `UPDATE obras
       SET estado = 'terminada'
       WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Obra no encontrada" });
    }

    return res.json({ ok: true, id: Number(id), estado: "terminada" });
  } catch (e) {
    return res.status(500).json({ error: "Error terminando obra", details: e.message });
  }
});

//  "Eliminar" obra (DELETE lógico) -> marcar como terminada
router.delete("/obras/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      `UPDATE obras
       SET estado = 'terminada'
       WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Obra no encontrada" });
    }

    return res.json({ ok: true, id: Number(id), estado: "terminada" });
  } catch (e) {
    return res.status(500).json({ error: "Error eliminando obra", details: e.message });
  }
});

// Asignar obra a residente
router.post("/obras/:id/asignar", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario_id } = req.body;

    if (!usuario_id) {
      return res.status(400).json({ error: "usuario_id es requerido" });
    }

    const [obraRows] = await pool.query(
      "SELECT id FROM obras WHERE id = ? LIMIT 1",
      [id]
    );
    if (obraRows.length === 0) {
      return res.status(404).json({ error: "Obra no encontrada" });
    }

    const [usuarioRows] = await pool.query(
      "SELECT id, rol FROM usuarios WHERE id = ? LIMIT 1",
      [usuario_id]
    );
    if (usuarioRows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    if (usuarioRows[0].rol !== "residente") {
      return res.status(400).json({ error: "Solo se pueden asignar usuarios residentes" });
    }

    await pool.query(
      `INSERT INTO usuarios_obras (usuario_id, obra_id)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE usuario_id = VALUES(usuario_id)`,
      [usuario_id, id]
    );

    return res.json({ ok: true, obra_id: Number(id), usuario_id: Number(usuario_id) });
  } catch (e) {
    return res.status(500).json({ error: "Error asignando obra", details: e.message });
  }
});

// Listar residentes asignados a una obra
router.get("/obras/:id/residentes", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT u.id, u.nombre, u.correo
       FROM usuarios_obras uo
       INNER JOIN usuarios u ON u.id = uo.usuario_id
       WHERE uo.obra_id = ?
       ORDER BY u.nombre ASC`,
      [id]
    );

    return res.json(rows);
  } catch (e) {
    return res.status(500).json({ error: "Error listando residentes", details: e.message });
  }
});

module.exports = router;
