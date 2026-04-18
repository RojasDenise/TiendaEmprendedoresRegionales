import { useState } from "react";

export default function Login({ onNavigate }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Por favor completá todos los campos.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, contraseña: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Credenciales incorrectas.");
      } else {
        alert(`Bienvenido: ${data.data?.apellidoNombre || email}`);
      }
    } catch (err) {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>Login</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="ejemplo@correo.com"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="••••••••"
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Ingresando..." : "Login"}
          </button>
        </form>

        <p style={styles.footer}>
          ¿No tenés cuenta?{" "}
          <span style={styles.link} onClick={() => onNavigate("register")}>
            Registrate
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },
  card: {
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "2rem",
    width: "100%",
    maxWidth: "380px",
  },
  title: {
    textAlign: "center",
    marginBottom: "1.5rem",
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#111",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  label: {
    fontSize: "0.875rem",
    color: "#444",
  },
  input: {
    padding: "0.5rem 0.75rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "0.95rem",
    outline: "none",
  },
  button: {
    marginTop: "0.5rem",
    padding: "0.65rem",
    backgroundColor: "#111",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    fontSize: "1rem",
    cursor: "pointer",
  },
  error: {
    color: "#c0392b",
    fontSize: "0.85rem",
    margin: 0,
  },
  footer: {
    textAlign: "center",
    marginTop: "1rem",
    fontSize: "0.875rem",
    color: "#555",
  },
  link: {
    color: "#111",
    fontWeight: "600",
    cursor: "pointer",
    textDecoration: "underline",
  },
};