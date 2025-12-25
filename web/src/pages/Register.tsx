import { Link } from 'react-router-dom';
import { Card } from 'antd';
import { SignUpButton } from '@insforge/react';

const Register = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <Card style={{ width: 400, textAlign: 'center' }}>
        <h2 style={{ marginBottom: 24 }}>Create Account</h2>
        <p style={{ marginBottom: 24, color: '#666' }}>Start tracking your finances today</p>
        
        <div style={{ marginBottom: 24 }}>
          <SignUpButton />
        </div>
        
        <div style={{ textAlign: 'center' }}>
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </Card>
    </div>
  );
};

export default Register;
