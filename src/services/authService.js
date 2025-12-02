/**
 * Servicio de autenticación para la aplicación
 * Maneja todas las operaciones relacionadas con login y autenticación
 */

// Configuración de la API
const API_BASE_URL = 'https://74pbcspn-3005.use2.devtunnels.ms/api/auth';
// Base general para otros endpoints (no-auth)
const API_BASE_URL_API = 'https://74pbcspn-3005.use2.devtunnels.ms/api';

// =========================
// Control de Roles (frontend)
// =========================
// Normaliza texto: quita acentos, pone mayúsculas y compacta espacios
const normalize = (text) => (text || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toUpperCase()
  .replace(/[()]/g, '')
  .replace(/\s+/g, ' ')
  .trim();

// Mapeo de cargo (base de datos) -> rol lógico en frontend
const cargoToRoleMap = {
  'TECNOLOGO CGO': 'ADMIN',
  'TECNÓLOGO(Supervísor)': 'SUPERVISOR',
  'PROFESIONAL 3 CALIDAD': 'PRO_CALIDAD',
  'PROFESIONAL': 'PROFESIONAL',
};

function getRoleFromCargo(cargo) {
  const key = normalize(cargo);
  // Regla específica para variaciones de "TECNÓLOGO (Supervisor)"
  if (key.includes('TECNOLOGO') && key.includes('SUPERVISOR')) return 'SUPERVISOR';
  return cargoToRoleMap[key] || 'BASICO';
}

// Permisos por rol (ajustable según necesidades)
const rolePermissions = {
  ADMIN: new Set(['viewDashboard', 'viewReportes', 'viewDocumentos', 'viewNotificaciones', 'viewConfiguracion']),
  SUPERVISOR: new Set(['viewDashboard', 'viewReportes', 'viewDocumentos', 'viewNotificaciones']),
  PRO_CALIDAD: new Set(['viewDashboard', 'viewReportes', 'viewNotificaciones']),
  PROFESIONAL: new Set(['viewDashboard', 'viewReportes', 'viewDocumentos', 'viewNotificaciones']),
  BASICO: new Set(['viewDashboard', 'viewNotificaciones']),
};

// Reglas de acceso para tabs del Dashboard
const tabRoles = {
  inicio: ['ADMIN', 'SUPERVISOR', 'PRO_CALIDAD', 'PROFESIONAL', 'BASICO'],
  reportes: ['ADMIN'],
  tiempos: ['ADMIN', 'SUPERVISOR', 'PRO_CALIDAD', 'PROFESIONAL'],
  consulta: ['ADMIN', 'SUPERVISOR', 'PRO_CALIDAD', 'PROFESIONAL', 'BASICO'],
  correrias: ['ADMIN', 'SUPERVISOR', 'PRO_CALIDAD', 'PROFESIONAL', 'BASICO'],
  Perfillector: ['ADMIN', 'SUPERVISOR', 'PRO_CALIDAD', 'PROFESIONAL', 'BASICO'],
  DBcliente: ['ADMIN', 'SUPERVISOR', 'PRO_CALIDAD', 'PROFESIONAL', 'BASICO'],
  policia: ['ADMIN', 'SUPERVISOR', 'PRO_CALIDAD', 'PROFESIONAL', 'BASICO'],
  ViernesBot: ['ADMIN', 'SUPERVISOR', 'PRO_CALIDAD', 'PROFESIONAL', 'BASICO'],
  documentos: ['ADMIN'],
  notificaciones: ['ADMIN'],
  configuracion: ['ADMIN'],
};

/**
 * Servicio de autenticación
 */
export const authService = {
  /**
   * Valida si existe la cédula en el sistema
   * @param {string} cedula - Número de cédula
   * @returns {Promise<Object>} - Respuesta con información del usuario
   */
  async validateCedula(cedula) {
    try {
      const response = await fetch(`${API_BASE_URL}/validate-cedula`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cedula }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al validar cédula');
      }

      return data;
    } catch (error) {
      console.error('Error validating cedula:', error);
      throw error;
    }
  },

  /**
   * Consulta tiempos por cliente con fallback de mes en backend
   * @param {('cliente'|'medidor')} tipo
   * @param {string|number} valor - número de cliente o medidor
   * @returns {Promise<Object>} - respuesta del backend
   */
  async consultaTiempos(tipo, valor) {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      throw new Error('No autenticado. Inicie sesión.');
    }

    // Por ahora el backend solo soporta tipo 'cliente'
    const baseBody = (String(tipo).toLowerCase() === 'cliente')
      ? { cliente: valor, tipo: 'cliente' }
      : { tipo: 'medidor', medidor: valor };

    // Adjuntar nombre del usuario logueado a cada petición
    const currentUserName = localStorage.getItem('userName') || null;
    const body = { ...baseBody, usuario: currentUserName };

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    };

    const response = await fetch(`${API_BASE_URL_API}/consulta/tiempos`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Error en consulta');
    }
    return data;
  },

  /**
   * Consulta un medidor en SAC
   * Body: { medidor, usuario }
   * Endpoint backend esperado: /api/consulta/medidorSac
   */
  async consultaMedidorSac(medidor) {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      throw new Error('No autenticado. Inicie sesión.');
    }

    const currentUserName = localStorage.getItem('userName') || null;
    const body = { medidor, usuario: currentUserName };

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    };

    const url = `${API_BASE_URL_API}/consulta/tiempos/medidorSac`;
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Respuesta no JSON (${response.status}). Detalle: ${text.slice(0,120)}...`);
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || `Error HTTP ${response.status}`);
    }
    return data;
  },

  /**
   * Obtiene información del panel (cantidades de lecturas, consultas, empleados, etc.)
   * GET /api/consulta/informacion/panel
   */
  async getPanelInfo() {
    const authToken = localStorage.getItem('authToken');
    const headers = authToken
      ? { 'Authorization': `Bearer ${authToken}`, 'Accept': 'application/json' }
      : { 'Accept': 'application/json' };

    const response = await fetch(`${API_BASE_URL_API}/consulta/informacion/panel?ts=${Date.now()}`, {
      method: 'GET',
      headers,
    });

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Respuesta no JSON (${response.status}). Detalle: ${text.slice(0,120)}...`);
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || `Error HTTP ${response.status}`);
    }
    // algunos controladores envían {success, data}; normalizamos retornando data si existe
    return data?.data ?? data;
  },

  /**
   * Consulta todos los tiempos de un cliente (listado completo) usando /api/consulta/tiempos/Cl
   * @param {number|string} cliente - Número de cliente
   * @returns {Promise<Object>} - respuesta con {success, data:{cliente,total,rows}}
   */
  async consultaTiemposClienteTotal(cliente) {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      throw new Error('No autenticado. Inicie sesión.');
    }

    const currentUserName = localStorage.getItem('userName') || null;
    const body = { cliente, usuario: currentUserName };

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    };

    const response = await fetch(`${API_BASE_URL_API}/consulta/tiempos/Cl`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Error en consulta de tiempos cliente');
    }
    return data;
  },

  /**
   * Valida contraseña temporal
   * @param {string} cedula - Número de cédula
   * @param {string} temporaryPassword - Contraseña temporal
   * @returns {Promise<Object>} - Respuesta con token temporal
   */
  async validateTemporaryPassword(cedula, temporaryPassword) {
    try {
      const response = await fetch(`${API_BASE_URL}/validate-temp-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cedula, temporaryPassword }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al validar contraseña temporal');
      }

      // Guardar el token temporal para el siguiente paso
      if (data.success && data.data.temporaryToken) {
        localStorage.setItem('temporaryToken', data.data.temporaryToken);
      }

      return data;
    } catch (error) {
      console.error('Error validating temporary password:', error);
      throw error;
    }
  },

  /**
   * Cambia la contraseña definitiva
   * @param {string} cedula - Número de cédula
   * @param {string} newPassword - Nueva contraseña
   * @returns {Promise<Object>} - Respuesta con token de autenticación
   */
  async changePassword(cedula, newPassword) {
    try {
      const temporaryToken = localStorage.getItem('temporaryToken');
      
      if (!temporaryToken) {
        throw new Error('Token temporal no encontrado. Debe validar la contraseña temporal primero.');
      }

      const response = await fetch(`${API_BASE_URL}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${temporaryToken}`,
        },
        body: JSON.stringify({ cedula, newPassword }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al cambiar contraseña');
      }

      // Limpiar token temporal y guardar token de autenticación
      localStorage.removeItem('temporaryToken');
      if (data.success && data.data.authToken) {
        localStorage.setItem('authToken', data.data.authToken);
        localStorage.setItem('userCedula', data.data.cedula);
        localStorage.setItem('userName', data.data.name);
        if (data.data.cargo) {
          localStorage.setItem('userCargo', data.data.cargo);
          localStorage.setItem('userRole', getRoleFromCargo(data.data.cargo));
        }
      }

      return data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  },

  /**
   * Login normal para usuarios que ya cambiaron contraseña
   * @param {string} cedula - Número de cédula
   * @param {string} password - Contraseña
   * @returns {Promise<Object>} - Respuesta con token de autenticación
   */
  async login(cedula, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cedula, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      // Guardar token de autenticación
      if (data.success && data.data.authToken) {
        localStorage.setItem('authToken', data.data.authToken);
        localStorage.setItem('userCedula', data.data.cedula);
        localStorage.setItem('userName', data.data.name);
        if (data.data.cargo) {
          localStorage.setItem('userCargo', data.data.cargo);
          localStorage.setItem('userRole', getRoleFromCargo(data.data.cargo));
        }
      }

      return data;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  },

  /**
   * Cerrar sesión
   * @returns {Promise<Object>} - Respuesta de logout
   */
  async logout() {
    try {
      const authToken = localStorage.getItem('authToken');
      
      if (authToken) {
        const response = await fetch(`${API_BASE_URL}/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
        });

        const data = await response.json();
        
        if (!response.ok) {
          console.warn('Error during logout:', data.message);
        }
      }

      // Limpiar localStorage independientemente del resultado del API
      localStorage.removeItem('authToken');
      localStorage.removeItem('temporaryToken');
      localStorage.removeItem('userCedula');
      localStorage.removeItem('userName');
      localStorage.removeItem('userCargo');
      localStorage.removeItem('userRole');

      return { success: true, message: 'Sesión cerrada exitosamente' };
    } catch (error) {
      console.error('Error during logout:', error);
      // Limpiar localStorage aunque haya error
      localStorage.removeItem('authToken');
      localStorage.removeItem('temporaryToken');
      localStorage.removeItem('userCedula');
      localStorage.removeItem('userName');
      localStorage.removeItem('userCargo');
      localStorage.removeItem('userRole');
      
      return { success: true, message: 'Sesión cerrada localmente' };
    }
  },

  /**
   * Verificar si el token es válido
   * @returns {Promise<Object>} - Respuesta de verificación
   */
  async verifyToken() {
    try {
      const authToken = localStorage.getItem('authToken');
      
      if (!authToken) {
        return { success: false, message: 'No hay token de autenticación' };
      }

      const response = await fetch(`${API_BASE_URL}/verify-token`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        // Token inválido, limpiar localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('userCedula');
        localStorage.removeItem('userName');
        throw new Error(data.message || 'Token inválido');
      }

      // Persistir datos del usuario si vienen del backend
      if (data.success && data.data) {
        if (data.data.name) localStorage.setItem('userName', data.data.name);
        if (data.data.cedula) localStorage.setItem('userCedula', data.data.cedula);
        if (data.data.cargo) {
          localStorage.setItem('userCargo', data.data.cargo);
          localStorage.setItem('userRole', getRoleFromCargo(data.data.cargo));
        }
      }

      return data;
    } catch (error) {
      console.error('Error verifying token:', error);
      throw error;
    }
  },

  /**
   * Obtener información del usuario actual desde localStorage
   * @returns {Object|null} - Información del usuario o null si no está logueado
   */
  getCurrentUser() {
    const authToken = localStorage.getItem('authToken');
    const userCedula = localStorage.getItem('userCedula');
    const userName = localStorage.getItem('userName');
    const userCargo = localStorage.getItem('userCargo');
    const userRole = localStorage.getItem('userRole') || (userCargo ? getRoleFromCargo(userCargo) : null);

    if (authToken && userCedula && userName) {
      return {
        cedula: userCedula,
        name: userName,
        cargo: userCargo || null,
        role: userRole || 'BASICO',
        isAuthenticated: true
      };
    }

    return null;
  },

  /**
   * Verificar si el usuario está autenticado
   * @returns {boolean} - true si está autenticado
   */
  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  },

  // -------- Helpers de acceso --------
  getUserRole() {
    return localStorage.getItem('userRole') || 'BASICO';
  },
  getUserCargo() {
    return localStorage.getItem('userCargo') || null;
  },
  hasRole(role) {
    const current = this.getUserRole();
    return current === role;
  },
  hasAnyRole(roles = []) {
    const current = this.getUserRole();
    return roles.includes(current);
  },
  hasPermission(permission) {
    const current = this.getUserRole();
    const perms = rolePermissions[current] || new Set();
    return perms.has(permission);
  },
  canAccessTab(tabId) {
    const allowed = tabRoles[tabId] || [];
    return this.hasAnyRole(allowed);
  },
  // Exponer reglas para uso externo (UI)
  get tabRoles() {
    return tabRoles;
  }
};

// Utilidades para validación de contraseña en frontend
export const passwordValidation = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false,

  validate(password) {
    const errors = [];

    if (password.length < this.minLength) {
      errors.push(`Debe tener al menos ${this.minLength} caracteres`);
    }

    if (this.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Debe contener al menos una letra mayúscula');
    }

    if (this.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Debe contener al menos una letra minúscula');
    }

    if (this.requireNumbers && !/\d/.test(password)) {
      errors.push('Debe contener al menos un número');
    }

    if (this.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Debe contener al menos un carácter especial');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  getStrength(password) {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    if (score <= 2) return { level: 'weak', color: 'red' };
    if (score <= 4) return { level: 'medium', color: 'yellow' };
    return { level: 'strong', color: 'green' };
  }
};