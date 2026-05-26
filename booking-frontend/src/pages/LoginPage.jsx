import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlineEnvelope, HiOutlineLockClosed } from 'react-icons/hi2';
import { authApi } from '../api/auth.api';
import { clientesApi } from '../api/clientes.api';
import useAuthStore from '../stores/useAuthStore';
import { validateForm, isValidEmail, isRequired } from '../utils/validators';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const validationRules = {
    email: [
      { validate: isRequired, message: 'El email es obligatorio' },
      { validate: isValidEmail, message: 'Ingresa un email válido' },
    ],
    password: [
      { validate: isRequired, message: 'La contraseña es obligatoria' },
    ],
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
      const { data } = await authApi.login(form);

      // Si el backend no retornó clienteId en la respuesta, intentamos buscarlo
      if (!data.clienteId) {
        try {
          const { data: listaClientes } = await clientesApi.getAll({ nombre: form.email });
          const lista = Array.isArray(listaClientes)
            ? listaClientes
            : Array.isArray(listaClientes?.items) ? listaClientes.items : [];
          const cliente = lista.find((c) => c.email === form.email);
          if (cliente?.clienteId) {
            data.clienteId = cliente.clienteId;
          }
        } catch {
          // Si falla la búsqueda, continuamos sin clienteId (admin u otro rol)
        }
      }

      login(data);
      toast.success(`¡Bienvenido, ${data.nombreCompleto}!`);
      navigate('/');
    } catch (err) {
      const msg = err.backendMessage || 'Credenciales inválidas';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Iniciar Sesión</h1>
          <p>Accede a tu cuenta para gestionar tus reservas</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
            <label htmlFor="email">Correo electrónico</label>
            <div className="input-icon-wrapper">
              <HiOutlineEnvelope size={18} />
              <input
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className={`form-group ${errors.password ? 'has-error' : ''}`}>
            <label htmlFor="password">Contraseña</label>
            <div className="input-icon-wrapper">
              <HiOutlineLockClosed size={18} />
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <p className="auth-footer-text">
          ¿No tienes cuenta?{' '}
          <Link to="/register">Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
}
