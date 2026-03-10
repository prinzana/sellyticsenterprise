import React, { useState } from 'react';
import { supabase } from '../../../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Store, MapPin, Phone, Mail, Lock, Eye, EyeOff, Briefcase, User, Save, Loader2, Info } from 'lucide-react';
import { toast } from 'react-toastify';

const AddStoreModal = ({ isOpen, onClose, onStoreAdded, ownerId, ownerName }) => {
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        shop_name: '',
        physical_address: '',
        phone_number: '',
        email_address: '',
        password: '',
        nature_of_business: 'Retail',
    });

    // SHA-256 hash (matching existing pattern in useAttendants)
    const arrayBufferToHex = (buffer) =>
        Array.prototype.map
            .call(new Uint8Array(buffer), (x) => ('00' + x.toString(16)).slice(-2))
            .join('');

    const hashPassword = async (plainText) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(plainText);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        return arrayBufferToHex(hashBuffer);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.shop_name || !formData.physical_address) {
            toast.error('Please fill in required fields');
            return;
        }
        if (!formData.email_address) {
            toast.error('Email address is required for store login');
            return;
        }
        if (!formData.password || formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            const hashedPassword = await hashPassword(formData.password);

            const { data, error } = await supabase
                .from('stores')
                .insert([
                    {
                        shop_name: formData.shop_name,
                        full_name: ownerName, // Auto-assigned from the logged-in owner
                        email_address: formData.email_address,
                        password: hashedPassword,
                        physical_address: formData.physical_address,
                        business_address: formData.physical_address,
                        phone_number: formData.phone_number || null,
                        nature_of_business: formData.nature_of_business,
                        owner_user_id: ownerId, // Links to the same store_owners entry
                        is_active: true,
                    },
                ])
                .select();

            if (error) {
                // Handle duplicate email gracefully
                if (error.message?.includes('stores_email_key') || error.code === '23505') {
                    toast.error('This email is already registered to another store. Please use a unique email for each store.');
                    return;
                }
                throw error;
            }

            toast.success('New organization created successfully!');
            onStoreAdded(data[0]);
            onClose();
            // Reset form
            setFormData({
                shop_name: '',
                physical_address: '',
                phone_number: '',
                email_address: '',
                password: '',
                nature_of_business: 'Retail',
            });
        } catch (err) {
            console.error('Error adding store:', err);
            toast.error(err.message || 'Failed to add store');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-all font-medium";

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20 }}
                        onClick={e => e.stopPropagation()}
                        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                    <Store className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Add New Store</h2>
                                    <p className="text-xs text-slate-500 font-medium">Register a new business organization under your account</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Owner Info Banner */}
                            <div className="flex items-center gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                                <User className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-bold text-indigo-700 dark:text-indigo-300">Owner: {ownerName}</p>
                                    <p className="text-xs text-indigo-500 dark:text-indigo-400">This store will be linked to your account automatically</p>
                                </div>
                            </div>

                            {/* Store Name & Nature */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        Store Name <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            required
                                            value={formData.shop_name}
                                            onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })}
                                            className={inputClass}
                                            placeholder="e.g. TechZone Electronics"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        Nature of Business
                                    </label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <select
                                            value={formData.nature_of_business}
                                            onChange={(e) => setFormData({ ...formData, nature_of_business: e.target.value })}
                                            className={inputClass}
                                        >
                                            <option value="Retail">Retail</option>
                                            <option value="Wholesale">Wholesale</option>
                                            <option value="Service">Service</option>
                                            <option value="Restaurant">Restaurant</option>
                                            <option value="Electronics">Electronics</option>
                                            <option value="Fashion">Fashion & Clothing</option>
                                            <option value="Pharmacy">Pharmacy</option>
                                            <option value="Supermarket">Supermarket</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Physical Address <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                    <textarea
                                        rows={2}
                                        required
                                        value={formData.physical_address}
                                        onChange={(e) => setFormData({ ...formData, physical_address: e.target.value })}
                                        className={`${inputClass} resize-none`}
                                        placeholder="123 Business Way, Ikeja, Lagos"
                                    />
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Phone Number
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="tel"
                                        value={formData.phone_number}
                                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                        className={inputClass}
                                        placeholder="+234..."
                                    />
                                </div>
                            </div>

                            {/* Login Credentials Section */}
                            <div className="pt-2">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Login Credentials</span>
                                    <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                                </div>

                                <div className="flex items-start gap-2 p-3 mb-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-900/30">
                                    <Info className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-amber-700 dark:text-amber-300">
                                        Each store requires a <strong>unique email</strong> for independent login. This allows each store to access its own dashboard separately.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            Store Email <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="email"
                                                required
                                                value={formData.email_address}
                                                onChange={(e) => setFormData({ ...formData, email_address: e.target.value })}
                                                className={inputClass}
                                                placeholder="shop-b@email.com"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            Store Password <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                required
                                                minLength={6}
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className={`${inputClass} pr-12`}
                                                placeholder="Minimum 6 characters"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-bold text-slate-600 dark:text-slate-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-3 bg-indigo-900 hover:bg-indigo-800 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Create Store
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AddStoreModal;
