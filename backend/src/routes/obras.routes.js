const express = require("express");
const router = express.Router();

const pool = require("../db");
const { requireAuth } = require("../middleware/auth.middleware.js");


//  Crear obra
router.post("/obras", requireAuth, async (req, res) => {
  try {
    const {
      nombre,
      clave,
      direccion = null,
      cliente = null,
      fecha_inicio = null,
      porcentaje_honorarios = null,
      estado = "activa"
    } = req.body;

    if (!nombre || !clave) {
      return res.status(400).json({ error: "nombre y clave son requeridos" });
    }

    const [result] = await pool.query(
      `INSERT INTO obras (nombre, clave, direccion, cliente, fecha_inicio, porcentaje_honorarios, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nombre, clave, direccion, cliente, fecha_inicio, porcentaje_honorarios, estado]
    );

    return res.status(201).json({
      id: result.insertId,
      nombre,
      clave,
      estado
    });
  } catch (e) {
    return res.status(500).json({ error: "Error creando obra", details: e.message });
  }
});

//  Listar obras
router.get("/obras", requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, nombre, clave, direccion, cliente, fecha_inicio, porcentaje_honorarios, estado
       FROM obras
       ORDER BY id DESC`
    );

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
      `SELECT id, nombre, clave, direccion, cliente, fecha_inicio, porcentaje_honorarios, estado
       FROM obras
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Obra no encontrada" });
    }

    return res.json(rows[0]);
  } catch (e) {
    return res.status(500).json({ error: "Error obteniendo obra", details: e.message });
  }
});

//  Editar obra (update parcial)
router.put("/obras/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, clave, direccion, cliente, fecha_inicio, porcentaje_honorarios, estado } = req.body;

    const [result] = await pool.query(
      `UPDATE obras
       SET
         nombre = COALESCE(?, nombre),
         clave = COALESCE(?, clave),
         direccion = COALESCE(?, direccion),
         cliente = COALESCE(?, cliente),
         fecha_inicio = COALESCE(?, fecha_inicio),
         porcentaje_honorarios = COALESCE(?, porcentaje_honorarios),
         estado = COALESCE(?, estado)
       WHERE id = ?`,
      [
        nombre ?? null,
        clave ?? null,
        direccion ?? null,
        cliente ?? null,
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
router.patch("/obras/:id/terminar", requireAuth, async (req, res) => {
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
router.delete("/obras/:id", requireAuth, async (req, res) => {
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

module.exports = router;
