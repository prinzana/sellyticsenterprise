import React, { useState, useEffect, useCallback } from "react";
import {
    Truck,
    Clock,
    ChevronRight,
    Package,
    Loader2
} from "lucide-react";
import { supabase } from "../../../../../supabaseClient";
import toast from "react-hot-toast";
import RequestDetailsModal from "./RequestDetailsModal";
import { useSession } from "../../useSession";

export default function DispatchRequestsView({ warehouseId, clientId }) {
    const { userName, userEmail } = useSession();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState("PENDING");

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            let query = supabase
                .from("warehouse_dispatch_requests")
                .select(`
                    *,
                    client:client_id (client_name, business_name, email),
                    items:warehouse_dispatch_request_items (
                        id,
                        quantity,
                        product:product_id (product_name, sku, product_type)
                    )
                `)
                .eq("warehouse_id", warehouseId)
                .eq("status", filterStatus)
                .order("created_at", { ascending: false });

            if (clientId) {
                query = query.eq("client_id", clientId);
            }

            const { data, error } = await query;

            if (error) throw error;
            setRequests(data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load requests");
        } finally {
            setLoading(false);
        }
    }, [warehouseId, filterStatus, clientId]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const updateRequestStatus = async (requestId, newStatus) => {
        try {
            const operatorInfo = userName || userEmail || "Unknown Operator";

            const { error } = await supabase
                .from("warehouse_dispatch_requests")
                .update({
                    status: newStatus,
                    updated_at: new Date().toISOString(),
                    completed_at: newStatus === 'DISPATCHED' ? new Date().toISOString() : null,
                    resolved_by: (newStatus === 'APPROVED' || newStatus === 'REJECTED') ? operatorInfo : undefined
                })
                .eq("id", requestId);

            if (error) throw error;
            toast.success(`Request marked as ${newStatus.toLowerCase()}`);
            fetchRequests();
            setIsModalOpen(false);
            setSelectedRequest(null);
        } catch (error) {
            toast.error("Update failed");
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-14rem)] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="flex flex-col h-full">
                {/* List Side */}
                <div className="flex-1 flex flex-col">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                        <div className="flex gap-1 bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                            {["PENDING", "APPROVED", "DISPATCHED", "REJECTED"].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${filterStatus === status ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
                            </div>
                        ) : requests.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-400 dark:text-slate-500">
                                <Truck className="w-12 h-12 mb-3 opacity-20" />
                                <p className="font-medium uppercase text-xs tracking-widest font-bold">No {filterStatus.toLowerCase()} requests</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {requests.map((req) => (
                                    <button
                                        key={req.id}
                                        onClick={() => {
                                            setSelectedRequest(req);
                                            setIsModalOpen(true);
                                        }}
                                        className="w-full p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between group"
                                    >
                                        <div className="min-w-0 pr-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                                    {req.client?.business_name || req.client?.client_name}
                                                </span>
                                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">#{String(req.id).substring(0, 8)}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <Package className="w-3.5 h-3.5" />
                                                    {req.items?.length || 0} Products
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {new Date(req.created_at).toLocaleDateString()}
                                                </span>
                                                <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md text-[9px] font-bold uppercase">View Products</span>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <RequestDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                request={selectedRequest}
                onUpdateStatus={updateRequestStatus}
            />
        </div>
    );
}
