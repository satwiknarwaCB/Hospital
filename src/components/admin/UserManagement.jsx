import React, { useState, useEffect } from 'react';
import {
    Users,
    UserPlus,
    Mail,
    Lock,
    Shield,
    Plus,
    Search,
    Filter,
    CheckCircle2,
    XCircle,
    MoreVertical,
    Activity,
    User,
    Briefcase,
    Heart,
    ChevronRight,
    Loader2,
    RefreshCcw,
    Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { userManagementAPI } from '../../lib/api';

const UserManagement = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('therapists');
    const [isLoading, setIsLoading] = useState(false);
    const [therapists, setTherapists] = useState([]);
    const [parents, setParents] = useState([]);
    const [childrenList, setChildrenList] = useState([]); // Available children for assignment
    const [isCreating, setIsCreating] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeMenu, setActiveMenu] = useState(null); // ID of user with open menu

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        specialization: 'Speech Therapy',
        experience_years: 5,
        relationship: 'Mother',
        phone: '',
        assignedChild: '' // For therapists
    });

    const [message, setMessage] = useState({ type: '', text: '' });
    const [invitationModal, setInvitationModal] = useState(null);

    useEffect(() => {
        fetchUsers();
        fetchChildren();
    }, [activeTab]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveMenu(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const fetchChildren = async () => {
        try {
            const data = await userManagementAPI.listChildren();
            setChildrenList(data);
        } catch (error) {
            console.error('Failed to fetch children:', error);
        }
    };

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            if (activeTab === 'therapists') {
                const data = await userManagementAPI.listTherapists();
                setTherapists(data);
            } else {
                const data = await userManagementAPI.listParents();
                setParents(data);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
            setMessage({ type: 'error', text: 'Failed to load users' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDeleteUser = async (e, userId, userName) => {
        e.stopPropagation(); // Prevent card click
        if (!window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) return;

        setIsLoading(true);
        try {
            if (activeTab === 'therapists') {
                await userManagementAPI.deleteTherapist(userId);
            } else {
                await userManagementAPI.deleteParent(userId);
            }
            setMessage({ type: 'success', text: 'Account deleted successfully' });
            fetchUsers(); // Refresh list
        } catch (error) {
            console.error('Delete failed:', error);
            setMessage({ type: 'error', text: 'Failed to delete user' });
        } finally {
            setIsLoading(false);
            setActiveMenu(null);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            let response;
            // Send null if password is empty string to avoid validation error
            const passwordPayload = formData.password ? formData.password : null;

            if (activeTab === 'therapists') {
                response = await userManagementAPI.createTherapist({
                    name: formData.name,
                    email: formData.email,
                    password: passwordPayload,
                    specialization: formData.specialization,
                    experience_years: parseInt(formData.experience_years) || 0,
                    phone: formData.phone
                }, formData.assignedChild);
            } else {
                response = await userManagementAPI.createParent({
                    name: formData.name,
                    email: formData.email,
                    password: passwordPayload,
                    relationship: formData.relationship,
                    phone: formData.phone,
                    children_ids: []
                });
            }

            const data = response.data || response;

            if (data.invitation_link) {
                setInvitationModal({
                    email: formData.email,
                    link: data.invitation_link
                });
                setMessage({ type: 'success', text: 'User invited successfully!' });
            } else {
                setMessage({ type: 'success', text: 'Account created successfully!' });
            }

            setIsCreating(false);
            setFormData({
                name: '', email: '', password: '', specialization: 'Speech Therapy',
                experience_years: 5, relationship: 'Mother', phone: '', assignedChild: ''
            });
            fetchUsers();
        } catch (error) {
            console.error('Create failed:', error);

            let errorText = 'Failed to create user';
            const detail = error.response?.data?.detail;

            if (typeof detail === 'string') {
                errorText = detail;
            } else if (Array.isArray(detail)) {
                // Handle Pydantic validation error array
                // e.g. [{ "loc": ["body", "password"], "msg": "Password must be at least 8 characters", "type": "value_error" }]
                errorText = detail.map(err => err.msg).join(', ');
            } else if (typeof detail === 'object') {
                errorText = JSON.stringify(detail);
            }

            setMessage({ type: 'error', text: errorText });
        } finally {
            setIsLoading(false);
        }
    };

    const quickFill = (user) => {
        setFormData({
            ...formData,
            name: user.name,
            email: user.email,
            password: 'User@123'
        });
    };

    const exampleTherapists = [
        { name: 'Dr. Rajesh Kumar', email: 'dr.rajesh@therapist.com' },
        { name: 'Dr. Meera Singh', email: 'dr.meera@therapist.com' }
    ];

    const exampleParents = [
        { name: 'Priya Patel', email: 'priya.patel@parent.com' },
        { name: 'Arun Sharma', email: 'arun.sharma@parent.com' }
    ];

    const currentUsers = activeTab === 'therapists' ? therapists : parents;
    const filteredUsers = currentUsers.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-800">User Management</h2>
                    <p className="text-neutral-500">Manage therapist and parent credentials</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchUsers}
                        disabled={isLoading}
                    >
                        <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button
                        onClick={() => setIsCreating(!isCreating)}
                        className="bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-200"
                    >
                        {isCreating ? <XCircle className="h-4 w-4 mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                        {isCreating ? 'Cancel' : `Add ${activeTab === 'therapists' ? 'Therapist' : 'Parent'}`}
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-neutral-100 rounded-2xl w-full max-w-md">
                <button
                    onClick={() => { setActiveTab('therapists'); setIsCreating(false); }}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${activeTab === 'therapists'
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-700'
                        }`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Therapists
                    </div>
                </button>
                <button
                    onClick={() => { setActiveTab('parents'); setIsCreating(false); }}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${activeTab === 'parents'
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-700'
                        }`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <Heart className="h-4 w-4" />
                        Parents
                    </div>
                </button>
            </div>

            {/* Creation Form */}
            {isCreating && (
                <Card className="border-none shadow-xl ring-1 ring-neutral-200 bg-white overflow-hidden animate-in slide-in-from-top-4 duration-300">
                    <CardHeader className="bg-neutral-50 border-b border-neutral-100">
                        <CardTitle className="text-lg flex items-center gap-2 text-neutral-800">
                            <Plus className="h-5 w-5 text-primary-600" />
                            Create New {activeTab === 'therapists' ? 'Therapist' : 'Parent'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={handleCreateUser} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                                        <User className="h-4 w-4 text-neutral-400" />
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                                        placeholder="Enter full name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-neutral-400" />
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                                        placeholder="email@example.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                                        <Lock className="h-4 w-4 text-neutral-400" />
                                        Default Password (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                                        placeholder="Leave blank to generate invitation link"
                                    />
                                    <p className="text-xs text-neutral-500">
                                        If left blank, an invitation link will be generated for the user to set their own password.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                                        <RefreshCcw className="h-4 w-4 text-neutral-400" />
                                        {activeTab === 'therapists' ? 'Specialization' : 'Relationship'}
                                    </label>
                                    {activeTab === 'therapists' ? (
                                        <div className="space-y-4">
                                            <select
                                                name="specialization"
                                                value={formData.specialization}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all outline-none appearance-none"
                                            >
                                                <option>Speech Therapy</option>
                                                <option>Occupational Therapy</option>
                                                <option>Physical Therapy</option>
                                                <option>Behavioral Therapy</option>
                                            </select>

                                            {/* Assign Child Option */}
                                            <div className="pt-2">
                                                <label className="text-sm font-bold text-neutral-700 flex items-center gap-2 mb-2">
                                                    <User className="h-4 w-4 text-neutral-400" />
                                                    Assign Patient (Optional)
                                                </label>
                                                <select
                                                    name="assignedChild"
                                                    value={formData.assignedChild}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none appearance-none"
                                                >
                                                    <option value="">No specific assignment (Will auto-create demo)</option>
                                                    {childrenList.map(c => (
                                                        <option key={c.id} value={c.id}>{c.name}</option>
                                                    ))}
                                                </select>
                                                <p className="text-xs text-neutral-400 mt-1">
                                                    If no patient assigned, a demo patient will be created automatically.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <select
                                            name="relationship"
                                            value={formData.relationship}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all outline-none appearance-none"
                                        >
                                            <option>Mother</option>
                                            <option>Father</option>
                                            <option>Guardian</option>
                                        </select>
                                    )}
                                </div>
                            </div>

                            {/* Quick fill section */}
                            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">Quick Fill Examples</p>
                                <div className="flex flex-wrap gap-2">
                                    {(activeTab === 'therapists' ? exampleTherapists : exampleParents).map((u, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => quickFill(u)}
                                            className="px-4 py-2 bg-white border border-neutral-200 rounded-lg text-xs font-semibold hover:border-primary-400 hover:text-primary-600 transition-all shadow-sm"
                                        >
                                            {u.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsCreating(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="bg-primary-600 hover:bg-primary-700 px-8"
                                >
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : `Create ${activeTab === 'therapists' ? 'Therapist' : 'Parent'}`}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Filter/Search Row */}
            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-neutral-200">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <input
                        type="text"
                        placeholder={`Search ${activeTab}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                    />
                </div>
                <Button variant="outline" className="h-[50px] px-6">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                </Button>
            </div>

            {/* List Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading && !isCreating ? (
                    Array(6).fill(0).map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="h-48" />
                        </Card>
                    ))
                ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                        <Card key={user.id} className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-none shadow-md ring-1 ring-neutral-200 relative overflow-visible z-0">
                            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 group-hover:scale-150 transition-transform ${activeTab === 'therapists' ? 'bg-primary-500' : 'bg-pink-500'}`} />

                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4 relative z-10">
                                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-xl font-bold ${activeTab === 'therapists'
                                        ? 'bg-primary-100 text-primary-600'
                                        : 'bg-pink-100 text-pink-600'
                                        }`}>
                                        {user.name.charAt(0)}
                                    </div>
                                    <div className="flex items-center gap-1 relative">
                                        {user.is_active ? (
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full uppercase tracking-tighter">
                                                <CheckCircle2 className="h-3 w-3" />
                                                Active
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full uppercase tracking-tighter">
                                                <XCircle className="h-3 w-3" />
                                                Suspended
                                            </span>
                                        )}

                                        {/* Dropdown Menu Trigger */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveMenu(activeMenu === user.id ? null : user.id);
                                            }}
                                            className="p-1 hover:bg-neutral-100 rounded-lg transition-colors relative"
                                        >
                                            <MoreVertical className="h-4 w-4 text-neutral-400" />
                                        </button>

                                        {/* Dropdown Menu */}
                                        {activeMenu === user.id && (
                                            <div className="absolute right-0 top-8 bg-white rounded-xl shadow-xl border border-neutral-100 py-1 w-32 z-50 animate-in fade-in zoom-in-95 duration-200">
                                                <button
                                                    onClick={(e) => handleDeleteUser(e, user.id, user.name)}
                                                    className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1 relative z-10">
                                    <h3 className="font-bold text-neutral-800 text-lg group-hover:text-primary-600 transition-colors">{user.name}</h3>
                                    <p className="text-sm text-neutral-500 flex items-center gap-2">
                                        <Mail className="h-3 w-3" />
                                        {user.email}
                                    </p>
                                </div>

                                <div className="mt-6 pt-6 border-t border-neutral-100 flex items-center justify-between relative z-10">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                                            {activeTab === 'therapists' ? 'Specialization' : 'Relationship'}
                                        </p>
                                        <p className="text-xs font-bold text-neutral-700">
                                            {activeTab === 'therapists' ? user.specialization : user.relationship}
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => {
                                            if (activeTab === 'therapists') {
                                                navigate('/admin/overview', { state: { therapistId: user.id } });
                                            }
                                        }}
                                        variant="ghost"
                                        size="sm"
                                        className="text-primary-600 hover:bg-primary-50 font-bold group"
                                    >
                                        View Portal
                                        <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center">
                        <div className="h-20 w-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="h-10 w-10 text-neutral-300" />
                        </div>
                        <h3 className="text-lg font-bold text-neutral-800">No {activeTab} accounts found</h3>
                        <p className="text-neutral-500">Add a new user to see them listed here.</p>
                        <Button
                            variant="outline"
                            className="mt-6"
                            onClick={() => setIsCreating(true)}
                        >
                            + Add New Account
                        </Button>
                    </div>
                )}
            </div>

            {/* Status Messages */}
            {message.text && (
                <div className={`fixed bottom-8 right-8 p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-8 duration-500 z-50 ${message.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
                    <p className="font-bold text-sm">{message.text}</p>
                    <button onClick={() => setMessage({ text: '', type: '' })} className="ml-4 hover:scale-110">
                        <XCircle className="h-5 w-5" />
                    </button>
                </div>
            )}

            {invitationModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <Card className="w-full max-w-lg shadow-2xl bg-white border-0">
                        <CardHeader className="bg-primary-50 border-b border-primary-100">
                            <CardTitle className="text-xl flex items-center gap-2 text-primary-900">
                                <CheckCircle2 className="h-6 w-6 text-green-500" />
                                Invitation Link Generated
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <p className="text-neutral-600">
                                The account for <strong>{invitationModal.email}</strong> has been created.
                                <br />Please share this invitation link so they can set their password:
                            </p>
                            <div className="bg-neutral-100 p-4 rounded-xl font-mono text-sm break-all border border-neutral-200 select-all text-neutral-700">
                                {invitationModal.link}
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <Button
                                    onClick={() => {
                                        navigator.clipboard.writeText(invitationModal.link);
                                        setMessage({ type: 'success', text: 'Link copied to clipboard' });
                                    }}
                                    variant="outline"
                                >
                                    Copy Link
                                </Button>
                                <Button onClick={() => setInvitationModal(null)}>
                                    Done
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
