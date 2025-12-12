-- ==========================================================
--  DATABASE INIT
-- ==========================================================
CREATE DATABASE IF NOT EXISTS obrapp_mvp
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_general_ci;

USE obrapp_mvp;

-- ==========================================================
--  USERS (ADMIN / RESIDENTE)
-- ==========================================================
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'residente') NOT NULL DEFAULT 'residente',
    activo TINYINT(1) NOT NULL DEFAULT 1,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
--  OBRAS
-- ==========================================================
CREATE TABLE obras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    clave CHAR(3) NOT NULL UNIQUE,
    direccion VARCHAR(255),
    cliente VARCHAR(150),
    responsable VARCHAR(150),
    fecha_inicio DATE,
    porcentaje_honorarios DECIMAL(5,2) NOT NULL,
    estado ENUM('activa', 'terminada') NOT NULL DEFAULT 'activa',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
--  RELACIÓN USUARIO–OBRA (ASIGNACIÓN DE RESIDENTES)
-- ==========================================================
CREATE TABLE usuarios_obras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    obra_id INT NOT NULL,
    UNIQUE(usuario_id, obra_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (obra_id) REFERENCES obras(id)
);

-- ==========================================================
--  CUENTAS INTERNAS
-- ==========================================================
CREATE TABLE cuentas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    activa TINYINT(1) NOT NULL DEFAULT 1,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
--  MOVIMIENTOS ENTRE CUENTAS
-- ==========================================================
CREATE TABLE movimientos_cuentas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cuenta_origen INT NOT NULL,
    cuenta_destino INT NOT NULL,
    monto DECIMAL(12,2) NOT NULL,
    fecha DATE NOT NULL,
    nota VARCHAR(255),

    FOREIGN KEY (cuenta_origen) REFERENCES cuentas(id),
    FOREIGN KEY (cuenta_destino) REFERENCES cuentas(id)
);

-- ==========================================================
--  GASTOS
-- ==========================================================
CREATE TABLE gastos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    obra_id INT NOT NULL,
    fecha DATE NOT NULL,
    monto DECIMAL(12,2) NOT NULL,
    cuenta_id INT NOT NULL,
    partida VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    usuario_id INT NOT NULL,

    FOREIGN KEY (obra_id) REFERENCES obras(id),
    FOREIGN KEY (cuenta_id) REFERENCES cuentas(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),

    INDEX(obra_id),
    INDEX(fecha)
);

-- ==========================================================
--  PAGOS DEL CLIENTE
-- ==========================================================
CREATE TABLE pagos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    obra_id INT NOT NULL,
    fecha DATE NOT NULL,
    monto DECIMAL(12,2) NOT NULL,
    cuenta_id INT NOT NULL,
    descripcion VARCHAR(255),

    FOREIGN KEY (obra_id) REFERENCES obras(id),
    FOREIGN KEY (cuenta_id) REFERENCES cuentas(id)
);

-- ==========================================================
--  ESTIMACIONES
-- ==========================================================
CREATE TABLE estimaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    obra_id INT NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    total_gastos DECIMAL(12,2) NOT NULL,
    honorarios DECIMAL(12,2) NOT NULL,
    total_estimacion DECIMAL(12,2) NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (obra_id) REFERENCES obras(id)
);

-- ==========================================================
--  DETALLE DE GASTOS INCLUIDOS EN UNA ESTIMACIÓN
-- ==========================================================
CREATE TABLE estimaciones_gastos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estimacion_id INT NOT NULL,
    gasto_id INT NOT NULL,

    UNIQUE(estimacion_id, gasto_id),

    FOREIGN KEY (estimacion_id) REFERENCES estimaciones(id),
    FOREIGN KEY (gasto_id) REFERENCES gastos(id)
);

