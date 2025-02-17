// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
// });

// module.exports = mongoose.model("User", userSchema);

const { sql } = require("../config/db");

const User = {
  findByEmail: async (email) => {
    const result = await sql.query`SELECT * FROM Users WHERE email = ${email}`;
    return result.recordset[0]; // Return user object if found
  },

  createUser: async (name, email, hashedPassword) => {
    await sql.query`INSERT INTO Users (name, email, password) VALUES (${name}, ${email}, ${hashedPassword})`;
  },

  insertMany: async (users) => {
    const values = users.map(({ name, email, hashedPassword }) => `('${name}', '${email}', '${hashedPassword}')`).join(",");
    await sql.query(`INSERT INTO Users (name, email, password) VALUES ${values}`);
  },

  getUsersPaginated: async (pageNumber, pageSize) => {
    const result = await sql.query`
      EXEC GetUsersWithPagination ${pageNumber}, ${pageSize}
    `;
    return {
      users: result.recordsets[0], // First result set (users)
      totalUsers: result.recordsets[1][0].TotalUsers, // Second result set (total count)
    };
  },

  getAllUsers: async () => {
    const result = await sql.query`SELECT id, name, email FROM Users`;
    return result.recordset;
  }
};

module.exports = User;
