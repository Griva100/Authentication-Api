import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

// Helper to convert file path to a public URL
const getPublicUrl = (fileName) => {
    if (!fileName) return "";
    return `http://localhost:5000/uploads/profile/${fileName}`;
};

const Navbar = ({ isLoggedIn, setIsLoggedIn, user }) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            // Call logout endpoint to clear cookie
            await fetch("https://your-backend-domain/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });
        } catch (error) {
            console.error("Logout error", error);
        }
        localStorage.removeItem("jwtToken"); // Remove token
        setIsLoggedIn(false);
        navigate("/login"); // Redirect to login
    };

    const handleProfileClick = () => {
        navigate("/profile");
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container">
                <Link className="navbar-brand" to="/home">MyApp</Link>
                <div className="collapse navbar-collapse">
                    <ul className="navbar-nav me-auto">
                        {isLoggedIn && (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/home">Home</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/users">Users</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/import-export">Import / Export</Link>
                                </li>
                            </>
                        )}
                    </ul>
                    <ul className="navbar-nav d-flex align-items-center">
                        {isLoggedIn ? (
                            <li className="nav-item">
                                <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
                            </li>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <Link className="btn btn-outline-light me-2" to="/login">Login</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="btn btn-primary" to="/register">Sign Up</Link>
                                </li>
                            </>
                        )}
                        {isLoggedIn && (
                            <li className="nav-item ms-3" onClick={handleProfileClick} style={{ cursor: "pointer" }}>
                                {user && user.avatar ? (
                                    <img
                                        src={getPublicUrl(user.avatar)}
                                        alt="User11"
                                        style={{
                                            width: "40px",
                                            height: "40px",
                                            borderRadius: "50%",
                                            objectFit: "cover"
                                        }}
                                    />
                                ) : (
                                    <div
                                        style={{
                                            width: "40px",
                                            height: "40px",
                                            borderRadius: "50%",
                                            backgroundColor: "#6c757d",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "white",
                                            fontSize: "0.8rem"
                                        }}
                                    >
                                        User
                                    </div>
                                )}
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
