import React, { useState } from 'react';
import { X, User, Mail, Phone, MapPin, Camera, Save, Upload } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

const ProfileEditModal = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        avatar: user?.avatar || '',
        relationship: user?.relationship || ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState(user?.avatar || '');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
                setFormData(prev => ({ ...prev, avatar: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Failed to save profile:', error);
            alert('Failed to save profile. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
                <CardHeader className="border-b border-neutral-100 sticky top-0 bg-white z-10">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-bold">Edit Profile</CardTitle>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                        >
                            <X className="h-5 w-5 text-neutral-500" />
                        </button>
                    </div>
                </CardHeader>

                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Profile Picture */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-neutral-100 shadow-lg">
                                    {previewImage ? (
                                        <img
                                            src={previewImage}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                                            <User className="h-16 w-16 text-white" />
                                        </div>
                                    )}
                                </div>
                                <label className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full shadow-lg cursor-pointer hover:bg-primary-700 transition-colors">
                                    <Camera className="h-5 w-5" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                            <p className="text-sm text-neutral-500">Click the camera icon to upload a new photo</p>
                        </div>

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                <User className="inline h-4 w-4 mr-2" />
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                <Mail className="inline h-4 w-4 mr-2" />
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-neutral-50"
                                placeholder="your@email.com"
                                disabled
                            />
                            <p className="text-xs text-neutral-500 mt-1">Email cannot be changed</p>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                <Phone className="inline h-4 w-4 mr-2" />
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                placeholder="+91 98765 43210"
                            />
                        </div>

                        {/* Address */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                <MapPin className="inline h-4 w-4 mr-2" />
                                Address
                            </label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                                placeholder="Enter your address"
                            />
                        </div>

                        {/* Relationship - only shown for parent users */}
                        {user?.role === 'parent' && (
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    <User className="inline h-4 w-4 mr-2" />
                                    Relationship to Child
                                </label>
                                <select
                                    name="relationship"
                                    value={formData.relationship}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                >
                                    <option value="">Select Relationship</option>
                                    <option value="Mother">Mother</option>
                                    <option value="Father">Father</option>
                                    <option value="Guardian">Guardian</option>
                                    <option value="Grandparent">Grandparent</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        )}

                        {/* Document Upload */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                <Upload className="inline h-4 w-4 mr-2" />
                                Upload Documents
                            </label>
                            <div className="relative">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-neutral-200 border-dashed rounded-xl cursor-pointer hover:bg-neutral-50 hover:border-primary-500 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="h-8 w-8 text-neutral-400 mb-2" />
                                        <p className="text-sm text-neutral-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                        <p className="text-xs text-neutral-400">PDF, JPG, PNG (MAX. 5MB)</p>
                                    </div>
                                    <input type="file" className="hidden" onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            // Handle file selection
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setFormData(prev => ({ ...prev, document: reader.result, documentName: file.name }));
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }} />
                                </label>
                                {formData.documentName && (
                                    <div className="mt-2 p-2 bg-green-50 text-green-700 rounded-lg text-sm flex items-center gap-2">
                                        <div className="h-2 w-2 bg-green-500 rounded-full" />
                                        Selected: {formData.documentName}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary-200 transition-all"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-5 w-5 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={isLoading}
                                className="px-6 py-3 rounded-xl font-bold"
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ProfileEditModal;
