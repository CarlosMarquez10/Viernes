import { useState } from 'react';
import { LogOut, User, Settings, Home, BarChart3, FileText, Clock, UserSearch, Siren, UserCheckIcon, DatabaseBackup, BotIcon, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MobileMenu from './MobileMenu';
import MapComponent from './MapComponent/MapComponent';
import { authService } from '../services/authService';
import consorcioLogo from '../assets/consorcioci.png';
import Policiaweb from './Policia/Policiaweb';
import React from 'react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('inicio');
  const currentUser = authService.getCurrentUser();
  const [panelInfo, setPanelInfo] = useState(null);
  const [panelLoading, setPanelLoading] = useState(false);
  const getVal = (obj, keys, def = 0) => {
    for (const k of keys) {
      const v = obj?.[k];
      if (v !== undefined && v !== null) return Number(v) || 0;
    }
    return def;
  };

  React.useEffect(() => {
    let mounted = true;
    const fetchPanel = async () => {
      try {
        setPanelLoading(true);
        const info = await authService.getPanelInfo();
        if (mounted) setPanelInfo(info);
      } catch (e) {
        // opcional: manejo silencioso en home
        console.warn('Error obteniendo información del panel:', e?.message || e);
      } finally {
        if (mounted) setPanelLoading(false);
      }
    };
    fetchPanel();
    const id = setInterval(fetchPanel, 60000); // cada 1 minuto
    return () => { mounted = false; clearInterval(id); };
  }, []);

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
    { id: 'correrias', label: 'Correrias', icon: UserCheckIcon},
    { id: 'tiempos', label: 'Tiempos', icon: Clock },
    { id: 'consulta', label: 'Consulta', icon:UserSearch},
    { id: 'DBcliente', label: 'DB Cliente', icon: DatabaseBackup },
    { id: 'policia', label: 'Policia', icon: Siren },
    { id: 'ViernesBot', label: 'Viernes Bot', icon: BotIcon },
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
              <div className="flex-shrink-0 flex items-center space-x-3">
                <img src={consorcioLogo} alt="Viernes" className="w-18 h-14" />
                <h1 className="text-2xl font-bold text-orange-600">Viernes CI</h1>
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
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Panel de Control</h2>
                
                {/* Stats Cards (dinámicas) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <BarChart3 className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Lecturas</p>
                        <p className="text-2xl font-bold text-gray-900">{panelLoading ? '...' : getVal(panelInfo, ['cantidad_lectura','cantida_lectura','cantidadLecturas'])}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <FileText className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Consultas</p>
                        <p className="text-2xl font-bold text-gray-900">{panelLoading ? '...' : getVal(panelInfo, ['cantidad_consulta'])}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <User className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Empleados</p>
                        <p className="text-2xl font-bold text-gray-900">{panelLoading ? '...' : getVal(panelInfo, ['cantidad_empleado'])}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <User className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Empleados Activos</p>
                        <p className="text-2xl font-bold text-gray-900">{panelLoading ? '...' : getVal(panelInfo, ['cantidad_empleado_activo'])}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <FileText className="w-6 h-6 text-orange-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Clientes SAC</p>
                        <p className="text-2xl font-bold text-gray-900">{panelLoading ? '...' : getVal(panelInfo, ['cantidad_cliente_sac'])}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <Settings className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Tipo Facturación</p>
                        <p className="text-2xl font-bold text-gray-900">{panelLoading ? '...' : getVal(panelInfo, ['cantidad_tipo_factura'])}</p>
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
              <ConsultaTab />
            )}

            {activeTab === 'tiempos' && (
              <TiemposTab />
            )}

            {activeTab === 'DBcliente' && (
              <DBClienteTab />
            )}

            {activeTab === 'correrias' && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Correria Pendientes</h2>
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-gray-600">Gestión de documentos del sistema.  ---  <span className='text-red-600'>PROXIMAMENTE</span></p>
                </div>
              </div>
            )}

            {activeTab === 'policia' && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Policia</h2>
                <div className="bg-white rounded-lg shadow p-2 md:p-6">
                  <Policiaweb />
                </div>
              </div>
            )}

            {activeTab === 'ViernesBot' && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Viernes Bot</h2>
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-gray-600">Interactúa con el bot de Viernes para obtener informacion sobre codigos de lectura y Scr o Procedimiento. ---  <span className='text-red-600'>PROXIMAMENTE</span>.</p>
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

function ConsultaTab() {
  const [tipo, setTipo] = useState('cliente');
  const [valor, setValor] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const isBasic = authService.hasRole('BASICO');

  const parseCoordenadas = (coordStr) => {
    if (!coordStr) return null;
    const s = String(coordStr).trim();
    // admite formatos "lat,lng" o "lat lng"
    const parts = s.split(/[;,\s]+/).filter(Boolean);
    if (parts.length < 2) return null;
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
    return { lat, lng };
  };

  const handleBuscar = async () => {
    setError(null);
    setResult(null);

    const v = String(valor).trim();
    if (!v) {
      setError('Debe ingresar un número.');
      return;
    }

    // if (tipo === 'medidor') {
    //   setError('Consulta por medidor aún no disponible. Use tipo "cliente".');
    //   return;
    // }  se comento la consulta por que se habilito la consulta por medidor.

    try {
      setLoading(true);
      const data = await authService.consultaTiempos(tipo, v);
      setResult(data?.data || null);
    } catch (e) {
      setError(e?.message || 'Error en la consulta');
    } finally {
      setLoading(false);
    }
  };

  const registro = result?.registro || null;
  const mesConsultado = result?.mesConsultado ?? null;
  const columnas = registro ? Object.keys(registro) : [];
  // Ocultar campos específicos para rol BASICO
  const normalize = (s) => String(s).trim().toLowerCase().replace(/[^\w]+/g, '_');
  const hiddenForBasic = new Set([
    'lectura_actual',
    'nueva',
    'codtarea', 'code_tarea', 'cod_tarea',
    'intentos',
    'ano', 'anio',
    'codcausaobs', 'cod_causa_obs',
    'fechaultlabor', 'fecha_ult_labor', 'fecha_ult_lab', 'fecha_ultima_labor',
    'horaultlabor', 'hora_ult_labor', 'hora_ult_lab',
    'secuencia',
    'enteros',
    'decimales',
    'created_at', 'creado_el',
    'periodo',
    'obs_predio',
    'obs_texto',
    'mes',
    'id',
    'correria',
    'cliente',
    'coordenadas'
  ]);
  const columnasVisibles = isBasic
    ? columnas.filter((c) => !hiddenForBasic.has(normalize(c)))
    : columnas;
  const coords = registro ? parseCoordenadas(registro.coordenadas) : null;
  const mapClientData = coords
    ? {
        GPS_LATITUD: coords.lat,
        GPS_LONGITUD: coords.lng,
        NOMBRE: registro?.servicio ? `Servicio ${registro.servicio}` : `Cliente ${registro?.cliente ?? ''}`,
        DIRECCION: registro?.ubicacion || '',
        CLIENTE_ID: registro?.cliente ?? '',
      }
    : null;

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Consulta</h2>

      {/* Panel de búsqueda */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="cliente">Cliente</option>
              <option value="medidor">Medidor</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
            <input
              type="number"
              placeholder="Ingrese número de cliente o medidor"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleBuscar}
              className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}
    </div>

    {/* Mapa (si hay coordenadas) */}
    {registro && mapClientData && (
      <div className="mb-6">
        <MapComponent clientData={mapClientData} />
      </div>
    )}

      {/* Resultados */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-600">Resultados de la consulta</p>
          {mesConsultado && (
            <span className="text-sm text-gray-500">Mes consultado: {mesConsultado}</span>
          )}
        </div>

        {!registro ? (
          <div className="text-sm text-gray-500">Sin datos disponibles.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {columnasVisibles.map((col) => (
              <div key={col} className="rounded border border-gray-200 p-3 bg-gray-50">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  {String(col).replace(/_/g, ' ')}
                </div>
                <div className="text-sm text-gray-900 break-words">
                  {registro[col] !== null && registro[col] !== undefined && registro[col] !== '' ? String(registro[col]) : '—'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TiemposTab() {
  const [cliente, setCliente] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [rows, setRows] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [chartData, setChartData] = React.useState([]);

  const isBasic = authService.hasRole('BASICO');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setRows([]);
    setTotal(0);

    const clienteNum = Number(cliente);
    if (!cliente || Number.isNaN(clienteNum)) {
      setError('Ingrese un número de cliente válido');
      return;
    }
    setLoading(true);
    try {
      const data = await authService.consultaTiemposClienteTotal(clienteNum);
      setRows(data?.data?.rows || []);
      setTotal(Number(data?.data?.total || 0));
      const consumosObj = data?.data?.consumos || {};
      let consumosArr = Object.values(consumosObj)
        .map((c) => ({ label: c.nombreMes || String(c.mes || ''), value: Number(c.consumo ?? 0), mes: Number(c.mes ?? 0) }))
        .filter((c) => !!c.label)
        .sort((a, b) => a.mes - b.mes);

      if (!consumosArr || consumosArr.length === 0) {
        const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
        const getVal = (obj, keys) => {
          for (const k of keys) { if (obj[k] !== undefined && obj[k] !== null) return obj[k]; }
          return null;
        };
        const getLectura = (r) => Number(getVal(r, ['lectura','LECTURA_ACT','lectura_act','LECTURA_ACTUAL']) ?? 0);
        const sorted = (data?.data?.rows || []).slice().sort((a,b) => Number(getVal(a,['mes','MES'])) - Number(getVal(b,['mes','MES'])));
        const tmp = [];
        for (let i=0; i<sorted.length; i++) {
          const mes = Number(getVal(sorted[i], ['mes','MES']));
          const lecturaActual = getLectura(sorted[i]);
          const next = sorted.find(r => Number(getVal(r,['mes','MES'])) === mes + 1);
          if (next) {
            const lecturaSiguiente = getLectura(next);
            tmp.push({ label: monthNames[mes-1] || String(mes), value: Math.max(0, lecturaSiguiente - lecturaActual), mes });
          }
        }
        consumosArr = tmp;
      }
      setChartData(consumosArr);
    } catch (err) {
      setError(err?.message || 'Error al consultar tiempos');
    } finally {
      setLoading(false);
    }
  };

  if (isBasic) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Tiempos</h2>
        <div className="text-red-600">No tiene permisos para ver esta sección.</div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Tiempos</h2>
      <div className="bg-white rounded-lg shadow p-3 md:p-6 mb-6">
        <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-0.5 md:mb-1">Cliente</label>
              <input
                type="number"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                className="w-full border rounded-md px-2 md:px-3 py-1.5 md:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Ingrese número de cliente"
                required
              />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1.5 md:px-4 md:py-2 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
            >
              {loading ? 'Consultando...' : 'Consultar'}
            </button>
            {error && <span className="text-red-600 text-sm">{error}</span>}
          </div>
        </form>
      </div>

      {/* Consumos por mes - Gráfica de barras (primero) */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Consumos por mes</h3>
          {chartData && chartData.length > 0 && (
            <span className="text-sm text-gray-600">Meses: {chartData.length}</span>
          )}
        </div>
        <div className="p-6">
          {chartData && chartData.length > 0 ? (
            <BarChart data={chartData} height={320} barWidth={42} gap={24} rotateLabels={-20} />
          ) : (
            <div className="text-gray-500 text-sm">No hay datos de consumo para graficar.</div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Resultados</h3>
          <span className="text-sm text-gray-600">Total: {total}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Instalación</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Cliente</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Medidor</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Empleado</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Cédula Emp</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Mes</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Nombre Mes</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Ciclo</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">CodTarea</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Lectura Act</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rows && rows.length > 0 ? (
                rows.map((r, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-2 text-sm text-gray-700">{r.INSTALACION ?? r.instalacion}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{r.CLIENTE ?? r.cliente}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{r.MEDIDOR ?? r.medidor}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{r.nombreEmpleado ?? ''}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{r.cedulaEmpleado ?? r.LECTOR ?? r.lector}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{r.MES ?? r.mes}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{r.nombreMes ?? ''}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{r.CICLO ?? r.ciclo}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{r.CODTAREA ?? r.codtarea}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{r.LECTURA_ACT ?? r.lectura_act ?? r.lectura}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-gray-500">Sin resultados</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      
    </div>
  );
}

function BarChart({ data, height = 320, barWidth = 42, gap = 24, rotateLabels = -20, responsive = true }) {
  const containerRef = React.useRef(null);
  const [containerWidth, setContainerWidth] = React.useState(0);

  React.useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Cálculos dinámicos para móvil/desktop
  const n = Math.max(1, data.length);
  let chartWidth = responsive && containerWidth ? containerWidth : n * (barWidth + gap) + gap;
  let bw = barWidth;
  let gp = gap;
  if (responsive && containerWidth) {
    gp = Math.max(8, Math.min(24, chartWidth / (n * 6))); // gap proporcional
    bw = Math.max(18, Math.min(48, (chartWidth - gp * (n + 1)) / n)); // ancho de barra proporcional
  }

  const chartHeight = height;
  const maxValue = Math.max(...data.map((d) => Number(d.value) || 0), 0) || 1;
  const labelArea = 34; // espacio para etiquetas de meses (abajo)
  const topArea = 28;   // espacio reservado arriba para que los valores no se corten
  const scaleY = (value) => (value / maxValue) * (chartHeight - labelArea - topArea);

  // Rotación y tamaño de etiqueta adaptable
  const smallWidth = chartWidth < 420 || n > 6;
  const rot = responsive ? (smallWidth ? -35 : -15) : rotateLabels;
  const labelFont = smallWidth ? 11 : 12;

  return (
    <div ref={containerRef} className="overflow-x-hidden w-full">
      <svg width={chartWidth} height={chartHeight}>
        {/* Eje X baseline */}
        <line x1={0} y1={chartHeight - labelArea} x2={chartWidth} y2={chartHeight - labelArea} stroke="#e5e7eb" strokeWidth={1} />
        {data.map((d, i) => {
          const x = gp + i * (bw + gp);
          const h = scaleY(Number(d.value) || 0);
          const y = chartHeight - labelArea - h;
          const yVal = Math.max(12, y - 12); // evita que el valor se desborde por arriba
          return (
            <g key={i}>
              {/* Barra */}
              <rect x={x} y={y} width={bw} height={h} fill="#fb923c" rx={6} />
              {/* Valor */}
              <text x={x + bw / 2} y={yVal} textAnchor="middle" fontSize={12} fill="#374151">
                {d.value}
              </text>
              {/* Label mes (rotada para mejor lectura en pantallas pequeñas) */}
              <text x={x + bw / 2} y={chartHeight - 10} textAnchor="middle" fontSize={labelFont} fill="#6b7280" transform={`rotate(${rot}, ${x + bw / 2}, ${chartHeight - 10})`}>
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
function DBClienteTab() {
  const [medidor, setMedidor] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [result, setResult] = React.useState(null);

  const handleConsultar = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    const medNum = Number(medidor);
    if (!medidor || Number.isNaN(medNum)) {
      setError('Ingrese un número de medidor válido');
      return;
    }
    setLoading(true);
    try {
      const data = await authService.consultaMedidorSac(medNum);
      setResult(data?.data ?? data);
    } catch (err) {
      setError(err?.message || 'Error en la consulta');
    } finally {
      setLoading(false);
    }
  };

  // Helper para renderizar objetos o arrays
  const renderData = (data) => {
    if (!data) return <div className="text-sm text-gray-500">Sin datos</div>;
    if (Array.isArray(data)) {
      const cols = Array.from(
        data.reduce((acc, row) => {
          Object.keys(row || {}).forEach((k) => acc.add(k));
          return acc;
        }, new Set())
      );
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {cols.map((c) => (
                  <th key={c} className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    {String(c).replace(/_/g, ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row, i) => (
                <tr key={i}>
                  {cols.map((c) => (
                    <td key={c} className="px-4 py-2 text-sm text-gray-700">
                      {row[c] !== null && row[c] !== undefined && row[c] !== '' ? String(row[c]) : '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    // object
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.entries(data || {}).map(([key, value]) => (
          <div key={key} className="rounded border border-gray-200 p-3 bg-gray-50">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              {String(key).replace(/_/g, ' ')}
            </div>
            <div className="text-sm text-gray-900 break-words">
              {value !== null && value !== undefined && value !== '' ? String(value) : '—'}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-6">DB Cliente (SAC)</h2>
      <div className="bg-white rounded-lg shadow p-3 md:p-6 mb-6">
        <form onSubmit={handleConsultar} className="space-y-3 md:space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-0.5 md:mb-1">Medidor</label>
              <input
                type="number"
                value={medidor}
                onChange={(e) => setMedidor(e.target.value)}
                className="w-full border rounded-md px-2 md:px-3 py-1.5 md:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Ingrese número de medidor"
                required
              />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1.5 md:px-4 md:py-2 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
            >
              {loading ? 'Consultando...' : 'Consultar'}
            </button>
            {error && <span className="text-red-600 text-sm">{error}</span>}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="px-6 py-2 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Resultado</h3>
        </div>
        <div className="p-4">
          {renderData(result)}
        </div>
      </div>
    </div>
  );
}