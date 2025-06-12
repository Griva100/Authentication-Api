import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Users from "./pages/Users";
import Profile from "./pages/Profile";
import ImportExport from "./pages/ImportExport";
import Navbar from "./components/Navbar";
import CryptoJS from "crypto-js";

const encryptionKey = 'my-strong-secret-key-1234';
const decryptData = (cipherText) => {
  const bytes = CryptoJS.AES.decrypt(cipherText, encryptionKey);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

const ProtectedRoute = ({ element }) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("jwtToken") : null;
  return token ? element : <Navigate to="/login" />;
};

const App = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("jwtToken"));
  // Assume that user data (e.g. avatar) is stored here after login
  const [user, setUser] = useState(null);
  // Reference to store the inactivity timeout ID.
  const inactivityTimeoutRef = useRef(null);
  // Timeout duration in milliseconds (10 minutes)
  const INACTIVITY_TIMEOUT = 5 * 60 * 1000;

  // useEffect(() => {
  //   setIsLoggedIn(!!localStorage.getItem("jwtToken"));
  // }, [localStorage.getItem("jwtToken")]); // Watch for token changes

  // Memoize refreshProfile without dependencies (other than stable ones)
  const refreshProfile = async () => {
    try {
      const response = await fetch(`${process.env.BASE_URL}/api/auth/profile`, {
        credentials: "include"
      });
      const data = await response.json();
      if (data.profile) {
        const decryptedProfile = decryptData(data.profile);
        setUser(decryptedProfile);
        localStorage.setItem("user", JSON.stringify(decryptedProfile));
      } else {
        console.log("refreshProfile: No profile data", data);
      }
    } catch (error) {
      console.error("Error refreshing profile:", error);
    }
  };

  // Auto logout logic: clear token and update state.
  const autoLogout = () => {
    console.log("User inactive. Logging out automatically.");
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    navigate("/login");
  };

  // Reset inactivity timer whenever there is user activity.
  const resetInactivityTimer = () => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    if (isLoggedIn) {
      inactivityTimeoutRef.current = setTimeout(autoLogout, INACTIVITY_TIMEOUT);
    }
  };

  // Listen for user activity events to reset the inactivity timer.
  useEffect(() => {
    if (isLoggedIn) {
      window.addEventListener("mousemove", resetInactivityTimer);
      window.addEventListener("keydown", resetInactivityTimer);
      // Initialize timer when user is logged in.
      resetInactivityTimer();
    }
    return () => {
      window.removeEventListener("mousemove", resetInactivityTimer);
      window.removeEventListener("keydown", resetInactivityTimer);
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, [isLoggedIn]);

  // Fetch user data on login or refresh
  useEffect(() => {
    if (isLoggedIn) {
      refreshProfile();
    }
  }, [isLoggedIn]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${process.env.BASE_URL}/api/users`);
      const data = await response.json();
      console.log("Fetched Users:", data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  return (
    <Router>
      {/* <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} /> */}
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} user={user} />
      <Routes>
        {/* <Route path="/login" element={<Login />} /> */}
        {/* <Route path="/register" element={<Register />} /> */}
        {/* <Route path="/home" element={<Home />} /> */}
        {/* <Route path="/users" element={<Users />} /> */}
        {/* <Route path="*" element={<Navigate to="/login" />} /> */}
        <Route path="/login" element={isLoggedIn ? <Navigate to="/home" /> : <Login setIsLoggedIn={setIsLoggedIn} refreshProfile={refreshProfile} />} />
        <Route path="/register" element={isLoggedIn ? <Navigate to="/home" /> : <Register />} />
        <Route path="/home" element={<ProtectedRoute element={<Home />} />} />
        <Route path="/users" element={<ProtectedRoute element={<Users />} />} />
        <Route path="/profile" element={<ProtectedRoute element={<Profile refreshProfile={refreshProfile} />} />} />
        <Route path="/import-export" element={<ProtectedRoute element={<ImportExport fetchUsers={fetchUsers} />} />} />
        <Route path="*" element={<Navigate to={isLoggedIn ? "/home" : "/login"} />} />
      </Routes>
    </Router>
  );
};

export default App;
