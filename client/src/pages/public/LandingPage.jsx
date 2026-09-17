import { Link } from 'react-router-dom';
import { ShoppingBag, Shield, Zap, Heart, ArrowRight } from 'lucide-react';

const features = [
  { icon: Shield, title: 'Campus-Verified', desc: 'Only verified students from your campus can access the marketplace.' },
  { icon: Zap,    title: 'Instant Listings', desc: 'List your items in minutes with photos, price, and meeting point.' },
  { icon: Heart,  title: 'Free Items',       desc: 'Give away things you no longer need — set the price to ₹0.' },
];

const categories = [
  '📱 Electronics', '📚 Books', '🛋 Furniture', '🚲 Cycles',
  '👕 Clothing', '🏠 Hostel Items', '📝 Study Materials', '⚽ Sports',
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <ShoppingBag className="w-7 h-7 text-indigo-600" />
            <span className="font-bold text-gray-900 text-lg">
              Campus<span className="text-indigo-600">Resale</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login"    className="text-sm text-gray-600 hover:text-gray-900 font-medium px-3 py-2">Login</Link>
            <Link to="/register" className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-20 pb-28 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full mb-6">
            🎓 Campus-exclusive marketplace
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
            Buy & Sell Within{' '}
            <span className="text-indigo-600">Your Campus</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
            Find what you need. Sell what you don't.{' '}
            <span className="font-semibold text-emerald-600">Give it away if you want.</span>
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/register"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-indigo-200"
            >
              Sell an Item <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-6 py-3 rounded-xl border border-gray-200 transition-colors"
            >
              Browse Listings
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">Why CampusResale?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center p-6 rounded-2xl bg-gray-50 hover:bg-indigo-50 transition-colors">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories preview */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Browse by Category</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <Link
                key={cat}
                to="/login"
                className="bg-white hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 text-gray-700 hover:text-indigo-700 text-sm font-medium px-4 py-2 rounded-full transition-all"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-indigo-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to start?</h2>
          <p className="text-indigo-200 mb-8">Register with your college email and start buying or selling today.</p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-white text-indigo-600 font-bold px-8 py-3 rounded-xl hover:bg-indigo-50 transition-colors"
          >
            Join Your Campus Marketplace
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-gray-500 border-t border-gray-100">
        © {new Date().getFullYear()} CampusResale · Campus-exclusive marketplace
      </footer>
    </div>
  );
}
