import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const footerLinks = {
  services: [
    { name: 'Electrical', path: '/category/electrical' },
    { name: 'Plumbing', path: '/category/plumbing' },
    { name: 'AC Repair', path: '/category/ac-repair' },
    { name: 'Painting', path: '/category/painting' },
    { name: 'Deep Cleaning', path: '/category/cleaning' },
    { name: 'All Services', path: '/services' },
  ],
  company: [
    { name: 'About Us', path: '/about' },
    { name: 'Careers', path: '/careers' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' },
    { name: 'FAQs', path: '/faq' },
  ],
  legal: [
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms & Conditions', path: '/terms' },
    { name: 'Refund Policy', path: '/refund' },
  ],
};

function FacebookIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}
function TwitterIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
    </svg>
  );
}
function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}
function LinkedinIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>
    </svg>
  );
}

const socialLinks = [
  { icon: TwitterIcon, href: '#', label: 'Twitter' },
  { icon: InstagramIcon, href: '#', label: 'Instagram' },
  { icon: LinkedinIcon, href: '#', label: 'LinkedIn' },
  { icon: FacebookIcon, href: '#', label: 'Facebook' },
];

export default function Footer() {
  return (
    <footer className="bg-[var(--bg-primary)] border-t border-[var(--border-primary)] pt-16 pb-8 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-[var(--color-primary-500)] to-transparent opacity-20"></div>
      
      <div className="container-app relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-8 mb-16">
          
          {/* Brand & Newsletter Column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Link to="/" className="flex items-center gap-2 group w-fit">
              <div className="w-8 h-8 rounded-[var(--radius-md)] bg-gradient-to-b from-[var(--color-primary-500)] to-[var(--color-primary-600)] flex items-center justify-center shadow-[var(--shadow-sm)] group-hover:shadow-[var(--shadow-glow)] transition-all">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                FixNow
              </span>
            </Link>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed max-w-sm">
              AI-powered service marketplace connecting you with verified technicians for reliable home repairs and maintenance.
            </p>

            <div className="mt-2">
              <form className="relative max-w-sm">
                <input
                  type="email"
                  placeholder="Subscribe to newsletter"
                  className="w-full pl-4 pr-12 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[var(--radius-lg)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--color-primary-500)] focus:ring-1 focus:ring-[var(--color-primary-500)] transition-all"
                />
                <button type="submit" className="absolute right-1.5 top-1.5 p-1.5 bg-[var(--color-primary-500)] text-white rounded-md hover:bg-[var(--color-primary-600)] transition-colors">
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-1">
            <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-5">Product</h4>
            <ul className="flex flex-col gap-3">
              {footerLinks.services.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm text-[var(--text-secondary)] hover:text-[var(--color-primary-500)] transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-1">
            <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-5">Company</h4>
            <ul className="flex flex-col gap-3">
              {footerLinks.company.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm text-[var(--text-secondary)] hover:text-[var(--color-primary-500)] transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-1">
            <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-5">Legal</h4>
            <ul className="flex flex-col gap-3">
              {footerLinks.legal.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm text-[var(--text-secondary)] hover:text-[var(--color-primary-500)] transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div className="lg:col-span-1">
            <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-5">Contact</h4>
            <ul className="flex flex-col gap-4">
              <li>
                <a href="mailto:hello@fixnow.ai" className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--color-primary-500)] transition-colors">
                  <Mail size={16} className="text-[var(--text-tertiary)]" /> hello@fixnow.ai
                </a>
              </li>
              <li>
                <a href="tel:+911234567890" className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--color-primary-500)] transition-colors">
                  <Phone size={16} className="text-[var(--text-tertiary)]" /> +91 12345 67890
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                <MapPin size={16} className="text-[var(--text-tertiary)] shrink-0 mt-0.5" /> 
                <span>Koramangala, <br/>Bangalore, India</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-[var(--border-primary)]">
          <p className="text-sm text-[var(--text-tertiary)]">
            © {new Date().getFullYear()} FixNow Inc. All rights reserved.
          </p>
          
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <social.icon size={20} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
