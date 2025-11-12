/**
 * RegisterForm Component
 * Formulario de registro adaptado para Guatemala con mejor UX
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@hooks/useToast';
import { authApi } from '@services/auth.api';
import { sanitizeInput } from '@utils/sanitize';
import { logger } from '@utils/logger';
import { DEPARTMENTS, getMunicipalitiesByDepartment } from '@/data/guatemala-locations';
import './RegisterForm.css';

export function RegisterForm() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [availableMunicipalities, setAvailableMunicipalities] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    // Información Personal
    email: '',
    dpi: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phoneNumber: '',
    
    // Ubicación
    department: '',
    municipality: '',
    address: '',
    
    // Seguridad
    password: '',
    confirmPassword: '',
  });

  // Actualizar municipios cuando cambia el departamento
  useEffect(() => {
    if (formData.department) {
      const municipalities = getMunicipalitiesByDepartment(formData.department);
      setAvailableMunicipalities(municipalities);
      // Limpiar el municipio seleccionado si no es válido para el nuevo departamento
      if (formData.municipality && !municipalities.includes(formData.municipality)) {
        setFormData((prev) => ({ ...prev, municipality: '' }));
      }
    } else {
      setAvailableMunicipalities([]);
      setFormData((prev) => ({ ...prev, municipality: '' }));
    }
  }, [formData.department, formData.municipality]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      // Validar Información Personal
      if (!formData.email.trim()) {
        showToast('error', 'El correo electrónico es requerido');
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        showToast('error', 'El correo electrónico no es válido');
        return false;
      }

      if (!formData.dpi.trim()) {
        showToast('error', 'El DPI es requerido');
        return false;
      }
      if (!/^[0-9]{13}$/.test(formData.dpi)) {
        showToast('error', 'El DPI debe tener exactamente 13 dígitos');
        return false;
      }

      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        showToast('error', 'Los nombres y apellidos son requeridos');
        return false;
      }

      if (!formData.dateOfBirth) {
        showToast('error', 'La fecha de nacimiento es requerida');
        return false;
      }

      // Validar edad mínima (18 años)
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        if (age - 1 < 18) {
          showToast('error', 'Debes ser mayor de 18 años para registrarte');
          return false;
        }
      } else if (age < 18) {
        showToast('error', 'Debes ser mayor de 18 años para registrarte');
        return false;
      }

      if (!formData.phoneNumber.trim()) {
        showToast('error', 'El número de teléfono es requerido');
        return false;
      }
      if (!/^[0-9]{8}$/.test(formData.phoneNumber)) {
        showToast('error', 'El número de teléfono debe tener 8 dígitos');
        return false;
      }

      return true;
    }

    if (step === 2) {
      // Validar Ubicación
      if (!formData.department) {
        showToast('error', 'El departamento es requerido');
        return false;
      }
      if (!formData.municipality) {
        showToast('error', 'El municipio es requerido');
        return false;
      }
      if (!formData.address.trim()) {
        showToast('error', 'La dirección es requerida');
        return false;
      }
      if (formData.address.trim().length < 10) {
        showToast('error', 'La dirección debe tener al menos 10 caracteres');
        return false;
      }

      return true;
    }

    if (step === 3) {
      // Validar Contraseña
      if (!formData.password) {
        showToast('error', 'La contraseña es requerida');
        return false;
      }

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
      if (!passwordRegex.test(formData.password)) {
        showToast(
          'error',
          'La contraseña debe tener al menos 12 caracteres, una mayúscula, una minúscula, un número y un carácter especial'
        );
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        showToast('error', 'Las contraseñas no coinciden');
        return false;
      }

      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 Register form submitted', { currentStep, formData });

    if (!validateStep(currentStep)) {
      console.log('❌ Validation failed for step', currentStep);
      return;
    }

    setIsLoading(true);
    console.log('✅ Starting registration process...');

    try {
      // Sanitizar datos
      const sanitizedData: {
        email: string;
        dpi: string;
        firstName: string;
        lastName: string;
        dateOfBirth: string;
        phoneNumber: string;
        department?: string;
        municipality?: string;
        address?: string;
        password: string;
      } = {
        email: sanitizeInput(formData.email),
        dpi: sanitizeInput(formData.dpi),
        firstName: sanitizeInput(formData.firstName),
        lastName: sanitizeInput(formData.lastName),
        dateOfBirth: formData.dateOfBirth,
        phoneNumber: sanitizeInput(formData.phoneNumber),
        password: formData.password,
      };

      // Agregar department, municipality y address solo si están definidos
      if (formData.department) {
        sanitizedData.department = sanitizeInput(formData.department);
      }
      if (formData.municipality) {
        sanitizedData.municipality = sanitizeInput(formData.municipality);
      }
      if (formData.address) {
        sanitizedData.address = sanitizeInput(formData.address);
      }

      await authApi.register(sanitizedData);

      showToast('success', '¡Registro exitoso! Por favor inicia sesión');
      logger.info('User registered successfully', { email: sanitizedData.email });
      setTimeout(() => navigate('/login'), 2000);
    } catch (error: unknown) {
      logger.error('Error al registrarse', error);
      let errorMessage = 'Error al registrarse. Por favor intenta nuevamente';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string | string[] } } };
        if (axiosError.response?.data?.message) {
          const msg = axiosError.response.data.message;
          errorMessage = Array.isArray(msg) ? msg.join(', ') : msg;
        }
      }
      
      showToast('error', errorMessage);
      console.error('Registration error details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return renderPersonalInfo();
      case 2:
        return renderLocationInfo();
      case 3:
        return renderSecurityInfo();
      default:
        return null;
    }
  };

  const renderPersonalInfo = () => (
    <div className="form-step">
      <h3>Información Personal</h3>
      <p className="step-description">Ingresa tus datos personales y de contacto</p>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="firstName">
            Nombres <span className="required">*</span>
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Ej: Juan Carlos"
            disabled={isLoading}
            autoFocus
          />
        </div>

        <div className="form-group">
          <label htmlFor="lastName">
            Apellidos <span className="required">*</span>
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Ej: García López"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="dpi">
            DPI <span className="required">*</span>
          </label>
          <input
            id="dpi"
            name="dpi"
            type="text"
            value={formData.dpi}
            onChange={handleChange}
            placeholder="1234567890101 (13 dígitos)"
            maxLength={13}
            disabled={isLoading}
          />
          <span className="input-hint">Documento Personal de Identificación</span>
        </div>

        <div className="form-group">
          <label htmlFor="dateOfBirth">
            Fecha de Nacimiento <span className="required">*</span>
          </label>
          <input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleChange}
            max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
            disabled={isLoading}
          />
          <span className="input-hint">Debes ser mayor de 18 años</span>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="email">
            Correo Electrónico <span className="required">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="correo@ejemplo.com"
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="phoneNumber">
            Teléfono <span className="required">*</span>
          </label>
          <input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="12345678"
            maxLength={8}
            disabled={isLoading}
          />
          <span className="input-hint">8 dígitos sin guiones</span>
        </div>
      </div>
    </div>
  );

  const renderLocationInfo = () => (
    <div className="form-step">
      <h3>Ubicación</h3>
      <p className="step-description">Indica tu ubicación geográfica</p>

      <div className="form-group">
        <label htmlFor="department">
          Departamento <span className="required">*</span>
        </label>
        <select
          id="department"
          name="department"
          value={formData.department}
          onChange={handleChange}
          disabled={isLoading}
        >
          <option value="">Selecciona un departamento</option>
          {DEPARTMENTS.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="municipality">
          Municipio <span className="required">*</span>
        </label>
        <select
          id="municipality"
          name="municipality"
          value={formData.municipality}
          onChange={handleChange}
          disabled={isLoading || !formData.department}
        >
          <option value="">
            {formData.department ? 'Selecciona un municipio' : 'Primero selecciona un departamento'}
          </option>
          {availableMunicipalities.map((muni) => (
            <option key={muni} value={muni}>
              {muni}
            </option>
          ))}
        </select>
        {formData.department && availableMunicipalities.length > 0 && (
          <span className="input-hint">
            {availableMunicipalities.length} municipios disponibles en {formData.department}
          </span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="address">
          Dirección Completa <span className="required">*</span>
        </label>
        <textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={(e) => handleChange(e as any)}
          placeholder="Ej: 5ta Avenida 12-34 Zona 1, cerca del parque central"
          rows={3}
          disabled={isLoading}
          className="address-textarea"
        />
        <span className="input-hint">Incluye zona, colonia, puntos de referencia</span>
      </div>
    </div>
  );

  const renderSecurityInfo = () => (
    <div className="form-step">
      <h3>Seguridad</h3>
      <p className="step-description">Crea una contraseña segura para tu cuenta</p>

      <div className="form-group">
        <label htmlFor="password">
          Contraseña <span className="required">*</span>
        </label>
        <div className="password-input-wrapper">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            placeholder="Mínimo 12 caracteres"
            disabled={isLoading}
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            )}
          </button>
        </div>
        <div className="password-requirements">
          <p>La contraseña debe contener:</p>
          <ul>
            <li className={formData.password.length >= 12 ? 'valid' : ''}>
              ✓ Mínimo 12 caracteres
            </li>
            <li className={/[a-z]/.test(formData.password) ? 'valid' : ''}>
              ✓ Una letra minúscula
            </li>
            <li className={/[A-Z]/.test(formData.password) ? 'valid' : ''}>
              ✓ Una letra mayúscula
            </li>
            <li className={/\d/.test(formData.password) ? 'valid' : ''}>
              ✓ Un número
            </li>
            <li className={/[@$!%*?&]/.test(formData.password) ? 'valid' : ''}>
              ✓ Un carácter especial (@$!%*?&)
            </li>
          </ul>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword">
          Confirmar Contraseña <span className="required">*</span>
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type={showPassword ? 'text' : 'password'}
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Repite tu contraseña"
          disabled={isLoading}
        />
        {formData.confirmPassword && formData.password !== formData.confirmPassword && (
          <span className="error-message">Las contraseñas no coinciden</span>
        )}
        {formData.confirmPassword && formData.password === formData.confirmPassword && (
          <span className="success-message">✓ Las contraseñas coinciden</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="register-container-modern">
      <div className="register-card-modern">
        <div className="register-header-modern">
          <div className="logo-section">
            <div className="logo-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M12 8v4l2 2" />
              </svg>
            </div>
            <h1>Registro de Votante</h1>
            <p>Sistema Electoral de Guatemala</p>
          </div>

          {/* Progress Stepper */}
          <div className="stepper">
            <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
              <div className="step-number">
                {currentStep > 1 ? '✓' : '1'}
              </div>
              <div className="step-label">Datos Personales</div>
            </div>
            <div className="step-line"></div>
            <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
              <div className="step-number">
                {currentStep > 2 ? '✓' : '2'}
              </div>
              <div className="step-label">Ubicación</div>
            </div>
            <div className="step-line"></div>
            <div className={`step ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>
              <div className="step-number">
                {currentStep > 3 ? '✓' : '3'}
              </div>
              <div className="step-label">Seguridad</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="register-form-modern">
          {renderStep()}

          <div className="form-actions">
            {currentStep > 1 && (
              <button
                type="button"
                className="btn-secondary"
                onClick={handleBack}
                disabled={isLoading}
              >
                ← Anterior
              </button>
            )}

            {currentStep < 3 ? (
              <button
                type="button"
                className="btn-primary"
                onClick={handleNext}
                disabled={isLoading}
              >
                Siguiente →
              </button>
            ) : (
              <button type="submit" className="btn-register" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Registrando...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="8.5" cy="7" r="4" />
                      <line x1="20" y1="8" x2="20" y2="14" />
                      <line x1="23" y1="11" x2="17" y2="11" />
                    </svg>
                    Crear Cuenta
                  </>
                )}
              </button>
            )}
          </div>
        </form>

        <div className="register-footer-modern">
          <p>
            ¿Ya tienes cuenta?{' '}
            <button
              type="button"
              className="link-button"
              onClick={() => navigate('/login')}
              disabled={isLoading}
            >
              Inicia Sesión
            </button>
          </p>
        </div>
      </div>

      <div className="register-info-modern">
        <div className="info-card-modern">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <h3>Votación Segura</h3>
          <p>Tu información está protegida con cifrado de nivel militar</p>
        </div>

        <div className="info-card-modern">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <h3>Anonimato Total</h3>
          <p>Tu voto es completamente anónimo y no puede ser rastreado</p>
        </div>

        <div className="info-card-modern">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <h3>Disponible 24/7</h3>
          <p>Vota en cualquier momento durante el período electoral</p>
        </div>
      </div>
    </div>
  );
}
