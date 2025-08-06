import React, { useState } from "react";
import axios from "axios";

export default function UserProfileModal({ user, onClose, onSave }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    setLoading(true);

    try {
      console.log("Sending password update request for email:", user.email); // Debug log
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/update-password`,
        {
          email: user.email,
          newPassword: password,
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      console.log("Password update response:", response.data); // Debug log
      setError("Password updated successfully");
      onSave(password); // Notify parent (e.g., to update token if needed)
      setTimeout(onClose, 1000); // Close after a brief success message
    } catch (err) {
      console.log("Password update error:", err.response?.data || err.message); // Debug log
      setError(
        err.response?.data?.error || "Failed to update password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative animate-fadeIn">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Update Password</h2>
        <p className="text-sm text-gray-600 mb-4">
          Email: {user.email} {/* Display user context */}
        </p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Re-enter password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {error && (
            <p className={`text-sm mt-1 ${error.includes("successfully") ? "text-green-600" : "text-red-600"}`}>
              {error}
            </p>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition"
          aria-label="Close"
          disabled={loading}
        >
          &times;
        </button>
      </div>
    </div>
  );
}