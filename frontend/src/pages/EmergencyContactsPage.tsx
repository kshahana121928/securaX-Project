import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Phone,
  Mail,
  Star,
  Trash2,
  Edit,
  Send,
  CheckCircle,
  AlertCircle,
  X,
} from 'lucide-react';
import { contactService } from '../services/contactService';
import { EmergencyContact } from '../types';

export const EmergencyContactsPage: React.FC = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [testStatus, setTestStatus] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    relationship: 'Parent',
    email: '',
    notifyPreference: 'all' as 'all' | 'sms' | 'call' | 'email',
    isPrimary: false,
  });

  const loadContacts = async () => {
    try {
      const res = await contactService.getContacts();
      if (res.success) {
        setContacts(res.contacts);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const openAddModal = () => {
    setEditingContact(null);
    setForm({
      name: '',
      phone: '',
      relationship: 'Parent',
      email: '',
      notifyPreference: 'all',
      isPrimary: contacts.length === 0,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (c: EmergencyContact) => {
    setEditingContact(c);
    setForm({
      name: c.name,
      phone: c.phone,
      relationship: c.relationship,
      email: c.email || '',
      notifyPreference: c.notifyPreference,
      isPrimary: c.isPrimary,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingContact) {
        await contactService.updateContact(editingContact._id, form);
      } else {
        await contactService.createContact(form);
      }
      setIsModalOpen(false);
      loadContacts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving contact.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this emergency contact?')) {
      await contactService.deleteContact(id);
      loadContacts();
    }
  };

  const handleTestAlert = async (id: string, name: string) => {
    setTestStatus(`Sending test notification to ${name}...`);
    try {
      const res = await contactService.testContactAlert(id);
      setTestStatus(res.message);
      setTimeout(() => setTestStatus(null), 4000);
    } catch {
      setTestStatus('Failed to send test alert.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-black text-slate-900">Emergency Contacts Guardian</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Maintain 3–5 verified family members or guardians who will receive instant SMS & live tracking links.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center space-x-2 shadow-md shadow-blue-500/20 transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Emergency Contact</span>
        </button>
      </div>

      {testStatus && (
        <div className="p-4 bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-semibold rounded-2xl flex items-center space-x-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-cyan-600" />
          <span>{testStatus}</span>
        </div>
      )}

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contacts.map((contact) => (
          <div
            key={contact._id}
            className={`bg-white rounded-3xl p-6 border shadow-sm flex flex-col justify-between transition hover:shadow-md ${
              contact.isPrimary ? 'border-blue-400 ring-2 ring-blue-500/10' : 'border-slate-200'
            }`}
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#0B1F3A] text-white flex items-center justify-center font-black text-base shadow">
                    {contact.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{contact.name}</h3>
                    <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                      {contact.relationship}
                    </span>
                  </div>
                </div>

                {contact.isPrimary && (
                  <span className="p-1.5 bg-amber-100 text-amber-700 rounded-xl" title="Primary Contact">
                    <Star className="w-4 h-4 fill-amber-500" />
                  </span>
                )}
              </div>

              <div className="space-y-2 text-xs py-2 border-y border-slate-100">
                <div className="flex items-center space-x-2 text-slate-700">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono font-semibold">{contact.phone}</span>
                </div>
                {contact.email && (
                  <div className="flex items-center space-x-2 text-slate-700 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{contact.email}</span>
                  </div>
                )}
                <div className="text-[11px] text-slate-400 pt-1">
                  Alert channel:{' '}
                  <strong className="text-slate-600 uppercase">{contact.notifyPreference}</strong>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between gap-2">
              <a
                href={`tel:${contact.phone}`}
                className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition"
              >
                <Phone className="w-3 h-3 text-green-400" />
                <span>Call</span>
              </a>

              <button
                onClick={() => handleTestAlert(contact._id, contact.name)}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center space-x-1 transition"
                title="Send test alert"
              >
                <Send className="w-3 h-3 text-blue-500" />
                <span>Test</span>
              </button>

              <button
                onClick={() => openEditModal(contact)}
                className="p-2 text-slate-400 hover:text-blue-600 rounded-xl transition"
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleDelete(contact._id)}
                className="p-2 text-slate-400 hover:text-red-600 rounded-xl transition"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Contact Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-slate-900 mb-1">
              {editingContact ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Saved contacts receive automated SMS alerts with live GPS tracking links.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Sunita Sharma"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 98765 00001"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship</label>
                  <input
                    type="text"
                    required
                    value={form.relationship}
                    onChange={(e) => setForm({ ...form, relationship: e.target.value })}
                    placeholder="Parent / Sibling / Friend"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@example.com (Optional)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alert Channel</label>
                <select
                  value={form.notifyPreference}
                  onChange={(e: any) => setForm({ ...form, notifyPreference: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Channels (SMS + Email + Call prompt)</option>
                  <option value="sms">SMS Only</option>
                  <option value="call">Call Priority</option>
                  <option value="email">Email Only</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="primaryContactCheck"
                  checked={form.isPrimary}
                  onChange={(e) => setForm({ ...form, isPrimary: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="primaryContactCheck" className="text-xs font-semibold text-slate-700">
                  Set as Primary Contact (Called first in emergency)
                </label>
              </div>

              <div className="flex space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
