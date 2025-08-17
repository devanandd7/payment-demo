import React, { useState, useEffect } from 'react';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

// Helper function to format amount (minimum 100 paise = 1 INR)
const validateAmount = (amount) => {
  const minAmount = 1; // Minimum 1 INR
  const value = Number(amount);
  return isNaN(value) || value < minAmount ? minAmount : Math.round(value);
};

function PaymentPage() {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [paymentError, setPaymentError] = useState('');

  // Load Razorpay script when component mounts
  useEffect(() => {
    loadRazorpayScript().catch(err => {
      console.error('Error loading Razorpay:', err);
      setPaymentError('Failed to load payment processor. Please try again later.');
    });
  }, []);

  const handlePayment = async (e) => {
    e.preventDefault();
    
    // Validate amount
    const paymentAmount = validateAmount(amount);
    if (paymentAmount < 1) {
      setPaymentError('Minimum amount is ₹1');
      return;
    }

    setLoading(true);
    setPaymentStatus('');
    setPaymentError('');

    try {
      const orderResponse = await fetch('http://localhost:5000/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: paymentAmount,
          currency: 'INR',
        }),
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create order');
      }

      const order = await orderResponse.json();

      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'Your Business Name',
        description: `Payment for order #${order.id}`,
        order_id: order.id,
        handler: function (response) {
          setPaymentStatus(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
          console.log('Payment successful:', response);
        },
        prefill: {
          name: 'Customer Name',
          email: 'customer@example.com',
          contact: '9876543210',
        },
        notes: {
          address: 'Test Address',
        },
        theme: {
          color: '#3399cc',
        },
        modal: {
          ondismiss: function () {
            console.log('Payment modal dismissed');
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', function (response) {
        const error = response.error;
        console.error('Payment failed:', error);
        setPaymentError(`Payment failed: ${error.description || 'Unknown error'}`);
      });

      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError('An error occurred while processing your payment. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: 500,
      margin: '40px auto',
      padding: '24px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ color: '#333', textAlign: 'center', marginBottom: '24px' }}>Secure Payment Gateway</h2>
      
      <form onSubmit={handlePayment} style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '500',
            color: '#555'
          }}>
            Enter Amount (INR):
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="1"
            step="1"
            required
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px',
              boxSizing: 'border-box',
              marginBottom: '8px'
            }}
            placeholder="Enter amount (minimum ₹1)"
          />
          <small style={{
            display: 'block',
            color: '#666',
            fontSize: '0.85em',
            marginTop: '4px'
          }}>
            Minimum amount: ₹1
          </small>
        </div>
        
        <button
          type="submit"
          disabled={loading || !amount}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: loading ? '#95a5a6' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.3s',
            marginTop: '10px'
          }}
        >
          {loading ? 'Processing...' : `Pay ₹${amount || '0'}`}
        </button>
      </form>

      {paymentStatus && (
        <div style={{
          margin: '20px 0',
          padding: '12px',
          backgroundColor: '#d4edda',
          color: '#155724',
          borderRadius: '4px',
          textAlign: 'center',
          border: '1px solid #c3e6cb'
        }}>
          ✅ {paymentStatus}
        </div>
      )}

      {paymentError && (
        <div style={{
          margin: '20px 0',
          padding: '12px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderRadius: '4px',
          textAlign: 'center',
          border: '1px solid #f5c6cb'
        }}>
          ❌ {paymentError}
        </div>
      )}

      <div style={{
        marginTop: '30px',
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#495057',
        textAlign: 'left',
        border: '1px solid #e9ecef'
      }}>
        <h4 style={{
          marginTop: '0',
          marginBottom: '12px',
          color: '#343a40',
          textAlign: 'center'
        }}>Test Card Details</h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          marginBottom: '12px'
        }}>
          <div>Card Number:</div>
          <div><strong>4111 1111 1111 1111</strong></div>
          
          <div>Expiry Date:</div>
          <div><strong>Any future date</strong></div>
          
          <div>CVV:</div>
          <div><strong>Any 3 digits</strong></div>
          
          <div>Name:</div>
          <div><strong>Any name</strong></div>
        </div>
        <p style={{
          margin: '12px 0 0',
          paddingTop: '12px',
          borderTop: '1px dashed #dee2e6',
          textAlign: 'center',
          fontSize: '0.9em',
          color: '#6c757d'
        }}>
          💳 This is a test payment. No real money will be charged.
        </p>
      </div>
    </div>
  );
}

export default PaymentPage;
