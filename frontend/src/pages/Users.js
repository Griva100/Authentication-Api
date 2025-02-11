import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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

  return (
    <div>
      <h2>Registered Users</h2>
      <table border="1">
        <thead>
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
      <button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
      <span> Page {page} of {totalPages} </span>
      <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
      <p>
        Already registered? <span onClick={() => navigate("/login")} style={{ color: 'blue', cursor: 'pointer' }}>Login here</span>
      </p>
    </div>
  );
};

export default Users;
