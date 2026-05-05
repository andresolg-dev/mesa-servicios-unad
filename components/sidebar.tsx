'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'
import { ROLE_LABELS } from '@/lib/types'
import {
  LayoutDashboard,
  Ticket,
  UserCog,
  BarChart3,
  User,
  LogOut,
  ChevronDown,
} from 'lucide-react'
import { useState } from 'react'

interface ChildItem {
  href: string
  label: string
}

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  children?: ChildItem[]
}

function TcLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <line x1="4.5" y1="8" x2="19.5" y2="8" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="12" y1="8" x2="12" y2="18" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="4.5" cy="8" r="1.8" fill="#FFB800" />
      <circle cx="19.5" cy="8" r="1.8" fill="white" fillOpacity="0.85" />
      <circle cx="12" cy="18" r="1.8" fill="white" fillOpacity="0.6" />
    </svg>
  )
}

function NavLink({ href, label, icon: Icon, children, pathname }: NavItem & { pathname: string }) {
  const isActive =
    pathname === href ||
    (href !== '/dashboard' && href !== '#' && pathname.startsWith(href))

  const hasActiveChild = children?.some(
    (c) => pathname === c.href || pathname.startsWith(c.href.split('?')[0])
  )

  const [open, setOpen] = useState<boolean>(!!hasActiveChild)

  if (children) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
            hasActiveChild
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">{label}</span>
          <ChevronDown className={cn('h-3 w-3 transition-transform', open && 'rotate-180')} />
        </button>
        {open && (
          <div className="mt-1 ml-4 space-y-0.5 border-l border-border pl-3">
            {children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  'flex items-center py-1.5 px-2 rounded text-sm transition-colors',
                  pathname === child.href || pathname.startsWith(child.href.split('?')[0] + '/')
                    ? 'text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {child.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  )
}

export function Sidebar() {
  const { user, signOut } = useAuth()
  const pathname = usePathname()

  const isAdmin = user?.role === 'admin'
  const isTechnician = user?.role?.startsWith('tecnico') || isAdmin

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-60 bg-card border-r border-border flex flex-col">

      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-border shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm shadow-primary/30">
          <TcLogo />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-sm leading-tight tracking-tight truncate">TecnoColombia</span>
          <span className="text-[10px] text-muted-foreground leading-tight">S.A.S · Mesa de Servicios</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">

        {/* Principal */}
        <div>
          <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            Principal
          </p>
          <div className="space-y-0.5">
            <NavLink href="/dashboard" label="Overview" icon={LayoutDashboard} pathname={pathname} />
            <NavLink
              href="/tickets"
              label="Tickets"
              icon={Ticket}
              pathname={pathname}
              children={[
                { href: '/tickets', label: 'Todos / Mi Cola' },
                { href: '/tickets/new', label: 'Nuevo Ticket' },
              ]}
            />
          </div>
        </div>

        {/* Gestión — solo admin */}
        {isAdmin && (
          <div>
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
              Gestión
            </p>
            <div className="space-y-0.5">
              <NavLink href="/admin" label="Usuarios & Roles" icon={UserCog} pathname={pathname} />
            </div>
          </div>
        )}

        {/* Analítica — técnicos y admin */}
        {isTechnician && (
          <div>
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
              Analítica
            </p>
            <div className="space-y-0.5">
              <NavLink href="/kpis" label="KPIs & Métricas" icon={BarChart3} pathname={pathname} />
            </div>
          </div>
        )}

        {/* Cuenta */}
        <div>
          <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            Cuenta
          </p>
          <div className="space-y-0.5">
            <NavLink href="/profile" label="Mi Perfil" icon={User} pathname={pathname} />
          </div>
        </div>

      </nav>

      {/* User row */}
      <div className="border-t border-border p-3 shrink-0">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
            {user?.displayName?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate leading-tight">{user?.displayName}</p>
            <p className="text-[11px] text-muted-foreground truncate">
              {user?.role ? ROLE_LABELS[user.role] : ''}
            </p>
          </div>
          <button
            onClick={() => signOut()}
            className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
            title="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
