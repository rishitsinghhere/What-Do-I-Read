import { useMemo, useState } from "react";
import { genres, books } from "../data/books";
import BookCard from "../components/BookCard";

export default function SelectGenres(){
  const [selected, setSelected] = useState([]);
  const toggle = (id) =>
    setSelected((s) => (s.includes(id) ? s.filter(x=>x!==id) : [...s, id]));

  const results = useMemo(()=>{
    if (!selected.length) return books.slice(0,12);
    return books.filter(b => selected.includes(b.genreId));
  },[selected]);

  return (
    <>
    <div class ="container-selectgenres">
      <h2 style={{margin:"10px 0 8px"}}>Select Genres</h2>
      <p className="muted" style={{marginTop:0}}>Pick one or many. Results update instantly.</p>

    <hr style={{ marginTop: 40,  borderColor: "transparent"}} />



      <div className="row" style={{marginBottom:14}}>
        {genres.map(g=>(
          <button key={g.id}
            onClick={()=>toggle(g.id)}
            className={`btn ${selected.includes(g.id)?"primary":""}`}>
            {g.name}
          </button>
        ))}
        <button className="btn" onClick={()=>setSelected([])}>Clear</button>
      </div>

       <hr style={{ marginTop: 50, marginBottom: 50 , borderColor: "#333", borderWidth: "2px" }} />

      <div className="grid grid-5">
        {results.map(b=><BookCard key={b.id} book={b} />)}
      </div>
    </div>
    </>

  )
}
