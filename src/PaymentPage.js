import React, { useState } from 'react';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

function PaymentPage() {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await loadRazorpayScript();
    if (!res) {
      alert('Razorpay SDK failed to load.');
      setLoading(false);
      return;
    }
    const options = {
      key: 'rzp_test_', // Replace with your Razorpay Test Key
      amount: Number(amount) * 100, // in paise
      currency: 'INR',
      name: 'Demo Payment',
      description: 'Test payment',
      handler: function (response) {
        alert('Payment successful! Payment ID: ' + response.razorpay_payment_id);
      },
      prefill: {
        name: 'Demo User',
        email: 'demo@example.com',
        contact: '9999999999',
      },
      theme: {
        color: '#3399cc',
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, border: '1px solid #eee', borderRadius: 8 }}>
      <h2>Demo Payment Page</h2>
      <form onSubmit={handlePayment}>
        <div style={{ marginBottom: 16 }}>
          <label>Amount (INR): </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="1"
            required
            style={{ padding: 8, width: '100%' }}
          />
        </div>
        <button type="submit" disabled={loading || !amount} style={{ padding: '10px 20px', background: '#3399cc', color: '#fff', border: 'none', borderRadius: 4 }}>
          {loading ? 'Processing...' : 'Pay Now'}
        </button>
      </form>
      <p style={{ marginTop: 20, color: '#888' }}>
        Use Razorpay Test Key and demo details. No real money will be charged.
      </p>
    </div>
  );
}

export default PaymentPage;
