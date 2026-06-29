import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, Button, Input } from '../../components/ui';
import { showToast } from '../../components/ui/Toast';

export default function SettingsPage() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleSave = () => {
    showToast.success('Settings saved successfully');
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-[var(--text-primary)]">Settings</h1>
        <Card className="p-6 space-y-6">
          <div>
            <h2 className="text-lg font-medium text-[var(--text-primary)] mb-4">Preferences</h2>
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Push Notifications</span>
              <button 
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`w-12 h-6 rounded-full transition-colors relative ${notificationsEnabled ? 'bg-[var(--color-primary-500)]' : 'bg-gray-300 dark:bg-gray-700'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${notificationsEnabled ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>
          
          <div className="pt-4 border-t border-[var(--border-primary)]">
            <h2 className="text-lg font-medium text-[var(--text-primary)] mb-4">Security</h2>
            <Button variant="outline" className="w-full sm:w-auto">Change Password</Button>
          </div>
          
          <div className="pt-4 border-t border-[var(--border-primary)] flex justify-end">
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
