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

const Register = () => {
  // const [name, setName] = useState("");
  // const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  // Validation Schema
  const validationSchema = Yup.object({
    name: Yup.string().min(3, "Too Short!").required("Name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
      .min(6, "Must be at least 6 characters")
      .matches(/[A-Z]/, "Must have at least one uppercase letter")
      .matches(/[!@#$%^&*~_]/, "Must have at least one special character (!@#$%^&*~_)")
      .required("Password is required"),
  });

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   try {
  //     await axios.post("http://localhost:5000/api/auth/register", { name, email, password },{ withCredentials: true });
  //     alert("Registration successful");
  //     navigate("/login");
  //   } catch (error) {
  //     console.error("Registration error:", error.response?.data || error.message);
  //     alert(error.response?.data?.message || "Registration failed");
  //   }
  // };

  // Handle Form Submission
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const encryptedData = encryptData(values);
      const response = await axios.post("http://localhost:5000/api/auth/register", { data: encryptedData }, { withCredentials: true });
      console.log("response:" , response);
      alert("Registration successful");
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    }
    setSubmitting(false);
  };

  return (
    // <div>
    //   <h2>Register</h2>
    //   <form onSubmit={handleSubmit}>
    //     <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
    //     <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
    //     <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
    //     <button type="submit">Register</button>
    //   </form>
    //   <p>
    //     Already registered? <span onClick={() => navigate("/login")} style={{ color: 'blue', cursor: 'pointer' }}>Login here</span>
    //   </p>
    // </div>
    <div className="container mt-4">
      <h2 className="text-center">Register</h2>
      <Formik
        initialValues={{ name: "", email: "", password: "" }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="mx-auto w-50 border p-4 rounded shadow-sm">
            <div className="mb-3">
              <label>Name</label>
              <Field type="text" name="name" className="form-control" />
              <ErrorMessage name="name" component="div" className="text-danger" />
            </div>
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
              {isSubmitting ? "Registering..." : "Register"}
            </button>
          </Form>
        )}
      </Formik>
      <p className="mt-3 text-center">
        Already registered? <span onClick={() => navigate("/login")} className="text-primary" style={{ cursor: "pointer" }}>Login here</span>
      </p>
    </div>
  );
};

export default Register;
