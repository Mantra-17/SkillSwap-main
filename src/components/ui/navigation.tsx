import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, Search, MessageSquare, Settings, Users, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

// Custom Logo Component
const CustomLogo = () => (
  <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
    <div className="relative w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 p-1 shadow-lg">
      {/* Gear Icon - Left Side */}
      <div className="absolute left-1 top-1 w-4 h-4">
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
          {/* Main gear body */}
          <path 
            d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" 
            fill="white" 
            stroke="white" 
            strokeWidth="0.5"
          />
          {/* Center circle */}
          <circle cx="12" cy="12" r="2" fill="white" stroke="white" strokeWidth="0.5"/>
          {/* Gear teeth details */}
          <path 
            d="M12 6L12 18M6 12L18 12" 
            stroke="white" 
            strokeWidth="1" 
            strokeLinecap="round"
          />
        </svg>
      </div>
      
      {/* Human Head Icon - Right Side */}
      <div className="absolute right-1 bottom-1 w-4 h-4">
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
          {/* Head circle */}
          <circle cx="12" cy="8" r="4" fill="white" stroke="white" strokeWidth="0.5"/>
          {/* Body/neck */}
          <path 
            d="M6 18C6 15.7909 8.79086 14 12 14C15.2091 14 18 15.7909 18 18" 
            fill="white" 
            stroke="white" 
            strokeWidth="0.5"
          />
          {/* Eye dot */}
          <circle cx="10" cy="7" r="1" fill="white"/>
        </svg>
      </div>
      
      {/* Connecting Arrows - Forming a loop */}
      <div className="absolute inset-0">
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
          {/* Top arrow: Gear to Human */}
          <path 
            d="M18 6C18 6 20 8 20 12C20 16 18 18 18 18" 
            stroke="white" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            fill="none"
          />
          {/* Arrow head for top arrow */}
          <path 
            d="M18 18L16 16L18 18L20 16" 
            stroke="white" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            fill="none"
          />
          
          {/* Bottom arrow: Human to Gear */}
          <path 
            d="M6 18C6 18 4 16 4 12C4 8 6 6 6 6" 
            stroke="white" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            fill="none"
          />
          {/* Arrow head for bottom arrow */}
          <path 
            d="M6 6L8 8L6 6L4 8" 
            stroke="white" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>
    </div>
    
    {/* Brand Text - "Skill" in darker blue, "Swap" in lighter blue/cyan */}
    <span className="text-xl font-bold">
      <span className="text-blue-700">Skill</span>
      <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Swap</span>
    </span>
  </Link>
);

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User'
        });
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Navigation auth state changed:', event, session);
      
      if (event === 'SIGNED_IN' && session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User'
        });
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);
  
  const isActive = (path: string) => location.pathname === path;
  
  const handleSignOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
      } else {
        setUser(null);
        navigate('/');
        // Reload to clear any cached state
        window.location.reload();
      }
    } catch (error) {
      console.error('Sign out exception:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <CustomLogo />
            <div className="flex items-center space-x-2">
              <div className="h-8 w-20 bg-muted animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }
  
  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <CustomLogo />
          
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/browse"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                isActive("/browse") 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <Search className="h-4 w-4" />
              <span>Browse Skills</span>
            </Link>
            
            <Link
              to="/requests"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                isActive("/requests") 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Requests</span>
            </Link>
            
            <Link
              to="/profile"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                isActive("/profile") 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-2">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:block">
                  Welcome, {user.name}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSignOut}
                  disabled={loading}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {loading ? "Signing Out..." : "Sign Out"}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/signin">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/signin">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}