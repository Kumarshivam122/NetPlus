import React from 'react';

export default function InvoicePrint({ order, user }) {
  if (!order) return null;

  const items = order.items || [];
  
  // Recalculate or use stored totals
  const subTotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalTax = items.reduce((acc, item) => {
    if (item.taxIncluded === false) {
      return acc + ((item.price * (item.taxPercent || 0) / 100) * item.quantity);
    }
    return acc;
  }, 0);
  const discountAmount = order.discountAmount || 0;
  const finalTotal = order.totalAmount || (subTotal - discountAmount + totalTax);

  return (
    <div id="invoice-capture" className="invoice-print-container">
      <div className="invoice-header">
        <div className="invoice-logo">
          <h2>NetPlus</h2>
          <p>Wholesale Pharmaceuticals</p>
        </div>
        <div className="invoice-details">
          <h1 style={{ color: '#000', margin: 0 }}>INVOICE</h1>
          <p><strong>Invoice #:</strong> ORD-{order.id}</p>
          <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
          <p><strong>Status:</strong> {order.status.toUpperCase()}</p>
        </div>
      </div>

      <div className="invoice-parties">
        <div className="invoice-from">
          <h4>Billed From:</h4>
          <p><strong>NetPlus Wholesale</strong></p>
          <p>123 Pharma Hub, Block C</p>
          <p>Medical District, MD 400001</p>
          <p>Email: support@netplus.com</p>
        </div>
        <div className="invoice-to">
          <h4>Billed To (Retailer):</h4>
          <p><strong>{order.userName || user?.name || 'Retailer'}</strong></p>
          {user?.email && <p>{user.email}</p>}
          {user?.gst && <p>GST: {user.gst}</p>}
        </div>
      </div>

      <table className="invoice-table">
        <thead>
          <tr>
            <th>Item Details</th>
            <th style={{ textAlign: 'center' }}>Qty</th>
            <th style={{ textAlign: 'right' }}>Unit Price</th>
            <th style={{ textAlign: 'right' }}>Tax</th>
            <th style={{ textAlign: 'right' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => {
            const itemTax = item.taxIncluded === false ? (item.price * (item.taxPercent || 0) / 100) * item.quantity : 0;
            const amount = (item.price * item.quantity);
            return (
              <tr key={idx}>
                <td>
                  <strong>{item.productName}</strong>
                  <div style={{ fontSize: '10px', color: '#666' }}>{item.manufacturer} | per {item.unit}</div>
                </td>
                <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ textAlign: 'right' }}>₹{item.price.toFixed(2)}</td>
                <td style={{ textAlign: 'right', fontSize: '11px', color: '#666' }}>
                  {item.taxIncluded ? 'Incl.' : `+ ₹${itemTax.toFixed(2)} (${item.taxPercent || 0}%)`}
                </td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{amount.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="invoice-summary">
        <div className="invoice-summary-row">
          <span>Subtotal:</span>
          <span>₹{subTotal.toFixed(2)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="invoice-summary-row discount">
            <span>Discount:</span>
            <span>- ₹{discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="invoice-summary-row">
          <span>Estimated Tax:</span>
          <span>₹{totalTax.toFixed(2)}</span>
        </div>
        <div className="invoice-summary-row total">
          <span>Total Amount:</span>
          <span>₹{Number(finalTotal).toFixed(2)}</span>
        </div>
      </div>

      <div className="invoice-footer">
        <p>Thank you for doing business with NetPlus.</p>
        <p style={{ fontSize: '10px', color: '#888', marginTop: '10px' }}>This is a computer generated invoice and does not require a signature.</p>
      </div>

      <style>{`
        .invoice-print-container {
          background: #fff;
          color: #000;
          font-family: 'Inter', sans-serif;
          padding: 40px;
          box-sizing: border-box;
          width: 800px;
          min-width: 800px;
          max-width: 800px;
          margin: 0 auto;
        }

        .invoice-header {
          display: flex;
          justify-content: space-between;
          border-bottom: 2px solid #0f766e;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }

        .invoice-logo h2 {
          color: #0f766e;
          font-weight: 800;
          margin: 0 0 5px 0;
          font-size: 28px;
        }
        .invoice-logo p { margin: 0; color: #555; font-size: 14px; }
        
        .invoice-details { text-align: right; }
        .invoice-details p { margin: 4px 0; font-size: 14px; color: #333; }

        .invoice-parties {
          display: flex;
          justify-content: space-between;
          margin-bottom: 40px;
        }
        .invoice-parties h4 { margin: 0 0 10px 0; color: #666; font-size: 12px; text-transform: uppercase; }
        .invoice-parties p { margin: 2px 0; font-size: 14px; color: #222; }

        .invoice-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .invoice-table th {
          background: #f1f5f9;
          color: #334155;
          text-align: left;
          padding: 12px;
          font-size: 13px;
          border-bottom: 2px solid #cbd5e1;
        }
        .invoice-table td {
          padding: 12px;
          border-bottom: 1px solid #e2e8f0;
          color: #0f172a;
          font-size: 14px;
        }

        .invoice-summary {
          width: 300px;
          margin-left: auto;
        }
        .invoice-summary-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
          color: #334155;
        }
        .invoice-summary-row.discount { color: #16a34a; }
        .invoice-summary-row.total {
          border-top: 2px solid #0f766e;
          margin-top: 10px;
          padding-top: 10px;
          font-size: 18px;
          font-weight: 800;
          color: #0f766e;
        }

        .invoice-footer {
          margin-top: 60px;
          text-align: center;
          color: #64748b;
          font-size: 13px;
          border-top: 1px solid #e2e8f0;
          padding-top: 20px;
        }
      `}</style>
    </div>
  );
}
