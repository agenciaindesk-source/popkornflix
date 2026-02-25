import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { Play, Search, Info, Plus, ChevronRight, Star, Clock, List, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className={cn(
      "fixed top-0 w-full z-50 transition-colors duration-300 px-4 md:px-12 py-4 flex items-center justify-between",
      isScrolled ? "bg-black/90 backdrop-blur-md" : "bg-gradient-to-b from-black/80 to-transparent"
    )}>
      <div className="flex items-center gap-8">
        <Link to="/" className="text-red-600 text-2xl md:text-3xl font-black tracking-tighter">
          POPKORNFLIX
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <Link to="/series" className="hover:text-white transition-colors">TV Shows</Link>
          <Link to="/movies" className="hover:text-white transition-colors">Movies</Link>
          <Link to="/latest" className="hover:text-white transition-colors">New & Popular</Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <form onSubmit={handleSearch} className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-white" />
          <input
            type="text"
            placeholder="Titles, people, genres"
            className="bg-black/40 border border-white/10 rounded-full py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-600/50 w-32 md:w-64 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
        <button className="md:hidden text-white">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </nav>
  );
};

const VideoPlayer = ({ src, title }: { src: string; title: string }) => {
  return (
    <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
      <iframe
        src={src}
        title={title}
        className="absolute inset-0 w-full h-full"
        allowFullScreen
        sandbox="allow-forms allow-scripts allow-same-origin allow-presentation"
      />
    </div>
  );
};

const ContentCard = ({ item }: { item: any }) => {
  return (
    <Link 
      to={`/watch/${item.slug}`}
      className="relative group aspect-[2/3] rounded-md overflow-hidden bg-zinc-900 transition-transform duration-300 hover:scale-105 hover:z-10"
    >
      <img
        src={item.posterUrl || `https://picsum.photos/seed/${item.id}/400/600`}
        alt={item.title}
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        <h3 className="text-white font-bold text-sm leading-tight mb-1">{item.title}</h3>
        <div className="flex items-center gap-2 text-[10px] text-gray-300">
          <span className="text-green-500 font-semibold">98% Match</span>
          <span>{item.year}</span>
          <span className="border border-white/20 px-1 rounded">HD</span>
        </div>
      </div>
    </Link>
  );
};

// --- Pages ---

const HomePage = () => {
  const [content, setContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/content')
      .then(res => res.json())
      .then(data => {
        setContent(data);
        setLoading(false);
      });
  }, []);

  const featured = content[0];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      {featured && (
        <section className="relative h-[80vh] w-full overflow-hidden">
          <img
            src={featured.bannerUrl || featured.posterUrl || `https://picsum.photos/seed/hero/1920/1080`}
            alt={featured.title}
            className="w-full h-full object-cover opacity-60"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          
          <div className="absolute bottom-24 left-4 md:left-12 max-w-2xl">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-black mb-4"
            >
              {featured.title}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-300 mb-8 line-clamp-3"
            >
              {featured.description || "In a world where everything is possible, one hero stands alone to face the ultimate challenge. Experience the thrill of Popkornflix Originals."}
            </motion.p>
            <div className="flex items-center gap-4">
              <Link to={`/watch/${featured.slug}`} className="bg-white text-black px-8 py-3 rounded-md font-bold flex items-center gap-2 hover:bg-white/90 transition-colors">
                <Play className="w-5 h-5 fill-current" /> Play
              </Link>
              <button className="bg-gray-500/50 text-white px-8 py-3 rounded-md font-bold flex items-center gap-2 hover:bg-gray-500/40 transition-colors backdrop-blur-md">
                <Info className="w-5 h-5" /> More Info
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Content Rows */}
      <main className="px-4 md:px-12 -mt-12 relative z-10 pb-24 space-y-12">
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            Trending Now <ChevronRight className="w-4 h-4 text-red-600" />
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {content.map(item => (
              <ContentCard key={item.id} item={item} />
            ))}
            {loading && Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-zinc-900 animate-pulse rounded-md" />
            ))}
          </div>
        </section>

        {!loading && content.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-4">No content found. Try syncing the database.</p>
            <button 
              onClick={() => fetch('/api/cron/sync', { method: 'POST' }).then(() => window.location.reload())}
              className="bg-red-600 px-6 py-2 rounded-md font-bold"
            >
              Sync Database
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

const WatchPage = () => {
  const { slug } = useParams();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/content/${slug}`)
      .then(res => res.json())
      .then(data => {
        setItem(data);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!item) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Content not found</div>;

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-4 md:px-12 pb-24">
      <div className="max-w-6xl mx-auto space-y-8">
        <VideoPlayer 
          src={`https://vidsrc.to/embed/${item.type}/${item.slug}`} 
          title={item.title} 
        />
        
        <div className="grid md:grid-cols-3 gap-12">
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl md:text-4xl font-black">{item.title}</h1>
              <div className="flex items-center gap-4">
                <button className="p-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors"><Plus className="w-6 h-6" /></button>
                <button className="p-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors"><Star className="w-6 h-6" /></button>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="text-green-500 font-bold">98% Match</span>
              <span>{item.year}</span>
              <span className="border border-white/20 px-1.5 rounded text-[10px] font-bold">TV-MA</span>
              <span>{item.type === 'series' ? '8 Seasons' : '2h 15m'}</span>
              <span className="border border-white/20 px-1.5 rounded text-[10px] font-bold">4K</span>
            </div>

            <p className="text-lg text-gray-300 leading-relaxed">
              {item.description || "An epic journey through time and space, where the boundaries of reality are blurred and the fate of humanity hangs in the balance. Popkornflix presents a masterpiece of storytelling."}
            </p>

            <div className="space-y-2">
              <p className="text-sm"><span className="text-gray-500">Cast:</span> Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page</p>
              <p className="text-sm"><span className="text-gray-500">Genres:</span> Sci-Fi, Action, Thriller</p>
              <p className="text-sm"><span className="text-gray-500">This movie is:</span> Mind-bending, Suspenseful, Exciting</p>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-bold">Episodes</h3>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {item.episodes?.length > 0 ? item.episodes.map((ep: any) => (
                <div key={ep.id} className="flex gap-4 p-2 rounded-md hover:bg-white/5 transition-colors cursor-pointer group">
                  <div className="relative w-32 aspect-video bg-zinc-800 rounded overflow-hidden flex-shrink-0">
                    <img src={ep.thumbnailUrl || `https://picsum.photos/seed/${ep.id}/160/90`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="w-6 h-6 fill-white" />
                    </div>
                  </div>
                  <div className="flex flex-col justify-center">
                    <h4 className="font-bold text-sm">{ep.number}. {ep.title}</h4>
                    <p className="text-xs text-gray-500">45m</p>
                  </div>
                </div>
              )) : (
                <div className="text-gray-500 text-sm italic">No episodes available for this title.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SearchPage = () => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const query = new URLSearchParams(window.location.search).get('q');

  useEffect(() => {
    if (query) {
      setLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
          setResults(data);
          setLoading(false);
        });
    }
  }, [query]);

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-4 md:px-12 pb-24">
      <h1 className="text-2xl font-bold mb-8">Search results for: <span className="text-gray-400">{query}</span></h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {results.map(item => (
          <ContentCard key={item.id} item={item} />
        ))}
        {loading && Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-[2/3] bg-zinc-900 animate-pulse rounded-md" />
        ))}
      </div>
      {!loading && results.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          No matches found for "{query}"
        </div>
      )}
    </div>
  );
};

// --- Main App ---

export default function App() {
  return (
    <Router>
      <div className="bg-black min-h-screen font-sans selection:bg-red-600 selection:text-white">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/watch/:slug" element={<WatchPage />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
        
        <footer className="px-4 md:px-12 py-12 border-t border-white/10 text-gray-500 text-sm">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="space-y-4">
              <p className="hover:underline cursor-pointer">Audio Description</p>
              <p className="hover:underline cursor-pointer">Investor Relations</p>
              <p className="hover:underline cursor-pointer">Legal Notices</p>
            </div>
            <div className="space-y-4">
              <p className="hover:underline cursor-pointer">Help Center</p>
              <p className="hover:underline cursor-pointer">Jobs</p>
              <p className="hover:underline cursor-pointer">Cookie Preferences</p>
            </div>
            <div className="space-y-4">
              <p className="hover:underline cursor-pointer">Gift Cards</p>
              <p className="hover:underline cursor-pointer">Terms of Use</p>
              <p className="hover:underline cursor-pointer">Corporate Information</p>
            </div>
            <div className="space-y-4">
              <p className="hover:underline cursor-pointer">Media Center</p>
              <p className="hover:underline cursor-pointer">Privacy</p>
              <p className="hover:underline cursor-pointer">Contact Us</p>
            </div>
          </div>
          <div className="text-center">
            <p className="mb-4">© 2026 POPKORNFLIX, Inc.</p>
            <p className="text-[10px] uppercase tracking-widest">Built with passion for cinema</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}
