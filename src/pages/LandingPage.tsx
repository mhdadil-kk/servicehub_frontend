import React, { useEffect, useState } from 'react';
import { Search, Star, Home, Droplet, Zap, Truck, Calendar, Coffee, Globe, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import { serviceApi } from '../api/service.service';

const getCategoryIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('clean')) return Home;
  if (n.includes('plumb')) return Droplet;
  if (n.includes('electric')) return Zap;
  if (n.includes('move')) return Truck;
  if (n.includes('water')) return Droplet;
  return Coffee;
};

const getCategoryColor = (index: number) => {
  const colors = [
    "text-blue-500 bg-blue-50",
    "text-indigo-500 bg-indigo-50",
    "text-amber-500 bg-amber-50",
    "text-rose-500 bg-rose-50",
    "text-emerald-500 bg-emerald-50",
    "text-purple-500 bg-purple-50",
  ];
  return colors[index % colors.length];
};

const LandingPage: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        const [catRes, provRes] = await Promise.all([
          serviceApi.getActiveServices(),
          serviceApi.browseProviders({ limit: 3 })
        ]);
        setCategories((catRes as any).data?.slice(0, 8) || []);
        setProviders((provRes as any).data?.providers || []);
      } catch (error) {
        console.error("Error fetching landing page data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLandingData();
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center h-12">
              <img src={logo} alt="ServiceHub" className="h-full object-contain" />
            </div>

            <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500">
              <a href="#services" className="hover:text-blue-600 transition-colors">Services</a>
              <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How it Works</a>
              <Link to="/register?role=provider" className="hover:text-blue-600 transition-colors">Become a Provider</Link>
            </div>

            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-blue-600 px-4">Login</Link>
              <Link to="/register" className="bg-blue-600 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-40 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-blue-50/50 to-transparent -z-10" />

        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight">
            Book Trusted Local <span className="text-blue-600">Services</span> Easily
          </h1>
          <p className="mt-6 text-lg text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            Find and book top-rated local professionals for home cleaning, plumbing, electrical work, and more in just a few clicks.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login" className="bg-blue-600 text-white px-10 py-4 rounded-full font-black text-base shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all">
              Get Started Now
            </Link>
            <Link to="/register?role=provider" className="bg-white text-slate-900 border-2 border-slate-100 px-10 py-4 rounded-full font-black text-base hover:bg-slate-50 hover:-translate-y-1 transition-all">
              Join as a Professional
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-400">
            <span>Popular:</span>
            {categories.slice(0, 3).map((cat, i) => (
              <Link key={i} to="/login" className="text-slate-600 hover:text-blue-600 underline underline-offset-4 decoration-slate-200">
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* --- POPULAR CATEGORIES --- */}
      <section id="services" className="py-24 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-12">
            <h2 className="text-3xl font-black text-slate-900">Popular Categories</h2>
            <p className="text-slate-500 font-medium mt-1">Find the right professional for your needs</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 animate-pulse">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl mx-auto mb-6"></div>
                  <div className="h-4 bg-slate-100 rounded w-3/4 mx-auto mb-2"></div>
                  <div className="h-3 bg-slate-100 rounded w-1/2 mx-auto"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {categories.map((cat, i) => {
                const Icon = getCategoryIcon(cat.name);
                const colorClass = getCategoryColor(i);
                return (
                  <Link to="/login" key={cat._id} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer text-center block">
                    <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${colorClass}`}>
                      <Icon size={28} />
                    </div>
                    <h3 className="font-black text-slate-900 mb-1">{cat.name}</h3>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Book Now</p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* --- FEATURED PROVIDERS --- */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-black text-slate-900">Featured Providers</h2>
              <p className="text-slate-500 font-medium mt-1">Top-rated professionals in your area</p>
            </div>
            <Link to="/login" className="text-blue-600 font-black text-sm hover:underline flex items-center gap-1">
              View All Providers <span>&rarr;</span>
            </Link>
          </div>

          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[1, 2, 3].map(i => (
                 <div key={i} className="bg-white rounded-[32px] overflow-hidden border border-slate-100 h-96 animate-pulse">
                   <div className="h-56 bg-slate-100"></div>
                   <div className="p-8"><div className="h-4 bg-slate-100 rounded w-1/2 mb-2"></div><div className="h-4 bg-slate-100 rounded w-1/3"></div></div>
                 </div>
               ))}
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {providers.map((p) => (
                <div key={p._id} className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all group">
                  <div className="relative h-56 overflow-hidden bg-slate-100">
                    <img 
                      src={p.profilePhoto || p.userId?.profilePhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${p.userId?.name || 'User'}`} 
                      alt={p.userId?.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                      <Star size={14} className="text-amber-500 fill-amber-500" />
                      <span className="text-[11px] font-black text-slate-900">5.0</span>
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-black text-slate-900">{p.userId?.name || "Provider"}</h3>
                        <p className="text-sm font-bold text-blue-600">{p.serviceId?.name || "Service"}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full border-2 border-white shadow-md overflow-hidden -mt-12 relative z-10 bg-white">
                        <img src={p.profilePhoto || p.userId?.profilePhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${p.userId?.name || 'P'}`} alt="" className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Starts at</p>
                        <p className="text-2xl font-black text-slate-900">₹{p.hourlyRate || 500}<span className="text-sm text-slate-400">/hr</span></p>
                      </div>
                      <Link to="/login" className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-xs hover:bg-blue-600 transition-colors">
                        View Profile
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section id="how-it-works" className="py-24 bg-slate-50/50">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-black text-slate-900 mb-4">How It Works</h2>
          <p className="text-slate-500 font-medium mb-16 italic">Book your next service in 3 simple steps</p>

          <div className="relative flex flex-col md:flex-row justify-between items-center gap-12 md:gap-4">
            {/* Dotted Line Connector */}
            <div className="absolute top-1/2 left-1/4 right-1/4 h-px border-t-2 border-dotted border-slate-200 -z-10 hidden md:block" />

            {[
              { icon: Search, title: "1. Find", desc: "Search for any local service and compare ratings and prices from top pros." },
              { icon: Calendar, title: "2. Book", desc: "Choose a convenient time slot and book instantly with our secure payment system." },
              { icon: Coffee, title: "3. Relax", desc: "Your professional arrives on time and gets the job done right. Satisfaction guaranteed." },
            ].map((step, i) => (
              <div key={i} className="flex-1 max-w-xs bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <div className="w-16 h-16 mx-auto bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 transition-transform hover:scale-110">
                  <step.icon size={28} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">{step.title}</h3>
                <p className="text-sm font-medium text-slate-500 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="pt-24 pb-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 md:col-span-1">
              <div className="h-10 mb-6 flex items-center">
                <img src={logo} alt="ServiceHub" className="h-full object-contain" />
              </div>
              <p className="text-sm font-medium text-slate-400 leading-relaxed">
                The easiest way to find and book trusted local services in your neighborhood.
              </p>
              <div className="flex gap-4 mt-6">
                <a href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors border border-slate-100">
                  <Globe size={18} />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors border border-slate-100">
                  <Mail size={18} />
                </a>
              </div>
            </div>

            {[
              { title: "ServiceHub", links: ["About Us", "Careers", "Blog", "Contact"] },
              { title: "Support", links: ["Help Center", "Safety", "Terms of Service", "Privacy Policy"] },
              { title: "Become a Pro", links: ["Partner with us", "Provider Dashboard", "Success Stories", "Pro Benefits"] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-black text-slate-900 mb-6 uppercase text-[11px] tracking-widest">{col.title}</h4>
                <ul className="space-y-4">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className="text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">
            <p>&copy; 2024 ServiceHub All rights reserved.</p>
            <div className="flex gap-8">
              <span>English (IN)</span>
              <span>₹ INR</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

