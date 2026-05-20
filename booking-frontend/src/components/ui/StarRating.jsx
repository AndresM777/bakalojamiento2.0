import { HiStar } from 'react-icons/hi2';

export default function StarRating({ rating = 0, max = 5, size = 16 }) {
  return (
    <div className="star-rating" aria-label={`${rating} de ${max} estrellas`}>
      {Array.from({ length: max }, (_, i) => (
        <HiStar
          key={i}
          size={size}
          className={i < rating ? 'star-filled' : 'star-empty'}
        />
      ))}
    </div>
  );
}
