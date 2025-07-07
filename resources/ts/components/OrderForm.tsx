import React, { useState } from 'react';

export type Nominee = {
  id: string;
  name: string;
};

export type OrderFormData = {
  stock: string;
  price: number;
  lots: number;
  order_type: 'Buy' | 'Sell' | 'Withdraw';
  selected_target: string[];
  pin: string;
};

type Props = {
  onSubmit: (order: OrderFormData) => void;
  submitting?: boolean;
  nominees?: Nominee[];
};

const OrderForm: React.FC<Props> = ({
  onSubmit,
  submitting = false,
  nominees = [],
}) => {
  const [form, setForm] = useState({
    stock: '',
    price: '',
    lots: '',
    order_type: 'Buy' as OrderFormData['order_type'],
    selected_target: [] as string[],
    pin: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
    setForm((prev) => ({ ...prev, selected_target: selected }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedPrice = parseFloat(form.price);
    const parsedLots = parseInt(form.lots, 10);

    if (!form.stock.trim()) return alert('Stock symbol is required.');
    if (isNaN(parsedPrice) || parsedPrice <= 0)
      return alert('Price must be a positive number.');
    if (isNaN(parsedLots) || parsedLots <= 0)
      return alert('Lots must be a positive integer.');
    if (form.selected_target.length === 0)
      return alert('Please select at least one nominee.');
    if (!form.pin.trim()) return alert('PIN is required.');

    onSubmit({
      stock: form.stock.trim(),
      price: parsedPrice,
      lots: parsedLots,
      order_type: form.order_type,
      selected_target: form.selected_target,
      pin: form.pin.trim(),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 c_strategist-panel-ho-rectangle11 bg-white p-6 rounded-[25px] shadow"
    >
      <h2 className="c_strategist-panel-ho-text13 mb-4">Create Order</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          name="stock"
          value={form.stock}
          onChange={handleChange}
          placeholder="Stock Symbol (e.g. AAPL)"
          className="border p-3 rounded-lg text-sm"
          required
          disabled={submitting}
          aria-label="Stock Symbol"
        />

        <input
          name="price"
          type="number"
          value={form.price}
          onChange={handleChange}
          placeholder="Price (e.g. 1500)"
          className="border p-3 rounded-lg text-sm"
          required
          min="0"
          step="0.01"
          disabled={submitting}
          aria-label="Price"
        />

        <input
          name="lots"
          type="number"
          value={form.lots}
          onChange={handleChange}
          placeholder="Lots (e.g. 10)"
          className="border p-3 rounded-lg text-sm"
          required
          min="1"
          step="1"
          disabled={submitting}
          aria-label="Lots"
        />

        <select
          name="order_type"
          value={form.order_type}
          onChange={handleChange}
          className="border p-3 rounded-lg text-sm"
          disabled={submitting}
          aria-label="Order Type"
        >
          <option value="Buy">Buy</option>
          <option value="Sell">Sell</option>
          <option value="Withdraw">Withdraw</option>
        </select>

        <select
          name="selected_target"
          multiple
          value={form.selected_target}
          onChange={handleMultiSelect}
          className="border p-3 rounded-lg text-sm col-span-1 md:col-span-2 h-32"
          disabled={submitting}
          aria-label="Nominee Target"
        >
          {nominees.length > 0 ? (
            nominees.map((nom) => (
              <option key={nom.id} value={nom.id}>
                {nom.name}
              </option>
            ))
          ) : (
            <option disabled>No nominees available</option>
          )}
        </select>

        <input
          name="pin"
          type="password"
          value={form.pin}
          onChange={handleChange}
          placeholder="Enter your PIN"
          className="border p-3 rounded-lg text-sm col-span-1 md:col-span-2"
          required
          disabled={submitting}
          aria-label="PIN"
        />
      </div>

      <button
        type="submit"
        className={`c_strategist-panel-ho-rectangle12 w-full p-3 rounded-[25px] font-bold transition text-white text-center shadow text-sm ${
          submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        }`}
        disabled={submitting}
      >
        {submitting ? 'Submitting...' : 'Submit Order'}
      </button>
    </form>
  );
};

export default OrderForm;
