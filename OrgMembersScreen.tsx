
import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  MoreVertical,
  Mail,
  Shield,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './components/Button';
import { Badge } from './components/Badge';
import { InviteMemberModal } from './components/InviteMemberModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { showToast } from './utils/demo';
import { apiClient } from './utils/apiClient';

export interface Member {
  id: string;
  name: string;
  contact: string;
  role: string;
  status: 'ACTIVE' | 'PENDING';
}

export const OrgMembersScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<Member | undefined>(undefined);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [orgs, setOrgs] = useState<any[]>([]);

  const fetchMembers = async () => {
    try {
      const myOrgs = await apiClient.get('/org/my-organizations');
      setOrgs(myOrgs);
      if (myOrgs.length > 0) {
        const membersData = await apiClient.get(`/org/${myOrgs[0].org_id}/members`);
        setMembers(membersData.map((m: any) => ({
          id: m.org_member_id.toString(),
          name: m.app_users?.full_name || 'User',
          contact: m.app_users?.email || m.app_users?.phone || 'No Contact',
          role: m.member_role,
          status: 'ACTIVE'
        })));
      }
    } catch (error) {
      showToast.error("Failed to load members");
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleInvite = async (data: { name: string; contact: string; role: string }) => {
    setIsSubmitting(true);
    try {
      if (orgs.length === 0) return;

      if (memberToEdit) {
        await apiClient.put(`/org/${orgs[0].org_id}/members/${memberToEdit.id}`, {
          role: data.role
        });
        showToast.success('Member role updated successfully!');
      } else {
        await apiClient.post(`/org/${orgs[0].org_id}/members`, {
          email: data.contact, // Assuming contact is email
          role: data.role
        });
        showToast.success('Member added successfully!');
      }

      fetchMembers();
      setIsInviteModalOpen(false);
      setMemberToEdit(undefined);
    } catch (error: any) {
      showToast.error(error.message || "Action failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.contact.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRemove = async () => {
    if (!memberToRemove) return;

    setIsSubmitting(true);
    try {
      await apiClient.delete(`/org/${orgs[0].org_id}/members/${memberToRemove.id}`);
      setMembers(prev => prev.filter(m => m.id !== memberToRemove.id));
      showToast.success("Member removed successfully");
      setMemberToRemove(null);
    } catch (error: any) {
      showToast.error(error.message || "Failed to remove member");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadgeVariant = (role: string): 'blue' | 'teal' | 'slate' => {
    switch (role) {
      case 'ORG_ADMIN': return 'blue';
      case 'ORG_MEMBER': return 'teal';
      default: return 'slate';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight font-display mb-2">Members</h1>
          <p className="text-lg text-slate-500 font-medium">Invite team members and manage roles within your organization.</p>
        </div>
        <Button
          variant="primary"
          className="px-8 py-4 rounded-2xl font-display shadow-2xl shadow-teal-500/20"
          onClick={() => {
            setMemberToEdit(undefined);
            setIsInviteModalOpen(true);
          }}
        >
          <UserPlus size={20} className="mr-2" /> Invite Member
        </Button>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 zen-shadow flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-grow w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search by name or contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-3.5 bg-slate-50/50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 text-sm font-medium transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto px-2">
          <Users size={18} className="text-slate-300" />
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
            {members.length} Total Members
          </span>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 zen-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Name</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Email / Phone</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Role</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 font-bold">
                        {member.name.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-900">{member.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-500 font-medium">
                      <Mail size={14} className="text-slate-300" />
                      {member.contact}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <Badge variant={getRoleBadgeVariant(member.role)}>
                      {member.role.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      {member.status === 'ACTIVE' ? (
                        <CheckCircle2 size={14} className="text-teal-500" />
                      ) : (
                        <Clock size={14} className="text-slate-300" />
                      )}
                      <span className={`text-xs font-bold ${member.status === 'ACTIVE' ? 'text-teal-600' : 'text-slate-400'}`}>
                        {member.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setMemberToEdit(member);
                          setIsInviteModalOpen(true);
                        }}
                        className="p-2.5 rounded-xl border border-slate-100 text-slate-400 hover:text-teal-600 hover:border-teal-200 hover:bg-white transition-all group/btn"
                        title="Edit Member"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => setMemberToRemove(member)}
                        className="p-2.5 rounded-xl border border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-white transition-all group/btn"
                        title="Remove Member"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Users size={40} className="text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">No members found matching your search.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => {
          setIsInviteModalOpen(false);
          setMemberToEdit(undefined);
        }}
        onConfirm={handleInvite}
        initialData={memberToEdit}
        isSubmitting={isSubmitting}
      />

      <ConfirmationModal
        isOpen={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleRemove}
        title="Remove Member"
        message={`Are you sure you want to remove ${memberToRemove?.name} from the organization? They will lose access to all audit requests and reports.`}
        type="reject"
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
