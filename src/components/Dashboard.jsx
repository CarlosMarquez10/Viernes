import { useState } from 'react';
import { LogOut, User, Settings, Home, BarChart3, FileText, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MobileMenu from './MobileMenu';
import { authService } from '../services/authService';

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('inicio');
  const currentUser = authService.getCurrentUser();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      navigate('/');
    }
  };

  const menuItems = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'reportes', label: 'Reportes', icon: BarChart3 },
    { id: 'consulta', label: 'Consulta', icon: BarChart3 },
    { id: 'documentos', label: 'Documentos', icon: FileText },
    { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
    { id: 'configuracion', label: 'Configuración', icon: Settings },
  ];

  // Filtrar tabs visibles según rol del usuario
  const visibleMenuItems = menuItems.filter((item) => authService.canAccessTab(item.id));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu Component */}
      <MobileMenu activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-orange-600 ml-16 md:ml-0">Dashboard</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-8 h-8 text-gray-400 bg-gray-100 rounded-full p-1" />
                <span className="text-sm font-medium text-gray-700 hidden sm:block">{currentUser?.name || 'Usuario'}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:block">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar - Hidden on mobile */}
        <nav className="hidden md:block w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4">
            <ul className="space-y-2">
              {visibleMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition ${
                        activeTab === item.id
                          ? 'bg-indigo-100 text-red-700 border-r-2 border-red-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'inicio' && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Bienvenido al Dashboard</h2>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <BarChart3 className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                        <p className="text-2xl font-bold text-gray-900">1,234</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <FileText className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Documentos</p>
                        <p className="text-2xl font-bold text-gray-900">567</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Bell className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Notificaciones</p>
                        <p className="text-2xl font-bold text-gray-900">89</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Settings className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Configuraciones</p>
                        <p className="text-2xl font-bold text-gray-900">12</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Actividad Reciente</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <p className="text-sm text-gray-600">Usuario Juan Pérez inició sesión</p>
                        <span className="text-xs text-gray-400">Hace 5 minutos</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <p className="text-sm text-gray-600">Nuevo documento subido</p>
                        <span className="text-xs text-gray-400">Hace 15 minutos</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <p className="text-sm text-gray-600">Configuración actualizada</p>
                        <span className="text-xs text-gray-400">Hace 1 hora</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reportes' && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Reportes</h2>
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-gray-600">Aquí se mostrarán los reportes del sistema.</p>
                </div>
              </div>
            )}

            {activeTab === 'consulta' && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Consulta</h2>
                {/* Panel de búsqueda */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                  <form className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cédula</label>
                      <input type="text" placeholder="Ingrese cédula" className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                      <input type="date" className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                    </div>
                    <div className="flex items-end">
                      <button type="button" className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">Buscar</button>
                    </div>
                  </form>
                </div>

                {/* Resultados */}
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-gray-600 mb-4">Resultados de la consulta</p>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-4 py-2 text-sm text-gray-700">—</td>
                          <td className="px-4 py-2 text-sm text-gray-700">—</td>
                          <td className="px-4 py-2 text-sm text-gray-700">—</td>
                          <td className="px-4 py-2 text-sm text-gray-700">Sin datos</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'documentos' && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Documentos</h2>
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-gray-600">Gestión de documentos del sistema.</p>
                </div>
              </div>
            )}

            {activeTab === 'notificaciones' && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Notificaciones</h2>
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-gray-600">Centro de notificaciones.</p>
                </div>
              </div>
            )}

            {activeTab === 'configuracion' && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Configuración</h2>
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-gray-600">Configuraciones del sistema.</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}