import { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Briefcase, MapPin, Building2, Clock, Shield, Camera } from 'lucide-react';
import { Card, Input, Button, Avatar, Tabs } from '../../components/ui';
import { showToast } from '../../components/ui/Toast';
import { useAuth } from '../../context/AuthContext';

export default function TechnicianProfileEdit() {
  const { user, login } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    
    // Personal / Address
    dob: '',
    gender: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    serviceRadiusKm: 10,
    
    // Professional
    experienceYears: 0,
    skills: '',
    bio: '',
    
    // Pricing
    baseCharge: 0,
    inspectionCharge: 0,
    emergencyCharge: 0,
    
    // Availability
    startTime: '09:00',
    endTime: '18:00',
    emergencyAvailable: false,

    // Banking
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('/api/technicians/me/profile');
        if (res.data.success && res.data.data) {
          const profile = res.data.data;
          console.log('Fetched profile:', profile);
          setFormData(prev => ({
            ...prev,
            // personalDetails is a nested object in the DB schema
            dob: profile.personalDetails?.dob || '',
            gender: profile.personalDetails?.gender || '',
            // address fields
            street: profile.address?.street || '',
            city: profile.address?.city || '',
            state: profile.address?.state || '',
            pincode: profile.address?.pincode || '',
            serviceRadiusKm: profile.address?.serviceRadiusKm || 10,
            // professional
            experienceYears: profile.experienceYears || 0,
            skills: profile.skills ? profile.skills.join(', ') : '',
            bio: profile.bio || '',
            // pricing
            baseCharge: profile.pricing?.baseCharge || 0,
            inspectionCharge: profile.pricing?.inspectionCharge || 0,
            emergencyCharge: profile.pricing?.emergencyCharge || 0,
            // availability
            startTime: profile.availability?.startTime || '09:00',
            endTime: profile.availability?.endTime || '18:00',
            emergencyAvailable: profile.availability?.emergencyAvailable || false,
            // banking — DB field is `banking`, not `bankingDetails`
            accountHolderName: profile.banking?.accountHolderName || '',
            bankName: profile.banking?.bankName || '',
            accountNumber: profile.banking?.accountNumber || '',
            ifscCode: profile.banking?.ifscCode || '',
            upiId: profile.banking?.upiId || '',
          }));
        }
      } catch (error: any) {
        showToast.error('Failed to load profile details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // We will send name and phone too, so backend can update User model
      const updatePayload = {
        name: formData.name,
        phone: formData.phone,
        // personalDetails matches the DB nested schema
        personalDetails: {
          dob: formData.dob,
          gender: formData.gender,
        },
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          serviceRadiusKm: Number(formData.serviceRadiusKm),
        },
        experienceYears: Number(formData.experienceYears),
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        bio: formData.bio,
        pricing: {
          baseCharge: Number(formData.baseCharge),
          inspectionCharge: Number(formData.inspectionCharge),
          emergencyCharge: Number(formData.emergencyCharge),
        },
        availability: {
          startTime: formData.startTime,
          endTime: formData.endTime,
          emergencyAvailable: formData.emergencyAvailable,
        },
        // `banking` matches the DB field name (was incorrectly `bankingDetails`)
        banking: {
          accountHolderName: formData.accountHolderName,
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode,
          upiId: formData.upiId,
        }
      };

      const res = await axios.put('/api/technicians/me/profile', updatePayload);
      
      if (res.data.success) {
        showToast.success('Profile updated successfully');
        // Update user context if name or phone changed
        if (user && (user.name !== formData.name || user.phone !== formData.phone)) {
          const updatedUser = { ...user, name: formData.name, phone: formData.phone };
          login(localStorage.getItem('token') || '', updatedUser);
        }
      }
    } catch (error: any) {
      showToast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-[var(--color-primary-500)] border-t-transparent rounded-full animate-spin"></div></div>;
  }

  const tabItems = [
    { id: 'personal', label: 'Personal Details', icon: <User size={16} /> },
    { id: 'professional', label: 'Professional', icon: <Briefcase size={16} /> },
    { id: 'pricing', label: 'Availability', icon: <Clock size={16} /> },
    { id: 'banking', label: 'Banking', icon: <Building2 size={16} /> },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Avatar */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative shrink-0">
            <Avatar src={user?.avatar || ""} name={user?.name || "User"} size="xl" className="shadow-lg" />
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-[var(--color-primary-600)] text-white rounded-full flex items-center justify-center hover:bg-[var(--color-primary-700)] transition-colors border-2 border-[var(--bg-primary)] shadow-md">
              <Camera size={14} />
            </button>
          </div>
          <div className="text-center md:text-left flex-1">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">{formData.name}</h2>
            <p className="text-[var(--text-secondary)] font-medium flex items-center justify-center md:justify-start gap-2 mt-1">
              <Shield size={16} className="text-[var(--color-success)]" /> Verified Professional
            </p>
          </div>
          <div className="shrink-0 w-full md:w-auto">
             <Button onClick={handleSave} disabled={isSaving} className="w-full md:w-auto px-8">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
         <Tabs tabs={tabItems} activeTab={activeTab} onChange={setActiveTab} variant="pills" />
      </div>

      {/* Tab Content */}
      <Card className="p-6 md:p-8">
        
        {/* PERSONAL TAB */}
        {activeTab === 'personal' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className="text-lg font-bold border-b border-[var(--border-primary)] pb-3 mb-6">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} />
              <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} />
              <Input label="Date of Birth" type="date" name="dob" value={formData.dob} onChange={handleChange} />
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/50 focus:border-[var(--color-primary-500)] transition-all">
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <h3 className="text-lg font-bold border-b border-[var(--border-primary)] pb-3 mb-6 mt-8">Address Details</h3>
            <div className="space-y-6">
              <Input label="Street Address" name="street" value={formData.street} onChange={handleChange} icon={<MapPin size={18} />} />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <Input label="City" name="city" value={formData.city} onChange={handleChange} />
                <Input label="State" name="state" value={formData.state} onChange={handleChange} />
                <Input label="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} />
              </div>
              <Input label="Service Radius (km)" type="number" name="serviceRadiusKm" value={formData.serviceRadiusKm} onChange={handleChange} />
            </div>
          </div>
        )}

        {/* PROFESSIONAL TAB */}
        {activeTab === 'professional' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className="text-lg font-bold border-b border-[var(--border-primary)] pb-3 mb-6">Professional Profile</h3>
            <div className="grid grid-cols-1 gap-6">
              <Input label="Years of Experience" type="number" name="experienceYears" value={formData.experienceYears} onChange={handleChange} />
              <Input label="Skills (comma separated)" name="skills" value={formData.skills} onChange={handleChange} placeholder="e.g. AC Repair, Fan installation, Wiring" />
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Short Bio</label>
                <textarea 
                  name="bio" 
                  value={formData.bio} 
                  onChange={handleChange} 
                  rows={4} 
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/50 focus:border-[var(--color-primary-500)] transition-all resize-none"
                  placeholder="Tell customers about your expertise..."
                />
              </div>
            </div>
          </div>
        )}

        {/* PRICING & AVAILABILITY TAB */}
        {activeTab === 'pricing' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className="text-lg font-bold border-b border-[var(--border-primary)] pb-3 mb-6">Working Hours</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input label="Start Time" type="time" name="startTime" value={formData.startTime} onChange={handleChange} />
              <Input label="End Time" type="time" name="endTime" value={formData.endTime} onChange={handleChange} />
            </div>
            
            <label className="flex items-center gap-3 p-4 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl cursor-pointer hover:border-[var(--color-primary-300)] transition-colors mt-2">
              <input type="checkbox" name="emergencyAvailable" checked={formData.emergencyAvailable} onChange={handleChange} className="w-5 h-5 accent-[var(--color-primary-600)]" />
              <span className="font-medium">I am available for 24/7 Emergency Services</span>
            </label>

            <h3 className="text-lg font-bold border-b border-[var(--border-primary)] pb-3 mb-6 mt-8">Pricing Model (₹)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Input label="Base Charge / Hr" type="number" name="baseCharge" value={formData.baseCharge} onChange={handleChange} />
              <Input label="Inspection Charge" type="number" name="inspectionCharge" value={formData.inspectionCharge} onChange={handleChange} />
              <Input label="Emergency Premium" type="number" name="emergencyCharge" value={formData.emergencyCharge} onChange={handleChange} />
            </div>
          </div>
        )}

        {/* BANKING TAB */}
        {activeTab === 'banking' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className="text-lg font-bold border-b border-[var(--border-primary)] pb-3 mb-6">Bank Account Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Account Holder Name" name="accountHolderName" value={formData.accountHolderName} onChange={handleChange} />
              <Input label="Bank Name" name="bankName" value={formData.bankName} onChange={handleChange} />
              <Input label="Account Number" name="accountNumber" value={formData.accountNumber} onChange={handleChange} />
              <Input label="IFSC Code" name="ifscCode" value={formData.ifscCode} onChange={handleChange} />
            </div>
            <div className="pt-4 border-t border-[var(--border-primary)] mt-4">
              <Input label="UPI ID (Optional)" name="upiId" value={formData.upiId} onChange={handleChange} placeholder="e.g. phone@bank" />
            </div>
          </div>
        )}

      </Card>
    </div>
  );
}
