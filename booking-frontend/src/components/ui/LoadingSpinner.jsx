export default function LoadingSpinner({ size = 'md', text = 'Cargando...' }) {
  const sizeMap = { sm: '24px', md: '40px', lg: '56px' };
  const dimension = sizeMap[size] || sizeMap.md;

  return (
    <div className="loading-spinner-container">
      <div
        className="loading-spinner"
        style={{ width: dimension, height: dimension }}
      />
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
}
