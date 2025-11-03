// Simulación de endpoints del backend para autenticación
// En producción, estos serían llamadas reales a tu API

const API_BASE_URL = 'http://localhost:3001/api'; // URL de ejemplo del backend

// Base de datos simulada para desarrollo
const mockDatabase = {
  users: [
    { cedula: '12345678', hasTemporaryPassword: true, temporaryPassword: 'temp123', isFirstLogin: true },
    { cedula: '87654321', hasTemporaryPassword: false, password: 'password123', isFirstLogin: false },
    { cedula: '11111111', hasTemporaryPassword: true, temporaryPassword: 'temp456', isFirstLogin: true },
  ]
};

// Simular delay de red
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  // Endpoint 1: Validar si existe la cédula
  async validateCedula(cedula) {
    await delay(800); // Simular latencia de red
    
    try {
      // En producción sería: 
      // const response = await fetch(`${API_BASE_URL}/auth/validate-cedula`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ cedula })
      // });
      
      // Simulación de respuesta del backend
      const user = mockDatabase.users.find(u => u.cedula === cedula);
      
      if (!user) {
        return {
          success: false,
          error: 'Cédula no encontrada en el sistema',
          code: 'CEDULA_NOT_FOUND'
        };
      }

      return {
        success: true,
        data: {
          cedula: user.cedula,
          hasTemporaryPassword: user.hasTemporaryPassword,
          isFirstLogin: user.isFirstLogin,
          requiresPasswordChange: user.hasTemporaryPassword
        }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error de conexión con el servidor',
        code: 'CONNECTION_ERROR'
      };
    }
  },

  // Endpoint 2: Validar contraseña temporal
  async validateTemporaryPassword(cedula, temporaryPassword) {
    await delay(600);
    
    try {
      // En producción sería:
      // const response = await fetch(`${API_BASE_URL}/auth/validate-temp-password`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ cedula, temporaryPassword })
      // });

      const user = mockDatabase.users.find(u => u.cedula === cedula);
      
      if (!user) {
        return {
          success: false,
          error: 'Usuario no encontrado',
          code: 'USER_NOT_FOUND'
        };
      }

      if (!user.hasTemporaryPassword) {
        return {
          success: false,
          error: 'Este usuario no tiene contraseña temporal',
          code: 'NO_TEMP_PASSWORD'
        };
      }

      if (user.temporaryPassword !== temporaryPassword) {
        return {
          success: false,
          error: 'Contraseña temporal incorrecta',
          code: 'INVALID_TEMP_PASSWORD'
        };
      }

      return {
        success: true,
        data: {
          cedula: user.cedula,
          temporaryToken: `temp_token_${Date.now()}`, // Token temporal para seguridad
          requiresPasswordChange: true
        }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error de conexión con el servidor',
        code: 'CONNECTION_ERROR'
      };
    }
  },

  // Endpoint 3: Cambiar contraseña definitiva
  async changePassword(cedula, temporaryToken, newPassword) {
    await delay(1000);
    
    try {
      // En producción sería:
      // const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      //   method: 'POST',
      //   headers: { 
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${temporaryToken}`
      //   },
      //   body: JSON.stringify({ cedula, newPassword })
      // });

      const user = mockDatabase.users.find(u => u.cedula === cedula);
      
      if (!user) {
        return {
          success: false,
          error: 'Usuario no encontrado',
          code: 'USER_NOT_FOUND'
        };
      }

      // Validaciones de contraseña en el backend
      if (newPassword.length < 8) {
        return {
          success: false,
          error: 'La contraseña debe tener al menos 8 caracteres',
          code: 'PASSWORD_TOO_SHORT'
        };
      }

      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
        return {
          success: false,
          error: 'La contraseña debe contener al menos una mayúscula, una minúscula y un número',
          code: 'PASSWORD_WEAK'
        };
      }

      // Simular actualización en base de datos
      user.password = newPassword;
      user.hasTemporaryPassword = false;
      user.temporaryPassword = null;
      user.isFirstLogin = false;

      return {
        success: true,
        data: {
          cedula: user.cedula,
          authToken: `auth_token_${Date.now()}`, // Token de autenticación real
          user: {
            cedula: user.cedula,
            isFirstLogin: false
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error de conexión con el servidor',
        code: 'CONNECTION_ERROR'
      };
    }
  },

  // Endpoint 4: Login normal (para usuarios que ya cambiaron contraseña)
  async login(cedula, password) {
    await delay(700);
    
    try {
      // En producción sería:
      // const response = await fetch(`${API_BASE_URL}/auth/login`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ cedula, password })
      // });

      const user = mockDatabase.users.find(u => u.cedula === cedula);
      
      if (!user) {
        return {
          success: false,
          error: 'Credenciales incorrectas',
          code: 'INVALID_CREDENTIALS'
        };
      }

      if (user.hasTemporaryPassword) {
        return {
          success: false,
          error: 'Debe usar su contraseña temporal primero',
          code: 'USE_TEMP_PASSWORD'
        };
      }

      if (user.password !== password) {
        return {
          success: false,
          error: 'Credenciales incorrectas',
          code: 'INVALID_CREDENTIALS'
        };
      }

      return {
        success: true,
        data: {
          cedula: user.cedula,
          authToken: `auth_token_${Date.now()}`,
          user: {
            cedula: user.cedula,
            isFirstLogin: false
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error de conexión con el servidor',
        code: 'CONNECTION_ERROR'
      };
    }
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