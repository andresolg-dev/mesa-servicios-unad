# Tareas por Integrante — Mesa de Servicios TecnoColombia S.A.S.
**Proyecto:** Gestión de TI · UNAD 202016904  
**Simulación:** 10 tickets registrados y gestionados durante una semana

---

## Contexto del ejercicio

Cada integrante asume un rol dentro de la Mesa de Servicios. Durante la semana de simulación, se deben registrar en total **al menos 10 tickets**, distribuidos según la tabla de abajo, para demostrar el flujo completo: creación → asignación → resolución/escalado → cierre + encuesta de satisfacción.

Usuarios del sistema:

| Email | Contraseña | Rol | Departamento |
|---|---|---|---|
| guzmanpalaciosmichelcamila@gmail.com | Cliente123! | Cliente | Externo |
| saladeinformaticacoam@gmail.com | Cliente123! | Cliente | Externo |
| pcpaulacorredor1@gmail.com | Tecnico1! | Técnico N1 | Soporte TI |
| jufefiguti123@gmail.com | Tecnico2! | Técnico N2 | Soporte TI |
| andypadilla1810@gmail.com | Tecnico3! | Técnico N3 | Infraestructura |
| andresolgin.rodriguez@gmail.com | Admin123! | Administrador | Dirección TI |

---

## Integrante 1 — Rol: Cliente (`guzmanpalaciosmichelcamila@gmail.com`)

**Responsabilidad:** Crear solicitudes realistas y cerrar el ciclo con evaluación de satisfacción.

### Tareas

1. **Semana 1, Día 1** — Crear ticket de prioridad **Media**, categoría **Software**  
   - Título: "Error al abrir Microsoft Word en equipos del área contable"  
   - Descripción detallada del problema (versión, mensaje de error, equipos afectados).  
   - Verificar que llegue confirmación por correo.

2. **Semana 1, Día 2** — Crear ticket de prioridad **Alta**, categoría **Red / Conectividad**  
   - Título: "Caída de internet en piso 3 — 8 equipos sin acceso"  
   - Incluir horario del incidente y número de usuarios afectados.  
   - Nota: Este ticket debe asignarse automáticamente a **Nivel 2** por las reglas de categoría.

3. **Semana 1, Día 3** — Crear ticket de prioridad **Crítica**, categoría **Aplicación**  
   - Título: "Sistema ERP inaccesible — producción detenida"  
   - Incluir impacto en operaciones.  
   - Nota: Este ticket debe asignarse automáticamente a **Nivel 3**.

4. **Semana 1, Día 5** — Crear ticket de prioridad **Baja**, categoría **Hardware**  
   - Título: "Teclado inalámbrico descargado en sala de reuniones"  
   - Descripción simple y concisa.

5. **Cierre de tickets** — Una vez que cada ticket aparezca como **Resuelto**, entrar al portal y:  
   - Hacer clic en **"Ticket Resuelto — Cerrar y Evaluar"**  
   - Calificar con estrellas (1-5) y dejar comentario de satisfacción.

**Evidencias a guardar:** capturas de pantalla de cada ticket creado y de cada encuesta completada.

---

## Integrante 2 — Rol: Cliente 2 (`saladeinformaticacoam@gmail.com`)

**Responsabilidad:** Crear solicitudes como segundo cliente externo y completar encuestas de satisfacción.

### Tareas

1. **Semana 1, Día 1** — Crear ticket de prioridad **Alta**, categoría **Hardware**
   - Título: "Computadores de la sala de informática no encienden tras corte de luz"
   - Descripción: número de equipos afectados, sala, hora del incidente.
   - Verificar que llegue correo de confirmación.

2. **Semana 1, Día 2** — Crear ticket de prioridad **Media**, categoría **Software**
   - Título: "Licencias de Office vencidas en sala de informática — 15 equipos"
   - Incluir número de serie o fecha de vencimiento si está disponible.

3. **Semana 1, Día 3** — Crear ticket de prioridad **Media**, categoría **Acceso / Permisos**
   - Título: "Estudiantes no pueden acceder al sistema de gestión académica"
   - Describir el mensaje de error y cuántos usuarios están afectados.

4. **Cierre de tickets** — Una vez que cada ticket aparezca como **Resuelto**:
   - Hacer clic en **"Cerrar y evaluar servicio"**
   - Calificar con estrellas y dejar comentario de satisfacción.

**Evidencias a guardar:** capturas de los tickets creados, del estado "Resuelto" y de las encuestas completadas.

---

## Integrante 3 — Rol: Técnico N1 (`pcpaulacorredor1@gmail.com`)  

**Responsabilidad:** Atender tickets de Nivel 1, escalar los que superen su alcance, y agregar notas internas.

### Tareas

1. **Semana 1, Días 1-2** — Acceder a la lista de tickets → filtrar por **Nivel 1** y estado **Abierto**.  
   - Tomar (asignarse) el ticket de prioridad Media (Software) creado por el cliente.  
   - Agregar un comentario interno: diagnóstico inicial y pasos de resolución.  
   - Marcar como **Resuelto** una vez solucionado con nota de solución aplicada.

2. **Semana 1, Días 2-3** — Tomar el ticket de prioridad Alta (Red) que llega escalado a N2:  
   - Este ticket llega directamente a N2, **no aplica para N1**. Si aparece en la cola de N1, documentar por qué (revisar regla de asignación).

3. **Semana 1, Día 3** — Crear un nuevo ticket propio de prueba:  
   - Prioridad **Media**, categoría **Acceso / Permisos**  
   - Título: "Usuario sin acceso a carpeta compartida de Finanzas"  
   - Tomarla y resolverla con comentario de solución.

4. **Semana 1, Día 4** — Tomar ticket de prioridad **Baja** (Hardware — teclado) y resolverlo.

5. **Escalado** — Crear un ticket de prioridad **Alta**, categoría **Software**, tomarlo y luego escalarlo a N2 con razón: "Requiere acceso a servidor de aplicaciones".

**Evidencias:** capturas del tablero N1 con tickets tomados, comentarios internos y escalados.

---

## Integrante 4 — Rol: Técnico N2 (`jufefiguti123@gmail.com`)

**Responsabilidad:** Atender tickets escalados a N2, resolver incidentes de red/aplicaciones, escalar a N3 si es necesario.

### Tareas

1. **Semana 1, Día 2** — Revisar la cola de Nivel 2 → tomar el ticket de **Alta / Red** que llegó automáticamente.  
   - Agregar diagnóstico interno (herramientas usadas, causa raíz).  
   - Resolver con descripción técnica de la solución.

2. **Semana 1, Día 3** — Recibir el ticket escalado por N1 (Alta / Software, acceso a servidor).  
   - Tomar y resolver con nota de los permisos configurados.

3. **Semana 1, Día 4** — Crear un nuevo ticket de prueba:  
   - Prioridad **Alta**, categoría **Aplicación**  
   - Título: "Módulo de reportes del ERP genera errores 500 en horas pico"  
   - Tomar y escalar a N3 con razón técnica.

4. **Semana 1, Día 5** — Tomar cualquier ticket abierto en N2 restante y resolverlo.

5. **Revisión de SLA** — Verificar en el panel de KPIs que los tickets atendidos cumplen los tiempos de SLA.  
   - Si alguno está en riesgo, documentar el porqué.

**Evidencias:** capturas del panel de N2, tickets resueltos y escalado a N3.

---

## Integrante 5 — Rol: Técnico N3 (`andypadilla1810@gmail.com`)

**Responsabilidad:** Gestionar incidentes críticos y de mayor complejidad técnica.

### Tareas

1. **Semana 1, Día 3** — Recibir el ticket **Crítico / Aplicación** (ERP inaccesible).  
   - Tomar inmediatamente (SLA: 15 min respuesta / 2 h resolución).  
   - Documentar causa raíz y pasos de restauración del servicio.  
   - Resolver y notificar al cliente con nota detallada.

2. **Semana 1, Día 4** — Recibir el ticket escalado por N2 (ERP / errores 500 en reportes).  
   - Tomar, analizar y resolver con nota técnica completa.

3. **Semana 1, Día 5** — Crear un ticket de prueba propio:  
   - Prioridad **Crítica**, categoría **Red / Conectividad**  
   - Título: "Falla en switch core — 3 subredes sin conectividad"  
   - Tomar y resolver documentando el procedimiento de restablecimiento.

4. **Revisión de historial de escalados** — En la vista de detalle de cada ticket, revisar la sección "Historial de escalados" y verificar que los niveles y fechas son correctos.

5. **KPIs** — Acceder a la sección **KPIs & Métricas** y documentar:  
   - Porcentaje de cumplimiento de SLA.  
   - Distribución por prioridad.  
   - Promedio de satisfacción.

**Evidencias:** capturas de tickets críticos resueltos, historial de escalados y panel de KPIs.

---

## Integrante 6 — Rol: Administrador (`andresolgin.rodriguez@gmail.com`)

**Responsabilidad:** Configurar el sistema, gestionar usuarios, validar reglas de asignación y revisar reportes.

### Tareas

1. **Semana 1, Día 1 — Configuración inicial**  
   - Acceder a `/admin` → verificar que los 5 usuarios existen con los roles correctos.  
   - Cambiar el rol de un usuario de prueba (ej. cambiarlo a `tecnico_n2` y luego devolverlo).  
   - Desactivar y reactivar un usuario para probar la funcionalidad.

2. **Semana 1, Día 1 — Validar reglas de asignación**  
   - Revisar la tabla "Reglas de Asignación por Categoría" en `/admin`.  
   - Crear un ticket de prueba con prioridad **Crítica** y verificar que se asigna a N3.  
   - Crear un ticket con prioridad **Alta + Aplicación** y verificar que va a N2.  
   - Crear un ticket con prioridad **Media** y verificar que va a N1.

3. **Semana 1, Días 3-4 — Supervisión de SLA**  
   - Acceder a `/kpis` y tomar captura del tablero.  
   - Verificar que los tickets críticos fueron atendidos dentro del SLA de 2 horas.  
   - Documentar cualquier incumplimiento de SLA y su causa.

4. **Semana 1, Día 5 — Informe de cierre**  
   - Revisar el dashboard principal (`/dashboard`): gráfico de tendencia semanal, distribución por categoría.  
   - En `/kpis`: exportar (captura) los indicadores finales:  
     - Total de tickets, % de resolución, % cumplimiento SLA, NPS / satisfacción promedio.

5. **Configurar notificaciones por correo** (opcional para entrega):  
   - Actualizar `EMAIL_USER` y `EMAIL_PASS` en `.env.local` con credenciales reales de Gmail.  
   - Crear una [contraseña de aplicación](https://myaccount.google.com/apppasswords) si se usa autenticación de dos factores.  
   - Verificar que al crear un ticket llegue el correo de confirmación.

**Evidencias:** capturas del panel de administración, cambios de rol, y dashboard de KPIs con datos finales.

---

## Resumen de tickets a crear (mínimo 10)

| # | Prioridad | Categoría | Creado por | Atendido por | Estado final |
|---|---|---|---|---|---|
| 1 | Media | Software | Cliente | Técnico N1 | Cerrado + encuesta |
| 2 | Alta | Red | Cliente | Técnico N2 (auto) | Cerrado + encuesta |
| 3 | Crítica | Aplicación | Cliente | Técnico N3 (auto) | Cerrado + encuesta |
| 4 | Baja | Hardware | Cliente | Técnico N1 | Cerrado + encuesta |
| 5 | Media | Acceso | Técnico N1 | Técnico N1 | Cerrado |
| 6 | Alta | Software | Técnico N1 | N1 → escala N2 | Cerrado |
| 7 | Alta | Aplicación | Técnico N2 | N2 → escala N3 | Cerrado |
| 8 | Crítica | Red | Técnico N3 | Técnico N3 | Cerrado |
| 9 | Crítica | Aplicación | Admin (prueba) | Técnico N3 | Cerrado |
| 10 | Alta | Aplicación | Admin (prueba) | Técnico N2 (auto) | Cerrado |

---

## Flujo esperado de un ticket completo

```
[Cliente crea ticket]
        ↓
[Sistema asigna nivel automáticamente según reglas]
        ↓
[Técnico del nivel correspondiente toma el ticket]
        ↓
        ├─ [Resuelve] → Estado: Resuelto → Cliente evalúa → Estado: Cerrado
        └─ [Escala]   → Estado: Escalado → Técnico N+1 toma → ...
```

---

## Criterios de evaluación (basados en guía UNAD Fase 4)

- [ ] Al menos 10 tickets con ciclo completo documentado
- [ ] Escalados entre niveles (N1→N2, N2→N3) con razón registrada
- [ ] SLA respetado para al menos el 80% de tickets
- [ ] Encuestas de satisfacción completadas por el cliente
- [ ] Panel de KPIs con datos reales exportados
- [ ] Reglas de asignación automática validadas con evidencia
- [ ] Notificaciones por correo configuradas (opcional +bonus)
