// client/src/pages/UsersPage.jsx
import { useEffect, useState } from "react";

export default function UsersPage() {
  const API = (import.meta.env.VITE_API_ORIGIN || "").trim();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "" });
  const [error, setError] = useState("");

  async function loadUsers() {
    setError("");
    try {
      const res = await fetch(`${API}/api/users`);
      const text = await res.text();             // read as text first
      const data = text ? JSON.parse(text) : []; // try parse
      if (!res.ok) throw new Error(data?.error || `GET /api/users ${res.status}`);
      setUsers(Array.isArray(data) ? data : []); // ensure array
    } catch (e) {
      setError(e.message || "Failed to load users");
      setUsers([]); // avoid .map crash
    }
  }

  async function addUser(e) {
  e.preventDefault();
  setError("");

  const name = form.name.trim();
  const email = form.email.trim();
  if (!email) {
    setError("Please enter an email.");
    return;
  }

  try {
    const res = await fetch(`${API}/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });

    const text = await res.text();
    let data;
    try { data = text ? JSON.parse(text) : {}; } catch { data = {}; }

    if (!res.ok) {
      throw new Error(data?.error || `POST /api/users ${res.status}`);
    }

    setForm({ name: "", email: "" });
    await loadUsers();
  } catch (err) {
    setError(err.message || "Failed to add user");
  }
}


  useEffect(() => { loadUsers(); }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Users</h1>

      <form onSubmit={addUser} style={{ marginBottom: 10 }}>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <button type="submit" disabled={!form.email.trim()}>Add</button>

      </form>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <ul>
        {users.map((u) => (
          <li key={u.id}>{u.name || "(no name)"} — {u.email}</li>
        ))}
      </ul>
      {error && <p style={{ color: "crimson" }}>{error}</p>}

    </div>
    
  );
}
