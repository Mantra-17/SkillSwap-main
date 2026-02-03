import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, Search, MessageSquare, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Brand } from "@/components/Brand";

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
      <nav className="border-b border-foreground/10 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Brand size="sm" />
            <div className="flex items-center space-x-2">
              <div className="h-8 w-20 bg-muted animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }
  
  return (
    <nav className="border-b border-foreground/10 bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Brand size="sm" />
          
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/browse"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                isActive("/browse") 
                  ? "bg-foreground text-background" 
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
                  ? "bg-foreground text-background" 
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
                  ? "bg-foreground text-background" 
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
