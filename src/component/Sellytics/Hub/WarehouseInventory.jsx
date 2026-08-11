// WarehouseInventory.jsx - Now Fully Mobile Responsive
import React, { useState, useEffect } from "react";
import {
  Package,
  Loader2,
  ArrowUpDown,
  CheckCircle,
} from "lucide-react";
import { supabase } from "../../../supabaseClient";
import { useCurrency } from "../../context/currencyContext"

export default function WarehouseInventory({ warehouseId, clients }) {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery] = useState("");
  const [clientFilter] = useState("all");
  const [typeFilter] = useState("all");
  const [sortBy] = useState("name");
  const [sortOrder] = useState("asc");

  const { formatPrice } = useCurrency();

  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);

      let query = supabase
        .from("warehouse_inventory")
        .select(`
          *,
          total_cost,
          warehouse_product_id (
            id,
            product_name,
            sku,
            product_type,
            warehouse_client_id,
            metadata
          )
        `)
        .eq("warehouse_id", warehouseId);

      const { data, error } = await query;

      if (!error) {
        const enriched = (data || []).map(item => {
          const client = clients.find(c => c.id === item.warehouse_product_id?.warehouse_client_id);
          return {
            ...item,
            product: item.warehouse_product_id,
            client
          };
        }).filter(item => item.product);

        setInventory(enriched);
      }
      setLoading(false);
    };

    fetchInventory();
  }, [warehouseId, clients]);

  // Filter and sort
  const filteredInventory = inventory
    .filter(item => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        item.product?.product_name?.toLowerCase().includes(searchLower) ||
        item.product?.sku?.toLowerCase().includes(searchLower);

      const matchesClient = clientFilter === "all" ||
        item.client?.id?.toString() === clientFilter;

      const matchesType = typeFilter === "all" ||
        item.product?.product_type === typeFilter;

      return matchesSearch && matchesClient && matchesType;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = (a.product?.product_name || "").localeCompare(b.product?.product_name || "");
          break;
        case "quantity":
          comparison = (a.quantity || 0) - (b.quantity || 0);
          break;
        case "available":
          comparison = (a.available_qty || 0) - (b.available_qty || 0);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  // Totals for stats cards
  const totalProducts = filteredInventory.length;
  const totalStock = filteredInventory.reduce((sum, i) => sum + (i.quantity || 0), 0);
  const totalAvailable = filteredInventory.reduce((sum, i) => sum + (i.available_qty || 0), 0);
  const totalDamaged = filteredInventory.reduce((sum, i) => sum + (i.damaged_qty || 0), 0);

  return (
    <div className="space-y-2 sm:space-y-3">
      {/* Ultra-Compact Stats Section */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">

        {/* Total Products */}
        <div className="rounded-lg bg-indigo-900 text-white p-2 sm:p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <Package className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-600" />
            </div>
            <p className="text-[9px] sm:text-[10px] font-medium text-indigo-100 leading-tight">Products</p>
          </div>
          <p className="text-lg sm:text-xl font-bold text-white leading-none">{totalProducts}</p>
        </div>

        {/* Total Stock */}
        <div className="rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-2 sm:p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <ArrowUpDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
            </div>
            <p className="text-[9px] sm:text-[10px] font-medium text-emerald-100 leading-tight">Stock</p>
          </div>
          <p className="text-lg sm:text-xl font-bold text-white leading-none">{totalStock.toLocaleString()}</p>
        </div>

        {/* Available */}
        <div className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white p-2 sm:p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded bg-blue-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600" />
            </div>
            <p className="text-[9px] sm:text-[10px] font-medium text-blue-100 leading-tight">Available</p>
          </div>
          <p className="text-lg sm:text-xl font-bold text-white leading-none">{totalAvailable.toLocaleString()}</p>
        </div>

        {/* Damaged */}
        <div className="rounded-lg bg-gradient-to-br from-rose-500 to-rose-600 text-white p-2 sm:p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded bg-rose-100 flex items-center justify-center flex-shrink-0">
              <Package className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-600" />
            </div>
            <p className="text-[9px] sm:text-[10px] font-medium text-rose-100 leading-tight">Damaged</p>
          </div>
          <p className="text-lg sm:text-xl font-bold text-white leading-none">{totalDamaged.toLocaleString()}</p>
        </div>
      </div>

      {/* Ultra-Compact Inventory Cards */}
      <div className="space-y-1.5 sm:space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-8 sm:py-10">
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
          </div>
        ) : filteredInventory.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <Package className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h3 className="font-medium text-xs sm:text-sm text-slate-600 dark:text-slate-400">No inventory found</h3>
            <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              {searchQuery ? "Adjust search" : "Add products"}
            </p>
          </div>
        ) : (
          filteredInventory.map((item) => (
            <div
              key={item.id}
              className="p-2 sm:p-2.5 bg-white dark:bg-surface-800 rounded-lg border border-slate-200 dark:border-slate-700/60 hover:shadow-md transition-shadow"
            >
              {/* Top Row: Icon + Product + Tags */}
              <div className="flex items-start gap-1.5 sm:gap-2">
                {/* Icon */}
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center flex-shrink-0">
                  <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 dark:text-indigo-400" />
                </div>

                {/* Product Info + Tags */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate leading-tight">
                        {item.product?.product_name}
                      </h3>
                      {item.product?.sku && (
                        <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                          {item.product.sku}
                        </p>
                      )}
                    </div>

                    {/* Tags - Right aligned on same line */}
                    <div className="flex flex-wrap gap-0.5 sm:gap-1 justify-end flex-shrink-0 max-w-[40%]">
                      <span className="px-1 py-0.5 rounded text-[8px] sm:text-[9px] font-medium bg-slate-100 dark:bg-surface-700 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {item.product?.product_type || "-"}
                      </span>
                      <span className="px-1 py-0.5 rounded text-[8px] sm:text-[9px] font-medium bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 whitespace-nowrap">
                        {item.client?.client_name || "Unknown"}
                      </span>
                      {item.product?.is_unique && (
                        <span className="px-1 py-0.5 rounded text-[8px] sm:text-[9px] font-bold uppercase bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                          UNQ
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Compact Quantities - Single Row */}
              <div className="mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-700/60">
                <div className="flex items-center justify-between text-[10px] sm:text-xs">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Tot:</span>
                      <span className="font-semibold text-slate-900 dark:text-white ml-0.5">{item.quantity || 0}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Avl:</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 ml-0.5">{item.available_qty || 0}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Dmg:</span>
                      <span className="font-semibold text-rose-600 dark:text-rose-400 ml-0.5">{item.damaged_qty || 0}</span>
                    </div>
                  </div>

                  {/* Value + Meta on same line */}
                  <div className="flex items-center gap-2 text-[9px] sm:text-[10px]">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {item.total_cost > 0 ? formatPrice(item.total_cost) : "-"}
                    </span>
                    {item.updated_by_email && (
                      <span className="text-slate-400 dark:text-slate-500 hidden sm:inline">
                        • {item.updated_by_email.split('@')[0]}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}