import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home, 
  BarChart3, 
  FileText, 
  Bell, 
  Settings, 
  LogOut,
  User
} from 'lucide-react';
import { authService } from '../services/authService';

const MobileMenu = ({ activeTab, setActiveTab }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const menuItems = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'reportes', label: 'Reportes', icon: BarChart3 },
    { id: 'consulta', label: 'Consulta', icon: BarChart3 },
    { id: 'policia', label: 'Policia', icon: BarChart3 },
    { id: 'documentos', label: 'Documentos', icon: FileText },
    { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
    { id: 'configuracion', label: 'Configuración', icon: Settings },
  ];

  const handleLogout = async () => {
    setIsOpen(false);
    try {
      await authService.logout();
    } finally {
      navigate('/');
    }
  };

  const handleMenuClick = (tabId) => {
    setActiveTab(tabId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-4 left-4 z-50 p-3 rounded-full shadow-lg transition-all duration-300 transform ${
          isOpen 
            ? 'bg-red-500 hover:bg-red-600 rotate-90' 
            : 'bg-blue-600 hover:bg-blue-700 hover:scale-110'
        } text-white md:hidden`}
        style={{ 
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
        }}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 md:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Menu Panel */}
      <div className={`fixed top-0 right-0 h-full w-80 transform transition-transform duration-300 ease-in-out z-40 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      style={{
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
      }}>
        
        {/* Header */}
        <div className="glass-header px-6 py-6 border-b border-white/20"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 165, 0, 0.8) 0%, rgba(255, 69, 0, 0.7) 50%, rgba(255, 255, 255, 0.6) 100%)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg drop-shadow-lg">{currentUser?.name || 'Usuario'}</h3>
              <p className="text-white/90 text-sm drop-shadow-md">{currentUser?.cargo || 'Dashboard'}</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-6 py-4">
          {menuItems.filter((item) => authService.canAccessTab(item.id)).map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 mb-2 ${
                activeTab === item.id
                  ? 'bg-white/20 text-gray-800 backdrop-blur-sm border border-white/30'
                  : 'text-gray-700 hover:bg-white/10 hover:backdrop-blur-sm'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-6 border-t border-white/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-500/10 hover:backdrop-blur-sm transition-all duration-200 border border-red-300/20"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;