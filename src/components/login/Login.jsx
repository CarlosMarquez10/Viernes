import { useState } from 'react';
import { Lock, User, Eye, EyeOff, KeyRound, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService, passwordValidation } from '../../services/authService';

export default function ModernLogin() {
  const navigate = useNavigate();
  const [step, setStep] = useState('cedula'); // 'cedula', 'temp-password', 'change-password'
  const [cedula, setCedula] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showTempPassword, setShowTempPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [temporaryToken, setTemporaryToken] = useState('');

  // Validación de cédula
  const handleCedulaSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!cedula.trim()) {
      setError('Por favor ingrese su cédula');
      setLoading(false);
      return;
    }

    try {
      const result = await authService.validateCedula(cedula.trim());
      
      if (result.success) {
        setUserInfo(result.data);
        
        // Usar la lógica mejorada del backend
        if (result.data.nextStep === 'normal-login') {
          // Usuario ya tiene contraseña definitiva
          setStep('normal-password');
        } else {
          // Usuario necesita usar contraseña temporal
          setStep('temp-password');
        }
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Error de conexión. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Validación de contraseña temporal
  const handleTempPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!temporaryPassword.trim()) {
      setError('Por favor ingrese su contraseña temporal');
      setLoading(false);
      return;
    }

    try {
      const result = await authService.validateTemporaryPassword(cedula, temporaryPassword.trim());
      
      if (result.success) {
        setTemporaryToken(result.data.temporaryToken);
        setStep('change-password');
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Error de conexión. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Cambio de contraseña definitiva
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validaciones frontend
    if (!newPassword || !confirmPassword) {
      setError('Por favor complete todos los campos');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    const validation = passwordValidation.validate(newPassword);
    if (!validation.isValid) {
      setError(validation.errors[0]);
      setLoading(false);
      return;
    }

    try {
      const result = await authService.changePassword(cedula, newPassword);
      
      if (result.success) {
        // Guardar token de autenticación
        localStorage.setItem('authToken', result.data.authToken);
        localStorage.setItem('userCedula', result.data.cedula);
        
        // Navegar al dashboard
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Error de conexión. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Login normal (para usuarios que ya cambiaron contraseña)
  const handleNormalLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!temporaryPassword.trim()) {
      setError('Por favor ingrese su contraseña');
      setLoading(false);
      return;
    }

    try {
      const result = await authService.login(cedula, temporaryPassword.trim());
      
      if (result.success) {
        localStorage.setItem('authToken', result.data.authToken);
        localStorage.setItem('userCedula', result.data.cedula);
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Error de conexión. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setError('');
    setLoading(false);
    
    if (step === 'temp-password' || step === 'normal-password') {
      setStep('cedula');
      setTemporaryPassword('');
      setUserInfo(null);
    } else if (step === 'change-password') {
      setStep('temp-password');
      setNewPassword('');
      setConfirmPassword('');
      setTemporaryToken('');
    }
  };

  // Obtener fortaleza de contraseña
  const getPasswordStrength = () => {
    if (!newPassword) return null;
    return passwordValidation.getStrength(newPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-orange-400 to-white-400 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-white rounded-full shadow-lg mb-4">
            <Lock className="w-12 h-12 text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Bienvenido</h1>
          <p className="text-white/90">
            {step === 'cedula' && 'Ingrese su número de cédula'}
            {step === 'temp-password' && 'Ingrese su contraseña temporal'}
            {step === 'normal-password' && 'Ingrese su contraseña'}
            {step === 'change-password' && 'Cree su nueva contraseña'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Indicador de paso */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full transition-colors ${
                step === 'cedula' ? 'bg-orange-600' : 
                ['temp-password', 'normal-password', 'change-password'].includes(step) ? 'bg-green-500' : 'bg-gray-300'
              }`}></div>
              <div className={`w-3 h-3 rounded-full transition-colors ${
                ['temp-password', 'normal-password'].includes(step) ? 'bg-orange-600' : 
                step === 'change-password' ? 'bg-green-500' : 'bg-gray-300'
              }`}></div>
              <div className={`w-3 h-3 rounded-full transition-colors ${
                step === 'change-password' ? 'bg-orange-600' : 'bg-gray-300'
              }`}></div>
            </div>
          </div>

          {/* Formulario de Cédula */}
          {step === 'cedula' && (
            <form onSubmit={handleCedulaSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Cédula
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                    placeholder="Ingrese su cédula"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transform hover:scale-105 transition duration-200 shadow-lg disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Validando...
                  </>
                ) : (
                  'Continuar'
                )}
              </button>
            </form>
          )}

          {/* Formulario de Contraseña Temporal */}
          {step === 'temp-password' && (
            <form onSubmit={handleTempPasswordSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña Temporal
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showTempPassword ? 'text' : 'password'}
                    value={temporaryPassword}
                    onChange={(e) => setTemporaryPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                    placeholder="Ingrese su contraseña temporal"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowTempPassword(!showTempPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showTempPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={loading}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition disabled:opacity-50"
                >
                  Atrás
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transform hover:scale-105 transition duration-200 shadow-lg disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Validando...
                    </>
                  ) : (
                    'Continuar'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Formulario de Login Normal */}
          {step === 'normal-password' && (
            <form onSubmit={handleNormalLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showTempPassword ? 'text' : 'password'}
                    value={temporaryPassword}
                    onChange={(e) => setTemporaryPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                    placeholder="Ingrese su contraseña"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowTempPassword(!showTempPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showTempPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={loading}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition disabled:opacity-50"
                >
                  Atrás
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transform hover:scale-105 transition duration-200 shadow-lg disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Ingresando...
                    </>
                  ) : (
                    'Ingresar'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Formulario de Cambio de Contraseña */}
          {step === 'change-password' && (
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div className="bg-indigo-50 border border-indigo-200 text-red-800 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                <KeyRound className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Cambio de Contraseña Requerido</strong>
                  <p className="mt-1">Por seguridad, debe crear una nueva contraseña</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                    placeholder="Mínimo 8 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                    placeholder="Repita la contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                <strong className="block mb-2">Requisitos de la contraseña:</strong>
                <ul className="space-y-1 ml-4">
                  <li className="flex items-center gap-2">
                    <span className={newPassword.length >= 8 ? 'text-green-600' : 'text-gray-400'}>•</span>
                    Mínimo 8 caracteres
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={newPassword === confirmPassword && newPassword ? 'text-green-600' : 'text-gray-400'}>•</span>
                    Las contraseñas coinciden
                  </li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
                >
                  Atrás
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transform hover:scale-105 transition duration-200 shadow-lg disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Cambiando...
                    </>
                  ) : (
                    'Cambiar Contraseña'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-white/80 text-sm">
          ¿Problemas para ingresar? <button className="underline hover:text-white">Contactar soporte</button>
        </div>
      </div>
    </div>
  );
}
