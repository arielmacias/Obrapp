# MVP — Sistema de Administración de Obras por Administración (Obrapp)

Este documento describe los requerimientos mínimos para el desarrollo del MVP del sistema de administración de obras bajo el modelo “por administración”, donde se cobra un porcentaje sobre los gastos de obra.

---

## 1. Usuarios y Roles

### **Rol Administrador**
- Puede ver y editar:
  - Obras
  - Gastos
  - Pagos
  - Estimaciones
  - Cuentas internas y movimientos
- Puede asignar obras a residentes.
- Puede crear, editar y terminar obras.

### **Rol Residente**
- Puede registrar gastos en las obras asignadas.
- Puede generar estimaciones de sus obras asignadas.
- No puede ver obras no asignadas.

---

## 2. Obras

### **R2 — Alta de obra**
Campos requeridos:
- Nombre de la obra  
- Clave (3 caracteres alfabéticos)  
- Dirección  
- Cliente(s)  
- Responsable(s) de obra  
- Fecha de inicio  
- Porcentaje de honorarios (ej. 10–20%)  
- Estado (activa / terminada)

Acciones:
- Crear obra  
- Editar datos básicos  
- Cambiar estado a “terminada”  

---

## 3. Cuentas Internas y Movimientos

### **R3 — Crear cuentas internas**
- Nombre de la cuenta  
- Descripción (opcional)

### **R4 — Movimientos entre cuentas**
- Registrar transferencias internas:
  - Cuenta origen  
  - Cuenta destino  
  - Monto  
  - Fecha  
  - Descripción  
- Afectan el saldo de ambas cuentas.

---

## 4. Gastos

### **R5 — Registrar gastos**
Campos mínimos:
- Obra  
- Partida (cimentación, estructura, albañilería, instalaciones, etc.)  
- Concepto  
- Monto  
- Fecha  
- Cuenta de salida  
- Adjuntar comprobante (PDF o foto)

Acciones:
- Registrar gasto  
- Ver lista de gastos por obra  
- Filtrar por fecha / partida

Reglas:
- No se pueden registrar gastos en obras terminadas.  
- El monto debe ser positivo.  

---

## 5. Pagos del Cliente

### **R6 — Registrar pagos**
Campos:
- Obra  
- Monto  
- Fecha  
- Cuenta de entrada  
- Observaciones (opcional)

Acciones:
- Registrar pago  
- Ver historial de pagos por obra

---

## 6. Estimaciones

### **R7 — Generar estimación semanal**
Contenido:
- Suma de gastos del período  
- Cálculo de honorarios basado en porcentaje configurado  
- Saldo de obra (pagos vs. gastos + honorarios)  
- Listado de gastos incluidos  
- Opción de generar archivo PDF con anexos  

Acciones:
- Generar estimación  
- Ver estimaciones previas  
- Descargar PDF

Reglas:
- No generar estimación si no hay obra activa.  
- Opcional: permitir seleccionar rango de fechas.  

---

## 7. Requerimientos Técnicos (Nivel MVP)

- Base de datos en MySQL  
- Backend con API REST para:
  - Obras
  - Gastos
  - Pagos
  - Estimaciones
  - Cuentas y movimientos  
- Manejo básico de roles (admin / residente)  
- Endpoints protegidos con autenticación simple (token o JWT, según stack)  
- Frontend funcional, sin necesidad de diseño avanzado (solo usable)

---

## 8. Fuera del Alcance del MVP (pero contemplado para futuro)

- Control de proveedores  
- Reportes avanzados  
- Dashboard financiero  
- Notificaciones o alertas  
- Multiempresa  
- Roles detallados con permisos personalizados  
- App móvil nativa  

---

## 9. Glosario

- **Obra:** Proyecto constructivo administrado.  
- **Partida:** Categoría del gasto (cimentación, albañilería, etc.).  
- **Estimación:** Resumen semanal de gastos + honorarios.  
- **Cuentas internas:** Cuentas que representan flujo de dinero dentro del sistema.  
- **Movimiento:** Transferencia entre cuentas.

---

## 10. Estado del Documento

- Versión: 1.0  
- Última actualización: *pendiente de definir*  
- Autor: Ariel Eduardo Macías Ruiz  
