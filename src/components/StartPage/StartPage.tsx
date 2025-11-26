import { Link } from "react-router-dom";
import "../StartPage/StartPage.css"; // подключаем стили

export default function StartPage() {
  return (
    <div className="start-container">
      <h1 className="start-title">Привет</h1>

      <Link to="/app" className="start-btn">
        Перейти
      </Link>
    </div>
  );
}