import { Card, Avatar, Descriptions, Spin } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useUser, UserButton } from '@insforge/react';

const Profile = () => {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ marginBottom: 24 }}>Profile</h2>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Avatar size={80} icon={<UserOutlined />} src={user?.avatarUrl} />
          <div style={{ marginTop: 8, fontSize: 18 }}>{user?.name || user?.email}</div>
        </div>
        
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Email">{user?.email || 'Not set'}</Descriptions.Item>
          <Descriptions.Item label="Name">{user?.name || 'Not set'}</Descriptions.Item>
          <Descriptions.Item label="User ID">{user?.id || 'Not set'}</Descriptions.Item>
        </Descriptions>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <p style={{ color: '#666', marginBottom: 16 }}>Manage your account:</p>
          <UserButton />
        </div>
      </Card>
    </div>
  );
};

export default Profile;
