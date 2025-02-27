import { useState, useRef } from "react";
import axios from "axios";
import CryptoJS from "crypto-js";
import * as xlsx from "xlsx";
import "bootstrap/dist/css/bootstrap.min.css";

const encryptionKey = 'my-strong-secret-key-1234';

const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), encryptionKey).toString();
};

const decryptData = (cipherText) => {
  const bytes = CryptoJS.AES.decrypt(cipherText, encryptionKey);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

const ImportExport = () => {
  const [importedUsers, setImportedUsers] = useState([]);
  const fileInputRef = useRef(null);

  // Download Excel file of users
  const downloadExcel = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/auth/export-users", {
        withCredentials: true,
      });
      if (!response.data.encryptedData) {
        alert("No data received");
        return;
      }
      // Decrypt the received Excel file data
      const decryptedData = decryptData(response.data.encryptedData);
      const excelBlob = new Blob(
        [Uint8Array.from(atob(decryptedData), (c) => c.charCodeAt(0))],
        { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }
      );
      const link = document.createElement("a");
      link.href = URL.createObjectURL(excelBlob);
      link.download = "users.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert(error.response?.data?.message || "Download failed");
    }
  };

  // Handle file selection for import
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      alert("Please select a file.");
      return;
    }
    // Validate file extension (.xlsx)
    if (!selectedFile.name.endsWith(".xlsx")) {
      alert("Invalid file format. Please upload an Excel file (.xlsx).");
      fileInputRef.current.value = "";
      return;
    }
    importFile(selectedFile);
  };

  // Process file import
  const importFile = (file) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const fileData = new Uint8Array(event.target.result);
        // Parse the Excel file
        const workbook = xlsx.read(fileData, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const jsonData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
        // Encrypt JSON data
        const encryptedData = encryptData(jsonData);
        // Send encrypted data to the backend
        const response = await axios.post(
          "http://localhost:5000/api/auth/import-users",
          { encryptedData },
          { headers: { "Content-Type": "application/json" } }
        );
        // Set imported users to state for display
        setImportedUsers(jsonData || []);
        if (response.data.errors && response.data.errors.length > 0) {
          alert("Some rows had errors:\n" + response.data.errors.join("\n"));
        } else {
          alert("Users imported successfully");
        }
        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = "";
      } catch (error) {
        console.error("Error importing users:", error);
        alert(error.response?.data?.message || "Import failed");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center">Import / Export Users</h2>
      <div className="d-flex justify-content-center mb-4">
        <button onClick={downloadExcel} className="btn btn-success me-3">
          Download Excel
        </button>
        <div>
          <input type="file" accept=".xlsx" ref={fileInputRef} onChange={handleFileChange} />
        </div>
      </div>
      {importedUsers.length > 0 && (
        <div>
          <h3 className="text-center">Imported Users</h3>
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
        </div>
      )}
    </div>
  );
};

export default ImportExport;
