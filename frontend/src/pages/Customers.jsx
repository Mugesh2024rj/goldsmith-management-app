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
  const [msg, setMsg] = useState('');

  const netWeight = useMemo(() => {
    return (Number(orderForm.gross_weight) || 0) - (Number(orderForm.stone_weight) || 0);
  }, [orderForm.gross_weight, orderForm.stone_weight]);

  const totalAmount = useMemo(() => {
    return netWeight * (Number(orderForm.rate) || 0) + (Number(orderForm.making_charge) || 0) + (Number(orderForm.repair_charge) || 0);
  }, [netWeight, orderForm.rate, orderForm.making_charge, orderForm.repair_charge]);

  const balanceAmount = useMemo(() => {
    return totalAmount - (Number(orderForm.advance_amount) || 0);
  }, [totalAmount, orderForm.advance_amount]);

  const resetOrderForm = () => setOrderForm({
    metal_type: 'gold', ornament_type: 'Ring', work_type: 'new_jewel',
    gross_weight: '', stone_weight: '', wastage: '0', rate: '6500',
    making_charge: '0', repair_charge: '0', advance_amount: '0',
    status: 'pending', order_date: new Date().toISOString().slice(0, 10), delivery_date: '',
  });

  const load = async () => {
    try {
      const { data } = await api.get('/customers');
      setCustomers(data);
    } catch {
      setCustomers([]);
    }
  };

  useEffect(() => { load(); }, []);

  const removeCustomer = async (id) => {
    if (!window.confirm(t('deleteCustomer') + '?')) return;
    try {
      await api.delete(`/customers/${id}`);
      await load();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const { data: cust } = await api.post('/customers', customerForm);
      await api.post('/orders', {
        customer_id: cust.id,
        ...orderForm,
        status: balanceAmount <= 0 ? 'completed' : 'pending',
        net_weight: netWeight,
        total_amount: totalAmount,
        balance_amount: balanceAmount,
      });
      setMsg(t('saveCustomer') + ' ✅');
      setCustomerForm({ name: '', phone: '', address: '' });
      resetOrderForm();
      setShowForm(false);
      await load();
    } catch (err) {
      setMsg(err.response?.data?.message || err.message);
    }
  };

  const inp = 'w-full rounded-2xl border border-white/10 bg-[#111111] px-4 py-3 text-white outline-none';

  return (
    <div className="space-y-6">

      {/* Header */}
      <article className="rounded-3xl border border-white/10 bg-[#171717] p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">{t('customers')}</h2>
            <p className="mt-1 text-sm text-white/70">{t('customerListSubtitle')}</p>
          </div>
          <button onClick={() => setShowForm(true)} className="rounded-full bg-gold px-4 py-2.5 text-sm font-semibold text-[#111111]">
            {t('addCustomer')}
          </button>
        </div>
      </article>

      {/* Add Customer Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <article className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/10 bg-[#171717] p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold">{t('formTitle')}</h3>
                <p className="text-sm text-white/70">{t('formSubtitle')}</p>
              </div>
              <button onClick={() => setShowForm(false)} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm">
                {t('close')}
              </button>
            </div>

            {msg && <p className="mb-3 rounded-xl border border-gold/30 bg-gold/10 p-3 text-sm text-gold">{msg}</p>}

            <form onSubmit={submit} className="space-y-4">

              {/* Customer Info */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h4 className="text-sm uppercase tracking-[0.25em] text-gold">{t('customerInfo')}</h4>
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  <label className="space-y-1 text-sm text-white/80">
                    <span>{t('customerNameLabel')}</span>
                    <input className={inp} value={customerForm.name} onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })} placeholder={t('customerNamePlaceholder')} required />
                    <small className="text-white/55">{t('customerNameHint')}</small>
                  </label>
                  <label className="space-y-1 text-sm text-white/80">
                    <span>{t('phone')}</span>
                    <input className={inp} value={customerForm.phone} onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })} placeholder={t('phonePlaceholder')} required />
                    <small className="text-white/55">{t('phoneHint')}</small>
                  </label>
                  <label className="space-y-1 text-sm text-white/80 md:col-span-2">
                    <span>{t('address')}</span>
                    <textarea className={inp} value={customerForm.address} onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })} placeholder={t('addressPlaceholder')} rows="3" />
                    <small className="text-white/55">{t('addressHint')}</small>
                  </label>
                </div>
              </div>

              {/* Jewelry Details */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h4 className="text-sm uppercase tracking-[0.25em] text-gold">{t('jewelryDetails')}</h4>
                <div className="mt-3 grid gap-4 md:grid-cols-2">

                  <label className="space-y-1 text-sm text-white/80">
                    <span>{t('metalType')}</span>
                    <select className={inp} value={orderForm.metal_type} onChange={(e) => setOrderForm({ ...orderForm, metal_type: e.target.value })}>
                      <option value="gold">{t('gold')}</option>
                      <option value="silver">{t('silver')}</option>
                    </select>
                  </label>

                  <label className="space-y-1 text-sm text-white/80">
                    <span>{t('ornamentType')}</span>
                    <select className={inp} value={orderForm.ornament_type} onChange={(e) => setOrderForm({ ...orderForm, ornament_type: e.target.value })}>
                      {ornamentOptions.map((item) => <option key={item} value={item}>{t(item)}</option>)}
                    </select>
                  </label>

                  <label className="space-y-1 text-sm text-white/80">
                    <span>{t('workType')}</span>
                    <select className={inp} value={orderForm.work_type} onChange={(e) => setOrderForm({ ...orderForm, work_type: e.target.value })}>
                      <option value="new_jewel">{t('newJewel')}</option>
                      <option value="repair">{t('repair')}</option>
                      <option value="old_to_new">{t('oldToNew')}</option>
                    </select>
                  </label>

                  <label className="space-y-1 text-sm text-white/80">
                    <span>{t('grossWeight')}</span>
                    <input type="number" step="0.001" className={inp} value={orderForm.gross_weight} onChange={(e) => setOrderForm({ ...orderForm, gross_weight: e.target.value })} placeholder={t('grossWeightPlaceholder')} />
                  </label>

                  <label className="space-y-1 text-sm text-white/80">
                    <span>{t('stoneWeight')}</span>
                    <input type="number" step="0.001" className={inp} value={orderForm.stone_weight} onChange={(e) => setOrderForm({ ...orderForm, stone_weight: e.target.value })} placeholder={t('stoneWeightPlaceholder')} />
                  </label>

                  <label className="space-y-1 text-sm text-white/80">
                    <span>{t('wastage')}</span>
                    <input type="number" step="0.01" className={inp} value={orderForm.wastage} onChange={(e) => setOrderForm({ ...orderForm, wastage: e.target.value })} placeholder={t('wastagePlaceholder')} />
                  </label>

                  <label className="space-y-1 text-sm text-white/80">
                    <span>{t('currentRate')}</span>
                    <input type="number" step="0.01" className={inp} value={orderForm.rate} onChange={(e) => setOrderForm({ ...orderForm, rate: e.target.value })} placeholder={t('currentRatePlaceholder')} />
                  </label>

                  <label className="space-y-1 text-sm text-white/80">
                    <span>{t('makingCharge')}</span>
                    <input type="number" step="0.01" className={inp} value={orderForm.making_charge} onChange={(e) => setOrderForm({ ...orderForm, making_charge: e.target.value })} placeholder={t('makingChargePlaceholder')} />
                  </label>

                  <label className="space-y-1 text-sm text-white/80">
                    <span>{t('repairCharge')}</span>
                    <input type="number" step="0.01" className={inp} value={orderForm.repair_charge} onChange={(e) => setOrderForm({ ...orderForm, repair_charge: e.target.value })} placeholder={t('repairChargePlaceholder')} />
                  </label>

                  <label className="space-y-1 text-sm text-white/80">
                    <span>{t('advanceAmount')}</span>
                    <input type="number" step="0.01" className={inp} value={orderForm.advance_amount} onChange={(e) => setOrderForm({ ...orderForm, advance_amount: e.target.value })} placeholder={t('advancePlaceholder')} />
                  </label>

                  <label className="space-y-1 text-sm text-white/80">
                    <span>{t('orderDate')}</span>
                    <input type="date" className={inp} value={orderForm.order_date} onChange={(e) => setOrderForm({ ...orderForm, order_date: e.target.value })} />
                  </label>

                  <label className="space-y-1 text-sm text-white/80">
                    <span>{t('finalDate')}</span>
                    <input type="date" className={inp} value={orderForm.delivery_date} onChange={(e) => setOrderForm({ ...orderForm, delivery_date: e.target.value })} />
                  </label>
                </div>

                {/* Auto Calculations */}
                <div className="mt-4 grid gap-3 rounded-2xl border border-gold/30 bg-gold/10 p-4 text-sm text-white/90 md:grid-cols-2">
                  <p>{t('netWeight')}: <strong>{netWeight.toFixed(3)} g</strong></p>
                  <p>{t('wastage')}: <strong>{Number(orderForm.wastage || 0).toFixed(2)}%</strong></p>
                  <p>{t('totalAmount')}: <strong>₹{totalAmount.toFixed(2)}</strong></p>
                  <p>{t('balanceAmount')}: <strong>₹{balanceAmount.toFixed(2)}</strong></p>
                  <p className="md:col-span-2 text-white/75">{t('autoCalcNote')}</p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm">
                  {t('cancel')}
                </button>
                <button type="submit" className="rounded-full bg-gold px-4 py-2.5 text-sm font-semibold text-[#111111]">
                  {t('saveCustomer')}
                </button>
              </div>
            </form>
          </article>
        </div>
      )}

      {/* Customer Table */}
      <article className="rounded-3xl border border-white/10 bg-[#171717] p-5 shadow-card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">{t('customers')}</h2>
          <input className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none text-white" placeholder={t('search')} />
        </div>
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#111111]">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/5 text-white/70">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">{t('customerName')}</th>
                <th className="px-4 py-3">{t('phone')}</th>
                <th className="px-4 py-3">{t('address')}</th>
                <th className="px-4 py-3 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr><td colSpan="5" className="py-6 text-center text-white/50">{t('search')}...</td></tr>
              ) : (
                customers.map((item) => (
                  <tr key={item.id} className="border-t border-white/10 text-white/80 hover:bg-white/5">
                    <td className="px-4 py-3">#{item.id}</td>
                    <td className="px-4 py-3">{item.name}</td>
                    <td className="px-4 py-3 text-white/60">{item.phone}</td>
                    <td className="px-4 py-3 text-white/60">{item.address || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => removeCustomer(item.id)} className="rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-200 hover:bg-red-500/20">
                        {t('deleteCustomer')}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
}
