import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import "./styles.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";
function BriefCard({ brief, onDelete }) { return <article className="card"><h2>{brief.city}</h2><p>{brief.temperature}° · {brief.condition}</p><p>{brief.summary}</p><p><strong>Wear:</strong> {brief.clothingAdvice}</p>{brief.alerts?.map((alert) => <p className="alert" key={alert}>{alert}</p>)}{brief._id && <button onClick={() => onDelete(brief._id)}>Delete</button>}</article>; }
function Create({ refresh }) {
  const [city, setCity] = useState(""); const [units, setUnits] = useState("metric"); const [brief, setBrief] = useState(null); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(event) { event.preventDefault(); setLoading(true); setError(""); try { const response = await fetch(`${API}/api/weather-briefs`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ city, units }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error); setBrief(data); refresh(); } catch (e) { setError(e.message); } finally { setLoading(false); } }
  return <main><h1>Weather Brief AI</h1><form onSubmit={submit}><input aria-label="City" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Enter a city" required /><select value={units} onChange={(e) => setUnits(e.target.value)}><option value="metric">Metric</option><option value="imperial">Imperial</option></select><button disabled={loading}>{loading ? "Generating…" : "Generate brief"}</button></form>{error && <p role="alert">{error}</p>}{brief && <BriefCard brief={brief} onDelete={() => {}} />}</main>;
}
function History() {
  const [briefs, setBriefs] = useState([]); const [error, setError] = useState("");
  const load = async () => { try { const response = await fetch(`${API}/api/weather-briefs`); if (!response.ok) throw new Error("Could not load history"); setBriefs(await response.json()); } catch (e) { setError(e.message); } };
  useEffect(() => { load(); }, []);
  const remove = async (id) => { const response = await fetch(`${API}/api/weather-briefs/${id}`, { method: "DELETE" }); if (response.ok) setBriefs((old) => old.filter((brief) => brief._id !== id)); };
  return <main><h1>Saved briefs</h1>{error && <p role="alert">{error}</p>}{briefs.length ? briefs.map((brief) => <BriefCard key={brief._id} brief={brief} onDelete={remove} />) : <p>No saved briefs yet.</p>}</main>;
}
function App() { const [, setVersion] = useState(0); return <BrowserRouter><nav><Link to="/">Create</Link><Link to="/history">History</Link></nav><Routes><Route path="/" element={<Create refresh={() => setVersion((v) => v + 1)} />} /><Route path="/history" element={<History />} /></Routes></BrowserRouter>; }
createRoot(document.getElementById("root")).render(<App />);
