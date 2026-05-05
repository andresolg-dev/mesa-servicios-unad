import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'Mesa de Servicios TecnoColombia <onboarding@resend.dev>'

function baseTemplate(title: string, body: string) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f7; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: #1e40af; color: #fff; padding: 24px 32px; }
    .header h2 { margin: 0; font-size: 20px; }
    .body { padding: 28px 32px; color: #374151; line-height: 1.6; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; }
    .badge-alta { background: #fef3c7; color: #92400e; }
    .badge-critica { background: #fee2e2; color: #991b1b; }
    .badge-media { background: #fff3cd; color: #856404; }
    .badge-baja { background: #d1fae5; color: #065f46; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; }
    td:first-child { font-weight: 600; color: #6b7280; width: 40%; }
    .footer { background: #f9fafb; padding: 16px 32px; font-size: 12px; color: #9ca3af; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h2>${title}</h2></div>
    <div class="body">${body}</div>
    <div class="footer">Mesa de Servicios TecnoColombia S.A.S &bull; Notificación automática</div>
  </div>
</body>
</html>`
}

interface TicketInfo {
  ticketNumber: string
  title: string
  category: string
  priority: string
  status: string
  createdByName: string
  createdByEmail: string
  assignedToName?: string
  assignedLevel?: string
}

function priorityLabel(p: string) {
  const map: Record<string, string> = { critica: 'Crítica', alta: 'Alta', media: 'Media', baja: 'Baja' }
  return map[p] || p
}

function categoryLabel(c: string) {
  const map: Record<string, string> = {
    hardware: 'Hardware', software: 'Software', red: 'Red / Conectividad',
    acceso: 'Acceso / Permisos', correo: 'Correo electrónico',
    aplicacion: 'Aplicación', otro: 'Otro',
  }
  return map[c] || c
}

async function send(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) return
  try {
    await resend.emails.send({ from: FROM, to, subject, html })
  } catch (err) {
    console.error('Email send error:', err)
  }
}

export async function sendTicketCreated(ticket: TicketInfo) {
  const body = `
    <p>Hola <strong>${ticket.createdByName}</strong>,</p>
    <p>Tu solicitud ha sido registrada en la Mesa de Servicios. Te informaremos cuando sea atendida.</p>
    <table>
      <tr><td>N° Ticket</td><td><strong>${ticket.ticketNumber}</strong></td></tr>
      <tr><td>Título</td><td>${ticket.title}</td></tr>
      <tr><td>Categoría</td><td>${categoryLabel(ticket.category)}</td></tr>
      <tr><td>Prioridad</td><td><span class="badge badge-${ticket.priority}">${priorityLabel(ticket.priority)}</span></td></tr>
    </table>
  `
  await send(ticket.createdByEmail, `[${ticket.ticketNumber}] Ticket creado`, baseTemplate('Ticket Creado', body))
}

export async function sendTicketAssigned(ticket: TicketInfo, techEmail: string) {
  const body = `
    <p>Hola <strong>${ticket.assignedToName}</strong>,</p>
    <p>Se te ha asignado el siguiente ticket. Por favor, atiéndelo según los tiempos de SLA correspondientes.</p>
    <table>
      <tr><td>N° Ticket</td><td><strong>${ticket.ticketNumber}</strong></td></tr>
      <tr><td>Título</td><td>${ticket.title}</td></tr>
      <tr><td>Categoría</td><td>${categoryLabel(ticket.category)}</td></tr>
      <tr><td>Prioridad</td><td><span class="badge badge-${ticket.priority}">${priorityLabel(ticket.priority)}</span></td></tr>
      <tr><td>Solicitante</td><td>${ticket.createdByName}</td></tr>
    </table>
  `
  await send(techEmail, `[${ticket.ticketNumber}] Nuevo ticket asignado`, baseTemplate('Ticket Asignado', body))
}

export async function sendTicketEscalated(ticket: TicketInfo, newLevelLabel: string) {
  const body = `
    <p>Hola <strong>${ticket.createdByName}</strong>,</p>
    <p>Tu ticket ha sido escalado a un nivel de soporte superior para garantizar la mejor atención posible.</p>
    <table>
      <tr><td>N° Ticket</td><td><strong>${ticket.ticketNumber}</strong></td></tr>
      <tr><td>Título</td><td>${ticket.title}</td></tr>
      <tr><td>Nuevo nivel</td><td>${newLevelLabel}</td></tr>
    </table>
  `
  await send(ticket.createdByEmail, `[${ticket.ticketNumber}] Ticket escalado`, baseTemplate('Ticket Escalado', body))
}

export async function sendTicketResolved(ticket: TicketInfo) {
  const body = `
    <p>Hola <strong>${ticket.createdByName}</strong>,</p>
    <p>Tu ticket ha sido marcado como <strong>resuelto</strong>. Ingresa al portal para evaluarlo y cerrarlo.</p>
    <table>
      <tr><td>N° Ticket</td><td><strong>${ticket.ticketNumber}</strong></td></tr>
      <tr><td>Título</td><td>${ticket.title}</td></tr>
      <tr><td>Resuelto por</td><td>${ticket.assignedToName || '—'}</td></tr>
    </table>
  `
  await send(ticket.createdByEmail, `[${ticket.ticketNumber}] Ticket resuelto`, baseTemplate('Ticket Resuelto', body))
}
