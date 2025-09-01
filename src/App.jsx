import { Link } from "react-router-dom";

export default function App() {
  return (
    <div style={{ padding: 20 }}>
      <h1>ReadyAdmit Frontend</h1>
      <nav>
        <Link to="/users">Users Page</Link>
      </nav>
    </div>
  );
}
