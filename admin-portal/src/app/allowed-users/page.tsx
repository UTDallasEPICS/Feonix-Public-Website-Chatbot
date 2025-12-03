"use client";

import React, { useEffect, useState, useCallback } from "react";
import { FiSearch } from "react-icons/fi";
type AllowedUser = {
  id: number;
  email: string;
  createdAt?: string;
};

export default function AllowedUsersTable() {
  const [users, setUsers] = useState<AllowedUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AllowedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editEmail, setEditEmail] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setFilteredUsers(users);
      return;
    }

    const term = debouncedSearch.toLowerCase();
    const filtered = users.filter((user) =>
      user.email.toLowerCase().includes(term)
    );
    setFilteredUsers(filtered);
  }, [debouncedSearch, users]);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/allowed-users");
      if (!res.ok) throw new Error("Failed to load users");
      const data = await res.json();
      setUsers(data);
      setFilteredUsers(data);
    } catch (e) {
      console.error("Error fetching allowed users", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    if (!newUserEmail.trim()) {
      alert("Please enter a valid email");
      return;
    }

    setIsAdding(true);
    try {
      const res = await fetch("/api/allowed-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newUserEmail.trim() }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to add user");
      }

      const newUser = await res.json();
      setUsers([...users, newUser]);
      setNewUserEmail("");
      alert("User added successfully!");
    } catch (err: any) {
      console.error("Add error", err);
      alert(err.message || "Failed to add user");
    } finally {
      setIsAdding(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to remove this user?")) return;

    try {
      const res = await fetch(`/api/allowed-users/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Delete failed");
      }

      setUsers(users.filter((user) => user.id !== id));
      setFilteredUsers(filteredUsers.filter((user) => user.id !== id));
      alert("User removed successfully!");
    } catch (err: any) {
      console.error("Delete error", err);
      alert(err.message || "Failed to remove user");
    }
  }

  function startEdit(user: AllowedUser) {
    setEditingId(user.id);
    setEditEmail(user.email);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditEmail("");
  }

  async function handleUpdate(id: number) {
    if (!editEmail.trim()) {
      alert("Please enter a valid email");
      return;
    }

    try {
      const res = await fetch(`/api/allowed-users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: editEmail.trim() }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Update failed");
      }

      const updatedUser = await res.json();
      setUsers(users.map((user) => (user.id === id ? updatedUser : user)));
      setEditingId(null);
      setEditEmail("");
      alert("User updated successfully!");
    } catch (err: any) {
      console.error("Update error", err);
      alert(err.message || "Failed to update user");
    }
  }

  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-b from-[#ecf2fb] to-white p-4">
      <div className="flex justify-center items-center py-6 bg-transparent">
        <img src="/logo.png" alt="Catch-a-Ride Logo" className="w-96" />
      </div>

      <div className="flex justify-center">
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg w-full max-w-6xl">
          <div className="flex flex-col gap-6 mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-semibold text-[#0d63e7]">
              Allowed Users Management
            </h2>

            <form
              onSubmit={handleAddUser}
              className="bg-[#f8fafc] p-4 rounded-lg border border-gray-200"
            >
              <h3 className="text-lg font-medium text-gray-700 mb-3">
                Add New User
              </h3>
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter user email address"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d63e7] focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  disabled={isAdding}
                  className="bg-[#0d63e7] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#173052] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAdding ? "Adding..." : "Add User"}
                </button>
              </div>
            </form>

            <div className="relative">
              <input
                type="text"
                placeholder="Search users by email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d63e7] focus:border-transparent"
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0d63e7]"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#ecf2fb] text-left text-gray-700 uppercase text-xs md:text-sm">
                      <th className="p-3 font-extrabold">ID</th>
                      <th className="p-3 font-extrabold">Email Address</th>
                      <th className="p-3 font-extrabold hidden md:table-cell">
                        Added Date
                      </th>
                      <th className="p-3 font-extrabold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b hover:bg-[#ecf2fb]/50 transition-colors"
                      >
                        <td className="p-3 font-mono text-sm text-gray-600">
                          {user.id}
                        </td>
                        <td className="p-3">
                          {editingId === user.id ? (
                            <input
                              type="email"
                              value={editEmail}
                              onChange={(e) => setEditEmail(e.target.value)}
                              className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#0d63e7]"
                              autoFocus
                            />
                          ) : (
                            <span className="truncate max-w-[250px] md:max-w-none block">
                              {user.email}
                            </span>
                          )}
                        </td>
                        <td className="p-3 hidden md:table-cell text-gray-500">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            {editingId === user.id ? (
                              <>
                                <button
                                  onClick={() => handleUpdate(user.id)}
                                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEdit(user)}
                                  className="bg-[#0d63e7] text-white px-3 py-1 rounded text-sm hover:bg-[#173052] transition-colors"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(user.id)}
                                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                                >
                                  Remove
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td
                          className="p-6 text-center text-gray-500"
                          colSpan={4}
                        >
                          {debouncedSearch.trim()
                            ? "No users match your search"
                            : "No allowed users yet. Add your first user above."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                <div>
                  Showing {filteredUsers.length} of {users.length} users
                  {debouncedSearch.trim() && " (filtered)"}
                </div>
                <div className="mt-2 md:mt-0">
                  <button
                    onClick={fetchUsers}
                    className="text-[#0d63e7] hover:text-[#173052] font-medium"
                  >
                    Refresh List
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
