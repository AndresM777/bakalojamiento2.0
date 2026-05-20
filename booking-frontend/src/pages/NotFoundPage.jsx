import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="not-found-page">
      <h1>404</h1>
      <p>La página que buscas no existe</p>
      <Link to="/" className="btn btn-primary">Volver al inicio</Link>
    </div>
  );
}
