import { useState, useEffect } from 'react';
import { UserPlus, Trash2, Shield, UserCheck, X } from 'lucide-react';

const STORAGE_KEY = 'user_management_users_v1';

const ACCESS_OPTIONS = [
  { name: 'Vessels', description: 'Create and manage vessels.' },
  { name: 'Ports Manager', description: 'Manage ports and port details.' },
  { name: 'Routes', description: 'Create and manage shipping routes.' },
  { name: 'Reports', description: 'View operational reports.' },
  { name: 'Users', description: 'Create and manage user accounts.' },
];

const DEFAULT_ACCESS = ACCESS_OPTIONS.reduce((access, option) => ({
  ...access,
  [option.name]: Boolean(option.required)
}), {});

function loadFromStorage(fallback) {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(data) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Fail silently
  }
}

const DEFAULT_USERS = [
  {
    id: 'usr-1',
    firstName: 'Johann Carlo',
    lastName: 'Florin',
    username: 'JCFLORIN',
    jobTitle: 'System Administrator',
    createdAt: '2026-01-15'
  },
];

export function Users() {
  const [users, setUsers] = useState(() => loadFromStorage(DEFAULT_USERS));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isManualUsername, setIsManualUsername] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    jobTitle: '',
    password: '',
    access: DEFAULT_ACCESS
  });

  useEffect(() => {
    saveToStorage(users);
  }, [users]);

  // Generate username based on first and last name
  const generateUsername = (first, last) => {
    if (!first.trim() && !last.trim()) return '';

    // Split first name by spaces to handle multiple first names (e.g., "Johann Carlo")
    const firstNameParts = first.trim().split(/\s+/).filter(Boolean);
    const firstInitials = firstNameParts.map(part => part[0]).join('');

    // Clean up last name (remove spaces if any)
    const cleanLastName = last.trim().replace(/\s+/g, '');

    return (firstInitials + cleanLastName).toUpperCase();
  };

  // Handle First Name change
  const handleFirstNameChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => {
      const updated = { ...prev, firstName: val };
      if (!isManualUsername) {
        updated.username = generateUsername(val, prev.lastName);
      }
      return updated;
    });
  };

  // Handle Last Name change
  const handleLastNameChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => {
      const updated = { ...prev, lastName: val };
      if (!isManualUsername) {
        updated.username = generateUsername(prev.firstName, val);
      }
      return updated;
    });
  };

  // Handle Username manual edit
  const handleUsernameChange = (e) => {
    setIsManualUsername(true);
    setFormData((prev) => ({
      ...prev,
      username: e.target.value.toUpperCase()
    }));
  };

  const handleOpenModal = () => {
    setFormData({
      firstName: '',
      lastName: '',
      username: '',
      jobTitle: '',
      password: '',
      access: DEFAULT_ACCESS
    });
    setIsManualUsername(false);
    setIsModalOpen(true);
  };

  const handleSaveUser = (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.username || !formData.password) {
      alert('Please fill in all required fields.');
      return;
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      username: formData.username.trim(),
      jobTitle: formData.jobTitle.trim() || 'Staff',
      access: formData.access,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setUsers((prev) => [newUser, ...prev]);
    setIsModalOpen(false);
  };

  const handleAccessChange = (name) => {
    setFormData((prev) => ({
      ...prev,
      access: { ...prev.access, [name]: !prev.access[name] }
    }));
  };

  const handleDeleteUser = (id) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    }
  };

  return (
    <div className="space-y-6 text-neutral-900 dark:text-neutral-100">
      {/* Header Bar */}
      <div className="bg-white dark:bg-black p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-black dark:text-white" /> User Management
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Create and manage team access accounts.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="px-4 py-2.5 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 dark:text-black text-white text-xs font-bold flex items-center gap-2 shadow-md transition-colors"
        >
          <UserPlus className="w-4 h-4" /> Add New User
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 uppercase font-mono">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Username</th>
                <th className="p-4">Job Title</th>
                <th className="p-4">Created</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                  <td className="p-4 font-bold text-neutral-900 dark:text-white">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="p-4 font-mono font-bold text-neutral-700 dark:text-neutral-300">
                    <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                      {u.username}
                    </span>
                  </td>
                  <td className="p-4 text-neutral-600 dark:text-neutral-400">
                    {u.jobTitle}
                  </td>
                  <td className="p-4 font-mono text-neutral-400 text-[11px]">
                    {u.createdAt}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-neutral-400 text-xs">
                    No users found. Click "Add New User" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 w-full max-w-md p-6 shadow-2xl relative space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4" /> Create New User
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-black dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveUser} className="space-y-3 text-xs">
              
              {/* First Name & Last Name */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-neutral-600 dark:text-neutral-400">First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Johann Carlo"
                    value={formData.firstName}
                    onChange={handleFirstNameChange}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-neutral-600 dark:text-neutral-400">Last Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Florin"
                    value={formData.lastName}
                    onChange={handleLastNameChange}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>
              </div>

              {/* Username (Auto-generated) */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-neutral-600 dark:text-neutral-400">Username *</label>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    {isManualUsername ? 'Manual override' : 'Auto-generated'}
                  </span>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. JCFLORIN"
                  value={formData.username}
                  onChange={handleUsernameChange}
                  className="w-full px-3 py-2 font-mono font-bold border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:border-black dark:focus:border-white uppercase"
                />
              </div>

              {/* Job Title */}
              <div className="space-y-1">
                <label className="font-bold text-neutral-600 dark:text-neutral-400">Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Software Engineer / Operations"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:border-black dark:focus:border-white"
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="font-bold text-neutral-600 dark:text-neutral-400">Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:border-black dark:focus:border-white"
                />
              </div>

              {/* Access Permissions */}
              <div className="border-t border-neutral-200 dark:border-neutral-800 pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-bold text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" /> Account Access
                    </label>
                    <p className="text-[10px] text-neutral-400 mt-0.5">Dashboard and Settings are included for every account.</p>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono">{Object.values(formData.access).filter(Boolean).length}/{ACCESS_OPTIONS.length}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ACCESS_OPTIONS.map((option) => (
                    <label
                      key={option.name}
                      className={`flex items-start gap-2 p-2 border border-neutral-200 dark:border-neutral-800 ${option.required ? 'bg-neutral-100 dark:bg-neutral-900' : 'bg-neutral-50 dark:bg-neutral-900/50'} cursor-pointer`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.access[option.name]}
                        disabled={option.required}
                        onChange={() => handleAccessChange(option.name)}
                        className="mt-0.5 accent-black dark:accent-white"
                      />
                      <span className="min-w-0">
                        <span className="block font-bold text-neutral-700 dark:text-neutral-200">{option.name}{option.required && <span className="ml-1 text-[9px] text-neutral-400">DEFAULT</span>}</span>
                        <span className="block text-[10px] leading-tight text-neutral-400">{option.description}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-3 flex justify-end gap-2 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 font-bold hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 dark:text-black text-white font-bold transition-colors"
                >
                  Save User
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}