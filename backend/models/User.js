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
    if (!result.recordset[0]) return null;
    return result.recordset[0]; // Return user object if found
  },

  createUser: async (name, email, password, avatar = null) => {
    console.log("Inserting User:", { name, email, password, avatar });
    await sql.query`INSERT INTO Users (name, email, password, avatar) VALUES (${name}, ${email}, ${password}, ${avatar === "null" ? null : avatar})`;
  },

  getUserById: async (id) => {
    const result = await sql.query`SELECT id, name, email, avatar FROM Users WHERE id = ${id}`;
    return result.recordset[0] || null;
  },

  updateUser: async (userId, name, email, avatarPath) => {
    await sql.query`
      UPDATE Users 
      SET name = ${name}, email = ${email}, avatar = ${avatarPath} 
      WHERE id = ${userId}`;
  },

  // insertMany: async (users) => {
  //   const values = users.map(({ name, email, password }) => `('${name}', '${email}', '${password}')`).join(",");
  //   await sql.query(`INSERT INTO Users (name, email, password) VALUES ${values}`);
  // },

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
