import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const Home = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/logout", {}, { withCredentials: true });
      alert("Logout successful");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      alert("Logout failed");
    }
  };


  return (
    // <div>
    //   <h2>Welcome to Home Page</h2>
    //   <button onClick={handleLogout}>Logout</button>
    //   <p>
    //     Here, you can check <span onClick={() => navigate("/users")} style={{ color: 'blue', cursor: 'pointer' }}>Registered data</span>
    //   </p>
    // </div>
    <div className="container mt-5 text-center">
      <h2 className="mb-4">Welcome to Home Page</h2>
      <button className="btn btn-danger mb-3" onClick={handleLogout}>Logout</button>
      <p>
        Here, you can check{" "}
        <span className="text-primary" style={{ cursor: "pointer" }} onClick={() => navigate("/users")}>
          Registered data
        </span>
      </p>
    </div>
  );
};

export default Home;
