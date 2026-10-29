import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Shield, 
  Plus, 
  Download, 
  Edit3, 
  Key, 
  Check, 
  Lock,
  Mail,
  User as UserIcon
} from 'lucide-react';
import { StatCard } from '../components/molecules/StatCard';
import { SearchBar } from '../components/molecules/SearchBar';
import { Pagination } from '../components/molecules/Pagination';
import { Drawer } from '../components/molecules/Drawer';
import { Modal } from '../components/molecules/Modal';
import { Button } from '../components/atoms/Button';
import { Badge } from '../components/atoms/Badge';
import { Input } from '../components/atoms/Input';
import { Select } from '../components/atoms/Select';
import { Avatar } from '../components/atoms/Avatar';
import { useData } from '../context/DataContext';
import { User, ModuleName, ModulePermission, UserRole } from '../types';
import { exportToCSV } from '../utils/exportUtils';

const DEFAULT_MODULES: ModuleName[] = [
  'Dashboard',
  'Gestión de clientes',
  'Convenios de pago',
  'Reportes de cartera vencida',
  'Seguimiento de gestores de cobro',
];

export const UsuariosPage: React.FC = () => {
  const { users, addUser, updateUserPermissions } = useData();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('Todos');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Drawer & Modal States
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form State for User Creation
  const [userData, setUserData] = useState({
    name: 'Andrea Morales',
    username: 'amorales',
    email: 'andrea.morales@jme.com.gt',
    role: 'Gestor de Cobro' as UserRole,
    password: 'password123',
    status: 'Activo' as const,
  });

  // Permission Matrix State for Form
  const [permissions, setPermissions] = useState<ModulePermission[]>(
    DEFAULT_MODULES.map(m => ({
      module: m,
      view: true,
      create: m === 'Gestión de clientes' || m === 'Convenios de pago',
      edit: m === 'Gestión de clientes',
      delete: false,
    }))
  );

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'Todos' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'Todos' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleTogglePermission = (
    module: ModuleName,
    action: 'view' | 'create' | 'edit' | 'delete'
  ) => {
    setPermissions(prev =>
      prev.map(p => (p.module === module ? { ...p, [action]: !p[action] } : p))
    );
  };

  const handleToggleAllPermissions = (checked: boolean) => {
    setPermissions(prev =>
      prev.map(p => ({
        ...p,
        view: checked,
        create: checked,
        edit: checked,
        delete: checked,
      }))
    );
  };

  const areAllPermissionsChecked = permissions.every(
    p => p.view && p.create && p.edit && p.delete
  );

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUserPermissions(editingUser.id, permissions);
      setEditingUser(null);
    } else {
      addUser({
        name: userData.name,
        username: userData.username,
        email: userData.email,
        role: userData.role,
        status: userData.status,
        avatar: userData.name.slice(0, 2).toUpperCase(),
        permissions,
      });
      setIsNewUserModalOpen(false);
    }
  };

  const openEditPermissions = (user: User) => {
    setEditingUser(user);
    if (user.permissions && user.permissions.length > 0) {
      setPermissions(user.permissions);
    } else {
      setPermissions(
        DEFAULT_MODULES.map(m => ({
          module: m,
          view: true,
          create: false,
          edit: false,
          delete: false,
        }))
      );
    }
  };

  const handleExportCSV = () => {
    const headers = ['Usuario', 'Nombre', 'Email', 'Rol', 'Estado', 'Último Acceso'];
    const rows = filteredUsers.map(u => [
      u.username,
      u.name,
      u.email,
      u.role,
      u.status,
      u.lastAccess,
    ]);
    exportToCSV('JME_Usuarios_Permisos', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Usuarios y permisos
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Administra los usuarios del sistema, sus roles y permisos de acceso.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingUser(null);
              setIsNewUserModalOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Nuevo usuario
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Exportar
          </Button>
        </div>
      </div>

      {/* 4 KPIs matching PDF Page 2 Bottom */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total de usuarios"
          value="28"
          icon={<Users className="w-5 h-5" />}
          iconColor="blue"
          subtitle="Cuentas registradas"
        />

        <StatCard
          label="Activos"
          value="22"
          icon={<UserCheck className="w-5 h-5" />}
          iconColor="emerald"
          subtitle="Sesiones autorizadas"
        />

        <StatCard
          label="Inactivos"
          value="6"
          icon={<UserX className="w-5 h-5" />}
          iconColor="rose"
          subtitle="Acceso revocado o suspendido"
        />

        <StatCard
          label="Roles"
          value="4"
          icon={<Shield className="w-5 h-5" />}
          iconColor="purple"
          subtitle="Perfiles jerárquicos de seguridad"
        />
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
        <div className="flex-1">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar usuario por nombre o correo..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="w-40">
            <Select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              options={[
                { value: 'Todos', label: 'Rol: Todos' },
                { value: 'Administrador', label: 'Administrador' },
                { value: 'Gestor de Cobro', label: 'Gestor de Cobro' },
                { value: 'Supervisor', label: 'Supervisor' },
                { value: 'Consultor', label: 'Consultor' },
              ]}
            />
          </div>

          <div className="w-36">
            <Select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              options={[
                { value: 'Todos', label: 'Estado: Todos' },
                { value: 'Activo', label: 'Activo' },
                { value: 'Inactivo', label: 'Inactivo' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Users Data Table matching PDF Page 2 Bottom */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Usuario</th>
                <th className="py-3 px-4">Nombre</th>
                <th className="py-3 px-4">Rol</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Último acceso</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedUsers.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-slate-800">
                    <div className="flex items-center gap-2.5">
                      <Avatar
                        initials={u.avatar || u.name.slice(0, 2).toUpperCase()}
                        size="xs"
                        className="bg-slate-800 text-white font-bold"
                      />
                      <span>{u.username}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {u.name}
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    {u.role}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={u.status === 'Activo' ? 'success' : 'danger'}>
                      {u.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">
                    {u.lastAccess}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => openEditPermissions(u)}
                        className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded-md transition-colors"
                        title="Modificar permisos granulares"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination matching PDF: "Mostrando 1 a 7 de 28 usuarios" */}
        <div className="px-4 border-t border-slate-100">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredUsers.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            itemLabel="usuarios"
          />
        </div>
      </div>

      {/* Drawer / Modal: Nuevo usuario & Matriz granular de permisos matching PDF Page 2 Bottom Right */}
      <Drawer
        isOpen={isNewUserModalOpen || !!editingUser}
        onClose={() => {
          setIsNewUserModalOpen(false);
          setEditingUser(null);
        }}
        title={editingUser ? `Permisos de ${editingUser.name}` : 'Nuevo usuario'}
        subtitle={
          editingUser
            ? 'Modificación de privilegios de acceso y auditoría'
            : 'Completa la información para crear un nuevo usuario.'
        }
        width="lg"
        footer={
          <div className="w-full flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsNewUserModalOpen(false);
                setEditingUser(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSaveUser}
            >
              Guardar usuario
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* User Basic Info Section matching PDF */}
          {!editingUser && (
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Información del usuario
              </h4>

              <div className="space-y-3">
                <Input
                  label="Nombre completo *"
                  required
                  value={userData.name}
                  onChange={e => setUserData({ ...userData, name: e.target.value })}
                  placeholder="Andrea Morales"
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Usuario *"
                    required
                    value={userData.username}
                    onChange={e => setUserData({ ...userData, username: e.target.value })}
                    placeholder="amorales"
                  />
                  <Select
                    label="Rol *"
                    value={userData.role}
                    onChange={e => setUserData({ ...userData, role: e.target.value as any })}
                    options={[
                      { value: 'Gestor de Cobro', label: 'Gestor de Cobro' },
                      { value: 'Administrador', label: 'Administrador' },
                      { value: 'Supervisor', label: 'Supervisor' },
                      { value: 'Consultor', label: 'Consultor' },
                    ]}
                  />
                </div>

                <Input
                  label="Contraseña *"
                  type="password"
                  required
                  value={userData.password}
                  onChange={e => setUserData({ ...userData, password: e.target.value })}
                  helperText="Mínimo 8 caracteres con letras y números"
                />
              </div>
            </div>
          )}

          {/* Granular Permission Matrix matching PDF Page 2 */}
          <div>
            <div className="mb-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Permisos de acceso
              </h4>
              <p className="text-[11px] text-slate-500">
                Selecciona los permisos que tendrá este usuario por módulo.
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-2.5 px-3">Módulo</th>
                    <th className="py-2.5 px-2 text-center">Ver</th>
                    <th className="py-2.5 px-2 text-center">Crear</th>
                    <th className="py-2.5 px-2 text-center">Editar</th>
                    <th className="py-2.5 px-2 text-center">Eliminar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {permissions.map(perm => (
                    <tr key={perm.module} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-medium text-slate-800">
                        {perm.module}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <input
                          type="checkbox"
                          checked={perm.view}
                          onChange={() => handleTogglePermission(perm.module, 'view')}
                          className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <input
                          type="checkbox"
                          checked={perm.create}
                          onChange={() => handleTogglePermission(perm.module, 'create')}
                          className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <input
                          type="checkbox"
                          checked={perm.edit}
                          onChange={() => handleTogglePermission(perm.module, 'edit')}
                          className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <input
                          type="checkbox"
                          checked={perm.delete}
                          onChange={() => handleTogglePermission(perm.module, 'delete')}
                          className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Select all checkbox matching PDF */}
            <div className="pt-3 flex items-center gap-2 text-xs text-slate-600">
              <input
                id="select-all-perm"
                type="checkbox"
                checked={areAllPermissionsChecked}
                onChange={e => handleToggleAllPermissions(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="select-all-perm" className="cursor-pointer select-none">
                Seleccionar todos los permisos
              </label>
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
};
