# US-01 – Registrar gasto

## Endpoint
POST /api/gastos

## Autenticación
Requiere token JWT

## Body
- obra_id (int, requerido)
- fecha (date, requerido)
- monto (decimal, requerido)
- cuenta_id (int, requerido)
- partida (string, requerido)
- descripcion (string, opcional)

## Ejemplo request
{ ... }

## Ejemplo response
{ ... }

## Errores
400 – Campos obligatorios faltantes  
500 – Error creando gasto
