import { useEffect, useState } from "react";
import axios from "axios";
import CryptoJS from "crypto-js";
import "bootstrap/dist/css/bootstrap.min.css";

const encryptionKey = 'my-strong-secret-key-1234';
const decryptData = (cipherText) => {
  const bytes = CryptoJS.AES.decrypt(cipherText, encryptionKey);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), encryptionKey).toString();
};

// Helper to convert file path to a public URL
const getPublicUrl = (fileName) => {
  if (!fileName) return "";
  return `http://localhost:5000/uploads/profile/${fileName}`;
};

const Profile = ({ setUser, refreshProfile }) => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", avatar: null });
  const [preview, setPreview] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const fetchProfile = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/auth/profile", { withCredentials: true });
      const decryptedProfile = decryptData(response.data.profile);
      setProfile(decryptedProfile);
      setFormData({ name: decryptedProfile.name, email: decryptedProfile.email, avatar: null });
      if (decryptedProfile.avatar) setPreview(getPublicUrl(decryptedProfile.avatar));
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, avatar: file });
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const encryptedData = encryptData({
      name: formData.name, email: formData.email, avatar: profile.avatar ? profile.avatar : null, // Keep the existing avatar if not updated

    });

    const formDataToSend = new FormData();
    formDataToSend.append("data", encryptedData);

    if (formData.avatar) {
      formDataToSend.append("avatar", formData.avatar); // Append only if user uploads a new one
    } else if (profile.avatar) {
      formDataToSend.append("avatar", profile.avatar); // Retain existing avatar
    }

    // Debugging: Check if FormData contains the correct data
    for (let [key, value] of formDataToSend.entries()) {
      console.log(key, value);
    }
    try {
      await axios.put("http://localhost:5000/api/auth/update-profile", formDataToSend, {
        withCredentials: true, headers: { "Content-Type": "multipart/form-data" }
      });
      alert("Profile updated successfully!");
      fetchProfile();
      refreshProfile(); // Update Navbar Avatar
      setIsEditing(false); // Exit edit mode after successful update
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (!profile) return <div className="container mt-4">Loading profile...</div>;

  return (
    <div className="container mt-4">
      <h2 className="text-center">Profile</h2>

      <div className="card mx-auto p-3 shadow" style={{ maxWidth: "400px", borderRadius: "10px" }}>
        {isEditing ? (
          <form onSubmit={handleSubmit}>
            {/* Avatar */}
            {preview ? (
              <img src={preview} className="card-img-top mb-3" style={{ height: "200px", objectFit: "contain" }} alt="Preview" />
            ) : null}
            <div className="mb-3">
              <label className="form-label fw-bold">Name</label>
              <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">Email</label>
              <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">Avatar</label>
              <input type="file" className="form-control" accept="image/*" onChange={handleFileChange} />
            </div>
            <button type="submit" className="btn btn-success w-100">Save Changes</button>
            <button type="button" className="btn btn-secondary w-100 mt-2" onClick={() => setIsEditing(false)}>Cancel</button>
          </form>
        ) : (
          <>
            {/* Avatar */}
            {profile.avatar ? (
              <img src={getPublicUrl(profile.avatar)} className="card-img-top mb-3" style={{ height: "200px", objectFit: "contain" }} alt="Profile" />
            ) : (
              <div
                style={{
                  height: "200px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#6c757d",
                  color: "white",
                }}
                className="mb-3"
              >
                No Image
              </div>
            )}
            {/* Name */}
            <div className="mb-2">
              <label className="fw-bold text-muted">Name</label>
              <p className="form-control bg-light">{profile.name}</p>
            </div>
            {/* Email */}
            <div className="mb-2">
              <label className="fw-bold text-muted">Email</label>
              <p className="form-control bg-light">{profile.email}</p>
            </div>
            <button className="btn btn-primary w-100" onClick={() => setIsEditing(true)}>Edit Profile</button>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
