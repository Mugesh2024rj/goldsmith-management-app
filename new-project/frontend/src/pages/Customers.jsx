import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const ornamentOptions = ['Ring', 'Chain', 'Bangle', 'Earrings', 'Necklace', 'Bracelet', 'Pendant', 'Nose Ring', 'Anklet', 'Waist Chain', 'Toe Ring', 'Crown', 'Mangalsutra', 'Brooch', 'Kada', 'Choker', 'Haram', 'Stud', 'Jhumka', 'Vanki', 'Armlet', 'Temple Jewelry', 'Coins', 'Custom Jewelry', 'Other'];

export default function Customers() {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [customerForm, setCustomerForm] = useState({ name: '', phone: '', address: '' });
  const [orderForm, setOrderForm] = useState({
    metal_type: 'gold',
    ornament_type: 'Ring',
    work_type: 'new_jewel',
    gross_weight: '',
    stone_weight: '',
    wastage: '0',
    rate: '6500',
    making_charge: '0',
    repair_charge: '0',
    advance_amount: '0',
    status: 'pending',
    order_date: new Date().toISOString().slice(0, 10),
    delivery_date: '',
  });
  const [status, setStatus] = useState('');

  const netWeight = useMemo(() => {
    const gross = Number(orderForm.gross_weight) || 0;
    const stone = Number(orderForm.stone_weight) || 0;
    return gross - stone;
  }, [orderForm.gross_weight, orderForm.stone_weight]);

  const totalAmount = useMemo(() => {
    const rate = Number(orderForm.rate) || 0;
    const making = Number(orderForm.making_charge) || 0;
    const repair = Number(orderForm.repair_charge) || 0;
    return netWeight * rate + making + repair;
  }, [netWeight, orderForm.rate, orderForm.making_charge, orderForm.repair_charge]);

  const balanceAmount = useMemo(() => {
    return totalAmount - (Number(orderForm.advance_amount) || 0);
  }, [totalAmount, orderForm.advance_amount]);

  const load = async () => {
    try {
      const { data } = await api.get('/customers');
      setCustomers(data);
      localStorage.setItem('goldsmith_customers', JSON.stringify(data));
    } catch {
      const saved = JSON.parse(localStorage.getItem('goldsmith_customers') || '[]');
      setCustomers(saved);
    }
  };

  const removeCustomer = async (id) => {
    try {
      await api.delete(`/customers/${id}`);
      await load();
    } catch {
      const saved = JSON.parse(localStorage.getItem('goldsmith_customers') || '[]');
      const next = saved.filter((item) => item.id !== id);
      localStorage.setItem('goldsmith_customers', JSON.stringify(next));
      setCustomers(next);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setStatus('');

    try {
      const customerRes = await api.post('/customers', customerForm);
      const customerId = customerRes.data.id;
      const finalStatus = balanceAmount <= 0 ? 'completed' : 'pending';
      await api.post('/orders', {
        customer_id: customerId,
        ...orderForm,
        status: finalStatus,
        net_weight: netWeight,
        total_amount: totalAmount,
        balance_amount: balanceAmount,
      });
      setStatus('Customer and jewelry order details saved successfully.');
      setCustomerForm({ name: '', phone: '', address: '' });
      setOrderForm({
        metal_type: 'gold',
        ornament_type: 'Ring',
        work_type: 'new_jewel',
        gross_weight: '',
        stone_weight: '',
        wastage: '0',
        rate: '6500',
        making_charge: '0',
        repair_charge: '0',
        advance_amount: '0',
        status: 'pending',
        order_date: new Date().toISOString().slice(0, 10),
        delivery_date: '',
      });
      await load();
    } catch {
      const saved = JSON.parse(localStorage.getItem('goldsmith_customers') || '[]');
      const savedOrders = JSON.parse(localStorage.getItem('goldsmith_orders') || '[]');
      const nextId = (saved[0]?.id || 0) + 1;
      const finalStatus = balanceAmount <= 0 ? 'completed' : 'pending';
      const created = {
        id: nextId,
        name: customerForm.name,
        phone: customerForm.phone,
        address: customerForm.address,
        order: { ...orderForm, status: finalStatus, net_weight: netWeight, total_amount: totalAmount, balance_amount: balanceAmount },
        created_at: new Date().toISOString(),
      };
      const createdOrder = {
        id: nextId,
        customer_id: nextId,
        customer_name: customerForm.name,
        customer_phone: customerForm.phone,
        metal_type: orderForm.metal_type,
        ornament_type: orderForm.ornament_type,
        work_type: orderForm.work_type,
        gross_weight: Number(netWeight) || 0,
        stone_weight: Number(orderForm.stone_weight) || 0,
        wastage: Number(orderForm.wastage) || 0,
        rate: Number(orderForm.rate) || 0,
        making_charge: Number(orderForm.making_charge) || 0,
        repair_charge: Number(orderForm.repair_charge) || 0,
        advance_amount: Number(orderForm.advance_amount) || 0,
        total_amount: Number(totalAmount) || 0,
        balance_amount: Number(balanceAmount) || 0,
        status: finalStatus,
        order_date: orderForm.order_date,
        delivery_date: orderForm.delivery_date,
        created_at: new Date().toISOString(),
      };
      const next = [created, ...saved];
      localStorage.setItem('goldsmith_customers', JSON.stringify(next));
      localStorage.setItem('goldsmith_orders', JSON.stringify([createdOrder, ...savedOrders]));
      setCustomers(next);
      setCustomerForm({ name: '', phone: '', address: '' });
      setStatus('Customer and jewelry details saved locally because the MySQL service is unavailable in this environment.');
    }
  };

  return (
    <div className="space-y-6">
      <article className="rounded-3xl border border-white/10 bg-[#171717] p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Customers</h2>
            <p className="mt-1 text-sm text-white/70">Open the add form as a popup and manage the customer list here.</p>
          </div>
          <button onClick={() => setShowForm(true)} className="rounded-full bg-gold px-4 py-2.5 text-sm font-semibold text-[#111111]">+ Add Customer</button>
        </div>
      </article>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <article className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/10 bg-[#171717] p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold">Add Customer & Jewelry Order</h3>
                <p className="text-sm text-white/70">Use the final date to finish the job. If the full amount is paid, the order will be marked completed automatically.</p>
              </div>
              <button onClick={() => setShowForm(false)} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm">Close</button>
            </div>
            <form onSubmit={(e) => { submit(e); setShowForm(false); }} className="space-y-4">
              {status ? <p className="rounded-xl border border-gold/30 bg-gold/10 p-3 text-sm text-gold">{status}</p> : null}

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h4 className="text-sm uppercase tracking-[0.25em] text-gold">Customer Information</h4>
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  <label className="space-y-1 text-sm text-white/80">
                    <span>Customer Name</span>
                    <input className="w-full rounded-2xl border border-white/10 bg-[#111111] px-4 py-3 text-white outline-none" value={customerForm.name} onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })} placeholder="Enter full name" />
                    <small className="text-white/55">This is the customer you are creating for the order.</small>
                  </label>
                  <label className="space-y-1 text-sm text-white/80">
                    <span>Phone Number</span>
                    <input className="w-full rounded-2xl border border-white/10 bg-[#111111] px-4 py-3 text-white outline-none" value={customerForm.phone} onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })} placeholder="e.g. 9876543210" />
                    <small className="text-white/55">Use this contact number for follow-up and billing.</small>
                  </label>
                  <label className="space-y-1 text-sm text-white/80 md:col-span-2">
                    <span>Address</span>
                    <textarea className="w-full rounded-2xl border border-white/10 bg-[#111111] px-4 py-3 text-white outline-none" value={customerForm.address} onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })} placeholder="Enter customer address" rows="3" />
                    <small className="text-white/55">This helps the shop team verify the delivery or pickup location.</small>
                  </label>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h4 className="text-sm uppercase tracking-[0.25em] text-gold">Jewelry Details</h4>
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  <label className="space-y-1 text-sm text-white/80"><span>Metal Type</span><select className="w-full rounded-2xl border border-white/10 bg-[#111111] px-4 py-3 text-white outline-none" value={orderForm.metal_type} onChange={(e) => setOrderForm({ ...orderForm, metal_type: e.target.value })}><option value="gold">Gold</option><option value="silver">Silver</option></select></label>
                  <label className="space-y-1 text-sm text-white/80"><span>Ornament Type</span><select className="w-full rounded-2xl border border-white/10 bg-[#111111] px-4 py-3 text-white outline-none" value={orderForm.ornament_type} onChange={(e) => setOrderForm({ ...orderForm, ornament_type: e.target.value })}>{ornamentOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
                  <label className="space-y-1 text-sm text-white/80"><span>Work Type</span><select className="w-full rounded-2xl border border-white/10 bg-[#111111] px-4 py-3 text-white outline-none" value={orderForm.work_type} onChange={(e) => setOrderForm({ ...orderForm, work_type: e.target.value })}><option value="new_jewel">New Jewel</option><option value="repair">Repair</option><option value="old_to_new">Old To New</option></select></label>
                  <label className="space-y-1 text-sm text-white/80"><span>Gross Weight (g)</span><input type="number" step="0.001" className="w-full rounded-2xl border border-white/10 bg-[#111111] px-4 py-3 text-white outline-none" value={orderForm.gross_weight} onChange={(e) => setOrderForm({ ...orderForm, gross_weight: e.target.value })} placeholder="Enter gross weight" /></label>
                  <label className="space-y-1 text-sm text-white/80"><span>Stone Weight (g)</span><input type="number" step="0.001" className="w-full rounded-2xl border border-white/10 bg-[#111111] px-4 py-3 text-white outline-none" value={orderForm.stone_weight} onChange={(e) => setOrderForm({ ...orderForm, stone_weight: e.target.value })} placeholder="Enter stone weight" /></label>
                  <label className="space-y-1 text-sm text-white/80"><span>Wastage (%)</span><input type="number" step="0.01" className="w-full rounded-2xl border border-white/10 bg-[#111111] px-4 py-3 text-white outline-none" value={orderForm.wastage} onChange={(e) => setOrderForm({ ...orderForm, wastage: e.target.value })} placeholder="Example: 5" /></label>
                  <label className="space-y-1 text-sm text-white/80"><span>Current Rate (₹/g)</span><input type="number" step="0.01" className="w-full rounded-2xl border border-white/10 bg-[#111111] px-4 py-3 text-white outline-none" value={orderForm.rate} onChange={(e) => setOrderForm({ ...orderForm, rate: e.target.value })} placeholder="Enter gold/silver rate" /></label>
                  <label className="space-y-1 text-sm text-white/80"><span>Making Charge</span><input type="number" step="0.01" className="w-full rounded-2xl border border-white/10 bg-[#111111] px-4 py-3 text-white outline-none" value={orderForm.making_charge} onChange={(e) => setOrderForm({ ...orderForm, making_charge: e.target.value })} placeholder="Enter making charges" /></label>
                  <label className="space-y-1 text-sm text-white/80"><span>Repair Charge</span><input type="number" step="0.01" className="w-full rounded-2xl border border-white/10 bg-[#111111] px-4 py-3 text-white outline-none" value={orderForm.repair_charge} onChange={(e) => setOrderForm({ ...orderForm, repair_charge: e.target.value })} placeholder="Enter repair charge" /></label>
                  <label className="space-y-1 text-sm text-white/80"><span>Advance Amount</span><input type="number" step="0.01" className="w-full rounded-2xl border border-white/10 bg-[#111111] px-4 py-3 text-white outline-none" value={orderForm.advance_amount} onChange={(e) => setOrderForm({ ...orderForm, advance_amount: e.target.value })} placeholder="Enter advance paid" /></label>
                  <label className="space-y-1 text-sm text-white/80"><span>Order Date</span><input type="date" className="w-full rounded-2xl border border-white/10 bg-[#111111] px-4 py-3 text-white outline-none" value={orderForm.order_date} onChange={(e) => setOrderForm({ ...orderForm, order_date: e.target.value })} /></label>
                  <label className="space-y-1 text-sm text-white/80"><span>Final Date</span><input type="date" className="w-full rounded-2xl border border-white/10 bg-[#111111] px-4 py-3 text-white outline-none" value={orderForm.delivery_date} onChange={(e) => setOrderForm({ ...orderForm, delivery_date: e.target.value })} /></label>
                </div>
                <div className="mt-4 grid gap-3 rounded-2xl border border-gold/30 bg-gold/10 p-4 text-sm text-white/90 md:grid-cols-2">
                  <p>Net Weight: <strong>{netWeight.toFixed(3)} g</strong></p>
                  <p>Wastage: <strong>{Number(orderForm.wastage || 0).toFixed(2)}%</strong></p>
                  <p>Total Amount: <strong>₹{totalAmount.toFixed(2)}</strong></p>
                  <p>Balance Amount: <strong>₹{balanceAmount.toFixed(2)}</strong></p>
                  <p className="md:col-span-2 text-white/75">If the balance is zero, the order will be saved as completed immediately. Otherwise it stays pending until the final date is reached.</p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm">Cancel</button>
                <button className="rounded-full bg-gold px-4 py-2.5 text-sm font-semibold text-[#111111]">Save Customer</button>
              </div>
            </form>
          </article>
        </div>
      )}
      <article className="rounded-3xl border border-white/10 bg-[#171717] p-5 shadow-card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">{t('customers')}</h2>
            <p className="text-sm text-white/70">Customer list only appears in this tab, with delete action available for each entry.</p>
          </div>
          <input className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none" placeholder={t('search')} />
        </div>
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#111111]">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/5 text-white/70">
              <tr>
                <th className="pb-3 pl-4">ID</th>
                <th className="pb-3">{t('customerName')}</th>
                <th className="pb-3">{t('phone')}</th>
                <th className="pb-3">{t('address')}</th>
                <th className="pb-3 pr-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((item) => (
                <tr key={item.id} className="border-t border-white/10 text-white/80 hover:bg-white/5">
                  <td className="py-3 pl-4">#{item.id}</td>
                  <td className="py-3">{item.name}</td>
                  <td className="py-3 text-white/70">{item.phone}</td>
                  <td className="py-3 text-white/70">{item.address || '-'}</td>
                  <td className="py-3 pr-4 text-right">
                    <button onClick={() => removeCustomer(item.id)} className="rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-200 hover:bg-red-500/20">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
}
