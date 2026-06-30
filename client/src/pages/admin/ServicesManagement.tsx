import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit2, CheckCircle, XCircle, Tag } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';

export default function ServicesManagement() {
  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'categories' | 'services'>('categories');
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [showCatForm, setShowCatForm] = useState(false);
  const [catForm, setCatForm] = useState({ name: '', slug: '', description: '', icon: 'Wrench', image: '' });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, svcRes] = await Promise.all([
        axios.get('/api/categories'),
        axios.get('/api/services'),
      ]);
      setCategories(catRes.data.data || catRes.data);
      setServices(svcRes.data.data || svcRes.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleEditCategory = (cat: any) => {
    setEditingCategory(cat);
    setCatForm({
      name:        cat.name,
      slug:        cat.slug,
      description: cat.description,
      icon:        cat.icon,
      image:       cat.image || '',
    });
    setShowCatForm(true);
  };

  const handleNewCategory = () => {
    setEditingCategory(null);
    setCatForm({ name: '', slug: '', description: '', icon: 'Wrench', image: '' });
    setShowCatForm(true);
  };

  const handleSaveCategory = async () => {
    if (!catForm.name || !catForm.description) {
      toast.error('Name and description are required');
      return;
    }
    const slug = catForm.slug || catForm.name.toLowerCase().replace(/\s+/g, '-');
    setSaving(true);
    try {
      if (editingCategory) {
        await axios.patch(`/api/admin/categories/${editingCategory._id}`, { ...catForm, slug });
        toast.success('Category updated');
      } else {
        await axios.post('/api/admin/categories', { ...catForm, slug });
        toast.success('Category created');
      }
      setShowCatForm(false);
      fetchData();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await axios.delete(`/api/admin/categories/${id}`);
      toast.success('Category deleted');
      fetchData();
    } catch {
      toast.error('Delete failed');
    }
  };

  const toggleServiceActive = async (svc: any) => {
    try {
      await axios.put(`/api/services/${svc._id}`, { isActive: !svc.isActive });
      toast.success(`Service ${!svc.isActive ? 'activated' : 'deactivated'}`);
      fetchData();
    } catch {
      toast.error('Failed to update service');
    }
  };

  return (
    <AdminLayout>
      {showCatForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)' }}>
            <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-primary)' }}>
              <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>
                {editingCategory ? 'Edit Category' : 'New Category'}
              </h3>
              <button onClick={() => setShowCatForm(false)} className="text-sm px-3 py-1.5 rounded-lg border"
                style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}>✕</button>
            </div>
            <div className="p-5 space-y-4">
              {(['name', 'slug', 'description', 'icon', 'image'] as const).map(field => (
                <div key={field}>
                  <label className="block text-sm font-medium mb-1.5 capitalize" style={{ color: 'var(--text-primary)' }}>
                    {field}{field === 'slug' ? ' (auto-generated if blank)' : ''}
                  </label>
                  <input
                    value={catForm[field]}
                    onChange={e => setCatForm(prev => ({ ...prev, [field]: e.target.value }))}
                    placeholder={field === 'image' ? 'https://...' : `Category ${field}`}
                    className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none"
                    style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                  />
                </div>
              ))}
              <button onClick={handleSaveCategory} disabled={saving}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                {saving ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Services & Categories</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
              {categories.length} categories · {services.length} services
            </p>
          </div>
          {activeTab === 'categories' && (
            <button onClick={handleNewCategory}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
              <Plus size={15} /> New Category
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {(['categories', 'services'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all border"
              style={{
                background:  activeTab === tab ? '#6366f1' : 'var(--bg-elevated)',
                color:       activeTab === tab ? '#fff'    : 'var(--text-secondary)',
                borderColor: activeTab === tab ? '#6366f1' : 'var(--border-primary)',
              }}>
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 rounded-xl animate-pulse" style={{ background: 'var(--border-primary)' }} />
            ))}
          </div>
        ) : activeTab === 'categories' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(cat => (
              <div key={cat._id} className="rounded-xl border p-5 transition-all hover:shadow-lg"
                style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-primary)' }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {cat.image && (
                      <img src={cat.image} alt={cat.name}
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                        onError={e => (e.currentTarget.style.display = 'none')} />
                    )}
                    <div>
                      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{cat.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>/{cat.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => handleEditCategory(cat)} className="p-1.5 rounded-lg"
                      style={{ color: 'var(--text-tertiary)' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-secondary)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDeleteCategory(cat._id)} className="p-1.5 rounded-lg"
                      style={{ color: '#ef4444' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-xs mt-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{cat.description}</p>
                <div className="flex items-center gap-2 mt-3">
                  <Tag size={12} style={{ color: 'var(--text-tertiary)' }} />
                  <span className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>{cat.icon}</span>
                  <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {cat.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border-primary)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--bg-secondary)' }}>
                  {['Service', 'Category', 'Base Price', 'Duration', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                      style={{ color: 'var(--text-tertiary)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {services.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-16 text-sm" style={{ color: 'var(--text-tertiary)' }}>No services found</td></tr>
                ) : services.map(svc => (
                  <tr key={svc._id} className="border-t transition-colors"
                    style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-elevated)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-secondary)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)'}>
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{svc.name}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{svc.category?.name || '—'}</td>
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>₹{svc.basePrice}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{svc.estimatedDuration || svc.duration || '—'} min</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${svc.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {svc.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleServiceActive(svc)}
                        className="p-1.5 rounded-lg"
                        style={{ color: svc.isActive ? '#f59e0b' : '#22c55e' }}
                        title={svc.isActive ? 'Deactivate' : 'Activate'}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-secondary)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                        {svc.isActive ? <XCircle size={16} /> : <CheckCircle size={16} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

