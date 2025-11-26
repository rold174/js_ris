import { Link } from "react-router-dom";

export default function StartPage() {
  return (
    <div style={{
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      background: "#20232a"
    }}>
      <h1 style={{ fontSize: "60px", color: "#61dafb", marginBottom: "40px" }}>
        Привет
      </h1>

      <Link
        to="/app"
        style={{
          padding: "15px 40px",
          fontSize: "22px",
          background: "#61dafb",
          borderRadius: "12px",
          color: "#000",
          textDecoration: "none"
        }}
      >
        Перейти
      </Link>
    </div>
  );
}
