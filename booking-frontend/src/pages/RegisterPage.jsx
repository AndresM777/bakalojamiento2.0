import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineUser, HiOutlineIdentification, HiOutlinePhone, HiOutlineMapPin } from 'react-icons/hi2';
import { clientesApi } from '../api/clientes.api';
import {
  validateForm,
  isRequired,
  isValidEmail,
  isValidPassword,
  isValidCedula,
  isValidTelefono,
} from '../utils/validators';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    email: '',
    password: '',
    nombreCompleto: '',
    cedula: '',
    telefono: '',
    domicilio: '',
  });

  const validationRules = {
    nombreCompleto: [{ validate: isRequired, message: 'El nombre es obligatorio' }],
    email: [
      { validate: isRequired, message: 'El email es obligatorio' },
      { validate: isValidEmail, message: 'Ingresa un email válido' },
    ],
    password: [
      { validate: isRequired, message: 'La contraseña es obligatoria' },
      { validate: isValidPassword, message: 'Mínimo 6 caracteres' },
    ],
    cedula: [
      { validate: isRequired, message: 'La cédula es obligatoria' },
      { validate: isValidCedula, message: 'Cédula: 7-10 dígitos numéricos' },
    ],
    telefono: [
      { validate: isRequired, message: 'El teléfono es obligatorio' },
      { validate: isValidTelefono, message: 'Teléfono inválido' },
    ],
    domicilio: [{ validate: isRequired, message: 'El domicilio es obligatorio' }],
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm(validationRules, form);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    try {
      await clientesApi.registrar(form);
      toast.success('¡Cuenta creada exitosamente! Inicia sesión.');
      navigate('/login');
    } catch (err) {
      const msg = err.backendMessage || 'Error al registrar. Intenta de nuevo.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'nombreCompleto', label: 'Nombre completo', icon: HiOutlineUser, type: 'text', placeholder: 'Juan Pérez', autoComplete: 'name' },
    { name: 'email', label: 'Correo electrónico', icon: HiOutlineEnvelope, type: 'email', placeholder: 'tu@email.com', autoComplete: 'email' },
    { name: 'password', label: 'Contraseña', icon: HiOutlineLockClosed, type: 'password', placeholder: '••••••••', autoComplete: 'new-password' },
    { name: 'cedula', label: 'Cédula', icon: HiOutlineIdentification, type: 'text', placeholder: '1234567890', autoComplete: 'off' },
    { name: 'telefono', label: 'Teléfono', icon: HiOutlinePhone, type: 'tel', placeholder: '3001234567', autoComplete: 'tel' },
    { name: 'domicilio', label: 'Domicilio', icon: HiOutlineMapPin, type: 'text', placeholder: 'Calle 123 #45-67, Bogotá', autoComplete: 'street-address' },
  ];

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <h1>Crear Cuenta</h1>
          <p>Regístrate para empezar a reservar</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-grid-2">
            {fields.map(({ name, label, icon: Icon, type, placeholder, autoComplete }) => (
              <div key={name} className={`form-group ${errors[name] ? 'has-error' : ''}`}>
                <label htmlFor={name}>{label}</label>
                <div className="input-icon-wrapper">
                  <Icon size={18} />
                  <input
                    id={name}
                    name={name}
                    type={type}
                    placeholder={placeholder}
                    value={form[name]}
                    onChange={handleChange}
                    autoComplete={autoComplete}
                  />
                </div>
                {errors[name] && <span className="field-error">{errors[name]}</span>}
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Crear Cuenta'}
          </button>
        </form>

        <p className="auth-footer-text">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
