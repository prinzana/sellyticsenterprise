import React from 'react';
import {
  FaRegMoneyBillAlt,
  FaBoxes,
  FaChartLine,
  FaTasks,
  FaReceipt,
  FaUndo,
  FaBoxOpen,
  FaFileInvoiceDollar,
  FaFileInvoice,
} from 'react-icons/fa';
import Sales from '../Sales/Sales';
import UnpaidManager from '../UnpaidSupplies/UnpaidManager';
import ReceiptManager from '../ReceiptManager/ReceiptManager';
import StockTransfer from '../StockTransfer/StockTransfer';
import Returns from '../ReturnsModule/Returns';
import ProductCatalogue from '../ProductLogs/ProductCatalogue';
import Inventory from '../InventoryLogs/Inventory';
import ExpenseManager from '../Expenses/ExpenseManager';
import DebtForm from '../DebtPayment/DebtForm';
import SalesSummary from '../SalesDashboard/Component/SalesSummary';

export const tools = [
  {
    key: 'sales',
    label: 'Sales Tracker',
    icon: <FaChartLine className="text-lg text-indigo-600 dark:text-indigo-400" />,
    desc: 'Add and track your daily sales to monitor business performance.',
    component: <Sales />,
    isFreemium: true,
  },
  {
    key: 'products',
    label: 'Products & Pricing Tracker',
    icon: <FaBoxes className="text-lg text-indigo-600 dark:text-indigo-400" />,
    desc: 'Manage your store products, prices, and stock levels.',
    component: <ProductCatalogue />,
    isFreemium: true,
  },
  {
    key: 'stock_transfer',
    label: 'Stock Transfer',
    icon: <FaFileInvoice className="text-lg text-indigo-600 dark:text-indigo-400" />,
    desc: 'Transfer stock between stores easily.',
    component: <StockTransfer />,
    isFreemium: true,
  },
  {
    key: 'inventory',
    label: 'Manage Inventory',
    icon: <FaTasks className="text-lg text-indigo-600 dark:text-indigo-400" />,
    desc: 'Track goods sold and stock remaining in your store.',
    component: <Inventory />,
    isFreemium: true,
  },
  {
    key: 'receipts',
    label: 'Sales Receipts',
    icon: <FaReceipt className="text-lg text-indigo-600 dark:text-indigo-400" />,
    desc: 'View and manage the latest sales receipts from your store.',
    component: <ReceiptManager />,
    isFreemium: true,
  },
  {
    key: 'returns',
    label: 'Returned Items Tracker',
    icon: <FaUndo className="text-lg text-indigo-600 dark:text-indigo-400" />,
    desc: 'Track and manage items returned by customers.',
    component: <Returns />,
    isFreemium: false,
  },
  {
    key: 'expenses',
    label: 'Expenses Tracker',
    icon: <FaRegMoneyBillAlt className="text-lg text-indigo-600 dark:text-indigo-400" />,
    desc: 'Record and monitor all store expenses.',
    component: <ExpenseManager />,
    isFreemium: false,
  },
  {
    key: 'unpaid supplies',
    label: 'Unpaid Supplies',
    icon: <FaBoxOpen className="text-lg text-indigo-600 dark:text-indigo-400" />,
    desc: "Track goods taken on credit that haven't been paid for yet.",
    component: <UnpaidManager />,
    isFreemium: false,
  },
  {
    key: 'debts',
    label: 'Debtors',
    icon: <FaFileInvoiceDollar className="text-lg text-indigo-600 dark:text-indigo-400" />,
    desc: 'Monitor customers who owe you money.',
    component: <DebtForm />,
    isFreemium: false,
  },
  {
    key: 'sales_summary',
    label: 'Sales Summary',
    icon: <FaChartLine className="text-lg text-indigo-600 dark:text-indigo-400" />,
    desc: 'Get a detailed overview of your sales performance.',
    component: <SalesSummary />,
    isFreemium: true,
  },
];

// Mapping to align various feature names (from store owner/user roles) to dashboard keys
export const featureKeyMapping = {
  // Products
  'products & pricing tracker': 'products',
  'products & pricing': 'products',
  'products': 'products',
  'product tracker': 'products',
  'products tracker': 'products',
  'dynamic products': 'products',

  // Suppliers (if you add a suppliers module later, this is ready)
  'suppliers & product tracker': 'suppliers',
  'suppliers': 'suppliers',
  'supplier': 'suppliers',

  // Sales & Summary
  'sales summary': 'sales_summary',
  'sales': 'sales',

  // Stock & Inventory
  'stock transfer': 'stock_transfer',
  'stock transfer tracker': 'stock_transfer',
  'inventory': 'inventory',

  // Receipts & Returns
  'receipts': 'receipts',
  'sales receipts': 'receipts',
  'returns': 'returns',
  'returned items': 'returns',

  // Financial
  'financials': 'financial_dashboard',
  'financial dashboard': 'financial_dashboard',
  'expenses': 'expenses',
  'expenses tracker': 'expenses',
  'unpaid supplies': 'unpaid supplies',
  'debts': 'debts',
  'debtors': 'debts',
};
