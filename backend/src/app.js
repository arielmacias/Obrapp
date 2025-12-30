require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const meRoutes = require("./routes/me.routes");
const obrasRoutes = require("./routes/obras.routes");
const gastosRoutes = require("./routes/gastos.routes");
const cuentasRoutes = require("./routes/cuentas.routes");

const app = express();

// ✅ CORS (permite que el frontend en :5173 hable con el backend en :3000)
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ JSON body
app.use(express.json());

// Health
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Obrapp API running" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", meRoutes);
app.use("/api", obrasRoutes);
app.use("/api", gastosRoutes); // 👈 ESTA LÍNEA ES CLAVE
app.use("/api", cuentasRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});