import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import CryptoJS from "crypto-js";
import "bootstrap/dist/css/bootstrap.min.css";

const encryptionKey = 'my-strong-secret-key-1234';

// AES encryption function
const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), encryptionKey).toString();
};

const Login = () => {
  // const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   try {
  //     await axios.post("http://localhost:5000/api/auth/login",
  //       { email, password },
  //       { withCredentials: true } // Ensures cookies are sent and received
  //     );
  //     alert("Login successful");
  //     navigate("/home");
  //   } catch (error) {
  //     console.error("Login error:", error.response?.data || error.message);
  //     alert(error.response?.data?.message || "Login failed");
  //   }
  // };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // await axios.post("http://localhost:5000/api/auth/login", values, { withCredentials: true });
      const encryptedData = encryptData(values);
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        { data: encryptedData },
        { withCredentials: true }
      );
      console.log("Response:", response.data);
      alert("Login successful");
      navigate("/home");
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
    setSubmitting(false);
  };

  return (
    // <div>
    //   <h2>Login</h2>
    //   <form onSubmit={handleSubmit}>
    //     <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
    //     <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
    //     <button type="submit">Login</button>
    //   </form>
    //   <p>
    //     Not registered? <span onClick={() => navigate("/register")} style={{ color: 'blue', cursor: 'pointer' }}>Register here</span>
    //   </p>
    // </div>
    <div className="container mt-4">
      <h2 className="text-center">Login</h2>
      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="mx-auto w-50 border p-4 rounded shadow-sm">
            <div className="mb-3">
              <label>Email</label>
              <Field type="email" name="email" className="form-control" />
              <ErrorMessage name="email" component="div" className="text-danger" />
            </div>
            <div className="mb-3 position-relative">
              <label>Password</label>
              <div className="input-group">
                <Field name="password" type={showPassword ? "text" : "password"} className="form-control" />
                <button type="button" className="btn btn-outline-secondary" onClick={togglePasswordVisibility}>
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <ErrorMessage name="password" component="div" className="text-danger" />
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </Form>
        )}
      </Formik>
      <p className="mt-3 text-center">
        Not registered? <span onClick={() => navigate("/register")} className="text-primary" style={{ cursor: "pointer" }}>Register here</span>
      </p>
    </div>
  );
};

export default Login;
