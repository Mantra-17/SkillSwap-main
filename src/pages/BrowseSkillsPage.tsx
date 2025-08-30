import { useState, useEffect } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, MapPin, Star, MessageSquare, Filter, User } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import RequestSwapDialog from "@/components/RequestSwapDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { useLocation } from "react-router-dom";

export default function BrowseSkillsPage() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const location = useLocation();
  const { toast } = useToast();

  // Get current user from Supabase
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (user && !error) {
          setCurrentUser({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
          });
        }
      } catch (error) {
        console.error('Error getting current user:', error);
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setCurrentUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User'
        });
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch users from Supabase
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from('profiles').select('*');
      if (!error && data) {
        // Map snake_case fields to camelCase for UI
        const mapped = data.map(u => ({
          ...u,
          name: u.name || '',
          bio: u.bio || '',
          avatar: u.avatar || '',
          location: u.location || '',
          availability: u.availability || '',
          rating: u.rating || 0,
          skillsOffered: Array.isArray(u.skills_offered) ? u.skills_offered : [],
          skillsWanted: Array.isArray(u.skills_wanted) ? u.skills_wanted : [],
        }));
        setUsers(mapped);
      }
    };
    fetchUsers();

    // Real-time subscription
    const subscription = supabase
      .channel('public:profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
        fetchUsers();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [location]);

  const handleRequestSwap = (user) => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to request swaps. You'll be redirected to the sign-in page.",
        variant: "destructive",
      });
      // Redirect to sign-in page after a short delay
      setTimeout(() => {
        window.location.href = '/signin';
      }, 2000);
      return;
    }
    
    // Don't allow users to request swaps with themselves
    if (currentUser.id === user.id) {
      toast({
        title: "Invalid Request",
        description: "You cannot request a swap with yourself.",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedUser(user);
    setShowRequestDialog(true);
  };

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "technology", label: "Technology" },
    { value: "creative", label: "Creative Arts" },
    { value: "music", label: "Music" },
    { value: "fitness", label: "Fitness & Wellness" },
    { value: "cooking", label: "Cooking & Food" },
    { value: "language", label: "Languages" },
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.skillsOffered.some(skill => 
      skill.toLowerCase().includes(searchTerm.toLowerCase())
    ) || user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || 
      user.skillsOffered.some(skill => {
        if (selectedCategory === "technology") return ["Web Development", "React", "JavaScript", "Programming", "Data Analysis"].includes(skill);
        if (selectedCategory === "creative") return ["Graphic Design", "UI/UX", "Figma", "Photography", "Photo Editing"].includes(skill);
        if (selectedCategory === "music") return ["Piano", "Music Theory", "Guitar"].includes(skill);
        if (selectedCategory === "fitness") return ["Yoga", "Meditation", "Wellness Coaching"].includes(skill);
        if (selectedCategory === "cooking") return ["Cooking", "Baking", "Nutrition"].includes(skill);
        return false;
      });
    return matchesSearch && matchesCategory;
  });

  // Before rendering
  console.log('All users:', users);
  console.log('Filtered users:', filteredUsers);

  // Dummy users for demo/testing
  const dummyUsers = [
    {
      name: "Sarah Johnson",
      email: "sarah@example.com",
      bio: "Passionate web developer with 5+ years of experience in React and Node.js. Love teaching and learning new technologies.",
      avatar: "",
      location: "San Francisco, CA",
      rating: 4.8,
      skills_offered: ["Web Development", "React", "JavaScript", "Node.js"],
      skills_wanted: ["Graphic Design", "UI/UX", "Figma"],
      availability: "Weekends"
    },
    {
      name: "Mike Chen",
      email: "mike@example.com",
      bio: "Professional graphic designer specializing in brand identity and UI/UX design. Always excited to collaborate on creative projects.",
      avatar: "",
      location: "New York, NY",
      rating: 4.9,
      skills_offered: ["Graphic Design", "UI/UX", "Figma", "Brand Identity"],
      skills_wanted: ["Web Development", "JavaScript", "React"],
      availability: "Evenings"
    },
    {
      name: "Emma Wilson",
      email: "emma@example.com",
      bio: "Certified yoga instructor and wellness coach. Helping people find balance through movement and mindfulness practices.",
      avatar: "",
      location: "Austin, TX",
      rating: 4.7,
      skills_offered: ["Yoga", "Meditation", "Wellness Coaching", "Nutrition"],
      skills_wanted: ["Photography", "Photo Editing", "Social Media Marketing"],
      availability: "Mornings"
    },
    {
      name: "David Rodriguez",
      email: "david@example.com",
      bio: "Professional photographer with expertise in portrait and event photography. Love capturing life's beautiful moments.",
      avatar: "",
      location: "Miami, FL",
      rating: 4.6,
      skills_offered: ["Photography", "Photo Editing", "Lightroom", "Event Photography"],
      skills_wanted: ["Cooking", "Baking", "Spanish Language"],
      availability: "Flexible"
    },
    {
      name: "Lisa Thompson",
      email: "lisa@example.com",
      bio: "Experienced chef and cooking instructor. Passionate about teaching others to create delicious, healthy meals.",
      avatar: "",
      location: "Seattle, WA",
      rating: 4.8,
      skills_offered: ["Cooking", "Baking", "Nutrition", "Meal Planning"],
      skills_wanted: ["Music Theory", "Piano", "Guitar"],
      availability: "Weekends"
    },
    {
      name: "Alex Kim",
      email: "alex@example.com",
      bio: "Music producer and multi-instrumentalist. Teaching piano, guitar, and music production to all skill levels.",
      avatar: "",
      location: "Los Angeles, CA",
      rating: 4.9,
      skills_offered: ["Piano", "Guitar", "Music Theory", "Music Production"],
      skills_wanted: ["Data Analysis", "Python", "Machine Learning"],
      availability: "Evenings"
    },
    {
      name: "Priya Patel",
      email: "priya@example.com",
      bio: "Language enthusiast and experienced Hindi/English tutor. Love helping others communicate!",
      avatar: "",
      location: "Chicago, IL",
      rating: 4.7,
      skills_offered: ["Hindi", "English", "Tutoring"],
      skills_wanted: ["French", "Spanish", "German"],
      availability: "Afternoons"
    },
    {
      name: "Tom Lee",
      email: "tom@example.com",
      bio: "Fitness coach and marathon runner. Let's get moving together!",
      avatar: "",
      location: "Boston, MA",
      rating: 4.5,
      skills_offered: ["Running", "Fitness Coaching", "Nutrition"],
      skills_wanted: ["Yoga", "Pilates", "Meditation"],
      availability: "Mornings"
    },
    {
      name: "Sophia Brown",
      email: "sophia@example.com",
      bio: "Artist and illustrator. I love sharing creative techniques and collaborating on art projects.",
      avatar: "",
      location: "Portland, OR",
      rating: 4.8,
      skills_offered: ["Drawing", "Painting", "Illustration"],
      skills_wanted: ["Web Design", "Animation", "3D Modeling"],
      availability: "Evenings"
    },
    {
      name: "Carlos Garcia",
      email: "carlos@example.com",
      bio: "Spanish language teacher and salsa dancer. Let's learn and dance!",
      avatar: "",
      location: "Houston, TX",
      rating: 4.6,
      skills_offered: ["Spanish", "Salsa Dancing", "Teaching"],
      skills_wanted: ["English", "Guitar", "Cooking"],
      availability: "Weekends"
    }
  ];

  // Add dummy users to Supabase
  const addDummyUsers = async () => {
    const { error } = await supabase.from('profiles').insert(dummyUsers);
    if (!error) {
      toast({ title: "Dummy users added!", description: "You can now browse and swap with them." });
    } else {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
          Browse Skills
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover talented people and find the perfect skill exchange opportunities
        </p>
        
        {/* Authentication Status */}
        {loading ? (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg inline-block">
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
              <span className="text-sm text-muted-foreground">Checking authentication...</span>
            </div>
          </div>
        ) : currentUser ? (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg inline-block">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700">
                Signed in as <strong>{currentUser.name}</strong> - You can request swaps!
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg inline-block">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-orange-700">
                <strong>Not signed in</strong> - <a href="/signin" className="underline hover:text-orange-800">Sign in</a> to request swaps
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Show Add Dummy Users button if there are fewer than 2 users */}
          {users.length < 2 && (
            <Button onClick={addDummyUsers} variant="outline" className="mb-4">
              Add Dummy Users
            </Button>
          )}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search skills or people..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results - Always show the filtered users */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user, index) => (
            <Card 
              key={user.id} 
              className="border-0 shadow-soft hover:shadow-hover transition-all duration-300 bg-gradient-card cursor-pointer"
              style={{animationDelay: `${index * 100}ms`}}
            >
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="bg-primary text-white">{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3 mr-1" />
                      {user.location}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-sm font-medium">{user.rating}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription>{user.bio}</CardDescription>
                <div>
                  <h4 className="font-medium mb-2">Skills I Can Offer:</h4>
                  <div className="flex flex-wrap gap-1">
                    {user.skillsOffered.map((skill, skillIndex) => (
                      <Badge key={skillIndex} className="text-xs bg-orange-500 text-white">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Skills I Want to Learn:</h4>
                  <div className="flex flex-wrap gap-1">
                    {user.skillsWanted.map((skill, skillIndex) => (
                      <Badge key={skillIndex} className="text-xs bg-orange-500 text-white">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-muted-foreground">
                    Available: {user.availability}
                  </span>
                  <Button 
                    size="sm" 
                    className="group"
                    onClick={() => handleRequestSwap(user)}
                  >
                    <MessageSquare className="h-4 w-4 mr-1 group-hover:scale-110 transition-transform" />
                    Request Swap
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No skills found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or browse all categories
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Request Swap Dialog */}
      {selectedUser && (
        <RequestSwapDialog
          isOpen={showRequestDialog}
          onClose={() => {
            setShowRequestDialog(false);
            setSelectedUser(null);
          }}
          targetUser={selectedUser}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}