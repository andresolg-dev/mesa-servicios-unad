import { TicketForm } from '@/components/ticket-form'

export default function NewTicketPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Crear Nuevo Ticket</h1>
        <p className="text-muted-foreground">
          Reporte un incidente o solicitud de servicio
        </p>
      </div>

      <TicketForm />
    </div>
  )
}
