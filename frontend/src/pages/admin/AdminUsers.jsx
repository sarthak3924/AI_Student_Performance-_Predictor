import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useToast } from '../../components/Toast';
import { SkeletonTable } from '../../components/Skeletons';
import { Trash2, Shield, User, GraduationCap, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminUsers() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/v1/admin/users');
      setUsers(response.data);
    } catch (err) {
      showToast('Failed to retrieve user directories.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, name) => {
    if (!window.confirm(`Are you sure you want to delete user account: ${name}?`)) return;

    try {
      await axios.delete(`/api/v1/admin/users/${userId}`);
      showToast(`Account of '${name}' successfully deleted.`, 'success');
      fetchUsers(); // reload list
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to delete account.', 'error');
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4 text-rose-400" />;
      case 'teacher':
        return <User className="h-4 w-4 text-amber-400" />;
      default:
        return <GraduationCap className="h-4 w-4 text-emerald-400" />;
    }
  };

  const filteredUsers = users.filter(u => 
    u.full_name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6 pt-16 lg:pt-0">
        <SkeletonTable />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pt-16 lg:pt-0"
    >
      <div>
        <h2 className="text-2xl font-bold font-sans tracking-tight">System Users Registry</h2>
        <p className="text-xs text-slate-400">View and regulate all students, teachers, and administrator portal access.</p>
      </div>

      {/* Search Filter */}
      <div className="relative bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
        <Search className="absolute left-7 top-7 h-4.5 w-4.5 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search registered accounts by name or email..."
          className="w-full glass-input pl-11 text-xs py-3"
        />
      </div>

      {/* Table grid */}
      <div className="glass-card p-6 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 pb-2 text-slate-400">
                <th className="py-2.5 font-bold">Account Name</th>
                <th className="py-2.5 font-bold">Email</th>
                <th className="py-2.5 font-bold">Role</th>
                <th className="py-2.5 font-bold">Academic/Teacher ID</th>
                <th className="py-2.5 font-bold">Department</th>
                <th className="py-2.5 font-bold">Created At</th>
                <th className="py-2.5 font-bold text-center">Settings</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} className="border-b border-slate-800/40 hover:bg-slate-800/10">
                  <td className="py-3.5 font-semibold text-slate-200">{u.full_name}</td>
                  <td className="py-3.5 text-slate-400">{u.email}</td>
                  <td className="py-3.5 font-semibold">
                    <span className="flex items-center gap-1.5 uppercase text-[9px] tracking-wide">
                      {getRoleIcon(u.role)}
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 font-mono text-slate-400">{u.academic_id}</td>
                  <td className="py-3.5 text-slate-400">{u.department}</td>
                  <td className="py-3.5 text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="py-3.5 text-center">
                    <button
                      onClick={() => handleDeleteUser(u.id, u.full_name)}
                      className="p-1.5 rounded-lg border border-transparent hover:border-red-500/20 hover:bg-red-500/10 text-red-400 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
