const pool = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// =======================
// LOGIN
// =======================
async function login(req, res) {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res.status(400).json({
        error: "correo y contrasena son requeridos"
      });
    }

    const [rows] = await pool.query(
      "SELECT id, nombre, correo, contrasena, rol, activo FROM usuarios WHERE correo = ? LIMIT 1",
      [correo]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const user = rows[0];

    if (!user.activo) {
      return res.status(403).json({ error: "Usuario inactivo" });
    }

    const ok = await bcrypt.compare(contrasena, user.contrasena);
    if (!ok) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      { id: user.id, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      usuario: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol
      }
    });
  } catch (e) {
    return res.status(500).json({
      error: "Error en login",
      details: e.message
    });
  }
}

// =======================
// REGISTER
// =======================
async function register(req, res) {
  try {
    const { nombre, correo, contrasena, rol } = req.body;

    if (!nombre || !correo || !contrasena) {
      return res.status(400).json({
        error: "nombre, correo y contrasena son requeridos"
      });
    }

    const [exists] = await pool.query(
      "SELECT id FROM usuarios WHERE correo = ? LIMIT 1",
      [correo]
    );

    if (exists.length > 0) {
      return res.status(409).json({
        error: "El correo ya está registrado"
      });
    }

    const hash = await bcrypt.hash(contrasena, 10);

    const [result] = await pool.query(
      `INSERT INTO usuarios (nombre, correo, contrasena, rol, activo)
       VALUES (?, ?, ?, ?, 1)`,
      [nombre, correo, hash, rol || "residente"]
    );

    return res.status(201).json({
      id: result.insertId,
      nombre,
      correo,
      rol: rol || "residente"
    });
  } catch (e) {
    return res.status(500).json({
      error: "Error en registro",
      details: e.message
    });
  }
}

module.exports = {
  login,
  register
};
