import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Scan, Package, Save, Camera, Keyboard, Search, RefreshCw, ToggleLeft, ToggleRight, Plus, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { supabase } from '../../../supabaseClient';

export default function BulkRestockModal({
    products = [],
    onClose,
    onSubmit,
    isSubmitting,
}) {
    const [items, setItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showProductSearch, setShowProductSearch] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [scannerMode, setScannerMode] = useState('camera');
    const [continuousScan, setContinuousScan] = useState(true);
    const [isScanning, setIsScanning] = useState(false);
    const [manualInput, setManualInput] = useState('');
    const [selectedUniqueIndex, setSelectedUniqueIndex] = useState(null);
    const [idInput, setIdInput] = useState('');
    const scannerRef = useRef(null);
    const inputRef = useRef(null);
    const lastScanRef = useRef('');

    const storeId = localStorage.getItem('store_id');

    // Get unique items
    const uniqueItems = useMemo(() =>
        items.filter(item => item.isUnique),
        [items]
    );

    // Auto-select first unique item if only one exists
    useEffect(() => {
        if (uniqueItems.length === 1) {
            const index = items.findIndex(i => i.isUnique);
            setSelectedUniqueIndex(index);
        } else if (uniqueItems.length === 0) {
            setSelectedUniqueIndex(null);
        }
    }, [uniqueItems.length, items]);

    // Check if restock is allowed (all unique items must have IDs)
    const canRestock = useMemo(() => {
        if (items.length === 0) return false;
        const uniqueWithoutIds = items.filter(i => i.isUnique && (!i.deviceIds || i.deviceIds.length === 0));
        return uniqueWithoutIds.length === 0;
    }, [items]);

    // Filter products for the dropdown
    const filteredProducts = products.filter(p => {
        const name = p.dynamic_product?.name || '';
        const search = searchTerm || '';
        return name.toLowerCase().includes(search.toLowerCase()) &&
            !items.some(item => item.productId === p.dynamic_product_id)
    });

    const handleAddItem = useCallback((inventoryItem) => {
        const product = inventoryItem.dynamic_product;
        const newItem = {
            productId: product.id,
            name: product.name,
            quantity: product.is_unique ? 0 : 1,
            reason: 'Restock',
            isUnique: product.is_unique,
            currentStock: inventoryItem.available_qty || 0,
            deviceIds: [],
            existingImeis: product.dynamic_product_imeis || ''
        };

        setItems(prev => {
            const newList = [...prev, newItem];
            if (product.is_unique) {
                setSelectedUniqueIndex(newList.length - 1);
            }
            return newList;
        });

        setSearchTerm('');
        setShowProductSearch(false);
    }, []);

    const handleRemoveItem = (index) => {
        setItems(prev => prev.filter((_, i) => i !== index));
        if (selectedUniqueIndex === index) {
            setSelectedUniqueIndex(null);
        } else if (selectedUniqueIndex !== null && selectedUniqueIndex > index) {
            setSelectedUniqueIndex(prev => prev - 1);
        }
    };

    const handleUpdateItem = (index, field, value) => {
        setItems(prev => prev.map((item, i) => {
            if (i !== index) return item;
            return { ...item, [field]: value };
        }));
    };

    // Check for duplicate ID in database
    const checkDuplicateId = useCallback(async (id) => {
        if (!storeId || !id) return false;

        try {
            const { data, error } = await supabase
                .from('dynamic_product')
                .select('id, name, dynamic_product_imeis')
                .eq('store_id', storeId)
                .ilike('dynamic_product_imeis', `%${id}%`);

            if (error) throw error;
            return data && data.length > 0 ? data[0] : null;
        } catch (err) {
            console.error('Error checking duplicate ID:', err);
            return null;
        }
    }, [storeId]);

    // Add ID to selected unique item
    const addIdToSelectedItem = useCallback(async (id) => {
        if (!id || selectedUniqueIndex === null) {
            toast.error('Please select a unique item first');
            return;
        }

        const trimmedId = id.trim().toUpperCase();
        if (!trimmedId) return;

        const selectedItem = items[selectedUniqueIndex];
        if (!selectedItem?.isUnique) {
            toast.error('Selected item is not a unique product');
            return;
        }

        // Check if already in current list
        if (selectedItem.deviceIds?.includes(trimmedId)) {
            toast('ID already added to this item', { icon: '⚠️' });
            return;
        }

        // Check across all items in form
        const allIds = items.flatMap(i => i.deviceIds || []);
        if (allIds.includes(trimmedId)) {
            toast.error('This ID is already added to another item');
            return;
        }

        // Check database for duplicates
        const existingProduct = await checkDuplicateId(trimmedId);
        if (existingProduct) {
            toast.error(`ID already exists in "${existingProduct.name}"`);
            return;
        }

        // Add the ID
        setItems(prev => prev.map((item, i) => {
            if (i !== selectedUniqueIndex) return item;
            const newIds = [...(item.deviceIds || []), trimmedId];
            return {
                ...item,
                deviceIds: newIds,
                quantity: newIds.length
            };
        }));

        toast.success(`ID added to ${selectedItem.name}`);
        setIdInput('');
        setManualInput('');
    }, [selectedUniqueIndex, items, checkDuplicateId]);

    // Remove ID from item
    const removeIdFromItem = (itemIndex, idToRemove) => {
        setItems(prev => prev.map((item, i) => {
            if (i !== itemIndex) return item;
            const newIds = (item.deviceIds || []).filter(id => id !== idToRemove);
            return {
                ...item,
                deviceIds: newIds,
                quantity: newIds.length
            };
        }));
    };

    const handleSubmit = () => {
        if (items.length === 0) {
            toast.error('Please add at least one product');
            return;
        }

        // Validate unique items have IDs
        const uniqueWithoutIds = items.filter(i => i.isUnique && (!i.deviceIds || i.deviceIds.length === 0));
        if (uniqueWithoutIds.length > 0) {
            toast.error(`${uniqueWithoutIds[0].name} requires at least one ID`);
            return;
        }

        // Validate non-unique items have quantity
        const invalidItems = items.filter(i => !i.isUnique && i.quantity <= 0);
        if (invalidItems.length > 0) {
            toast.error('All items must have a quantity greater than 0');
            return;
        }

        onSubmit(items);
    };

    // Scanner functions
    const stopScanner = async () => {
        try {
            if (scannerRef.current) {
                await scannerRef.current.stop();
                await scannerRef.current.clear();
            }
        } catch (_) { }
        scannerRef.current = null;
        setIsScanning(false);
    };

    // Process scanned code - add as ID to selected unique item
    const processScannedCode = useCallback(async (code) => {
        if (!code) return;

        const trimmedCode = code.trim();

        // Prevent duplicate scans
        if (trimmedCode === lastScanRef.current) return;
        lastScanRef.current = trimmedCode;
        setTimeout(() => { lastScanRef.current = ''; }, 2000);

        // If we have a selected unique item, add ID to it
        if (selectedUniqueIndex !== null && items[selectedUniqueIndex]?.isUnique) {
            await addIdToSelectedItem(trimmedCode);
        } else if (uniqueItems.length > 0) {
            // Has unique items but none selected
            toast.error('Select a unique item to add IDs to');
        } else {
            // No unique items - try to find and add product
            const foundProduct = products.find(p => {
                const product = p.dynamic_product;
                return product?.device_id?.toLowerCase() === trimmedCode.toLowerCase();
            });

            if (foundProduct) {
                if (items.some(item => item.productId === foundProduct.dynamic_product_id)) {
                    toast('Product already in list', { icon: '⚠️' });
                    return;
                }
                handleAddItem(foundProduct);
                toast.success(`Added: ${foundProduct.dynamic_product?.name}`);
            } else {
                toast.error('Product not found');
            }
        }
    }, [selectedUniqueIndex, items, uniqueItems.length, products, handleAddItem, addIdToSelectedItem]);

    const handleManualSubmit = () => {
        if (!manualInput.trim()) {
            toast.error('Please enter a code');
            return;
        }
        processScannedCode(manualInput.trim());
        setManualInput('');
    };

    const handleIdInput = () => {
        if (!idInput.trim()) {
            toast.error('Please enter an ID');
            return;
        }
        addIdToSelectedItem(idInput.trim());
    };

    // Camera scanning
    useEffect(() => {
        if (!showScanner || scannerMode !== 'camera') {
            stopScanner();
            return;
        }

        if (scannerRef.current) return;

        const startScanning = async () => {
            try {
                const scanner = new Html5Qrcode("bulk-scanner-container");
                scannerRef.current = scanner;

                const cameras = await Html5Qrcode.getCameras();
                let cameraId = null;

                const backCamera = cameras.find(cam =>
                    cam.label.toLowerCase().includes('back') ||
                    cam.label.toLowerCase().includes('rear') ||
                    cam.label.toLowerCase().includes('environment')
                );

                if (backCamera) {
                    cameraId = backCamera.id;
                } else if (cameras.length > 0) {
                    cameraId = cameras[0].id;
                }

                const config = {
                    fps: 20,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                    formatsToSupport: [
                        Html5QrcodeSupportedFormats.QR_CODE,
                        Html5QrcodeSupportedFormats.CODE_128,
                        Html5QrcodeSupportedFormats.CODE_39,
                        Html5QrcodeSupportedFormats.EAN_13,
                        Html5QrcodeSupportedFormats.EAN_8,
                        Html5QrcodeSupportedFormats.UPC_A,
                    ],
                };

                await scanner.start(
                    cameraId || { facingMode: "environment" },
                    config,
                    (decodedText) => {
                        processScannedCode(decodedText.trim());
                    },
                    () => { }
                );

                setIsScanning(true);
            } catch (err) {
                console.error('Scanner error:', err);
                toast.error('Camera access denied or error starting scanner');
                setIsScanning(false);
            }
        };

        startScanning();

        return () => {
            stopScanner();
        };
    }, [showScanner, scannerMode, processScannedCode]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopScanner();
        };
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`bg-white dark:bg-slate-900 rounded-2xl w-full shadow-2xl overflow-hidden flex flex-col ${showScanner ? 'max-w-5xl max-h-[95vh]' : 'max-w-3xl max-h-[90vh]'
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 flex-shrink-0">
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Package className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                            Bulk Restock
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500">Add multiple items to inventory at once</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className={`flex-1 overflow-hidden flex ${showScanner ? 'flex-col lg:flex-row' : 'flex-col'}`}>
                    {/* Main Form Section */}
                    <div className={`flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 ${showScanner ? 'lg:w-1/2 lg:border-r lg:border-slate-200 lg:dark:border-slate-700' : ''}`}>

                        {/* Add Product Section */}
                        <div className="relative">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        placeholder="Search to add product..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setShowProductSearch(true);
                                        }}
                                        onFocus={() => setShowProductSearch(true)}
                                        className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
                                    />
                                    {showProductSearch && searchTerm && (
                                        <div className="absolute top-full left-0 right-0 mt-2 max-h-48 overflow-y-auto bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50">
                                            {filteredProducts.length === 0 ? (
                                                <div className="p-4 text-center text-slate-500 text-sm">No products found</div>
                                            ) : (
                                                filteredProducts.map(item => (
                                                    <button
                                                        key={item.id}
                                                        onClick={() => handleAddItem(item)}
                                                        className="w-full px-4 py-2.5 text-left hover:bg-indigo-50 dark:hover:bg-slate-700 flex items-center justify-between text-sm"
                                                    >
                                                        <span className="font-medium text-slate-900 dark:text-gray-200 truncate">
                                                            {item.dynamic_product?.name}
                                                            {item.dynamic_product?.is_unique && (
                                                                <span className="ml-2 px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-[10px] font-bold rounded">UNIQUE</span>
                                                            )}
                                                        </span>
                                                        <span className="text-xs text-slate-500 flex-shrink-0 ml-2">
                                                            Stock: {item.available_qty || 0}
                                                        </span>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => setShowScanner(!showScanner)}
                                    className={`px-3 py-2 rounded-xl flex items-center gap-2 transition-colors font-medium text-sm ${showScanner ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                        }`}
                                >
                                    <Scan className="w-4 h-4" />
                                    <span className="hidden sm:inline">{showScanner ? 'Close' : 'Scan'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Items List */}
                        <div className="space-y-3">
                            <AnimatePresence mode="popLayout">
                                {items.length === 0 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl"
                                    >
                                        <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                        <p className="text-slate-500 font-medium text-sm">No items added yet</p>
                                        <p className="text-xs text-slate-400 mt-1">Search or scan products</p>
                                    </motion.div>
                                )}

                                {items.map((item, index) => (
                                    <motion.div
                                        key={`${item.productId}-${index}`}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className={`bg-white dark:bg-slate-800 border rounded-xl p-3 shadow-sm ${item.isUnique && selectedUniqueIndex === index
                                            ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                                            : 'border-slate-200 dark:border-slate-700'
                                            }`}
                                    >
                                        {/* Item Header */}
                                        <div className="flex items-start gap-3">
                                            {/* Radio for unique items */}
                                            {item.isUnique && uniqueItems.length > 1 && (
                                                <button
                                                    onClick={() => setSelectedUniqueIndex(index)}
                                                    className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedUniqueIndex === index
                                                        ? 'border-indigo-600 bg-indigo-600'
                                                        : 'border-slate-300 dark:border-slate-600'
                                                        }`}
                                                >
                                                    {selectedUniqueIndex === index && (
                                                        <div className="w-2 h-2 bg-white rounded-full" />
                                                    )}
                                                </button>
                                            )}

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-semibold text-slate-900 dark:text-white text-sm truncate">{item.name}</span>
                                                    {item.isUnique && (
                                                        <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-[10px] font-bold uppercase rounded-full">
                                                            Unique
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-slate-500 mt-0.5">
                                                    Current Stock: {item.currentStock}
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleRemoveItem(index)}
                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Unique Item - ID Entry */}
                                        {item.isUnique && (
                                            <div className="mt-3 space-y-2">
                                                {/* ID Chips */}
                                                <div className="flex flex-wrap gap-1.5">
                                                    {(item.deviceIds || []).map((id, idIdx) => (
                                                        <span
                                                            key={idIdx}
                                                            className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs rounded-lg"
                                                        >
                                                            {id}
                                                            <button
                                                                onClick={() => removeIdFromItem(index, id)}
                                                                className="hover:text-red-500"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </span>
                                                    ))}

                                                    {/* Inline ID Input */}
                                                    {selectedUniqueIndex === index && (
                                                        <div className="flex gap-1">
                                                            <input
                                                                type="text"
                                                                value={idInput}
                                                                onChange={(e) => setIdInput(e.target.value)}
                                                                onKeyDown={(e) => e.key === 'Enter' && handleIdInput()}
                                                                placeholder="Enter ID..."
                                                                className="w-28 px-2 py-1 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 focus:ring-1 focus:ring-indigo-500"
                                                            />
                                                            <button
                                                                onClick={handleIdInput}
                                                                className="px-2 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                                            >
                                                                <Plus className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Warning if no IDs */}
                                                {(!item.deviceIds || item.deviceIds.length === 0) && (
                                                    <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs">
                                                        <AlertCircle className="w-3.5 h-3.5" />
                                                        At least 1 ID required
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                                    <span>Qty: <span className="font-semibold text-slate-700 dark:text-slate-300">{item.deviceIds?.length || 0}</span> (auto)</span>
                                                    <select
                                                        value={item.reason}
                                                        onChange={(e) => handleUpdateItem(index, 'reason', e.target.value)}
                                                        className="px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                                                    >
                                                        <option>Restock</option>
                                                        <option>Return</option>
                                                        <option>Correction</option>
                                                    </select>
                                                </div>
                                            </div>
                                        )}

                                        {/* Non-Unique Item - Quantity */}
                                        {!item.isUnique && (
                                            <div className="mt-3 flex items-center gap-3">
                                                <div className="flex items-center gap-2">
                                                    <label className="text-xs text-slate-500">Qty:</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => handleUpdateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                                        className="w-16 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-center"
                                                    />
                                                </div>
                                                <select
                                                    value={item.reason}
                                                    onChange={(e) => handleUpdateItem(index, 'reason', e.target.value)}
                                                    className="px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                                                >
                                                    <option>Restock</option>
                                                    <option>Return</option>
                                                    <option>Correction</option>
                                                </select>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Scanner Panel */}
                    {showScanner && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="lg:w-1/2 bg-slate-50 dark:bg-slate-800/50 overflow-y-auto flex flex-col min-h-[300px] max-h-[50vh] lg:max-h-none"
                        >
                            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Scan className="w-5 h-5 text-indigo-600" />
                                        Scanner
                                    </h3>
                                    <button onClick={() => setShowScanner(false)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Selected item indicator */}
                                {selectedUniqueIndex !== null && items[selectedUniqueIndex] && (
                                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl border border-indigo-200 dark:border-indigo-800">
                                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Scanning IDs for:</p>
                                        <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">{items[selectedUniqueIndex].name}</p>
                                    </div>
                                )}

                                {/* Continuous toggle */}
                                <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center gap-2">
                                        <RefreshCw className="w-4 h-4 text-slate-500" />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Continuous</span>
                                    </div>
                                    <button onClick={() => setContinuousScan(!continuousScan)}>
                                        {continuousScan ? <ToggleRight className="w-8 h-8 text-indigo-600" /> : <ToggleLeft className="w-8 h-8 text-slate-400" />}
                                    </button>
                                </div>

                                {/* Mode buttons */}
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        onClick={() => setScannerMode('camera')}
                                        className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl border-2 text-xs font-medium ${scannerMode === 'camera' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700' : 'border-slate-200 dark:border-slate-700 text-slate-600'}`}
                                    >
                                        <Camera className="w-4 h-4" />
                                        Camera
                                    </button>
                                    <button
                                        onClick={() => setScannerMode('external')}
                                        className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl border-2 text-xs font-medium ${scannerMode === 'external' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700' : 'border-slate-200 dark:border-slate-700 text-slate-600'}`}
                                    >
                                        <Keyboard className="w-4 h-4" />
                                        External
                                    </button>
                                    <button
                                        onClick={() => setScannerMode('manual')}
                                        className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl border-2 text-xs font-medium ${scannerMode === 'manual' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700' : 'border-slate-200 dark:border-slate-700 text-slate-600'}`}
                                    >
                                        <Search className="w-4 h-4" />
                                        Manual
                                    </button>
                                </div>

                                {/* Camera view */}
                                {scannerMode === 'camera' && (
                                    <div className="relative w-full aspect-square max-h-52 bg-black rounded-xl overflow-hidden">
                                        <div id="bulk-scanner-container" className="w-full h-full" />
                                        {isScanning && (
                                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-full">
                                                Scanning...
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* External mode */}
                                {scannerMode === 'external' && (
                                    <div className="text-center py-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                                        <Keyboard className="w-10 h-10 mx-auto text-indigo-600 mb-2" />
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">External Scanner Ready</p>
                                    </div>
                                )}

                                {/* Manual entry */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium uppercase text-slate-500">Enter ID</label>
                                    <div className="flex gap-2">
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={manualInput}
                                            onChange={e => setManualInput(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleManualSubmit()}
                                            placeholder="Enter barcode or IMEI"
                                            className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-sm"
                                        />
                                        <button onClick={handleManualSubmit} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm">
                                            Add
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col sm:flex-row justify-between items-center gap-3 flex-shrink-0">
                    <div className="text-sm text-slate-500">
                        <span className="font-bold text-slate-900 dark:text-white mr-1">{items.length}</span>
                        items selected
                        {!canRestock && items.some(i => i.isUnique) && (
                            <span className="ml-2 text-amber-600 text-xs">(Unique items need IDs)</span>
                        )}
                    </div>

                    <div className="flex gap-3 w-full sm:w-auto">
                        <button onClick={onClose} className="flex-1 sm:flex-none px-4 py-2.5 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-sm">
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !canRestock}
                            title={!canRestock ? 'All unique items require at least one ID' : ''}
                            className="flex-1 sm:flex-none px-6 py-2.5 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Restock All
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
