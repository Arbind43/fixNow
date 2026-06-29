import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, MapPin, Briefcase, FileCheck, Building2, Clock, CheckCircle2,
  ChevronRight, ChevronLeft, Upload, Loader2, Wrench
} from 'lucide-react';
import { showToast } from '../../components/ui/Toast';
import { useAuth } from '../../context/AuthContext';

const STEPS = [
  { id: 1, title: 'Basic Info', icon: User },
  { id: 2, title: 'Personal', icon: MapPin },
  { id: 3, title: 'Professional', icon: Briefcase },
  { id: 4, title: 'Documents', icon: FileCheck },
  { id: 5, title: 'Banking', icon: Building2 },
  { id: 6, title: 'Pricing', icon: Clock },
  { id: 7, title: 'Review', icon: CheckCircle2 },
];

const inputCls = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/50 focus:bg-white/10 transition-all text-sm";
const labelCls = "block text-sm font-semibold text-white/70 mb-1.5";

const InputField = ({ label, ...props }: any) => (
  <div>
    <label className={labelCls}>{label}</label>
    <input className={inputCls} {...props} />
  </div>
);

export default function TechnicianRegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', password: '',
    dob: '', gender: '', street: '', city: '', state: '', pincode: '', serviceRadiusKm: '10',
    categoryId: '', experienceYears: '', skills: '', bio: '',
    accountHolderName: '', bankName: '', accountNumber: '', ifscCode: '', upiId: '',
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    startTime: '09:00', endTime: '18:00', emergencyAvailable: false,
    baseCharge: '', inspectionCharge: '', emergencyCharge: '',
  });

  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    profilePhoto: null, aadhaarCard: null, panCard: null, drivingLicense: null, tradeCertificate: null,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('/api/categories');
        setCategories(res.data.data);
      } catch (err) {
        console.error('Failed to fetch categories');
      }
    };
    fetchCategories();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({ ...prev, [fieldName]: e.target.files![0] }));
    }
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        if (!formData.fullName || !formData.email || !formData.phone || !formData.password) {
          showToast.error('Please fill all basic information'); return false;
        }
        return true;
      case 2:
        if (!formData.dob || !formData.city || !formData.state || !formData.pincode || !files.profilePhoto) {
          showToast.error('Please fill all personal details including profile photo'); return false;
        }
        return true;
      case 3:
        if (!formData.categoryId || !formData.experienceYears) {
          showToast.error('Please select category and experience'); return false;
        }
        return true;
      case 4:
        if (!files.aadhaarCard) {
          showToast.error('Aadhaar Card is mandatory'); return false;
        }
        return true;
      case 5:
        if (!formData.accountNumber || !formData.ifscCode) {
          showToast.error('Bank account number and IFSC are required'); return false;
        }
        return true;
      case 6:
        if (!formData.baseCharge) {
          showToast.error('Base charge is required'); return false;
        }
        return true;
      default: return true;
    }
  };

  const nextStep = () => { if (validateStep(currentStep)) setCurrentStep(prev => Math.min(prev + 1, 7)); };
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    if (!validateStep(6)) return;
    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, typeof value === 'boolean' ? String(value) : value as string);
      });
      Object.entries(files).forEach(([key, file]) => {
        if (file) submitData.append(key, file);
      });

      const res = await axios.post('/api/technician/register', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        showToast.success(res.data.message);
        if (res.data.data.token && res.data.data.user) {
          login(res.data.data.token, res.data.data.user);
        }
        navigate('/technician/dashboard');
      }
    } catch (err: any) {
      showToast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white mb-6">Basic Information</h2>
      <InputField label="Full Name *" name="fullName" value={formData.fullName} onChange={handleInputChange} />
      <InputField label="Email Address *" type="email" name="email" value={formData.email} onChange={handleInputChange} />
      <InputField label="Mobile Number *" type="tel" name="phone" value={formData.phone} onChange={handleInputChange} />
      <InputField label="Password *" type="password" name="password" value={formData.password} onChange={handleInputChange} />
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white mb-6">Personal & Address</h2>
      <div className="grid grid-cols-2 gap-4">
        <InputField label="Date of Birth *" type="date" name="dob" value={formData.dob} onChange={handleInputChange} />
        <div>
          <label className={labelCls}>Gender</label>
          <select name="gender" value={formData.gender} onChange={handleInputChange} className={inputCls}>
            <option value="">Select...</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      <div>
        <label className={labelCls}>Profile Photo *</label>
        <div className="relative border-2 border-dashed border-white/20 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors cursor-pointer group overflow-hidden bg-white/5">
          <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'profilePhoto')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
          {files.profilePhoto ? (
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-amber-500 mb-3 shadow-md">
                <img src={URL.createObjectURL(files.profilePhoto)} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <span className="text-sm font-medium text-amber-500">{files.profilePhoto.name}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Upload size={24} />
              </div>
              <span className="text-sm font-medium text-white">Click to upload photo</span>
              <span className="text-xs text-white/50 mt-1">PNG, JPG up to 5MB</span>
            </div>
          )}
        </div>
      </div>
      <div className="pt-2">
        <h3 className="font-semibold text-white mb-3">Address</h3>
        <InputField label="Street" name="street" value={formData.street} onChange={handleInputChange} />
        <div className="grid grid-cols-3 gap-4 mt-4">
          <InputField label="City *" name="city" value={formData.city} onChange={handleInputChange} />
          <InputField label="State *" name="state" value={formData.state} onChange={handleInputChange} />
          <InputField label="Pincode *" name="pincode" value={formData.pincode} onChange={handleInputChange} />
        </div>
        <div className="mt-4">
          <InputField label="Service Radius (km) *" type="number" name="serviceRadiusKm" value={formData.serviceRadiusKm} onChange={handleInputChange} />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white mb-6">Professional Information</h2>
      <div>
        <label className={labelCls}>Primary Service Category *</label>
        <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} className={inputCls}>
          <option value="" className="text-black">Select Category</option>
          {categories.map(c => <option key={c._id} value={c._id} className="text-black">{c.name}</option>)}
        </select>
      </div>
      <InputField label="Years of Experience *" type="number" name="experienceYears" value={formData.experienceYears} onChange={handleInputChange} />
      <InputField label="Skills (comma separated)" name="skills" value={formData.skills} onChange={handleInputChange} placeholder="e.g. AC Repair, Fridge Repair" />
      <div>
        <label className={labelCls}>Short Bio</label>
        <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows={3} className={inputCls} placeholder="Tell customers about yourself..."></textarea>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white mb-6">Document Verification</h2>
      <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-200 rounded-xl text-sm mb-6">
        Your documents are securely stored and only used for verification purposes.
      </div>
      
      <div className="space-y-4">
        {[
          { label: 'Aadhaar Card', name: 'aadhaarCard', req: true },
          { label: 'PAN Card', name: 'panCard', req: false },
          { label: 'Driving License', name: 'drivingLicense', req: false },
          { label: 'Trade Certificate', name: 'tradeCertificate', req: false },
        ].map(doc => (
          <div key={doc.name} className="border border-white/10 bg-white/5 rounded-xl p-4">
            <h3 className="font-semibold text-sm mb-3 flex justify-between text-white">
              {doc.label} 
              {doc.req ? <span className="text-red-400">* Required</span> : <span className="text-white/40">Optional</span>}
            </h3>
            <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileChange(e, doc.name)} className="text-sm w-full text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-500 file:text-white hover:file:bg-amber-600 transition-all" />
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white mb-6">Banking Details</h2>
      <InputField label="Account Holder Name *" name="accountHolderName" value={formData.accountHolderName} onChange={handleInputChange} />
      <InputField label="Bank Name" name="bankName" value={formData.bankName} onChange={handleInputChange} />
      <InputField label="Account Number *" name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} />
      <InputField label="IFSC Code *" name="ifscCode" value={formData.ifscCode} onChange={handleInputChange} />
      <InputField label="UPI ID (Optional)" name="upiId" value={formData.upiId} onChange={handleInputChange} placeholder="e.g. name@okhdfcbank" />
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white mb-6">Availability & Pricing</h2>
      <div className="grid grid-cols-2 gap-4">
        <InputField label="Start Time *" type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} />
        <InputField label="End Time *" type="time" name="endTime" value={formData.endTime} onChange={handleInputChange} />
      </div>
      <label className="flex items-center gap-3 text-sm mt-4 cursor-pointer p-4 bg-white/5 border border-white/10 rounded-xl text-white">
        <input type="checkbox" name="emergencyAvailable" checked={formData.emergencyAvailable} onChange={handleInputChange} className="w-5 h-5 accent-amber-500 rounded" />
        I am available for 24/7 Emergency Services
      </label>
      
      <div className="pt-6">
        <h3 className="font-semibold text-white mb-4">Pricing Structure (₹)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField label="Base Charge / Hr *" type="number" name="baseCharge" value={formData.baseCharge} onChange={handleInputChange} />
          <InputField label="Inspection Charge" type="number" name="inspectionCharge" value={formData.inspectionCharge} onChange={handleInputChange} />
          <InputField label="Emergency Premium" type="number" name="emergencyCharge" value={formData.emergencyCharge} onChange={handleInputChange} />
        </div>
      </div>
    </div>
  );

  const renderStep7 = () => (
    <div className="space-y-6 text-center py-8">
      <div className="w-24 h-24 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(16,185,129,0.2)]">
        <CheckCircle2 size={48} />
      </div>
      <h2 className="text-3xl font-extrabold text-white">Ready to Submit!</h2>
      <p className="text-white/60 max-w-md mx-auto">
        You've completed all the steps. Your application will be submitted for Admin Review. 
        Once verified, you can start accepting bookings!
      </p>
      
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-left space-y-3 mt-6 text-sm mx-auto max-w-sm">
        <div className="flex justify-between border-b border-white/10 pb-3">
          <span className="text-white/50">Name:</span>
          <span className="font-semibold text-white">{formData.fullName}</span>
        </div>
        <div className="flex justify-between border-b border-white/10 pb-3">
          <span className="text-white/50">Email:</span>
          <span className="font-semibold text-white">{formData.email}</span>
        </div>
        <div className="flex justify-between border-b border-white/10 pb-3">
          <span className="text-white/50">City:</span>
          <span className="font-semibold text-white">{formData.city}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/50">Documents:</span>
          <span className="font-semibold text-white">Aadhaar {files.panCard && ', PAN'} {files.drivingLicense && ', License'}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f1117] flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white/5 border-b border-white/10 sticky top-0 z-20 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
              <Wrench size={22} className="text-white" />
            </div>
            Fix<span className="text-amber-500">Now</span> Pro
          </Link>
          <div className="text-sm font-semibold text-amber-500 px-4 py-2 bg-amber-500/10 rounded-full border border-amber-500/20">
            Step {currentStep} of 7
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-1 w-full bg-white/5 flex relative">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(245,158,11,0.5)]"
            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12 flex flex-col">
        {/* Steps Tracker */}
        <div className="hidden md:flex items-center justify-between mb-12 relative">
          <div className="absolute top-6 left-0 right-0 h-0.5 bg-white/10 -z-10" />
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isDone = step.id < currentStep;
            return (
              <div key={step.id} className="flex flex-col items-center gap-3 shrink-0 w-24">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-4 border-[#0f1117] ${
                  isActive ? 'bg-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.4)] scale-110' : 
                  isDone ? 'bg-amber-500/20 text-amber-500' : 
                  'bg-white/10 text-white/30'
                }`}>
                  <Icon size={isActive ? 22 : 18} />
                </div>
                <span className={`text-[11px] font-bold text-center uppercase tracking-wider ${isActive ? 'text-amber-500' : isDone ? 'text-white/80' : 'text-white/30'}`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Form Card */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl flex-1 backdrop-blur-xl relative overflow-hidden">
          {/* Decorative blobs */}
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-amber-500/10 rounded-full blur-[100px]" />
          <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px]" />
          
          <div className="relative z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
                {currentStep === 4 && renderStep4()}
                {currentStep === 5 && renderStep5()}
                {currentStep === 6 && renderStep6()}
                {currentStep === 7 && renderStep7()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8">
          <button 
            onClick={prevStep} 
            disabled={currentStep === 1 || isSubmitting}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-all disabled:opacity-30"
          >
            <ChevronLeft size={18} /> Back
          </button>
          
          {currentStep < 7 ? (
            <button 
              onClick={nextStep} 
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] disabled:opacity-50"
            >
              Continue <ChevronRight size={18} />
            </button>
          ) : (
            <button 
              onClick={handleSubmit} 
              disabled={isSubmitting} 
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] disabled:opacity-50 min-w-[200px]"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
