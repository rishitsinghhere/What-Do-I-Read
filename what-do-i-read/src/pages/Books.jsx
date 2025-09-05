import { useParams } from "react-router-dom";
import { booksByGenre, genres } from "../data/books";
import BookCard from "../components/BookCard";

export default function Books(){
  const { genreId } = useParams();
  const list = booksByGenre[genreId] || [];
  const g = genres.find(x=>x.id===genreId);

  return (
    <>
    <div class ="container-books">
      <h2 style={{margin:"10px 0 14px"}}>{g ? g.name : "Books"}</h2>
      <div className="grid grid-5">
        {list.map(b => <BookCard key={b.id} book={b} />)}
      </div>
    </div>
    </>
  )
}
