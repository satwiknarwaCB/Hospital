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
    Trash2,
    ChevronDown,
    Baby,
    Phone,
    MapPin,
    Fingerprint,
    Edit,
    Key,
    Image,
    Upload,
    Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { userManagementAPI } from '../../lib/api';
import { useApp } from '../../lib/context';

const UserManagement = () => {
    const { refreshAdminStats, refreshChildren } = useApp();
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
        password: 'User@123',
        specialization: 'Speech Therapy',
        customSpecialization: '',
        qualification: '',
        experience_years: '',
        relationship: 'Mother',
        phone: '',
        address: '',
        profile_photo: ''
    });

    const [childFormData, setChildFormData] = useState({
        name: '',
        age: '',
        gender: 'Male',
        medical_condition: 'Autism',
        customCondition: '',
        school_name: '',
        parent_id: '',
        therapy_start_date: '',
        therapy_type: 'Speech Therapy'
    });

    const [message, setMessage] = useState({ type: '', text: '' });
    const [invitationModal, setInvitationModal] = useState(null);
    const [editingUser, setEditingUser] = useState(null); // User being edited
    const [passwordResetModal, setPasswordResetModal] = useState(null); // { user, role }
    const [resetPasswordData, setResetPasswordData] = useState({ newPassword: '', confirmPassword: '' });

    const handleCreateChild = async (e) => {
        e.preventDefault();

        // Frontend validation for age based on backend constraints
        const age = parseInt(childFormData.age);
        if (age >= 18) {
            setMessage({ type: 'error', text: "Child's age must be under 18 for child registration" });
            return;
        } else if (age <= 0) {
            setMessage({ type: 'error', text: 'Please enter a valid age greater than 0' });
            return;
        }

        setIsLoading(true);
        try {
            await userManagementAPI.createChild({
                name: childFormData.name,
                age: age,
                gender: childFormData.gender,
                condition: childFormData.medical_condition === '+ Add Custom' ? childFormData.customCondition : childFormData.medical_condition,
                school_name: childFormData.school_name,
                parent_id: childFormData.parent_id,
                therapy_start_date: childFormData.therapy_start_date,
                therapy_type: childFormData.therapy_type
            });
            setMessage({ type: 'success', text: 'Child record created successfully' });
            setChildFormData({ name: '', age: '', gender: 'Male', medical_condition: 'Autism', customCondition: '', school_name: '', parent_id: '', therapy_start_date: '', therapy_type: 'Speech Therapy' });
            setIsCreating(false);
            fetchChildren();
            refreshChildren(); // Sync global state
        } catch (error) {
            console.error('Failed to create child:', error);

            // Extract descriptive error from backend if available
            let errorText = 'Failed to create child record';
            const detail = error.response?.data?.detail;
            if (typeof detail === 'string') {
                errorText = detail;
            } else if (Array.isArray(detail)) {
                errorText = detail.map(err => err.msg).join(', ');
            }

            setMessage({ type: 'error', text: errorText });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteChild = async (e, childId, childName) => {
        e.stopPropagation();
        if (!window.confirm(`Are you sure you want to delete ${childName}?`)) return;
        setIsLoading(true);
        try {
            await userManagementAPI.deleteChild(childId);
            setMessage({ type: 'success', text: 'Child record deleted' });
            fetchChildren();
            refreshChildren(); // Sync global state
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to delete child' });
        } finally {
            setIsLoading(false);
            setActiveMenu(null);
        }
    };

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

    const handleFileChange = (e, isEditing = false) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (isEditing) {
                    setEditingUser(prev => ({ ...prev, profile_photo: reader.result }));
                } else {
                    setFormData(prev => ({ ...prev, profile_photo: reader.result }));
                }
            };
            reader.readAsDataURL(file);
        }
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
            refreshAdminStats();
        } catch (error) {
            console.error('Delete failed:', error);
            setMessage({ type: 'error', text: 'Failed to delete user' });
        } finally {
            setIsLoading(false);
            setActiveMenu(null);
        }
    };

    const handleToggleUserStatus = async (user) => {
        try {
            const role = user.role || (activeTab === 'therapists' ? 'therapist' : 'parent');
            const response = await userManagementAPI.toggleUserStatus(role, user.id);
            if (response.data.status === 'success') {
                setMessage({ type: 'success', text: `Account ${response.data.is_active ? 'enabled' : 'disabled'} successfully` });
                fetchUsers();
            }
        } catch (error) {
            console.error('Failed to toggle status:', error);
            setMessage({ type: 'error', text: 'Failed to update account status' });
        }
    };

    const handleEditUser = (user) => {
        // Populate editingUser state with current user data
        setEditingUser({
            ...user,
            customCondition: '',
            qualification: user.qualification || '',
            profile_photo: user.profile_photo || '',
            originalEmail: user.email, // Track original email to check if it changed
            therapy_start_date: user.therapy_start_date || '',
            therapy_type: user.therapy_type || 'Speech Therapy'
        });
        setActiveMenu(null);
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const updateData = {};

            if (activeTab === 'therapists') {
                // Therapist fields
                updateData.name = editingUser.name;
                updateData.email = editingUser.email;
                updateData.specialization = editingUser.specialization === '+ Add Custom'
                    ? editingUser.customSpecialization
                    : editingUser.specialization;
                updateData.experience_years = parseInt(editingUser.experience_years) || 0;
                updateData.qualification = editingUser.qualification;
                updateData.phone = editingUser.phone;
                updateData.profile_photo = editingUser.profile_photo;
                updateData.license_number = editingUser.license_number;

                await userManagementAPI.updateTherapist(editingUser.id, updateData);
            } else if (activeTab === 'parents') {
                // Parent fields
                updateData.name = editingUser.name;
                updateData.email = editingUser.email;
                updateData.phone = editingUser.phone;
                updateData.address = editingUser.address;
                updateData.relationship = editingUser.relationship;

                await userManagementAPI.updateParent(editingUser.id, updateData);
            } else if (activeTab === 'children') {
                // Child fields
                updateData.name = editingUser.name;
                updateData.age = parseInt(editingUser.age) || 0;
                updateData.gender = editingUser.gender;
                updateData.condition = editingUser.condition === '+ Add Custom'
                    ? editingUser.customCondition
                    : editingUser.condition;
                updateData.school_name = editingUser.school_name;
                updateData.therapy_start_date = editingUser.therapy_start_date;
                updateData.therapy_type = editingUser.therapy_type;

                await userManagementAPI.updateChild(editingUser.id, updateData);
            }

            setMessage({ type: 'success', text: `${activeTab.slice(0, -1)} updated successfully!` });
            setEditingUser(null);

            if (activeTab === 'children') {
                fetchChildren();
            } else {
                fetchUsers();
            }
        } catch (error) {
            console.error('Update failed:', error);
            let errorText = 'Failed to update user';
            const detail = error.response?.data?.detail;

            if (typeof detail === 'string') {
                errorText = detail;
            } else if (Array.isArray(detail)) {
                errorText = detail.map(err => err.msg).join(', ');
            }

            setMessage({ type: 'error', text: errorText });
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenPasswordReset = (user) => {
        const role = activeTab === 'therapists' ? 'therapist' : 'parent';
        setPasswordResetModal({ user, role });
        setResetPasswordData({ newPassword: '', confirmPassword: '' });
        setActiveMenu(null);
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        // Validate passwords match
        if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match!' });
            return;
        }

        // Validate password length
        if (resetPasswordData.newPassword.length < 8) {
            setMessage({ type: 'error', text: 'Password must be at least 8 characters long' });
            return;
        }

        setIsLoading(true);
        try {
            const response = await userManagementAPI.resetPassword(
                passwordResetModal.role,
                passwordResetModal.user.id,
                resetPasswordData.newPassword
            );

            setMessage({ type: 'success', text: response.message || 'Password reset successfully!' });
            setPasswordResetModal(null);
            setResetPasswordData({ newPassword: '', confirmPassword: '' });
            fetchUsers(); // Refresh to show updated is_active status
        } catch (error) {
            console.error('Password reset failed:', error);
            let errorText = 'Failed to reset password';
            const detail = error.response?.data?.detail;

            if (typeof detail === 'string') {
                errorText = detail;
            } else if (Array.isArray(detail)) {
                errorText = detail.map(err => err.msg).join(', ');
            }

            setMessage({ type: 'error', text: errorText });
        } finally {
            setIsLoading(false);
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
                const payload = {
                    name: formData.name,
                    email: formData.email,
                    password: passwordPayload,
                    specialization: formData.specialization === '+ Add Custom' ? formData.customSpecialization : formData.specialization,
                    qualification: formData.qualification,
                    experience_years: parseInt(formData.experience_years) || 0,
                    phone: formData.phone,
                    profile_photo: formData.profile_photo
                };

                response = await userManagementAPI.createTherapist(payload);
            } else {
                response = await userManagementAPI.createParent({
                    name: formData.name,
                    email: formData.email,
                    password: passwordPayload,
                    relationship: formData.relationship,
                    phone: formData.phone,
                    address: formData.address,
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

            setFormData({
                name: '', email: '', password: 'User@123', specialization: 'Speech Therapy',
                customSpecialization: '', qualification: '', experience_years: '', relationship: 'Mother', phone: '',
                address: '', profile_photo: ''
            });
            setIsCreating(false);
            await fetchUsers();
            await refreshAdminStats();
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

    const currentUsers = activeTab === 'therapists' ? therapists : activeTab === 'children' ? childrenList : parents;
    const filteredUsers = currentUsers.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-neutral-900 uppercase tracking-tight">User Governance</h2>
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mt-1">Personnel & Family Access Control</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchUsers}
                        disabled={isLoading}
                        className="flex-1 md:flex-none h-11 px-6 rounded-xl border-neutral-200 font-black text-[10px] uppercase tracking-widest"
                    >
                        <RefreshCcw className={`h-3.5 w-3.5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Sync
                    </Button>
                    <Button
                        onClick={() => setIsCreating(!isCreating)}
                        className={`flex-[2] md:flex-none h-11 px-8 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all ${isCreating ? 'bg-rose-500 hover:bg-rose-600 text-white' : 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-100'}`}
                    >
                        {isCreating ? <XCircle className="h-4 w-4 mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                        {isCreating ? 'Dismiss' : `Enrol ${activeTab === 'therapists' ? 'Therapist' : activeTab === 'children' ? 'Child' : 'Parent'}`}
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex p-1.5 bg-neutral-100 rounded-[1.25rem] w-full max-w-xl border border-neutral-200 shadow-inner">
                <button
                    onClick={() => {
                        setActiveTab('therapists');
                        setIsCreating(false);
                        setFormData({
                            name: '',
                            email: '',
                            password: 'User@123',
                            specialization: 'Speech Therapy',
                            customSpecialization: '',
                            experience_years: 5,
                            relationship: 'Mother',
                            phone: ''
                        });
                    }}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'therapists'
                        ? 'bg-white text-primary-600 shadow-md ring-1 ring-neutral-200'
                        : 'text-neutral-400 hover:text-neutral-600'
                        }`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <Briefcase className="h-3.5 w-3.5" />
                        Therapists
                    </div>
                </button>
                <button
                    onClick={() => {
                        setActiveTab('parents');
                        setIsCreating(false);
                        setFormData({
                            name: '',
                            email: '',
                            password: 'User@123',
                            specialization: 'Speech Therapy',
                            customSpecialization: '',
                            experience_years: 5,
                            relationship: 'Mother',
                            phone: ''
                        });
                    }}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'parents'
                        ? 'bg-white text-primary-600 shadow-md ring-1 ring-neutral-200'
                        : 'text-neutral-400 hover:text-neutral-600'
                        }`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <Heart className="h-3.5 w-3.5" />
                        Parents
                    </div>
                </button>
                <button
                    onClick={() => {
                        setActiveTab('children');
                        setIsCreating(false);
                        setChildFormData({
                            name: '',
                            age: '',
                            gender: 'Male',
                            medical_condition: 'Autism',
                            customCondition: '',
                            school_name: '',
                            parent_id: ''
                        });
                    }}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'children'
                        ? 'bg-white text-primary-600 shadow-md ring-1 ring-neutral-200'
                        : 'text-neutral-400 hover:text-neutral-600'
                        }`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <Baby className="h-3.5 w-3.5" />
                        Children
                    </div>
                </button>
            </div>

            {/* Creation Form */}
            {isCreating && (
                <Card className="border-none shadow-2xl ring-1 ring-neutral-200 bg-white overflow-hidden animate-in slide-in-from-top-4 duration-500 rounded-[2rem] md:rounded-[2.5rem]">
                    <CardHeader className="bg-neutral-50/50 border-b border-neutral-100 p-6 md:p-8">
                        <CardTitle className="text-xl md:text-2xl font-black text-neutral-900 uppercase tracking-tight flex items-center gap-3">
                            <Plus className="h-6 w-6 text-primary-600" />
                            {activeTab === 'children' ? 'Register New Child' : `Register New ${activeTab === 'therapists' ? 'Therapist' : 'Parent'}`}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 md:p-10">
                        {activeTab === 'children' ? (
                            <form onSubmit={handleCreateChild} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                            <User className="h-3.5 w-3.5" />
                                            Child's Name
                                        </label>
                                        <input
                                            type="text"
                                            value={childFormData.name}
                                            onChange={(e) => setChildFormData({ ...childFormData, name: e.target.value })}
                                            required
                                            className="w-full px-5 py-4 bg-neutral-100/50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all outline-none font-black text-sm tracking-tight"
                                            placeholder="Child Full Name"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-neutral-400 tracking-widest flex items-center gap-2 px-1">
                                            <Heart className="h-3.5 w-3.5" />
                                            Parent (Link)
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={childFormData.parent_id}
                                                onChange={(e) => setChildFormData({ ...childFormData, parent_id: e.target.value })}
                                                required
                                                className="w-full px-5 py-4 bg-neutral-100/50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all outline-none appearance-none font-black text-sm tracking-tight cursor-pointer"
                                            >
                                                <option value="">Select Parent</option>
                                                {parents.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name} ({p.email})</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-neutral-400 tracking-widest flex items-center gap-2 px-1">
                                            <Activity className="h-3.5 w-3.5" />
                                            Age
                                        </label>
                                        <input
                                            type="number"
                                            value={childFormData.age}
                                            onChange={(e) => setChildFormData({ ...childFormData, age: e.target.value })}
                                            required
                                            className="w-full px-5 py-4 bg-neutral-100/50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all outline-none font-black text-sm tracking-tight"
                                            placeholder="Years"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-neutral-400 tracking-widest flex items-center gap-2 px-1">
                                            <Users className="h-3.5 w-3.5" />
                                            Gender
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={childFormData.gender}
                                                onChange={(e) => setChildFormData({ ...childFormData, gender: e.target.value })}
                                                className="w-full px-5 py-4 bg-neutral-100/50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all outline-none appearance-none font-black text-sm tracking-tight cursor-pointer"
                                            >
                                                <option>Male</option>
                                                <option>Female</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-neutral-400 tracking-widest flex items-center gap-2 px-1">
                                            <Activity className="h-3.5 w-3.5" />
                                            Medical Condition
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={childFormData.medical_condition}
                                                onChange={(e) => setChildFormData({ ...childFormData, medical_condition: e.target.value })}
                                                className="w-full px-5 py-4 bg-neutral-100/50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all outline-none appearance-none font-black text-sm tracking-tight cursor-pointer"
                                            >
                                                <option>Autism</option>
                                                <option>ADHD</option>
                                                <option>Speech Delay</option>
                                                <option>Developmental Delay</option>
                                                <option>+ Add Custom</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                                        </div>
                                        {childFormData.medical_condition === '+ Add Custom' && (
                                            <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                                <input
                                                    type="text"
                                                    value={childFormData.customCondition}
                                                    onChange={(e) => setChildFormData({ ...childFormData, customCondition: e.target.value })}
                                                    required
                                                    className="w-full px-5 py-3 bg-white border-2 border-primary-100 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all outline-none font-black text-xs tracking-tight"
                                                    placeholder="Specify Custom Condition..."
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-neutral-400 tracking-widest flex items-center gap-2 px-1">
                                            <Briefcase className="h-3.5 w-3.5" />
                                            School Name (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={childFormData.school_name}
                                            onChange={(e) => setChildFormData({ ...childFormData, school_name: e.target.value })}
                                            className="w-full px-5 py-4 bg-neutral-100/50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all outline-none font-black text-sm tracking-tight"
                                            placeholder="School Name"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-neutral-400 tracking-widest flex items-center gap-2 px-1">
                                            <Clock className="h-3.5 w-3.5" />
                                            Therapy Start Date
                                        </label>
                                        <input
                                            type="date"
                                            value={childFormData.therapy_start_date}
                                            onChange={(e) => setChildFormData({ ...childFormData, therapy_start_date: e.target.value })}
                                            className="w-full px-5 py-4 bg-neutral-100/50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all outline-none font-black text-sm tracking-tight cursor-pointer"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-neutral-400 tracking-widest flex items-center gap-2 px-1">
                                            <Activity className="h-3.5 w-3.5" />
                                            Therapy Type
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={childFormData.therapy_type}
                                                onChange={(e) => setChildFormData({ ...childFormData, therapy_type: e.target.value })}
                                                className="w-full px-5 py-4 bg-neutral-100/50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all outline-none appearance-none font-black text-sm tracking-tight cursor-pointer"
                                            >
                                                <option>Speech Therapy</option>
                                                <option>Occupational Therapy</option>
                                                <option>Behavioral Therapy (ABA)</option>
                                                <option>Physical Therapy</option>
                                                <option>Social Skills</option>
                                                <option>Sensory Integration</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
                                    <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
                                    <Button type="submit" disabled={isLoading} className="bg-primary-600 hover:bg-primary-700 px-8">
                                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Register Child'}
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleCreateUser} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-neutral-400 tracking-widest flex items-center gap-2 px-1">
                                            <User className="h-3.5 w-3.5" />
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-5 py-4 bg-neutral-100/50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all outline-none font-black text-sm tracking-tight"
                                            placeholder="Full Name"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-neutral-400 tracking-widest flex items-center gap-2 px-1">
                                            <Mail className="h-3.5 w-3.5" />
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-5 py-4 bg-neutral-100/50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all outline-none font-black text-sm tracking-tight"
                                            placeholder="email@example.com"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-neutral-400 tracking-widest flex items-center gap-2 px-1">
                                            <Lock className="h-3.5 w-3.5" />
                                            Password (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className="w-full px-5 py-4 bg-neutral-100/50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all outline-none font-black text-sm tracking-tight"
                                            placeholder="Set Password"
                                        />
                                        <p className="text-[9px] font-black text-neutral-400 tracking-tighter px-1">
                                            Leave blank to auto-generate invitation link.
                                        </p>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-neutral-400 tracking-widest flex items-center gap-2 px-1">
                                            <RefreshCcw className="h-3.5 w-3.5" />
                                            {activeTab === 'therapists' ? 'Clinical Specialization' : 'Relationship Status'}
                                        </label>
                                        <div className="relative">
                                            {activeTab === 'therapists' ? (
                                                <select
                                                    name="specialization"
                                                    value={formData.specialization}
                                                    onChange={handleInputChange}
                                                    className="w-full px-5 py-4 bg-neutral-100/50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all outline-none appearance-none font-black text-sm tracking-tight cursor-pointer"
                                                >
                                                    <option>Speech Therapy</option>
                                                    <option>Occupational Therapy</option>
                                                    <option>Physical Therapy</option>
                                                    <option>Behavioral Therapy</option>
                                                    <option>+ Add Custom</option>
                                                </select>
                                            ) : (
                                                <select
                                                    name="relationship"
                                                    value={formData.relationship}
                                                    onChange={handleInputChange}
                                                    className="w-full px-5 py-4 bg-neutral-100/50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all outline-none appearance-none font-black text-sm tracking-tight cursor-pointer"
                                                >
                                                    <option>Mother</option>
                                                    <option>Father</option>
                                                    <option>Guardian</option>
                                                </select>
                                            )}
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    {activeTab === 'therapists' && (
                                        <>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-neutral-400 tracking-widest flex items-center gap-2 px-1">
                                                    <Phone className="h-3.5 w-3.5" />
                                                    Phone Number
                                                </label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full px-5 py-4 bg-neutral-100/50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all outline-none font-black text-sm tracking-tight"
                                                    placeholder="+91 XXXXX XXXXX"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-neutral-400 tracking-widest flex items-center gap-2 px-1">
                                                    <Upload className="h-3.5 w-3.5" />
                                                    Profile Photo
                                                </label>
                                                <div className="flex items-center gap-4">
                                                    {formData.profile_photo && (
                                                        <div className="h-14 w-14 rounded-2xl border-2 border-primary-100 overflow-hidden bg-neutral-100 flex-shrink-0 shadow-sm">
                                                            <img src={formData.profile_photo} alt="Preview" className="w-full h-full object-cover" />
                                                        </div>
                                                    )}
                                                    <label className="flex-1 flex items-center justify-center gap-3 px-5 py-4 bg-neutral-100/50 border-2 border-neutral-200 border-dashed rounded-2xl hover:bg-white hover:border-primary-400 hover:shadow-md transition-all cursor-pointer group">
                                                        <Upload className="h-4 w-4 text-neutral-400 group-hover:text-primary-600" />
                                                        <span className="text-[10px] font-black text-neutral-600 group-hover:text-primary-700 uppercase tracking-widest">
                                                            Choose Image
                                                        </span>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => handleFileChange(e, false)}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Professional Details Section */}
                                            <div className="col-span-full mt-4 pt-6 border-t border-neutral-100">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-black text-neutral-400 tracking-widest flex items-center gap-2 px-1">
                                                            <Briefcase className="h-3.5 w-3.5" />
                                                            Qualification
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="qualification"
                                                            value={formData.qualification}
                                                            onChange={handleInputChange}
                                                            required
                                                            className="w-full px-5 py-4 bg-neutral-100/50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all outline-none font-black text-sm tracking-tight"
                                                            placeholder="e.g. BPT, MPT, Psychology"
                                                        />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-black text-neutral-400 tracking-widest flex items-center gap-2 px-1">
                                                            <Activity className="h-3.5 w-3.5" />
                                                            Experience (Years)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            name="experience_years"
                                                            value={formData.experience_years}
                                                            onChange={handleInputChange}
                                                            required
                                                            className="w-full px-5 py-4 bg-neutral-100/50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all outline-none font-black text-sm tracking-tight"
                                                            placeholder="Years of experience"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {activeTab === 'parents' && (
                                        <>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-neutral-400 tracking-widest flex items-center gap-2 px-1">
                                                    <Phone className="h-3.5 w-3.5" />
                                                    Mobile Number
                                                </label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full px-5 py-4 bg-neutral-100/50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all outline-none font-black text-sm tracking-tight"
                                                    placeholder="+91 XXXXX XXXXX"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-neutral-400 tracking-widest flex items-center gap-2 px-1">
                                                    <MapPin className="h-3.5 w-3.5" />
                                                    Residential Address
                                                </label>
                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full px-5 py-4 bg-neutral-100/50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all outline-none font-black text-sm tracking-tight"
                                                    placeholder="Street, City, Zip Code"
                                                />
                                            </div>

                                        </>
                                    )}
                                    {formData.specialization === '+ Add Custom' && activeTab === 'therapists' && (
                                        <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <input
                                                type="text"
                                                name="customSpecialization"
                                                value={formData.customSpecialization}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-5 py-3 bg-white border-2 border-primary-100 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all outline-none font-black text-xs tracking-tight"
                                                placeholder="Enter Custom Specialization..."
                                            />
                                        </div>
                                    )}
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
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Filter/Search Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-white p-3 md:p-4 rounded-2xl shadow-sm border border-neutral-200">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <input
                        type="text"
                        placeholder={`Search ${activeTab}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all outline-none text-sm"
                    />
                </div>
                <Button variant="outline" className="h-[52px] px-6">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                </Button>
            </div>

            {/* List Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {isLoading && !isCreating ? (
                    Array(6).fill(0).map((_, i) => (
                        <Card key={i} className="animate-pulse rounded-[2rem] border-none shadow-sm h-[240px] bg-neutral-100" />
                    ))
                ) : activeTab === 'children' ? (
                    // Children List View
                    childrenList.length > 0 ? (
                        childrenList.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map((child) => (
                            <Card key={child.id} className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border-none shadow-sm ring-1 ring-neutral-200 relative overflow-hidden rounded-[2rem] bg-white">
                                <div className="absolute top-0 right-0 w-32 h-32 -mr-12 -mt-12 rounded-full opacity-[0.03] bg-emerald-500 group-hover:opacity-10 group-hover:scale-150 transition-all duration-700" />
                                <CardContent className="p-7">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="h-16 w-16 rounded-[1.5rem] flex items-center justify-center text-2xl font-black shadow-inner bg-emerald-50 text-emerald-600 border border-emerald-100">
                                            {child.name.charAt(0)}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {child.is_active ? (
                                                <span className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-emerald-100">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-[9px] font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-rose-100">
                                                    <XCircle className="h-3 w-3" />
                                                    Inactive
                                                </span>
                                            )}
                                            <div className="relative">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveMenu(activeMenu === child.id ? null : child.id);
                                                    }}
                                                    className="p-2 hover:bg-neutral-100 rounded-xl transition-all border border-transparent hover:border-neutral-200"
                                                >
                                                    <MoreVertical className="h-4 w-4 text-neutral-400" />
                                                </button>
                                                {activeMenu === child.id && (
                                                    <div className="absolute right-0 top-10 bg-white rounded-xl shadow-2xl border border-neutral-100 py-2 w-40 z-50 animate-in fade-in zoom-in-95 duration-300">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEditUser(child);
                                                            }}
                                                            className="w-full text-left px-4 py-2.5 text-[10px] font-black uppercase text-emerald-600 hover:bg-emerald-50 flex items-center gap-3 transition-colors border-b border-neutral-50"
                                                        >
                                                            <Edit className="h-3.5 w-3.5" />
                                                            Update Record
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleToggleUserStatus({ ...child, role: 'child' });
                                                                setActiveMenu(null);
                                                            }}
                                                            className={`w-full text-left px-4 py-2.5 text-[10px] font-black uppercase flex items-center gap-3 transition-colors border-b border-neutral-50 ${child.is_active ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                                                        >
                                                            {child.is_active ? (
                                                                <>
                                                                    <XCircle className="h-3.5 w-3.5" />
                                                                    Disable Record
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                                    Enable Record
                                                                </>
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={(e) => handleDeleteChild(e, child.id, child.name)}
                                                            className="w-full text-left px-4 py-2.5 text-[10px] font-black uppercase text-rose-600 hover:bg-rose-50 flex items-center gap-3 transition-colors"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                            REMOVE
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1 relative z-10">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-neutral-800 text-lg group-hover:text-emerald-600 transition-colors">{child.name}</h3>
                                            <span className="text-[9px] font-mono bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-md border border-neutral-200 uppercase tracking-wider">
                                                {child.id}
                                            </span>
                                        </div>
                                        <p className="text-sm text-neutral-500 flex items-center gap-2">
                                            <Activity className="h-3 w-3" />
                                            {child.condition}
                                        </p>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-neutral-100 space-y-2 relative z-10">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-neutral-400 font-bold uppercase tracking-wide">Age</span>
                                            <span className="font-semibold text-neutral-700">{child.age} Years</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-neutral-400 font-bold uppercase tracking-wide">Parent</span>
                                            <span className="font-semibold text-neutral-700">{parents.find(p => p.id === child.parent_id)?.name || 'Unknown'}</span>
                                        </div>
                                        {child.school_name && (
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-neutral-400 font-bold uppercase tracking-wide">School</span>
                                                <span className="font-semibold text-neutral-700">{child.school_name}</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <div className="h-20 w-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Baby className="h-10 w-10 text-neutral-300" />
                            </div>
                            <h3 className="text-lg font-bold text-neutral-800">No children records</h3>
                            <p className="text-neutral-500">Add a child to start tracking status.</p>
                            <Button variant="outline" className="mt-6" onClick={() => setIsCreating(true)}>+ Add New Child</Button>
                        </div>
                    )
                ) : (
                    // Regular User (Therapist/Parent) List View
                    filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                            <Card key={user.id} className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border-none shadow-sm ring-1 ring-neutral-200 relative overflow-hidden rounded-[2rem] bg-white">
                                <div className={`absolute top-0 right-0 w-32 h-32 -mr-12 -mt-12 rounded-full opacity-[0.03] group-hover:opacity-10 group-hover:scale-150 transition-all duration-700 ${activeTab === 'therapists' ? 'bg-primary-500' : 'bg-pink-500'}`} />

                                <CardContent className="p-7">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className={`h-16 w-16 rounded-[1.5rem] flex items-center justify-center text-2xl font-black shadow-inner overflow-hidden ${activeTab === 'therapists'
                                            ? 'bg-primary-50 text-primary-600 border border-primary-100'
                                            : 'bg-pink-50 text-pink-600 border border-pink-100'
                                            }`}>
                                            {activeTab === 'therapists' && user.profile_photo ? (
                                                <img src={user.profile_photo} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                user.name.charAt(0)
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {user.is_active ? (
                                                <span className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-emerald-100">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-[9px] font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-rose-100">
                                                    <XCircle className="h-3 w-3" />
                                                    Inactive
                                                </span>
                                            )}

                                            <div className="relative">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveMenu(activeMenu === user.id ? null : user.id);
                                                    }}
                                                    className="p-2 hover:bg-neutral-100 rounded-xl transition-all border border-transparent hover:border-neutral-200"
                                                >
                                                    <MoreVertical className="h-4 w-4 text-neutral-400" />
                                                </button>

                                                {activeMenu === user.id && (
                                                    <div className="absolute right-0 top-10 bg-white rounded-xl shadow-2xl border border-neutral-100 py-2 w-40 z-50 animate-in fade-in zoom-in-95 duration-300">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEditUser(user);
                                                            }}
                                                            className="w-full text-left px-4 py-2.5 text-[10px] font-black uppercase text-primary-600 hover:bg-primary-50 flex items-center gap-3 transition-colors border-b border-neutral-50"
                                                        >
                                                            <Edit className="h-3.5 w-3.5" />
                                                            Update Profile
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleOpenPasswordReset(user);
                                                            }}
                                                            className="w-full text-left px-4 py-2.5 text-[10px] font-black uppercase text-neutral-600 hover:bg-neutral-50 flex items-center gap-3 transition-colors border-b border-neutral-50"
                                                        >
                                                            <Key className="h-3.5 w-3.5" />
                                                            Reset Password
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleToggleUserStatus(user);
                                                                setActiveMenu(null);
                                                            }}
                                                            className={`w-full text-left px-4 py-2.5 text-[10px] font-black uppercase flex items-center gap-3 transition-colors border-b border-neutral-50 ${user.is_active ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                                                        >
                                                            {user.is_active ? (
                                                                <>
                                                                    <XCircle className="h-3.5 w-3.5" />
                                                                    Disable Account
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                                    Enable Account
                                                                </>
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={(e) => handleDeleteUser(e, user.id, user.name)}
                                                            className="w-full text-left px-4 py-2.5 text-[10px] font-black uppercase text-rose-600 hover:bg-rose-50 flex items-center gap-3 transition-colors"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                            Delete Account
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1 relative z-10">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-neutral-800 text-lg group-hover:text-primary-600 transition-colors">{user.name}</h3>
                                            {activeTab === 'therapists' && user.qualification && (
                                                <span className="text-[10px] font-black bg-primary-100 text-primary-700 px-2 py-0.5 rounded-lg border border-primary-200">
                                                    {user.qualification}
                                                </span>
                                            )}
                                            <span className="text-[9px] font-mono bg-neutral-100 text-neutral-400 px-2 py-0.5 rounded-md border border-neutral-200 uppercase tracking-wider">
                                                {user.id.length > 20 ? `ID: ${user.id.slice(0, 8)}...` : user.id}
                                            </span>
                                        </div>
                                        <p className="text-sm text-neutral-500 flex items-center gap-2">
                                            <Mail className="h-3 w-3" />
                                            {user.email}
                                        </p>
                                        {user.created_at && (
                                            <p className="text-[10px] text-neutral-400 font-medium">
                                                Created: {new Date(user.created_at).toLocaleDateString()} {new Date(user.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        )}
                                        {activeTab === 'parents' && (
                                            <div className="flex items-center gap-1.5 mt-1 pt-1 border-t border-neutral-50/50">
                                                <Clock className="h-2.5 w-2.5 text-primary-400" />
                                                <p className="text-[10px] font-black text-primary-600 uppercase tracking-tight">
                                                    Last Login: <span className="text-neutral-500 font-medium normal-case">
                                                        {user.last_login
                                                            ? `${new Date(user.last_login).toLocaleDateString()} ${new Date(user.last_login).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                                            : 'Never'
                                                        }
                                                    </span>
                                                </p>
                                            </div>
                                        )}
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
                    )
                )}
            </div>

            {/* Password Reset Modal */}
            {passwordResetModal && (
                <div className="fixed inset-0 bg-neutral-900/60 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-md animate-in fade-in duration-300">
                    <Card className="w-full max-w-md shadow-2xl bg-white border-0 rounded-t-[2.5rem] sm:rounded-[2rem] overflow-hidden animate-in slide-in-from-bottom duration-500">
                        <CardHeader className="bg-amber-50/50 border-b border-amber-100 p-6">
                            <CardTitle className="text-xl font-black flex items-center gap-3 text-amber-900 uppercase tracking-tight">
                                <Key className="h-5 w-5 text-amber-600" />
                                Reset Access
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                                <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest mb-1">Target Account</p>
                                <p className="text-sm font-bold text-amber-900">{passwordResetModal.user.name}</p>
                                <p className="text-[11px] text-amber-700">{passwordResetModal.user.email}</p>
                            </div>

                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">New Secure Password</label>
                                    <input
                                        type="password"
                                        value={resetPasswordData.newPassword}
                                        onChange={(e) => setResetPasswordData({ ...resetPasswordData, newPassword: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 bg-neutral-100 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-sm"
                                        placeholder="Min 8 characters"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Confirm Password</label>
                                    <input
                                        type="password"
                                        value={resetPasswordData.confirmPassword}
                                        onChange={(e) => setResetPasswordData({ ...resetPasswordData, confirmPassword: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 bg-neutral-100 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-sm"
                                        placeholder="Repeat password"
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <Button type="button" variant="ghost" className="flex-1" onClick={() => setPasswordResetModal(null)}>Cancel</Button>
                                    <Button type="submit" disabled={isLoading} className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-black text-[10px] uppercase tracking-widest h-11">
                                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Override Password'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Edit User Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-neutral-900/60 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-md animate-in fade-in duration-300">
                    <Card className="w-full max-w-2xl shadow-2xl bg-white border-0 rounded-t-[2.5rem] sm:rounded-[2rem] overflow-hidden animate-in slide-in-from-bottom duration-500 overflow-y-auto max-h-[90vh]">
                        <CardHeader className="bg-primary-50/50 border-b border-primary-100 p-6 sticky top-0 bg-white z-10">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl font-black flex items-center gap-3 text-primary-900 uppercase tracking-tight">
                                    <Edit className="h-5 w-5 text-primary-600" />
                                    Edit {activeTab.slice(0, -1)} Registry
                                </CardTitle>
                                <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-primary-100 rounded-full transition-colors">
                                    <XCircle className="h-5 w-5 text-neutral-400" />
                                </button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 md:p-8">
                            <form onSubmit={handleUpdateUser} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Common Fields */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Full Name</label>
                                        <input
                                            type="text"
                                            value={editingUser.name}
                                            onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                                            required
                                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-sm"
                                        />
                                    </div>

                                    {activeTab !== 'children' && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Email Registry</label>
                                            <input
                                                type="email"
                                                value={editingUser.email}
                                                onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                                required
                                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-sm"
                                            />
                                        </div>
                                    )}

                                    {/* Role Specific Fields */}
                                    {activeTab === 'therapists' && (
                                        <>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Specialization</label>
                                                <div className="relative">
                                                    <select
                                                        value={editingUser.specialization}
                                                        onChange={(e) => setEditingUser({ ...editingUser, specialization: e.target.value })}
                                                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl appearance-none font-bold text-sm outline-none cursor-pointer"
                                                    >
                                                        <option>Speech Therapy</option>
                                                        <option>Occupational Therapy</option>
                                                        <option>Physical Therapy</option>
                                                        <option>Behavioral Therapy</option>
                                                        <option>+ Add Custom</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                                                </div>
                                                {editingUser.specialization === '+ Add Custom' && (
                                                    <input
                                                        type="text"
                                                        value={editingUser.customSpecialization}
                                                        onChange={(e) => setEditingUser({ ...editingUser, customSpecialization: e.target.value })}
                                                        required
                                                        placeholder="Enter Specialization"
                                                        className="w-full mt-2 px-4 py-3 bg-white border border-primary-200 rounded-xl outline-none font-bold text-sm"
                                                    />
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Experience (Years)</label>
                                                <input
                                                    type="number"
                                                    value={editingUser.experience_years}
                                                    onChange={(e) => setEditingUser({ ...editingUser, experience_years: e.target.value })}
                                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none font-bold text-sm"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Professional Qualification</label>
                                                <input
                                                    type="text"
                                                    value={editingUser.qualification}
                                                    onChange={(e) => setEditingUser({ ...editingUser, qualification: e.target.value })}
                                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none font-bold text-sm"
                                                    placeholder="e.g. BPT, MPT, Psychology"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Profile Photo</label>
                                                <div className="flex items-center gap-4">
                                                    {editingUser.profile_photo && (
                                                        <div className="h-12 w-12 rounded-xl border border-neutral-200 overflow-hidden bg-neutral-100 flex-shrink-0">
                                                            <img src={editingUser.profile_photo} alt="Preview" className="w-full h-full object-cover" />
                                                        </div>
                                                    )}
                                                    <label className="flex-1 flex items-center justify-center gap-2 h-[46px] bg-neutral-50 border border-neutral-200 border-dashed rounded-xl hover:bg-neutral-100 hover:border-primary-300 transition-all cursor-pointer group">
                                                        <Upload className="h-4 w-4 text-neutral-400 group-hover:text-primary-500" />
                                                        <span className="text-xs font-bold text-neutral-600 group-hover:text-primary-600 uppercase tracking-tight">
                                                            Choose Image
                                                        </span>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => handleFileChange(e, true)}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Contact Phone</label>
                                                <input
                                                    type="tel"
                                                    value={editingUser.phone}
                                                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none font-bold text-sm"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">License Registry</label>
                                                <input
                                                    type="text"
                                                    value={editingUser.license_number}
                                                    onChange={(e) => setEditingUser({ ...editingUser, license_number: e.target.value })}
                                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none font-bold text-sm"
                                                />
                                            </div>
                                        </>
                                    )}

                                    {activeTab === 'parents' && (
                                        <>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Relationship</label>
                                                <div className="relative">
                                                    <select
                                                        value={editingUser.relationship}
                                                        onChange={(e) => setEditingUser({ ...editingUser, relationship: e.target.value })}
                                                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl appearance-none font-bold text-sm outline-none cursor-pointer"
                                                    >
                                                        <option>Mother</option>
                                                        <option>Father</option>
                                                        <option>Guardian</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Contact Phone</label>
                                                <input
                                                    type="tel"
                                                    value={editingUser.phone}
                                                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none font-bold text-sm"
                                                />
                                            </div>
                                            <div className="col-span-full space-y-2">
                                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Residential Address</label>
                                                <textarea
                                                    value={editingUser.address}
                                                    onChange={(e) => setEditingUser({ ...editingUser, address: e.target.value })}
                                                    rows={3}
                                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none font-bold text-sm"
                                                />
                                            </div>
                                        </>
                                    )}

                                    {activeTab === 'children' && (
                                        <>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Child Age</label>
                                                <input
                                                    type="number"
                                                    value={editingUser.age}
                                                    onChange={(e) => setEditingUser({ ...editingUser, age: e.target.value })}
                                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none font-bold text-sm"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Gender Identity</label>
                                                <div className="relative">
                                                    <select
                                                        value={editingUser.gender}
                                                        onChange={(e) => setEditingUser({ ...editingUser, gender: e.target.value })}
                                                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl appearance-none font-bold text-sm outline-none cursor-pointer"
                                                    >
                                                        <option>Male</option>
                                                        <option>Female</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Medical Condition</label>
                                                <div className="relative">
                                                    <select
                                                        value={editingUser.condition}
                                                        onChange={(e) => setEditingUser({ ...editingUser, condition: e.target.value })}
                                                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl appearance-none font-bold text-sm outline-none cursor-pointer"
                                                    >
                                                        <option>Autism</option>
                                                        <option>ADHD</option>
                                                        <option>Speech Delay</option>
                                                        <option>Developmental Delay</option>
                                                        <option>+ Add Custom</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                                                </div>
                                                {editingUser.condition === '+ Add Custom' && (
                                                    <input
                                                        type="text"
                                                        value={editingUser.customCondition}
                                                        onChange={(e) => setEditingUser({ ...editingUser, customCondition: e.target.value })}
                                                        required
                                                        placeholder="Specify Condition"
                                                        className="w-full mt-2 px-4 py-3 bg-white border border-primary-200 rounded-xl outline-none font-bold text-sm"
                                                    />
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">School Affiliation</label>
                                                <input
                                                    type="text"
                                                    value={editingUser.school_name}
                                                    onChange={(e) => setEditingUser({ ...editingUser, school_name: e.target.value })}
                                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none font-bold text-sm"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Therapy Start Date</label>
                                                <input
                                                    type="date"
                                                    value={editingUser.therapy_start_date}
                                                    onChange={(e) => setEditingUser({ ...editingUser, therapy_start_date: e.target.value })}
                                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-sm cursor-pointer"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Therapy Type</label>
                                                <div className="relative">
                                                    <select
                                                        value={editingUser.therapy_type}
                                                        onChange={(e) => setEditingUser({ ...editingUser, therapy_type: e.target.value })}
                                                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl appearance-none font-bold text-sm outline-none cursor-pointer"
                                                    >
                                                        <option>Speech Therapy</option>
                                                        <option>Occupational Therapy</option>
                                                        <option>Behavioral Therapy (ABA)</option>
                                                        <option>Physical Therapy</option>
                                                        <option>Social Skills</option>
                                                        <option>Sensory Integration</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="flex justify-end gap-3 pt-6 border-t border-neutral-100 sticky bottom-0 bg-white">
                                    <Button type="button" variant="ghost" className="px-8" onClick={() => setEditingUser(null)}>Dismiss</Button>
                                    <Button type="submit" disabled={isLoading} className="bg-primary-600 hover:bg-primary-700 text-white font-black text-[10px] uppercase tracking-widest px-10 h-12 shadow-xl shadow-primary-50">
                                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Commit Changes'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div >
    );
};

export default UserManagement;
