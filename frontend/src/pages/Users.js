import { useState, useEffect, useRef } from "react";
import axios from "axios";
import CryptoJS from "crypto-js";
import * as xlsx from "xlsx";
import "bootstrap/dist/css/bootstrap.min.css";

const encryptionKey = 'my-strong-secret-key-1234';

// AES decryption function
const decryptData = (cipherText) => {
  const bytes = CryptoJS.AES.decrypt(cipherText, encryptionKey);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [importedUsers, setImportedUsers] = useState([]); // Imported users
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const limit = 5;

  useEffect(() => {
    fetchUsers();
  }, [page]);


  const fetchUsers = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/auth/users?page=${page}&limit=${limit}`, { withCredentials: true });
      const decryptedUsers = decryptData(response.data.users);
      setUsers(decryptedUsers);
      setTotalPages(response.data.totalPages); // Set total pages from API
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Function to download Excel file
  const downloadExcel = async () => {
    // window.location.href = "http://localhost:5000/api/auth/export-users";
    try {
      const response = await axios.get("http://localhost:5000/api/auth/export-users", { withCredentials: true });

      if (!response.data.encryptedData) {
        alert("No data received");
        return;
      }

      // Decrypt the received Excel file data
      const decryptedData = decryptData(response.data.encryptedData);
      const excelBlob = new Blob([Uint8Array.from(atob(decryptedData), c => c.charCodeAt(0))], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Create a link to download the decrypted file
      const link = document.createElement("a");
      link.href = URL.createObjectURL(excelBlob);
      link.download = "users.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) {
      alert("Please select a file.");
      return;
    }

    // Validate file type
    if (!selectedFile.name.endsWith(".xlsx")) {
      alert("Invalid file format. Please upload an Excel file (.xlsx).");
      fileInputRef.current.value = "";
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const fileData = new Uint8Array(event.target.result); // Get raw file data

        // Read Excel file as JSON
        const workbook = xlsx.read(fileData, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const jsonData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        // Convert JSON to string
        const jsonString = JSON.stringify(jsonData);

        // Encrypt JSON data
        const encryptedData = CryptoJS.AES.encrypt(jsonString, encryptionKey).toString();

        // const formData = new FormData();
        // formData.append("file", file);

        // console.log("Importing Users Data:", formData);

        // const response = await axios.post("http://localhost:5000/api/auth/import-users", formData,
        //   {
        //     headers: { "Content-Type": "multipart/form-data" },
        //     withCredentials: true,
        //   });

        // Send encrypted file data as JSON payload
        const response = await axios.post("http://localhost:5000/api/auth/import-users",
          { encryptedData },
          { headers: { "Content-Type": "application/json" } }
        );

        setImportedUsers(jsonData || []);
        //   // Update state with successfully imported users
        // setImportedUsers(response.data.importedUsers || []);

        // If there are errors, display them in an alert or UI
        if (response.data.errors.length > 0) {
          alert("Some rows had errors:\n" + response.data.errors.join("\n"));
        } else {
          alert("Users imported successfully");
        }

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
    reader.readAsArrayBuffer(file);
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

      <h2 className="text-center mt-4">Imported Users</h2>
      <table className="table table-bordered table-striped">
        <thead className="table-warning">
          <tr>
            <th>Name</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {importedUsers.map((user, index) => (
            <tr key={index}>
              <td>{user.name}</td>
              <td>{user.email}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4">
        <input type="file" accept=".xlsx" onChange={handleFileChange} ref={fileInputRef} />
        <button onClick={handleUpload} className="btn btn-primary ms-2">Import Users</button>
      </div>
    </div>
  );
};

export default Users;
