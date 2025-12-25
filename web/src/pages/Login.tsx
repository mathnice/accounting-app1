import { Link } from 'react-router-dom';
import { Card } from 'antd';
import { SignInButton } from '@insforge/react';

const Login = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <Card style={{ width: 400, textAlign: 'center' }}>
        <h2 style={{ marginBottom: 24 }}>Smart Accounting</h2>
        <p style={{ marginBottom: 24, color: '#666' }}>Sign in to manage your finances</p>
        
        <div style={{ marginBottom: 24 }}>
          <SignInButton />
        </div>
        
        <div style={{ textAlign: 'center' }}>
          No account? <Link to="/register">Register Now</Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;
