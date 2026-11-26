import { LayoutDashboard, ListOrdered, ShieldCheck, Trophy, Users } from 'lucide-react';
import { PanelLayout } from '../panel/PanelLayout.jsx';

// Las inscripciones se gestionan dentro de cada torneo (pestaña "Inscritos")
export const SECCIONES_ADMIN = [
  { to: '/admin', label: 'Resumen', icono: LayoutDashboard, end: true },
  { to: '/admin/torneos', label: 'Torneos', icono: Trophy },
  { to: '/admin/atletas', label: 'Atletas', icono: Users },
  { to: '/admin/resultados', label: 'Resultados', icono: ListOrdered },
  { to: '/admin/usuarios', label: 'Usuarios', icono: ShieldCheck },
];

/** Panel de administración (/admin). */
export function AdminLayout() {
  return <PanelLayout secciones={SECCIONES_ADMIN} etiqueta="Admin" rolLegible="Administrador" inicio="/admin" />;
}
