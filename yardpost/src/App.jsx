import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://xpdvllkjniqyruspqsge.supabase.co";
const SUPABASE_KEY = "sb_publishable_q_QW5p1gzkASt1OMSZ4Bcg_WpsjGIEs";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TAG_OPTIONS = ["Furniture","Clothing","Tools","Electronics","Books","Toys","Kids","Baby","Antiques","Collectibles","Records","Jewelry","Sports","Kitchen","Art","Other"];
const TAG_COLORS = { Furniture:"#8B5E3C",Clothing:"#B05095",Tools:"#3C6E8B",Electronics:"#2D7A5B",Books:"#8B6914",Toys:"#CC4A1A",Kids:"#CC4A1A",Baby:"#7B5EA7",Antiques:"#8B5E3C",Collectibles:"#3C6E8B",Records:"#1A1A2E",Jewelry:"#B05095",Sports:"#2D7A5B",Kitchen:"#CC8800",Art:"#7B5EA7",Other:"#555" };

function formatDate(d) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" });
}
function formatTime(t) {
  const [h,m] = t.split(":").map(Number);
  return `${h%12||12}:${String(m).padStart(2,"0")} ${h>=12?"PM":"AM"}`;
}
function daysUntil(d) {
  const today = new Date(); today.setHours(0,0,0,0);
  const diff = Math.round((new Date(d+"T00:00:00") - today)/86400000);
  if(diff===0) return "Today";
  if(diff===1) return "Tomorrow";
  if(diff<0) return "Past";
  return `In ${diff} days`;
}
function getDistanceMiles(lat1,lng1,lat2,lng2) {
  const R=3958.8, dLat=(lat2-lat1)*Math.PI/180, dLng=(lng2-lng1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

function AdBanner({ slot="top", style={} }) {
  return (
    <div style={{ background:"#F5F0E8", border:"2px dashed #CCC", borderRadius:"4px", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", padding:"16px", textAlign:"center", minHeight: slot==="top" ? "90px" : "90px", ...style }}>
      {/* Replace this with your Google AdSense <ins> tag once approved */}
      <div style={{ fontFamily:"'DM Mono',monospace", fontSize:"10px", color:"#AAA", letterSpacing:"0.08em", textTransform:"uppercase" }}>Advertisement</div>
      <div style={{ fontFamily:"'DM Mono',monospace", fontSize:"9px", color:"#CCC", marginTop:"4px" }}>AdSense slot: {slot}</div>
    </div>
  );
}

function SaleCard({ sale, onClick, userLat, userLng }) {
  const badge = daysUntil(sale.date);
  const isPast = badge==="Past";
  const dist = (userLat && sale.lat && sale.lng)
    ? getDistanceMiles(userLat, userLng, sale.lat, sale.lng).toFixed(1) : null;

  return (
    <div onClick={() => !isPast && onClick(sale)}
      style={{ background:"#FFFDF7", border:"2px solid #2A2A2A", borderRadius:"4px", cursor:isPast?"default":"pointer", opacity:isPast?0.55:1, overflow:"hidden", transition:"transform 0.15s, box-shadow 0.15s", boxShadow:"4px 4px 0 #2A2A2A", display:"flex", flexDirection:"column" }}
      onMouseEnter={e=>{ if(!isPast){e.currentTarget.style.transform="translate(-2px,-2px)";e.currentTarget.style.boxShadow="6px 6px 0 #2A2A2A";}}}
      onMouseLeave={e=>{ e.currentTarget.style.transform="translate(0,0)";e.currentTarget.style.boxShadow="4px 4px 0 #2A2A2A";}}>
      <div style={{ background:"#E8C547", padding:"10px 14px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:"2px solid #2A2A2A" }}>
        <span style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:"11px", letterSpacing:"0.08em", textTransform:"uppercase" }}>
          {sale.city}, {sale.state} {dist && <span style={{fontWeight:400,color:"#555"}}>· {dist} mi</span>}
        </span>
        <span style={{ background:badge==="Today"?"#C0392B":badge==="Tomorrow"?"#2D7A5B":badge==="Past"?"#888":"#2A2A2A", color:"#fff", fontFamily:"'DM Mono',monospace", fontSize:"10px", padding:"2px 8px", borderRadius:"2px", fontWeight:600 }}>{badge}</span>
      </div>
      <div style={{ padding:"16px 14px 12px", flex:1 }}>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"17px", fontWeight:700, lineHeight:1.25, marginBottom:"6px", color:"#1A1A1A" }}>{sale.title}</div>
        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:"11px", color:"#666", marginBottom:"10px" }}>{sale.address} · {formatDate(sale.date)}</div>
        <div style={{ fontFamily:"'Crimson Text',serif", fontSize:"14px", color:"#444", lineHeight:1.5, marginBottom:"12px" }}>{sale.description.slice(0,100)}{sale.description.length>100?"…":""}</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:"4px" }}>
          {(sale.tags||[]).map(tag=>(
            <span key={tag} style={{ background:TAG_COLORS[tag]||"#555", color:"#fff", fontFamily:"'DM Mono',monospace", fontSize:"9px", padding:"2px 7px", borderRadius:"2px", letterSpacing:"0.06em", textTransform:"uppercase" }}>{tag}</span>
          ))}
        </div>
      </div>
      <div style={{ borderTop:"2px solid #2A2A2A", padding:"8px 14px", background:"#F5F0E8", fontFamily:"'DM Mono',monospace", fontSize:"11px", color:"#555", display:"flex", justifyContent:"space-between" }}>
        <span>🕐 {formatTime(sale.start_time)} – {formatTime(sale.end_time)}</span>
        <span>by {sale.host}</span>
      </div>
    </div>
  );
}

function Modal({ sale, onClose }) {
  if(!sale) return null;
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"#FFFDF7", border:"3px solid #2A2A2A", borderRadius:"4px", boxShadow:"8px 8px 0 #2A2A2A", maxWidth:"560px", width:"100%", maxHeight:"90vh", overflow:"auto" }}>
        <div style={{ background:"#E8C547", padding:"16px 20px", borderBottom:"3px solid #2A2A2A", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"22px", fontWeight:700, color:"#1A1A1A", lineHeight:1.2 }}>{sale.title}</div>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:"11px", color:"#555", marginTop:"4px" }}>Hosted by {sale.host}</div>
          </div>
          <button onClick={onClose} style={{ background:"#2A2A2A", color:"#E8C547", border:"none", borderRadius:"2px", width:"30px", height:"30px", cursor:"pointer", fontSize:"16px", fontWeight:700 }}>×</button>
        </div>
        <div style={{ padding:"20px" }}>
          <AdBanner slot="modal" style={{ marginBottom:"16px" }} />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"16px" }}>
            {[["📍 Address",`${sale.address}, ${sale.city}, ${sale.state} ${sale.zip}`],["📅 Date",formatDate(sale.date)],["🕐 Time",`${formatTime(sale.start_time)} – ${formatTime(sale.end_time)}`],["📣 Status",daysUntil(sale.date)]].map(([label,value])=>(
              <div key={label} style={{ background:"#F5F0E8", border:"1.5px solid #DDD", borderRadius:"3px", padding:"10px 12px" }}>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:"9px", color:"#888", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"3px" }}>{label}</div>
                <div style={{ fontFamily:"'Crimson Text',serif", fontSize:"15px", color:"#1A1A1A", fontWeight:600 }}>{value}</div>
              </div>
            ))}
          </div>
          <div style={{ fontFamily:"'Crimson Text',serif", fontSize:"16px", color:"#333", lineHeight:1.65, marginBottom:"16px" }}>{sale.description}</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"5px", marginBottom:"20px" }}>
            {(sale.tags||[]).map(tag=>(
              <span key={tag} style={{ background:TAG_COLORS[tag]||"#555", color:"#fff", fontFamily:"'DM Mono',monospace", fontSize:"9px", padding:"3px 9px", borderRadius:"2px", letterSpacing:"0.06em", textTransform:"uppercase" }}>{tag}</span>
            ))}
          </div>
          <a href={`https://maps.google.com/?q=${encodeURIComponent(sale.address+", "+sale.city+", "+sale.state)}`} target="_blank" rel="noreferrer"
            style={{ display:"inline-block", background:"#2A2A2A", color:"#E8C547", fontFamily:"'DM Mono',monospace", fontSize:"12px", padding:"10px 18px", borderRadius:"3px", textDecoration:"none", letterSpacing:"0.06em" }}>
            → Open in Google Maps
          </a>
        </div>
      </div>
    </div>
  );
}

function PostForm({ onPost, onClose }) {
  const [form, setForm] = useState({ title:"", host:"", address:"", city:"", state:"MA", zip:"", date:"", start_time:"08:00", end_time:"14:00", description:"", tags:[] });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const toggleTag = tag => set("tags", form.tags.includes(tag)?form.tags.filter(t=>t!==tag):[...form.tags,tag]);

  const validate = () => {
    const e={};
    if(!form.title.trim()) e.title="Required";
    if(!form.host.trim()) e.host="Required";
    if(!form.address.trim()) e.address="Required";
    if(!form.city.trim()) e.city="Required";
    if(!form.zip.trim()) e.zip="Required";
    if(!form.date) e.date="Required";
    if(!form.description.trim()) e.description="Required";
    if(form.tags.length===0) e.tags="Pick at least one";
    setErrors(e);
    return Object.keys(e).length===0;
  };

  const geocode = async () => {
    try {
      const q = encodeURIComponent(`${form.address}, ${form.city}, ${form.state} ${form.zip}`);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`);
      const data = await res.json();
      if(data[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    } catch {}
    return { lat: null, lng: null };
  };

  const submit = async () => {
    if(!validate()) return;
    setSaving(true);
    setSaveError("");
    const { lat, lng } = await geocode();
    const { data, error } = await supabase.from("sales").insert([{ ...form, lat, lng }]).select();
    setSaving(false);
    if(error) { setSaveError("Error saving: " + error.message); return; }
    onPost(data[0]);
    onClose();
  };

  const inputStyle = (err) => ({ width:"100%", boxSizing:"border-box", border:`2px solid ${err?"#C0392B":"#2A2A2A"}`, borderRadius:"3px", padding:"9px 11px", fontFamily:"'Crimson Text',serif", fontSize:"15px", background:"#FFFDF7", outline:"none" });
  const labelStyle = { fontFamily:"'DM Mono',monospace", fontSize:"10px", color:"#555", letterSpacing:"0.07em", textTransform:"uppercase", display:"block", marginBottom:"4px" };

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.65)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"#FFFDF7", border:"3px solid #2A2A2A", borderRadius:"4px", boxShadow:"8px 8px 0 #2A2A2A", maxWidth:"600px", width:"100%", maxHeight:"92vh", overflow:"auto" }}>
        <div style={{ background:"#2A2A2A", padding:"16px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"20px", fontWeight:700, color:"#E8C547" }}>Post a Yard Sale</div>
          <button onClick={onClose} style={{ background:"#E8C547", color:"#2A2A2A", border:"none", borderRadius:"2px", width:"30px", height:"30px", cursor:"pointer", fontSize:"16px", fontWeight:700 }}>×</button>
        </div>
        <div style={{ padding:"20px", display:"flex", flexDirection:"column", gap:"14px" }}>
          {saveError && <div style={{ background:"#FFF0F0", border:"2px solid #C0392B", borderRadius:"3px", padding:"10px", fontFamily:"'DM Mono',monospace", fontSize:"11px", color:"#C0392B" }}>{saveError}</div>}
          {[["Sale Title","title","e.g. Moving Sale — Everything Must Go!"],["Your Name / Household","host","e.g. The Murphys"]].map(([label,key,ph])=>(
            <div key={key}>
              <label style={labelStyle}>{label} *</label>
              <input value={form[key]} onChange={e=>set(key,e.target.value)} placeholder={ph} style={inputStyle(errors[key])} />
              {errors[key] && <div style={{ color:"#C0392B", fontFamily:"'DM Mono',monospace", fontSize:"10px", marginTop:"3px" }}>{errors[key]}</div>}
            </div>
          ))}
          <div>
            <label style={labelStyle}>Street Address *</label>
            <input value={form.address} onChange={e=>set("address",e.target.value)} placeholder="14 Elm Street" style={inputStyle(errors.address)} />
            {errors.address && <div style={{ color:"#C0392B", fontFamily:"'DM Mono',monospace", fontSize:"10px", marginTop:"3px" }}>{errors.address}</div>}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 80px 80px", gap:"10px" }}>
            <div>
              <label style={labelStyle}>City *</label>
              <input value={form.city} onChange={e=>set("city",e.target.value)} placeholder="Salem" style={inputStyle(errors.city)} />
              {errors.city && <div style={{ color:"#C0392B", fontFamily:"'DM Mono',monospace", fontSize:"10px", marginTop:"3px" }}>{errors.city}</div>}
            </div>
            <div><label style={labelStyle}>State</label><input value={form.state} onChange={e=>set("state",e.target.value)} maxLength={2} style={inputStyle(false)} /></div>
            <div>
              <label style={labelStyle}>ZIP *</label>
              <input value={form.zip} onChange={e=>set("zip",e.target.value)} maxLength={5} style={inputStyle(errors.zip)} />
              {errors.zip && <div style={{ color:"#C0392B", fontFamily:"'DM Mono',monospace", fontSize:"10px", marginTop:"3px" }}>{errors.zip}</div>}
            </div>
          </div>
          <div>
            <label style={labelStyle}>Date *</label>
            <input type="date" value={form.date} onChange={e=>set("date",e.target.value)} style={inputStyle(errors.date)} />
            {errors.date && <div style={{ color:"#C0392B", fontFamily:"'DM Mono',monospace", fontSize:"10px", marginTop:"3px" }}>{errors.date}</div>}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
            <div><label style={labelStyle}>Start Time</label><input type="time" value={form.start_time} onChange={e=>set("start_time",e.target.value)} style={inputStyle(false)} /></div>
            <div><label style={labelStyle}>End Time</label><input type="time" value={form.end_time} onChange={e=>set("end_time",e.target.value)} style={inputStyle(false)} /></div>
          </div>
          <div>
            <label style={labelStyle}>Description *</label>
            <textarea value={form.description} onChange={e=>set("description",e.target.value)} placeholder="What's for sale? Any highlights?" rows={3} style={{ ...inputStyle(errors.description), resize:"vertical" }} />
            {errors.description && <div style={{ color:"#C0392B", fontFamily:"'DM Mono',monospace", fontSize:"10px", marginTop:"3px" }}>{errors.description}</div>}
          </div>
          <div>
            <label style={labelStyle}>Categories * {errors.tags && <span style={{color:"#C0392B"}}>{errors.tags}</span>}</label>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
              {TAG_OPTIONS.map(tag=>(
                <button key={tag} onClick={()=>toggleTag(tag)} style={{ border:"2px solid #2A2A2A", borderRadius:"3px", padding:"4px 10px", fontFamily:"'DM Mono',monospace", fontSize:"10px", cursor:"pointer", background:form.tags.includes(tag)?(TAG_COLORS[tag]||"#2A2A2A"):"#FFFDF7", color:form.tags.includes(tag)?"#fff":"#2A2A2A", textTransform:"uppercase", letterSpacing:"0.05em", transition:"all 0.1s" }}>{tag}</button>
              ))}
            </div>
          </div>
          <button onClick={submit} disabled={saving} style={{ background:saving?"#CCC":"#E8C547", border:"2px solid #2A2A2A", borderRadius:"3px", boxShadow:"3px 3px 0 #2A2A2A", padding:"12px", fontFamily:"'Playfair Display',serif", fontSize:"16px", fontWeight:700, cursor:saving?"not-allowed":"pointer", transition:"all 0.1s", marginTop:"4px" }}>
            {saving ? "Saving…" : "Post My Yard Sale →"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterTags, setFilterTags] = useState([]);
  const [sortBy, setSortBy] = useState("date");
  const [userLat, setUserLat] = useState(null);
  const [userLng, setUserLng] = useState(null);
  const [radiusMiles, setRadiusMiles] = useState(25);
  const [locating, setLocating] = useState(false);

  useEffect(() => { fetchSales(); }, []);

  const fetchSales = async () => {
    setLoading(true);
    const { data } = await supabase.from("sales").select("*").order("date", { ascending: true });
    setSales(data || []);
    setLoading(false);
  };

  const getLocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => { setUserLat(pos.coords.latitude); setUserLng(pos.coords.longitude); setLocating(false); setSortBy("distance"); },
      () => { setLocating(false); alert("Couldn't get your location. Please allow location access in your browser settings and try again."); }
    );
  };

  const clearLocation = () => { setUserLat(null); setUserLng(null); if(sortBy==="distance") setSortBy("date"); };
  const toggleFilterTag = tag => setFilterTags(t=>t.includes(tag)?t.filter(x=>x!==tag):[...t,tag]);

  const filtered = sales
    .filter(s => {
      const q = search.toLowerCase();
      const matchSearch = !q || s.title.toLowerCase().includes(q) || s.city.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || (s.tags||[]).some(t=>t.toLowerCase().includes(q));
      const matchTags = filterTags.length===0 || filterTags.every(t=>(s.tags||[]).includes(t));
      const matchRadius = !userLat || !s.lat || getDistanceMiles(userLat,userLng,s.lat,s.lng) <= radiusMiles;
      return matchSearch && matchTags && matchRadius;
    })
    .sort((a,b) => {
      if(sortBy==="distance" && userLat && a.lat && b.lat)
        return getDistanceMiles(userLat,userLng,a.lat,a.lng) - getDistanceMiles(userLat,userLng,b.lat,b.lng);
      return new Date(a.date) - new Date(b.date);
    });

  const itemsWithAds = [];
  filtered.forEach((sale,i) => {
    itemsWithAds.push({ type:"sale", sale });
    if((i+1)%6===0) itemsWithAds.push({ type:"ad", key:`ad-${i}` });
  });

  const inputBase = { border:"2px solid #2A2A2A", borderRadius:"3px", padding:"9px 12px", fontFamily:"'Crimson Text',serif", fontSize:"15px", background:"#FFFDF7", outline:"none" };

  return (
    <div style={{ minHeight:"100vh", background:"#F5F0E8" }}>
      <header style={{ background:"#2A2A2A", borderBottom:"4px solid #E8C547", padding:"0 24px", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ maxWidth:"1100px", margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 0" }}>
          <div style={{ display:"flex", alignItems:"baseline", gap:"10px" }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"26px", fontWeight:800, color:"#E8C547", lineHeight:1 }}>YardPost</div>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:"9px", color:"#888", letterSpacing:"0.1em", textTransform:"uppercase" }}>local yard sales</div>
          </div>
          <button onClick={()=>setShowForm(true)} style={{ background:"#E8C547", border:"2px solid #E8C547", borderRadius:"3px", padding:"9px 18px", fontFamily:"'DM Mono',monospace", fontSize:"11px", fontWeight:600, cursor:"pointer", letterSpacing:"0.07em", textTransform:"uppercase", color:"#1A1A1A" }}>
            + Post a Sale
          </button>
        </div>
      </header>

      <div style={{ maxWidth:"1100px", margin:"16px auto 0", padding:"0 24px" }}>
        <AdBanner slot="leaderboard" />
      </div>

      <div style={{ background:"#E8C547", borderBottom:"3px solid #2A2A2A", padding:"32px 24px 24px", marginTop:"12px" }}>
        <div style={{ maxWidth:"1100px", margin:"0 auto" }}>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(26px,5vw,48px)", fontWeight:800, color:"#1A1A1A", lineHeight:1.1, marginBottom:"6px" }}>Find yard sales<br />in your neighborhood.</div>
          <div style={{ fontFamily:"'Crimson Text',serif", fontSize:"18px", color:"#555", marginBottom:"18px" }}>Browse listings or post your own — completely free.</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"8px", maxWidth:"640px" }}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by city, keyword, or category…" style={{ flex:"1 1 260px", ...inputBase }} />
            {!userLat ? (
              <button onClick={getLocation} disabled={locating} style={{ background:"#2A2A2A", color:"#E8C547", border:"2px solid #2A2A2A", borderRadius:"3px", padding:"9px 14px", fontFamily:"'DM Mono',monospace", fontSize:"11px", cursor:locating?"not-allowed":"pointer", letterSpacing:"0.06em", textTransform:"uppercase" }}>
                {locating?"Locating…":"📍 Near Me"}
              </button>
            ) : (
              <div style={{ display:"flex", alignItems:"center", gap:"6px", background:"#2A2A2A", border:"2px solid #2A2A2A", borderRadius:"3px", padding:"0 12px" }}>
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"10px", color:"#E8C547" }}>📍 Near you</span>
                <select value={radiusMiles} onChange={e=>setRadiusMiles(Number(e.target.value))} style={{ background:"transparent", border:"none", color:"#E8C547", fontFamily:"'DM Mono',monospace", fontSize:"10px", cursor:"pointer", outline:"none" }}>
                  {[5,10,25,50].map(r=><option key={r} value={r} style={{background:"#2A2A2A"}}>{r} mi</option>)}
                </select>
                <button onClick={clearLocation} style={{ background:"none", border:"none", color:"#888", cursor:"pointer", fontSize:"14px" }}>×</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ background:"#FFFDF7", borderBottom:"2px solid #DDD", padding:"12px 24px" }}>
        <div style={{ maxWidth:"1100px", margin:"0 auto", display:"flex", flexWrap:"wrap", gap:"8px", alignItems:"center" }}>
          <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"9px", color:"#888", letterSpacing:"0.08em", textTransform:"uppercase", marginRight:"4px" }}>Filter:</span>
          {TAG_OPTIONS.slice(0,10).map(tag=>(
            <button key={tag} onClick={()=>toggleFilterTag(tag)} style={{ border:"1.5px solid #2A2A2A", borderRadius:"2px", padding:"3px 9px", fontFamily:"'DM Mono',monospace", fontSize:"9px", cursor:"pointer", background:filterTags.includes(tag)?(TAG_COLORS[tag]||"#2A2A2A"):"#F5F0E8", color:filterTags.includes(tag)?"#fff":"#2A2A2A", textTransform:"uppercase", letterSpacing:"0.05em", transition:"all 0.1s" }}>{tag}</button>
          ))}
          {filterTags.length>0 && <button onClick={()=>setFilterTags([])} style={{ background:"none", border:"none", fontFamily:"'DM Mono',monospace", fontSize:"10px", color:"#C0392B", cursor:"pointer", textDecoration:"underline" }}>Clear</button>}
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:"6px" }}>
            <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"9px", color:"#888", textTransform:"uppercase", letterSpacing:"0.07em" }}>Sort:</span>
            {[["date","By Date"],["distance","Nearest"]].map(([opt,label])=>(
              <button key={opt} onClick={()=>{ if(opt==="distance"&&!userLat) getLocation(); setSortBy(opt); }} style={{ border:"1.5px solid #2A2A2A", borderRadius:"2px", padding:"3px 9px", fontFamily:"'DM Mono',monospace", fontSize:"9px", cursor:"pointer", background:sortBy===opt?"#2A2A2A":"#F5F0E8", color:sortBy===opt?"#E8C547":"#2A2A2A", textTransform:"uppercase", letterSpacing:"0.05em" }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      <main style={{ maxWidth:"1100px", margin:"0 auto", padding:"28px 24px" }}>
        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:"10px", color:"#888", marginBottom:"16px", letterSpacing:"0.06em" }}>
          {loading ? "Loading sales…" : `${filtered.length} sale${filtered.length!==1?"s":""} found${userLat?` within ${radiusMiles} miles`:""}`}
        </div>
        {loading ? (
          <div style={{ textAlign:"center", padding:"60px", fontFamily:"'Playfair Display',serif", fontSize:"20px", color:"#AAA" }}>Loading…</div>
        ) : filtered.length===0 ? (
          <div style={{ textAlign:"center", padding:"60px 20px" }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"24px", color:"#AAA", marginBottom:"10px" }}>No sales found.</div>
            <div style={{ fontFamily:"'Crimson Text',serif", fontSize:"16px", color:"#BBB" }}>Try a different search or be the first to post in your area!</div>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:"20px" }}>
            {itemsWithAds.map((item,i) =>
              item.type==="ad"
                ? <div key={item.key} style={{gridColumn:"1/-1"}}><AdBanner slot={`inline-${i}`} /></div>
                : <SaleCard key={item.sale.id} sale={item.sale} onClick={setSelected} userLat={userLat} userLng={userLng} />
            )}
          </div>
        )}
      </main>

      <div style={{ maxWidth:"1100px", margin:"0 auto", padding:"0 24px 32px" }}>
        <AdBanner slot="footer" />
      </div>

      <footer style={{ borderTop:"2px solid #2A2A2A", padding:"20px 24px", textAlign:"center", background:"#2A2A2A" }}>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"18px", fontWeight:700, color:"#E8C547" }}>YardPost</div>
        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:"9px", color:"#666", marginTop:"4px", letterSpacing:"0.07em" }}>FREE · LOCAL · NO ACCOUNT NEEDED</div>
      </footer>

      {selected && <Modal sale={selected} onClose={()=>setSelected(null)} />}
      {showForm && <PostForm onPost={sale=>setSales(s=>[sale,...s])} onClose={()=>setShowForm(false)} />}
    </div>
  );
}
