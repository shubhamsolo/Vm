// Simple test component to verify React is working
export const TestApp = () => {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f0f0f0', 
      color: '#000',
      fontFamily: 'Arial, sans-serif',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: 'red', fontSize: '24px' }}>TEST: React is working!</h1>
      <p>If you see this, React is rendering correctly.</p>
      <p>Current time: {new Date().toLocaleString()}</p>
    </div>
  );
};

