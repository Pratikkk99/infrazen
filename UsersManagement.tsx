
import React, { useState, useEffect } from 'react';
import { Search, MoreVertical, ExternalLink, ShieldAlert, UserCheck, ArrowLeft } from 'lucide-react';
import { Dropdown } from './components/Dropdown';
import { Badge } from './components/Badge';
import { Button } from './components/Button';
import { simulateAction, showToast } from './utils/demo';
import { apiClient } from './utils/apiClient';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Suspended';
}

interface UsersManagementProps {
  onBack?: () => void;
  onView?: (userId: string) => void;
}

export const UsersManagement: React.FC<UsersManagementProps> = ({ onBack, onView }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await apiClient.get('/admin/users');
        setUsers(data.map((u: any) => ({
          id: u.user_id.toString(),
          name: u.full_name,
          email: u.email || '-',
          role: u.primary_role,
          status: u.user_status === 'ACTIVE' ? 'Active' : 'Suspended'
        })));
      } catch (error) {
        showToast.error("Failed to load users");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleViewUser = async (user: User) => {
    if (onView) {
      onView(user.id);
      return;
    }
    setLoadingUserId(user.id);
    try {
      showToast.success(`Profile for ${user.name} loaded`);
    } catch (error: any) {
      showToast.error("Failed to load user profile");
    } finally {
      setLoadingUserId(null);
    }
  };

  const handleToggleStatus = async (user: User) => {
    setTogglingUserId(user.id);
    const newStatus = user.status === 'Active' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await apiClient.post(`/admin/users/${user.id}/status`, { status: newStatus });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus === 'ACTIVE' ? 'Active' : 'Suspended' } : u));
      showToast.success(`User ${user.name} has been ${newStatus.toLowerCase()}`);
    } catch (error) {
      showToast.error("Action failed — try again");
    } finally {
      setTogglingUserId(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'EXPERT': return 'teal';
      case 'ORG_ADMIN': return 'blue';
      case 'SYSTEM_ADMIN': return 'red';
      default: return 'slate';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-3 bg-white hover:bg-slate-50 text-slate-400 hover:text-teal-600 rounded-[1.25rem] transition-all border border-slate-100 zen-shadow group"
            >
              <ArrowLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
            </button>
          )}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Users</h2>
            <p className="text-slate-500 text-sm font-medium">Manage all registered users, experts, and organizations.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="w-full sm:w-64">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Search Users</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 text-sm transition-all"
              />
            </div>
          </div>

          <Dropdown
            label="Role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-32"
          >
            <option value="All">All Roles</option>
            <option value="EXPERT">Experts</option>
            <option value="ORG_ADMIN">Owners/Orgs</option>
            <option value="SYSTEM_ADMIN">Admins</option>
          </Dropdown>

          <Dropdown
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-32"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
          </Dropdown>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 zen-shadow overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">User</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Contact</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Role</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="group hover:bg-teal-50/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 group-hover:bg-white group-hover:text-teal-600 transition-all zen-shadow border border-transparent group-hover:border-teal-100">
                          {user.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-500">{user.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={user.status === 'Active' ? 'teal' : 'red'}>{user.status}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-3 py-1.5 text-xs border-slate-200 hover:border-teal-600 hover:text-teal-600 bg-white"
                          onClick={() => handleViewUser(user)}
                          loading={loadingUserId === user.id}
                        >
                          <ExternalLink size={14} className="mr-1.5" /> View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="px-3 py-1.5 text-xs text-slate-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleToggleStatus(user)}
                          loading={togglingUserId === user.id}
                        >
                          {user.status === 'Active' ? <ShieldAlert size={14} /> : <UserCheck size={14} />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <p className="text-slate-400 text-sm font-medium">No users found matching your criteria.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 border-t border-slate-50 flex items-center justify-between bg-white">
          <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">Showing {filteredUsers.length} Users</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-xs font-bold text-slate-400 border border-slate-100 rounded-lg cursor-not-allowed">Previous</button>
            <button className="px-3 py-1 text-xs font-bold text-teal-600 border border-teal-100 rounded-lg bg-teal-50/50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};
