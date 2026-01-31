import React, { forwardRef } from 'react';
import { useCurrency } from '../../context/currencyContext';

const ReceiptPreview = forwardRef(({ store, receipt, saleGroup, productGroups, styles }, ref) => {
  const { formatPrice } = useCurrency();

  const receiptDate = receipt?.date ? new Date(receipt.date) : new Date(saleGroup?.created_at || Date.now());
  const totalAmount = receipt?.sales_amount || saleGroup?.total_amount || 0;
  const totalQuantity = productGroups.reduce((sum, g) => sum + g.quantity, 0);

  const hasCustomerInfo =
    receipt?.customer_name?.trim() ||
    receipt?.phone_number?.trim() ||
    receipt?.customer_address?.trim() ||
    receipt?.warranty?.trim();

  return (
    <div
      ref={ref}
      className="bg-white w-full max-w-[80mm] mx-auto text-xs"
      style={{ fontFamily: styles?.fontFamily || 'monospace' }}
    >
      {/* Header */}
      <div
        className="text-center p-4 mb-3 rounded-t-2xl"
        style={{
          backgroundColor: styles?.headerBgColor || '#1E3A8A',
          color: styles?.headerTextColor || '#FFFFFF'
        }}
      >
        {styles?.logoUrl && (
          <img src={styles.logoUrl} alt="Logo" className="w-16 h-16 mx-auto mb-2 rounded-lg object-cover" />
        )}
        <h1 className="text-lg font-bold mb-1">{store?.shop_name || 'Your Store'}</h1>
        <div className="text-[10px] space-y-0.5 opacity-90">
          {store?.business_address && <p>{store.business_address}</p>}
          {store?.phone_number && <p>Tel: {store.phone_number}</p>}
          {store?.email_address && <p>{store.email_address}</p>}
        </div>
      </div>

      {/* Receipt Info */}
      <div className="px-3 mb-3 space-y-1 text-[10px]">
        <div className="flex justify-between">
          <span className="font-semibold">Receipt:</span>
          <span>{receipt?.receipt_id || 'RCPT-XXX'}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Date:</span>
          <span>{receiptDate.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Payment:</span>
          <span className="uppercase">{saleGroup?.payment_method || 'N/A'}</span>
        </div>
      </div>

      <div className="border-t-2 border-dashed border-slate-300 my-2"></div>

      {/* Items */}
      <div className="px-3 mb-3">
        <div className="space-y-2">
          {productGroups.length > 0 ? (
            productGroups.map((group, idx) => (
              <div key={idx} className="pb-2 border-b border-dashed border-slate-200 last:border-0">
                <div className="font-semibold text-[11px] mb-0.5">{group.productName}</div>
                {group.deviceIds.length > 0 && (
                  <div className="text-[9px] text-slate-600 mb-1 break-words">
                    IMEI: {group.deviceIds.join(', ')}
                  </div>
                )}
                <div className="flex justify-between items-center text-[9px]">
                  <span>{group.quantity} x {formatPrice(group.unitPrice)}</span>
                  <span className="font-bold truncate ml-1" title={formatPrice(group.totalAmount)}>{formatPrice(group.totalAmount)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-[10px] text-slate-500 py-2">No items</div>
          )}
        </div>
      </div>

      <div className="border-t-2 border-dashed border-slate-300 my-2"></div>

      {/* Totals */}
      <div className="px-3 mb-3 text-sm">
        <div className="flex justify-between mb-1">
          <span className="font-semibold">Total Items:</span>
          <span className="font-bold">{totalQuantity}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="font-bold">TOTAL:</span>
          <span className="font-bold truncate ml-1" title={formatPrice(totalAmount)}>{formatPrice(totalAmount)}</span>
        </div>
      </div>

      <div className="border-t-2 border-dashed border-slate-300 my-2"></div>

      {/* Customer Info */}
      {hasCustomerInfo && (
        <>
          <div className="px-3 mb-3 text-[10px]">
            <div className="font-semibold mb-1">Customer Details:</div>
            {receipt?.customer_name?.trim() && <div>Name: {receipt.customer_name.trim()}</div>}
            {receipt?.phone_number?.trim() && <div>Phone: {receipt.phone_number.trim()}</div>}
            {receipt?.customer_address?.trim() && <div>Address: {receipt.customer_address.trim()}</div>}
            {receipt?.warranty?.trim() && <div>Warranty: {receipt.warranty.trim()}</div>}
          </div>
          <div className="border-t-2 border-dashed border-slate-300 my-2"></div>
        </>
      )}

      {/* Footer */}
      <div className="text-center text-[10px] px-3 pb-4 space-y-1">
        <p className="font-semibold">Thank you for your patronage!</p>
        <p className="text-[9px] text-slate-500">Powered by {store?.shop_name || 'Zana Store'}</p>
      </div>
    </div>
  );
});

ReceiptPreview.displayName = 'ReceiptPreview';

export default ReceiptPreview;