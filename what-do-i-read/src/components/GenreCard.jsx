import { Link } from "react-router-dom";
import { booksByGenre } from "../data/books";

export default function GenreCard({ genre }){
  const sample = booksByGenre[genre.id][0];
  const bg = sample?.cover;
  return (
    <Link to={`/books/${genre.id}`} className="card" style={{
      display:"grid",alignContent:"end",minHeight:220,padding:16,
      backgroundImage:`linear-gradient(180deg,rgba(8,10,14,.15),rgba(8,10,14,.85)), url(${bg})`,
      backgroundSize:"cover",backgroundPosition:"center"
    }}>
      <div className="pill" style={{width:"fit-content"}}>{genre.name}</div>
      <div className="muted" style={{fontSize:12,marginTop:6,marginLeft:6}}>
        {booksByGenre[genre.id].length} books
      </div>
    </Link>
  )
}
