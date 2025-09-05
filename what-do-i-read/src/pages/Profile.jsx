import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLibrary } from "../context/LibraryContext";
import BookCard from "../components/BookCard";

export default function Profile(){
  const { user, updateProfile } = useAuth();
  const { playlists, renamePlaylist, removePlaylist, createPlaylist, saved, booksById } = useLibrary();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [photo, setPhoto] = useState(user?.photo || "");

  const handleSaveProfile = () => updateProfile({ name, email, photo });

  return (
    <>
    <div class ="container-profile">
      <h2 style={{margin:"10px 0 14px 10px"}}>Profile</h2>
      <div className="grid grid-2">
        <div className="card" style={{padding:16}}>
          <div className="row">
            <img src={photo} alt="avatar" style={{width:80,height:80,borderRadius:"50%",border:"1px solid var(--border)"}} />
            <div>
              <div className="label">Name</div>
              <input className="input" value={name} onChange={e=>setName(e.target.value)} />
              <div className="label" style={{marginTop:8}}>Email</div>
              <input className="input" value={email} onChange={e=>setEmail(e.target.value)} />
              <div className="label" style={{marginTop:8}}>Photo URL</div>
              <input className="input" value={photo} onChange={e=>setPhoto(e.target.value)} />
              <div className="row" style={{marginTop:12}}>
                <button className="btn primary" onClick={handleSaveProfile}>Update</button>
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{padding:16}}>
          <div className="row" style={{justifyContent:"space-between",alignItems:"center"}}>
            <h3 style={{margin:0}}>Playlists</h3>
            <button className="btn" onClick={()=>createPlaylist(prompt("Playlist name") || "New Playlist")}>New Playlist</button>
          </div>
          <div className="grid grid-2" style={{marginTop:12}}>
            {playlists.map(pl=>(
              <div key={pl.id} className="card" style={{padding:14}}>
                <div className="row" style={{justifyContent:"space-between"}}>
                  <input className="input" value={pl.name}
                    onChange={e=>renamePlaylist(pl.id, e.target.value)} />
                  {pl.id !== "default" && (
                    <button className="btn" onClick={()=>removePlaylist(pl.id)}>Delete</button>
                  )}
                </div>
                <div className="list-h" style={{marginTop:10}}>
                  {pl.bookIds.map(id=>{
                    const b = booksById[id];
                    return b ? <div key={id} style={{width:130}}><BookCard book={b} /></div> : null;
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="sep" />
      <h3>Saved Books</h3>
      <div className="grid grid-5" style={{marginTop:12}}>
        {Object.keys(saved).map(id=>{
          const b = booksById[id];
          return b ? <BookCard key={id} book={b} /> : null;
        })}
      </div>
    </div>
    </>
  )
}
