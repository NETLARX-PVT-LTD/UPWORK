'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiEdit2, FiTrash2, FiUserPlus, FiSearch, FiX, FiLoader, FiEye, FiEyeOff } from 'react-icons/fi';
import { useNotification } from '@/contexts/NotificationContext';

interface User {
  id: string; // Changed from number to string to match API
  name: string;
  email: string;
  role: 'admin' | 'user';
  department: string;
}

interface EditingUser extends User {
  password?: string; // Make password optional for editing
}

interface NewUserForm {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  department: string;
}

export default function ManageUsersPage() {
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newUser, setNewUser] = useState<NewUserForm>({ 
    name: '', 
    email: '',
    password: '', // Added password field
    role: 'user',
    department: '' 
  });
  const [userToDelete, setUserToDelete] = useState<string | null>(null); // Changed from number to string
  const [editingUser, setEditingUser] = useState<EditingUser | null>(null); // Use new EditingUser interface

  // Query for fetching users
  const { data: users = [], isLoading, error } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch users');
      }
      return response.json();
    },
  });

  // Mutation for adding users
  const addUserMutation = useMutation({
    mutationFn: async (newUserData: NewUserForm) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newUserData)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create user');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showNotification('success', 'User created successfully');
      setShowModal(false);
      setNewUser({ name: '', email: '', password: '', role: 'user', department: '' });
    },
    onError: (error: Error) => {
      showNotification('error', error.message);
    }
  });

  // Mutation for deleting users
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete user');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showNotification('success', 'User deleted successfully');
      setUserToDelete(null);
    },
    onError: (error: Error) => {
      showNotification('error', error.message);
    }
  });

  // Mutation for updating users
  const updateUserMutation = useMutation({
    mutationFn: async (userData: EditingUser) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(userData)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update user');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showNotification('success', 'User updated successfully');
      setEditingUser(null);
    },
    onError: (error: Error) => {
      showNotification('error', error.message);
    }
  });

  const handleAddUser = async () => {
    // Validate form
    if (!newUser.name || !newUser.email || !newUser.password || !newUser.department) {
      showNotification('error', 'Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      showNotification('error', 'Please enter a valid email address');
      return;
    }

    addUserMutation.mutate({
      ...newUser,
      name: newUser.name.trim(),
      email: newUser.email.trim(),
      department: newUser.department.trim()
    });
  };

  const handleDelete = (userId: string) => { // Changed from number to string
    setUserToDelete(userId);
  };

  const confirmDelete = () => {
    if (!userToDelete) return;
    deleteUserMutation.mutate(userToDelete);
  };

  const handleEdit = (user: User) => { // Changed to use User type
    setEditingUser(user);
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;
    updateUserMutation.mutate(editingUser);
  };

  // Filter users with memoization
  const filteredUsers = useMemo(() => {
    const searchTermLower = searchTerm.toLowerCase();
    return users.filter((user: User) => {
      return (
        (user.name?.toLowerCase() || '').includes(searchTermLower) ||
        (user.email?.toLowerCase() || '').includes(searchTermLower) ||
        (user.department?.toLowerCase() || '').includes(searchTermLower)
      );
    });
  }, [users, searchTerm]);

  // Use isLoading instead of loading state
  if (isLoading) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2 text-gray-600">
            <FiLoader className="w-5 h-5 animate-spin" />
            <span>Loading users...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if query fails
  if (error) {
    return (
      <div className="p-4 md:p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Failed to load users: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header Section - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Manage Users</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Add, edit, or remove system users</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiUserPlus className="w-5 h-5 mr-2" />
          Add User
        </button>
      </div>

      {/* Search and Filter Section - Mobile Responsive */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              text-gray-900 placeholder-gray-500 text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Mobile Card View - Enhanced Version */}
      <div className="block sm:hidden space-y-3">
        {filteredUsers.map((user: User) => (
          <div key={user.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* User Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center">
                {/* User Avatar - Updated */}
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold text-lg">
                    {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                  </span>
                </div>
                <div className="ml-3 min-w-0 flex-1">
                  <div className="font-medium text-gray-900 truncate text-base">
                    {user.name}
                  </div>
                  <div className="text-gray-500 text-sm truncate">
                    {user.email}
                  </div>
                </div>
                <span className={`
                  ml-3 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                  ${user.role === 'admin' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-green-100 text-green-800'
                  }`}
                >
                  {user.role}
                </span>
              </div>
            </div>

            {/* User Details */}
            <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center">
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Department:</span> {user.department}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handleEdit(user)}
                  className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                  aria-label="Edit user"
                >
                  <FiEdit2 className="w-5 h-5 text-blue-600" />
                </button>
                <button 
                  onClick={() => handleDelete(user.id)}
                  className="p-2 rounded-full hover:bg-red-50 transition-colors"
                  aria-label="Delete user"
                >
                  <FiTrash2 className="w-5 h-5 text-red-600" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                  Name
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                  Email
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                  Department
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                  Role
                </th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user: User) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      {/* User Avatar - Updated */}
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-gray-900">{user.department}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-green-100 text-green-800'
                      }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right text-sm font-medium space-x-3">
                    <button 
                      onClick={() => handleEdit(user)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setUserToDelete(null)}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg 
                  text-gray-700 hover:bg-gray-50 transition-colors order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg 
                  hover:bg-red-700 transition-colors order-1 sm:order-2"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-xl w-full max-w-md mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Edit User</h2>
              <button 
                onClick={() => setEditingUser(null)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    text-gray-900 placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    text-gray-900 placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  value={editingUser.department}
                  onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    text-gray-900 placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ 
                    ...editingUser, 
                    role: e.target.value as 'admin' | 'user' 
                  })}
                  className="w-full p-2.5 border text-gray-700 border-gray-200 rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
              <button
                onClick={() => setEditingUser(null)}
                className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg 
                  text-gray-700 hover:bg-gray-50 transition-colors order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateUser}
                className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 text-white rounded-lg 
                  hover:bg-blue-700 transition-colors order-1 sm:order-2"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Mobile Responsive */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-xl w-full max-w-md mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Add New User</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Form inputs with mobile-friendly spacing */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    text-gray-900 placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className={`w-full p-2.5 border rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    text-gray-900 placeholder-gray-500
                    ${!newUser.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email) 
                      ? 'border-gray-200' 
                      : 'border-red-300 bg-red-50'
                    }`}
                />
                {newUser.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email) && (
                  <p className="mt-1 text-sm text-red-600">
                    Please enter a valid email address
                  </p>
                )}
              </div>

              {/* Add password input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-lg 
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      text-gray-900 placeholder-gray-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  placeholder="Enter department"
                  value={newUser.department}
                  onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    text-gray-900 placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ 
                    ...newUser, 
                    role: e.target.value as 'admin' | 'user' 
                  })}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-gray-500
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="user" className="text-gray-900">User</option>
                  <option value="admin" className="text-gray-900">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg 
                  text-gray-700 hover:bg-gray-50 transition-colors order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 text-white rounded-lg 
                  hover:bg-blue-700 transition-colors order-1 sm:order-2"
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
