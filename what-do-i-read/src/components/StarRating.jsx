// StarRating.jsx
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

export default function StarRating({ rating, maxStars = 5, size = 16 }) {
  const stars = [];
  
  for (let i = 1; i <= maxStars; i++) {
    if (i <= rating) {
      // Full star
      stars.push(<FaStar key={i} size={size} color="#d4af37" />);
    } else if (i - 0.5 <= rating) {
      // Half star
      stars.push(<FaStarHalfAlt key={i} size={size} color="#d4af37" />);
    } else {
      // Empty star
      stars.push(<FaRegStar key={i} size={size} color="#666" />);
    }
  }
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
      {stars}
      <span style={{ marginLeft: '6px', fontSize: '12px', color: 'var(--muted)' }}>
        ({rating.toFixed(1)})
      </span>
    </div>
  );
}