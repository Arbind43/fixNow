import { useParams, Link } from 'react-router-dom';
import { Button, Avatar, Badge } from '../../components/ui';
import { ShieldCheck, MapPin, Calendar, Briefcase, ThumbsUp, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';

const StarDisplay = ({ value }: { value: number }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map(s => (
      <Star key={s} size={14} className={s <= Math.round(value) ? 'text-amber-400 fill-amber-400' : 'text-zinc-600'} />
    ))}
  </div>
);

export default function TechnicianProfilePage() {
  const { id } = useParams();
  const [technician, setTechnician] = useState<any>(null);
  const [reviews, setReviews]       = useState<any[]>([]);
  const [isLoading, setIsLoading]   = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchAll = async () => {
      try {
        const [techRes, reviewRes] = await Promise.all([
          axios.get(`/api/technicians/${id}`),
          axios.get(`/api/reviews/technician/${id}`),
        ]);
        setTechnician(techRes.data.data);
        setReviews(reviewRes.data.data || []);
      } catch (error) {
        console.error('Error fetching technician:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  if (isLoading) {
    return (
      <div className="bg-[var(--bg-secondary)] min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!technician) {
    return (
      <div className="bg-[var(--bg-secondary)] min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Technician not found</h2>
        <Link to="/search"><Button>Back to Search</Button></Link>
      </div>
    );
  }

  const rating      = technician.rating || 0;
  const reviewCount = technician.reviewCount || reviews.length || 0;
  const joinedDate  = technician.createdAt
    ? new Date(technician.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'New';

  return (
    <div className="bg-[var(--bg-secondary)] min-h-screen">
      <div className="container-app max-w-5xl py-12 px-4">

        {/* Profile Hero Card */}
        <div className="bg-[var(--bg-primary)] rounded-[var(--radius-2xl)] border border-[var(--border-primary)] shadow-[var(--shadow-lg)] overflow-hidden mb-8">
          <div className="h-36 bg-gradient-to-br from-[var(--color-primary-800)] via-[var(--color-primary-700)] to-purple-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-60 h-60 bg-blue-400/20 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/20 rounded-full blur-[80px]" />
          </div>

          <div className="px-6 sm:px-8 pb-8">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 -mt-16 mb-6">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                <div className="relative">
                  <img
                    src={technician.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(technician.user?.name || 'T')}&background=f59e0b&color=fff&size=128`}
                    alt={technician.user?.name}
                    className="w-32 h-32 rounded-full border-4 border-[var(--bg-primary)] shadow-lg object-cover bg-white"
                  />
                  {technician.verificationStatus === 'verified' && (
                    <div className="absolute bottom-2 right-2 bg-emerald-500 text-white rounded-full p-1 border-2 border-[var(--bg-primary)]" title="Verified Technician">
                      <ShieldCheck size={16} />
                    </div>
                  )}
                </div>
                <div className="text-center md:text-left mb-2">
                  <h1 className="text-3xl font-bold text-[var(--text-primary)]">{technician.user?.name}</h1>
                  <p className="text-[var(--text-secondary)] flex items-center justify-center md:justify-start gap-2 mt-1">
                    <MapPin size={16} />
                    {technician.address?.city || 'India'}
                    {technician.address?.serviceRadiusKm ? ` · ${technician.address.serviceRadiusKm} km radius` : ''}
                  </p>
                  <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
                    <StarDisplay value={rating} />
                    <span className="text-sm text-[var(--text-tertiary)]">({reviewCount} reviews)</span>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-auto flex gap-3">
                <Link to="/dashboard/messages" className="flex-1 md:flex-none">
                  <Button variant="outline" className="w-full">Message</Button>
                </Link>
                <Link to="/dashboard/book-service" state={{ technician }} className="flex-1 md:flex-none">
                  <Button className="w-full">Book Service</Button>
                </Link>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-[var(--border-primary)]">
              {[
                { icon: <Star size={14} className="text-amber-500 fill-amber-500"/>, label: 'Rating', value: `${rating} (${reviewCount})` },
                { icon: <Briefcase size={14}/>, label: 'Experience', value: `${technician.experienceYears || 1} Years` },
                { icon: <ThumbsUp size={14}/>, label: 'Jobs Done', value: `${technician.completedJobs || reviewCount || 0}+` },
                { icon: <Calendar size={14}/>, label: 'Joined', value: joinedDate },
              ].map((stat, i) => (
                <div key={i} className={`text-center md:text-left ${i > 0 ? 'border-l border-[var(--border-primary)] pl-4' : ''}`}>
                  <p className="text-[var(--text-tertiary)] text-sm mb-1 flex items-center justify-center md:justify-start gap-1">{stat.icon} {stat.label}</p>
                  <p className="text-xl font-bold text-[var(--text-primary)]">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <h3 className="font-bold text-[var(--text-primary)] mb-2">About</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">{technician.bio || 'This professional is ready to provide top quality service.'}</p>
            </div>

            {technician.skills?.length > 0 && (
              <div className="mt-6">
                <h3 className="font-bold text-[var(--text-primary)] mb-3">Skills & Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {technician.skills.map((skill: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-full text-sm text-[var(--text-secondary)]">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing */}
            {technician.pricing && (
              <div className="mt-6 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                <h3 className="font-bold text-[var(--text-primary)] mb-3">Service Charges</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-[var(--text-tertiary)]">Base Charge</p>
                    <p className="font-bold text-amber-500">₹{technician.pricing.baseCharge || 0}</p>
                  </div>
                  <div>
                    <p className="text-[var(--text-tertiary)]">Inspection</p>
                    <p className="font-bold text-[var(--text-primary)]">₹{technician.pricing.inspectionCharge || 0}</p>
                  </div>
                  {technician.availability?.emergencyAvailable && (
                    <div>
                      <p className="text-[var(--text-tertiary)]">Emergency</p>
                      <p className="font-bold text-red-500">₹{technician.pricing.emergencyCharge || 0}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div className="bg-[var(--bg-primary)] rounded-2xl p-6 sm:p-8 border border-[var(--border-primary)] shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Customer Reviews</h2>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-extrabold text-amber-500">{rating}</span>
              <div>
                <StarDisplay value={rating} />
                <span className="text-xs text-[var(--text-tertiary)]">{reviewCount} reviews</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {reviews.length > 0 ? reviews.map((review: any) => (
              <div key={review._id} className="border-b border-[var(--border-primary)] last:border-0 pb-6 last:pb-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={review.customer?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.customer?.name || 'C')}&background=random&size=40`}
                      alt={review.customer?.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-[var(--text-primary)] text-sm">{review.customer?.name || 'Customer'}</p>
                      <StarDisplay value={review.rating} />
                    </div>
                  </div>
                  <span className="text-xs text-[var(--text-tertiary)] shrink-0">
                    {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-[var(--text-secondary)] text-sm mt-3 ml-13 leading-relaxed">{review.comment}</p>
                )}
              </div>
            )) : (
              <div className="text-center py-10">
                <Star size={40} className="text-[var(--text-tertiary)] mx-auto mb-3 opacity-40" />
                <p className="text-[var(--text-tertiary)]">No reviews yet.</p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">Be the first to book and review this technician!</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
