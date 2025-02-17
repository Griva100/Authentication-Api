import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const limit = 5;

  useEffect(() => {
    fetchUsers();
  }, [page]);


  const fetchUsers = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/auth/users?page=${page}&limit=${limit}`, { withCredentials: true });
      setUsers(response.data.users);
      setTotalPages(response.data.totalPages); // Set total pages from API
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Function to download Excel file
  const downloadExcel = () => {
    window.location.href = "http://localhost:5000/api/auth/export-users";
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    console.log("Importing Users Data:", formData);

    try {
      await axios.post("http://localhost:5000/api/auth/import-users", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      alert("Users imported successfully");
      setFile(null);
      fetchUsers(); // Refresh the user list
      
      // Reset file input field
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error importing users:", error);
      alert(error.response?.data?.message || "Import failed");
    }
  };

  return (
    // <div>
    //   <h2>Registered Users</h2>
    //   <table border="1">
    //     <thead>
    //       <tr>
    //         <th>ID</th>
    //         <th>Name</th>
    //         <th>Email</th>
    //       </tr>
    //     </thead>
    //     <tbody>
    //       {users.map((user) => (
    //         <tr key={user.id}>
    //           <td>{user.id}</td>
    //           <td>{user.name}</td>
    //           <td>{user.email}</td>
    //         </tr>
    //       ))}
    //     </tbody>
    //   </table>
    //   <button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
    //   <span> Page {page} of {totalPages} </span>
    //   <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
    //   <p>
    //     Already registered? <span onClick={() => navigate("/login")} style={{ color: 'blue', cursor: 'pointer' }}>Login here</span>
    //   </p>
    //   {/* Button to download the Excel file */}
    //   <button onClick={downloadExcel} style={{ marginTop: "10px" }}>
    //     Download Excel
    //   </button>
    // </div>
    <div className="container mt-4">
      <h2 className="text-center">Registered Users</h2>
      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="d-flex justify-content-between">
        <button className="btn btn-secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
        <span> Page {page} of {totalPages} </span>
        <button className="btn btn-secondary" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
      </div>
      <button onClick={downloadExcel} className="btn btn-success mt-3">Download Excel</button>

      <div className="mt-4">
        <input type="file" accept=".xlsx" onChange={handleFileChange} ref={fileInputRef} />
        <button onClick={handleUpload} className="btn btn-primary ms-2">Import Users</button>
      </div>

      <p className="mt-3 text-center">
        Already registered? <span onClick={() => navigate("/login")} className="text-primary" style={{ cursor: "pointer" }}>Login here</span>
      </p>
    </div>
  );
};

export default Users;
