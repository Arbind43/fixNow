import { useState } from 'react';
import { User, Mail, Phone, MapPin, Camera, Shield } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, Input, Button, Avatar } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../../components/ui/Toast';
import TechnicianProfileEdit from './TechnicianProfileEdit';

export default function ProfilePage() {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '123 Tech Park, Bangalore, India',
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast.success('Profile updated successfully');
    }, 1000);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">My Profile</h1>
          <p className="text-[var(--text-secondary)] mt-1">Manage your personal information and settings</p>
        </div>

        {user?.role === 'technician' ? (
          <TechnicianProfileEdit />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column - Avatar & Quick Info */}
            <div className="space-y-6">
              <Card className="p-6 flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <Avatar src={user?.avatar || ""} name={user?.name || "User"} size="xl" className="shadow-md" />
                  <button className="absolute bottom-0 right-0 w-10 h-10 bg-[var(--color-primary-600)] text-white rounded-full flex items-center justify-center hover:bg-[var(--color-primary-700)] transition-colors border-4 border-[var(--bg-primary)]">
                    <Camera size={18} />
                  </button>
                </div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">{user?.name}</h2>
                <p className="text-[var(--text-secondary)] uppercase text-sm font-semibold tracking-wider">{user?.role}</p>
                
                <div className="w-full mt-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                    <Shield size={16} className="text-[var(--color-success)]" />
                    <span>Account Verified</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                    <Mail size={16} />
                    <span>{user?.email}</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column - Edit Form */}
            <div className="md:col-span-2 space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6">Personal Information</h3>
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Input 
                      label="Full Name" 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      icon={<User size={18} />}
                    />
                    <Input 
                      label="Email Address" 
                      type="email"
                      value={formData.email} 
                      disabled
                      icon={<Mail size={18} />}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Input 
                      label="Phone Number" 
                      type="tel"
                      value={formData.phone} 
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      icon={<Phone size={18} />}
                    />
                  </div>
                  <Input 
                    label="Primary Address" 
                    value={formData.address} 
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    icon={<MapPin size={18} />}
                  />
                </div>

                <div className="mt-8 flex justify-end">
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </Card>

              <Card className="p-6 border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10">
                <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">Danger Zone</h3>
                <p className="text-sm text-red-500/80 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300 dark:text-red-400 dark:border-red-900 dark:hover:bg-red-900/30">
                  Delete Account
                </Button>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
