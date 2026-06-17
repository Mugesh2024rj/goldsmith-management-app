import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';

const DetailRow = ({ label, value }) => (
  <div className="rounded-2xl border border-white/10 bg-[#111111] p-3">
    <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">{label}</p>
    <p className="mt-1 text-sm text-white">{value || '-'}</p>
  </div>
);

const formatDate = (d) => {
  if (!d) return '-';
  const date = new Date(d);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const statusClass = (s = '') => {
  switch (s.toLowerCase()) {
    case 'completed': case 'delivered': return 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100';
    case 'in_progress': return 'border-amber-400/30 bg-amber-500/10 text-amber-100';
    default: return 'border-sky-400/30 bg-sky-500/10 text-sky-100';
  }
};

export default function Orders() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [metalFilter, setMetalFilter] = useState(searchParams.get('metal_type') || '');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (metalFilter) params.metal_type = metalFilter;
      if (search) params.search = search;
      const { data } = await api.get('/orders', { params });
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load orders: ' + (err.response?.data?.message || err.message));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [metalFilter, search]);

  useEffect(() => {
    setMetalFilter(searchParams.get('metal_type') || '');
  }, [searchParams]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/orders/${id}/status`, { status });
      const updated = { ...selectedOrder, status, balance_amount: status === 'completed' ? 0 : selectedOrder.balance_amount };
      setSelectedOrder(updated);
      setOrders((prev) => prev.map((o) => o.id === id ? updated : o));
    } catch (err) {
      alert('Update failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const removeOrder = async (id) => {
    if (!window.confirm('Delete this order?')) return;
    try {
      await api.delete(`/orders/${id}`);
      setSelectedOrder(null);
      await loadOrders();
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const formatBalance = (item) =>
    ['completed', 'delivered'].includes(item?.status) ? 'Settled' : `₹${Number(item?.balance_amount ?? 0).toLocaleString()}`;

  return (
    <article className="rounded-3xl border border-white/10 bg-[#171717] p-5 shadow-card">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-xl font-semibold">{t('orders')}</h2>
        <input
          className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none text-white"
          placeholder={t('search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        <label className="text-sm text-white/80">
          <span className="mb-1 block">Metal Type</span>
          <select value={metalFilter} onChange={(e) => setMetalFilter(e.target.value)} className="rounded-2xl border border-white/10 bg-[#111111] px-3 py-2 text-white outline-none">
            <option value="">All</option>
            <option value="gold">Gold</option>
            <option value="silver">Silver</option>
          </select>
        </label>
        <button onClick={() => { setMetalFilter(''); setSearch(''); }} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white">Reset</button>
      </div>

      {error && <p className="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#111111]">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/5 text-white/70">
            <tr>
              <th className="whitespace-nowrap px-4 py-3">ID</th>
              <th className="whitespace-nowrap px-4 py-3">Name</th>
              <th className="whitespace-nowrap px-4 py-3">Phone</th>
              <th className="whitespace-nowrap px-4 py-3">Metal</th>
              <th className="whitespace-nowrap px-4 py-3">Ornament</th>
              <th className="whitespace-nowrap px-4 py-3">Order Date</th>
              <th className="whitespace-nowrap px-4 py-3">Total</th>
              <th className="whitespace-nowrap px-4 py-3">Balance</th>
              <th className="whitespace-nowrap px-4 py-3">Status</th>
              <th className="whitespace-nowrap px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="10" className="py-6 text-center text-white/50">Loading...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan="10" className="py-6 text-center text-white/50">No orders found.</td></tr>
            ) : (
              orders.map((item) => (
                <tr key={item.id} onClick={() => setSelectedOrder(item)} className="cursor-pointer border-t border-white/10 text-white/80 hover:bg-white/5">
                  <td className="px-4 py-3">#{item.id}</td>
                  <td className="px-4 py-3">{item.customer_name || '-'}</td>
                  <td className="px-4 py-3 text-white/60">{item.customer_phone || '-'}</td>
                  <td className="px-4 py-3"><span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs uppercase">{item.metal_type}</span></td>
                  <td className="px-4 py-3">{item.ornament_type}</td>
                  <td className="px-4 py-3 text-white/60">{formatDate(item.order_date)}</td>
                  <td className="px-4 py-3 font-semibold text-gold">₹{Number(item.total_amount ?? 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-white/60">{formatBalance(item)}</td>
                  <td className="px-4 py-3"><span className={`rounded-full border px-2 py-1 text-xs font-semibold capitalize ${statusClass(item.status)}`}>{item.status}</span></td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => removeOrder(item.id)}
                      className="rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/30"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setSelectedOrder(null)}>
          <article className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#171717] p-5 shadow-card" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gold">Order Details</p>
                <h3 className="mt-1 text-xl font-semibold">#{selectedOrder.id} · {selectedOrder.customer_name}</h3>
                <p className="text-sm text-white/60">{selectedOrder.customer_phone}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white">Close</button>
            </div>

            <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-2">
              <DetailRow label="Metal" value={selectedOrder.metal_type?.toUpperCase()} />
              <DetailRow label="Ornament" value={selectedOrder.ornament_type} />
              <DetailRow label="Work Type" value={selectedOrder.work_type} />
              <DetailRow label="Gross Weight" value={`${selectedOrder.gross_weight} g`} />
              <DetailRow label="Net Weight" value={`${selectedOrder.net_weight} g`} />
              <DetailRow label="Rate" value={`₹${selectedOrder.rate}/g`} />
              <DetailRow label="Making Charge" value={`₹${selectedOrder.making_charge}`} />
              <DetailRow label="Repair Charge" value={`₹${selectedOrder.repair_charge}`} />
              <DetailRow label="Advance" value={`₹${selectedOrder.advance_amount}`} />
              <DetailRow label="Total Amount" value={`₹${Number(selectedOrder.total_amount).toLocaleString()}`} />
              <DetailRow label="Balance" value={formatBalance(selectedOrder)} />
              <DetailRow label="Status" value={selectedOrder.status} />
              <DetailRow label="Order Date" value={formatDate(selectedOrder.order_date)} />
              <DetailRow label="Delivery Date" value={formatDate(selectedOrder.delivery_date)} />
            </div>

            {/* Status Update - only show if not completed */}
            {selectedOrder.status !== 'completed' && (
              <div className="mt-4 rounded-2xl border border-gold/30 bg-gold/10 p-4">
                <p className="text-sm font-semibold text-gold mb-3">Update Status</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => updateStatus(selectedOrder.id, 'pending')}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      selectedOrder.status === 'pending'
                        ? 'bg-gold text-[#111]'
                        : 'border border-gold/40 bg-gold/10 text-gold hover:bg-gold/20'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => updateStatus(selectedOrder.id, 'completed')}
                    className="rounded-full border border-gold/40 bg-gold/10 px-4 py-2 text-sm font-semibold text-gold hover:bg-gold hover:text-[#111] transition"
                  >
                    Mark Completed
                  </button>
                </div>
              </div>
            )}

            {selectedOrder.status === 'completed' && (
              <div className="mt-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
                ✅ This order is completed.
              </div>
            )}

            {/* Delete */}
            <div className="mt-3 flex items-center justify-between rounded-2xl border border-red-400/20 bg-red-500/10 p-3">
              <span className="text-sm text-red-200">Delete this order permanently</span>
              <button onClick={() => removeOrder(selectedOrder.id)} className="rounded-full border border-red-400/30 bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-200 hover:bg-red-500/30">
                Delete Order
              </button>
            </div>
          </article>
        </div>
      )}
    </article>
  );
}
