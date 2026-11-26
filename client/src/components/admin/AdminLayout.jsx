import { ClipboardList, LayoutDashboard, ListOrdered, Trophy, Users } from 'lucide-react';
import { PanelLayout } from '../panel/PanelLayout.jsx';

export const SECCIONES_ADMIN = [
  { to: '/admin', label: 'Resumen', icono: LayoutDashboard, end: true },
  { to: '/admin/torneos', label: 'Torneos', icono: Trophy },
  { to: '/admin/inscripciones', label: 'Inscripciones', icono: ClipboardList },
  { to: '/admin/resultados', label: 'Resultados', icono: ListOrdered },
  { to: '/admin/usuarios', label: 'Usuarios', icono: Users },
];

/** Panel de administración (/admin). */
export function AdminLayout() {
  return <PanelLayout secciones={SECCIONES_ADMIN} etiqueta="Admin" rolLegible="Administrador" inicio="/admin" />;
}
