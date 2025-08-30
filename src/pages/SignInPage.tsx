import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { Eye, EyeOff, Github, Chrome } from "lucide-react";
import { Navigation } from "@/components/ui/navigation";

// Custom Logo Component for SignIn Page
const CustomLogo = () => (
  <Link to="/" className="inline-flex items-center space-x-3 hover:opacity-80 transition-opacity mb-8">
    <div className="relative w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 p-1 shadow-lg">
      {/* Gear Icon - Left Side */}
      <div className="absolute left-1 top-1 w-5 h-5">
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
      <div className="absolute right-1 bottom-1 w-5 h-5">
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
    <span className="text-3xl font-bold">
      <span className="text-blue-700">Skill</span>
      <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Swap</span>
    </span>
  </Link>
);

export default function SignInPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  // Tab state
  const [activeTab, setActiveTab] = useState("signin");
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Sign up form state
  const [name, setName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  // Reset password form state
  const [resetPassword, setResetPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Check for password reset token in URL
  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const type = searchParams.get('type');
    
    console.log('URL params detected:', { accessToken, refreshToken, type });
    console.log('Current URL:', window.location.href);
    console.log('Search params:', Object.fromEntries(searchParams.entries()));
    
    if (accessToken && refreshToken && type === 'recovery') {
      // User came from password reset email
      console.log('Password reset tokens detected, switching to reset tab');
      setActiveTab("reset");
      
      // Set the session in Supabase
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      }).then(({ data, error }) => {
        if (error) {
          console.error('Error setting session:', error);
        } else {
          console.log('Session set successfully:', data);
          toast({
            title: "Password Reset",
            description: "Please enter your new password below.",
          });
        }
      });
    } else {
      console.log('No valid reset tokens found in URL');
    }
  }, [searchParams, toast]);

  // Handle OAuth redirects and session management
  useEffect(() => {
    const handleAuthChange = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session && !error) {
        console.log('User authenticated via OAuth:', session.user);
        toast({
          title: "Welcome!",
          description: `Signed in as ${session.user.email}`,
        });
        
        // Redirect to home page
        setTimeout(() => {
          navigate('/');
          window.location.reload();
        }, 1000);
      }
    };

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
      
      if (event === 'SIGNED_IN' && session) {
        handleAuthChange();
      }
    });

    // Check initial session
    handleAuthChange();

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const handleSignIn = async () => {
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Try Supabase authentication first
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Supabase sign-in error:', error);
        
        // If it's a network error, try local storage fallback
        if (error.message.includes('Failed to fetch') || error.message.includes('Network error')) {
          console.log('Network error detected, trying local storage fallback');
          
          const localUsers = JSON.parse(localStorage.getItem('localUsers') || '[]');
          const localUser = localUsers.find((u: any) => u.email === email && u.password === password);
          
          if (localUser) {
            localStorage.setItem('user', JSON.stringify(localUser));
            toast({
              title: "Signed In",
              description: "Welcome back!",
            });
            setTimeout(() => {
              navigate('/');
              window.location.reload();
            }, 1000);
            return;
          }
        }
        
        toast({
          title: "Sign-In Error",
          description: error.message || "Failed to sign in",
          variant: "destructive",
        });
      } else {
        console.log('Supabase sign-in successful:', data);
        toast({
          title: "Welcome Back!",
          description: "Successfully signed in",
        });
        setTimeout(() => {
          navigate('/');
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error('Sign-in exception:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!name || !signupEmail || !signupPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    // Password validation
    if (signupPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(signupPassword)) {
      toast({
        title: "Error",
        description: "Password must contain at least one uppercase letter, one lowercase letter, and one number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Try Supabase sign-up first
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          data: {
            full_name: name,
          }
        }
      });

      if (error) {
        console.error('Supabase sign-up error:', error);
        
        // If it's a network error, use local storage fallback
        if (error.message.includes('Failed to fetch') || error.message.includes('Network error')) {
          console.log('Network error detected, using local storage fallback');
          
          const localUsers = JSON.parse(localStorage.getItem('localUsers') || '[]');
          const existingUser = localUsers.find((u: any) => u.email === signupEmail);
          
          if (existingUser) {
            toast({
              title: "Error",
              description: "User with this email already exists",
              variant: "destructive",
            });
            return;
          }
          
          const newUser = {
            id: Date.now().toString(),
            name,
            email: signupEmail,
            password: signupPassword,
          };
          
          localUsers.push(newUser);
          localStorage.setItem('localUsers', JSON.stringify(localUsers));
          localStorage.setItem('user', JSON.stringify(newUser));
          
          toast({
            title: "Account Created",
            description: "Welcome to SkillSwap!",
          });
          
          setTimeout(() => {
            navigate('/');
            window.location.reload();
          }, 1000);
          return;
        }
        
        toast({
          title: "Sign-Up Error",
          description: error.message || "Failed to create account",
          variant: "destructive",
        });
      } else {
        console.log('Supabase sign-up successful:', data);
        toast({
          title: "Account Created",
          description: "Please check your email to verify your account.",
        });
        
        // Clear form
        setName("");
        setSignupEmail("");
        setSignupPassword("");
        setActiveTab("signin");
      }
    } catch (error) {
      console.error('Sign-up exception:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Use Supabase password reset with redirect back to sign-in page
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/`,
      });

      if (error) {
        console.error('Password reset error:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to send reset email",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Reset Email Sent",
          description: "Check your email for password reset instructions.",
        });
        // Clear the email field after successful send
        setEmail("");
        // Switch to reset password tab
        setActiveTab("reset");
      }
    } catch (error) {
      console.error('Password reset exception:', error);
      toast({
        title: "Error",
        description: "Failed to send reset email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (resetPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    // Password validation
    if (resetPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(resetPassword)) {
      toast({
        title: "Error",
        description: "Password must contain at least one uppercase letter, one lowercase letter, and one number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // First check if we have a session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('No active session:', sessionError);
        toast({
          title: "Session Error",
          description: "Please click the reset link from your email again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Active session found, updating password...');
      
      // Update the user's password
      const { error } = await supabase.auth.updateUser({
        password: resetPassword,
      });

      if (error) {
        console.error('Password reset update error:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to reset password",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password Reset Success",
          description: "Your password has been reset successfully!",
        });
        
        // Clear password fields and switch to sign in tab
        setResetPassword("");
        setConfirmPassword("");
        setActiveTab("signin");
        
        // Sign out the user and redirect to home
        await supabase.auth.signOut();
        
        setTimeout(() => {
          navigate('/');
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      console.error('Password reset update exception:', error);
      toast({
        title: "Error",
        description: "Failed to reset password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // OAuth Authentication Functions
  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        }
      });

      if (error) {
        console.error('Google sign-in error:', error);
        toast({
          title: "Google Sign-In Error",
          description: error.message || "Failed to sign in with Google",
          variant: "destructive",
        });
        setLoading(false);
      } else {
        console.log('Google sign-in initiated:', data);
        toast({
          title: "Google Sign-In",
          description: "Redirecting to Google...",
        });
        // Keep loading state until redirect happens
      }
    } catch (error) {
      console.error('Google sign-in exception:', error);
      toast({
        title: "Error",
        description: "Failed to sign in with Google. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/`,
        }
      });

      if (error) {
        console.error('GitHub sign-in error:', error);
        toast({
          title: "GitHub Sign-In Error",
          description: error.message || "Failed to sign in with GitHub",
          variant: "destructive",
        });
        setLoading(false);
      } else {
        console.log('GitHub sign-in initiated:', data);
        toast({
          title: "GitHub Sign-In",
          description: "Redirecting to GitHub...",
        });
        // Keep loading state until redirect happens
      }
    } catch (error) {
      console.error('GitHub sign-in exception:', error);
      toast({
        title: "Error",
        description: "Failed to sign in with GitHub. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-6">
            <CustomLogo />
          </div>
          
          <Card className="border-0 shadow-soft">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold">Welcome to SkillSwap</CardTitle>
              <CardDescription>
                Sign in to your account or create a new one
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  <TabsTrigger value="reset">Reset</TabsTrigger>
                </TabsList>
              
                <TabsContent value="signin" className="space-y-4 mt-6">
                  <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-bold">Welcome back</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                      Enter your credentials to access your account
                    </p>
                  </div>

                  {/* OAuth Buttons */}
                  <div className="space-y-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-white hover:bg-gray-50 text-gray-700 border-gray-300 hover:border-gray-400"
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                    >
                      <Chrome className="mr-2 h-4 w-4" />
                      {loading ? "Connecting to Google..." : "Continue with Google"}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white border-gray-700 hover:border-gray-600"
                      onClick={handleGitHubSignIn}
                      disabled={loading}
                    >
                      <Github className="mr-2 h-4 w-4" />
                      {loading ? "Connecting to GitHub..." : "Continue with GitHub"}
                    </Button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with email
                      </span>
                    </div>
                  </div>
                  
                  <form onSubmit={(e) => { e.preventDefault(); handleSignIn(); }} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="transition-all focus:shadow-hover"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pr-10 transition-all focus:shadow-hover"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Button
                        type="button"
                        variant="link"
                        className="text-sm text-primary hover:underline p-0 h-auto"
                        onClick={handleForgotPassword}
                        disabled={loading}
                      >
                        {loading ? "Sending..." : "Forgot password? Reset it here"}
                      </Button>
                    </div>
                    
                    <Button 
                      className="w-full bg-gradient-primary hover:shadow-hover transition-all"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? "Signing In..." : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup" className="space-y-4 mt-6">
                  <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-bold">Create an account</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                      Enter your details to create your account
                    </p>
                  </div>

                  {/* OAuth Buttons */}
                  <div className="space-y-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-white hover:bg-gray-50 text-gray-700 border-gray-300 hover:border-gray-400"
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                    >
                      <Chrome className="mr-2 h-4 w-4" />
                      {loading ? "Connecting to Google..." : "Continue with Google"}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white border-gray-700 hover:border-gray-600"
                      onClick={handleGitHubSignIn}
                      disabled={loading}
                    >
                      <Github className="mr-2 h-4 w-4" />
                      {loading ? "Connecting to GitHub..." : "Continue with GitHub"}
                    </Button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with email
                      </span>
                    </div>
                  </div>
                  
                  <form onSubmit={(e) => { e.preventDefault(); handleSignUp(); }} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="transition-all focus:shadow-hover"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="transition-all focus:shadow-hover"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          className="pr-10 transition-all focus:shadow-hover"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-gradient-primary hover:shadow-hover transition-all"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="reset" className="space-y-4 mt-6">
                  <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-bold">Reset Password</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                      Enter your new password below
                    </p>
                  </div>
                  
                  <form onSubmit={(e) => { e.preventDefault(); handleResetPassword(); }} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-password">New Password</Label>
                      <div className="relative">
                        <Input
                          id="reset-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your new password"
                          value={resetPassword}
                          onChange={(e) => setResetPassword(e.target.value)}
                          className="pr-10 transition-all focus:shadow-hover"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirm your new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="transition-all focus:shadow-hover"
                      />
                    </div>
                    
                    <Button 
                      className="w-full bg-gradient-primary hover:shadow-hover transition-all"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? "Resetting..." : "Reset Password"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Need help?{" "}
            <Link to="/support" className="text-primary hover:underline">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}