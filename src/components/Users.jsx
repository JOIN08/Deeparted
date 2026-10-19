import { useEffect, useState } from 'react';
import { UserPlus, Trash2, Shield, UserCheck, X } from 'lucide-react';
import { apiRequest } from '../data/api';
import {
  EMPTY_USER_ACCESS,
  PERMISSION_MODULES,
  normalizeUserAccess,
} from '../data/userAccess';

export function Users({ canEdit = false }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isManualUsername, setIsManualUsername] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;
    apiRequest('/api/users')
      .then(({ users: savedUsers }) => {
        if (isActive) setUsers(savedUsers);
      })
      .catch((loadError) => {
        if (isActive) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load users.');
        }
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });
    return () => {
      isActive = false;
    };
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    jobTitle: '',
    password: '',
    access: normalizeUserAccess(EMPTY_USER_ACCESS)
  });

  // Generate username based on first and last name
  const generateUsername = (first, last) => {
    if (!first.trim() && !last.trim()) return '';

    // Split first name by spaces to handle multiple first names (e.g., "Miguel Carlito")
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
    if (!canEdit) return;
    setFormData({
      firstName: '',
      lastName: '',
      username: '',
      jobTitle: '',
      password: '',
      access: normalizeUserAccess(EMPTY_USER_ACCESS)
    });
    setIsManualUsername(false);
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!canEdit || isSaving) return;
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.username.trim() || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }
    setIsSaving(true);
    setError('');
    try {
      const { user } = await apiRequest('/api/users', {
        method: 'POST',
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          username: formData.username.trim(),
          jobTitle: formData.jobTitle.trim() || 'Staff',
          password: formData.password,
          access: normalizeUserAccess(formData.access),
        }),
      });
      setUsers((currentUsers) => [user, ...currentUsers]);
      setIsModalOpen(false);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to create user.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAccessChange = (name, permission) => {
    if (!canEdit) return;
    setFormData((prev) => ({
      ...prev,
      access: {
        ...prev.access,
        [name]: {
          ...prev.access[name],
          [permission]: !prev.access[name][permission],
          ...(permission === 'edit' && !prev.access[name].edit ? { view: true } : {}),
          ...(permission === 'view' && prev.access[name].view ? { edit: false } : {}),
        },
      }
    }));
  };

  const handleDeleteUser = async (id) => {
    if (!canEdit) return;
    if (confirm('Are you sure you want to delete this user?')) {
      setError('');
      try {
        await apiRequest(`/api/users/${encodeURIComponent(id)}`, { method: 'DELETE' });
        setUsers((currentUsers) => currentUsers.filter((user) => user.id !== id));
      } catch (deleteError) {
        setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete user.');
      }
    }
  };

  return (
    <div className="space-y-6 text-neutral-900 dark:text-neutral-100">
      <p className="border border-sky-200 bg-sky-50 px-4 py-3 text-xs text-sky-800 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-200">
        Accounts and user-management permissions are stored and enforced by the server. Other operational records are being moved behind the API in stages.
      </p>
      {error && (
        <p role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}
      {/* Header Bar */}
      <div className="bg-white dark:bg-github-panel p-6 border border-neutral-200 dark:border-github-border shadow-sm flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-black dark:text-white" /> User Management
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {canEdit
              ? 'Set view or edit access by module. Dashboard and bookings remain available to every account.'
              : 'Review the accounts and module permissions available to this team.'}
          </p>
        </div>
        {canEdit && (
          <button
            onClick={handleOpenModal}
            className="px-4 py-2.5 bg-ui-sea hover:bg-ui-sea-dark dark:bg-white dark:hover:bg-neutral-200 dark:text-black text-white text-xs font-bold flex items-center gap-2 shadow-md transition-colors"
          >
            <UserPlus className="w-4 h-4" /> Add New User
          </button>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-github-panel border border-neutral-200 dark:border-github-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 uppercase font-mono">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Username</th>
                <th className="p-4">Job Title</th>
                <th className="p-4">Created</th>
                <th className="p-4">Module access</th>
                {canEdit && <th className="p-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                  <td className="p-4 font-bold text-neutral-900 dark:text-white">
                    {u.firstName} {u.lastName}{u.isAdmin ? ' (Admin)' : ''}
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
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex max-w-80 flex-wrap gap-1">
                      {PERMISSION_MODULES.filter(({ name }) => u.access[name].view).map(({ name }) => (
                        <span key={name} className="rounded border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-600 dark:border-github-border dark:bg-github-raised dark:text-github-text">
                          {name}: {u.access[name].edit ? 'Edit' : 'View'}
                        </span>
                      ))}
                      {!PERMISSION_MODULES.some(({ name }) => u.access[name].view) && (
                        <span className="text-[10px] text-neutral-400">No module access</span>
                      )}
                    </div>
                  </td>
                  {canEdit && <td className="p-4 text-right">
                    {!u.isAdmin && (
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>}
                </tr>
              ))}
              {!isLoading && users.length === 0 && (
                <tr>
                  <td colSpan={canEdit ? 6 : 5} className="p-8 text-center text-neutral-400 text-xs">
                    No users found. Click "Add New User" to create one.
                  </td>
                </tr>
              )}
              {isLoading && (
                <tr>
                  <td colSpan={canEdit ? 6 : 5} className="p-8 text-center text-neutral-400 text-xs">
                    Loading users...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {canEdit && isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0a2330]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-h-[90dvh] w-full max-w-md space-y-4 overflow-y-auto rounded-[10px] border border-neutral-200 bg-white p-6 shadow-2xl dark:border-github-border dark:bg-github-panel">
            
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
                    placeholder="e.g. John"
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
                    placeholder="e.g. Doe"
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
                  placeholder="e.g. JDOE"
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
                  minLength={12}
                  maxLength={72}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:border-black dark:focus:border-white"
                />
                <span className="block text-[10px] text-neutral-400">Use at least 12 characters.</span>
              </div>

              {/* Access Permissions */}
              <div className="border-t border-neutral-200 dark:border-neutral-800 pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-bold text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" /> Account Access
                    </label>
                    <p className="text-[10px] text-neutral-400 mt-0.5">Edit access also enables viewing. Dashboard and bookings are included for every account.</p>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono">{PERMISSION_MODULES.filter(({ name }) => formData.access[name].view).length}/{PERMISSION_MODULES.length} modules</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PERMISSION_MODULES.map((option) => (
                    <div
                      key={option.name}
                      className="flex flex-col gap-2 border border-neutral-200 bg-neutral-50 p-2 dark:border-github-border dark:bg-github-canvas"
                    >
                      <span className="font-bold text-neutral-700 dark:text-neutral-200">{option.name}</span>
                      <span className="text-[10px] leading-tight text-neutral-400">{option.description}</span>
                      <span className="flex gap-4">
                        {(['view', 'edit']).map((permission) => (
                          <label key={permission} className="inline-flex cursor-pointer items-center gap-1.5 text-[10px] capitalize text-neutral-600 dark:text-neutral-300">
                            <input
                              type="checkbox"
                              checked={formData.access[option.name][permission]}
                              onChange={() => handleAccessChange(option.name, permission)}
                              className="accent-black dark:accent-white"
                            />
                            {permission}
                          </label>
                        ))}
                      </span>
                    </div>
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
                  disabled={isSaving}
                  className="px-4 py-2 bg-ui-sea hover:bg-ui-sea-dark dark:bg-white dark:hover:bg-neutral-200 dark:text-black text-white font-bold transition-colors"
                >
                  {isSaving ? 'Creating...' : 'Save User'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}