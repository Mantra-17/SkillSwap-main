import { useState, useRef, useEffect } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, X, MapPin, Clock, Eye, EyeOff, Camera, Save, Upload, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { v4 as uuidv4 } from 'uuid';

export default function ProfilePage() {
  const [isPublic, setIsPublic] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = useState<any>(null);
  const [skillsOffered, setSkillsOffered] = useState<string[]>([]);
  const [skillsWanted, setSkillsWanted] = useState<string[]>([]);

  const [newSkillOffered, setNewSkillOffered] = useState("");
  const [newSkillWanted, setNewSkillWanted] = useState("");

  const [swapHistory, setSwapHistory] = useState([]);
  const [swapStats, setSwapStats] = useState({ total: 0, streak: 0, points: 0 });

  // Fetch profile from Supabase on mount
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (data) {
        setProfile(data);
        setSkillsOffered(data.skills_offered || []);
        setSkillsWanted(data.skills_wanted || []);
        if (data.avatar) setImagePreview(data.avatar); // Always show avatar if present
      } else if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
    };
    fetchProfile();
  }, []);

  // Fetch swap history for the current user
  useEffect(() => {
    const fetchSwapHistory = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      // Fetch completed swaps where user is from_user_id or to_user_id
      const { data, error } = await supabase
        .from('swap_requests')
        .select('*')
        .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });
      let swaps = data || [];
      // If no real swaps, add dummy data
      if (!swaps.length) {
        swaps = [
          {
            id: 'dummy1',
            from_user_id: user.id,
            to_user_id: 'user-photography',
            to_user_name: 'Sarah Johnson',
            skill_offered: 'React',
            skill_wanted: 'Photography',
            created_at: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
            status: 'completed',
          },
          {
            id: 'dummy2',
            from_user_id: 'user-guitar',
            from_user_name: 'Mike Chen',
            to_user_id: user.id,
            skill_offered: 'Guitar',
            skill_wanted: 'Python',
            created_at: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
            status: 'completed',
          },
          {
            id: 'dummy3',
            from_user_id: user.id,
            to_user_id: 'user-spanish',
            to_user_name: 'Emma Wilson',
            skill_offered: 'Yoga',
            skill_wanted: 'Spanish',
            created_at: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
            status: 'completed',
          },
          {
            id: 'dummy4',
            from_user_id: 'user-creative',
            from_user_name: 'Priya Patel',
            to_user_id: user.id,
            skill_offered: 'Drawing',
            skill_wanted: 'Web Design',
            created_at: new Date(Date.now() - 86400000 * 4).toISOString(), // 4 days ago
            status: 'completed',
          },
          {
            id: 'dummy5',
            from_user_id: user.id,
            to_user_id: 'user-language',
            to_user_name: 'Carlos Garcia',
            skill_offered: 'English',
            skill_wanted: 'Spanish',
            created_at: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
            status: 'completed',
          },
        ];
      }
      setSwapHistory(swaps);
      // Calculate stats
      const total = swaps.length;
      // Streak: count consecutive days with swaps (from most recent)
      let streak = 0;
      let lastDate = null;
      for (const swap of swaps) {
        const swapDate = new Date(swap.created_at).toDateString();
        if (!lastDate) {
          streak = 1;
          lastDate = swapDate;
        } else if (swapDate === lastDate) {
          continue;
        } else {
          const prev = new Date(lastDate).getTime();
          const curr = new Date(swapDate).getTime();
          const diff = (prev - curr) / (1000 * 60 * 60 * 24);
          if (diff === 1) {
            streak++;
            lastDate = swapDate;
          } else {
            break;
          }
        }
      }
      // Points: 10 points per swap
      const points = total * 10;
      setSwapStats({ total, streak, points });
    };
    fetchSwapHistory();
  }, []);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file (JPEG, PNG, etc.)",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      toast({
        title: "Image selected",
        description: "Your new profile picture has been selected. Click 'Save Changes' to apply it.",
      });
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const addSkillOffered = () => {
    if (newSkillOffered.trim() && !skillsOffered.includes(newSkillOffered.trim())) {
      setSkillsOffered([...skillsOffered, newSkillOffered.trim()]);
      setNewSkillOffered("");
    }
  };

  const addSkillWanted = () => {
    if (newSkillWanted.trim() && !skillsWanted.includes(newSkillWanted.trim())) {
      setSkillsWanted([...skillsWanted, newSkillWanted.trim()]);
      setNewSkillWanted("");
    }
  };

  const removeSkillOffered = (skill: string) => {
    setSkillsOffered(skillsOffered.filter(s => s !== skill));
  };

  const removeSkillWanted = (skill: string) => {
    setSkillsWanted(skillsWanted.filter(s => s !== skill));
  };

  // Save profile to Supabase
  const handleSave = async () => {
    if (!profile) return;
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || !user.id) {
      toast({
        title: "Error",
        description: "You must be signed in to update your profile.",
        variant: "destructive",
      });
      return;
    }

    let avatarUrl = profile?.avatar || "";
    if (selectedImage) {
      // Upload to Supabase Storage
      const fileExt = selectedImage.name.split('.').pop();
      const fileName = `${user.id}-${uuidv4()}.${fileExt}`;
      // Remove any previous avatar for this user (optional, for cleanup)
      // await supabase.storage.from('avatars').remove([fileName]);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, selectedImage, { upsert: true });
      if (uploadError) {
        toast({
          title: "Image upload failed",
          description: uploadError.message,
          variant: "destructive",
        });
        return;
      }
      // Get public URL (synchronous)
      const { publicUrl } = supabase.storage.from('avatars').getPublicUrl(fileName).data;
      if (!publicUrl) {
        toast({
          title: "Failed to get public URL",
          description: 'No public URL returned',
          variant: "destructive",
        });
        return;
      }
      avatarUrl = publicUrl;
      setImagePreview(avatarUrl); // Update preview immediately
      console.log('Avatar uploaded, public URL:', avatarUrl);
    }

    // Defensive: Only upsert empty skills arrays if user actually removed all skills
    const safeSkillsOffered = Array.isArray(skillsOffered) ? skillsOffered : [];
    const safeSkillsWanted = Array.isArray(skillsWanted) ? skillsWanted : [];

    const updates = {
      user_id: user.id,
      name: profile?.name || "",
      email: profile?.email || "",
      location: profile?.location || "",
      availability: profile?.availability || "",
      bio: profile?.bio || "",
      avatar: avatarUrl,
      skills_offered: safeSkillsOffered,
      skills_wanted: safeSkillsWanted,
    };
    console.log('Saving profile with updates:', updates);
    const { error } = await supabase
      .from('profiles')
      .upsert([updates], { onConflict: 'user_id' });
    if (!error) {
      setIsEditing(false);
      setSelectedImage(null); // Clear selected image after save
      // setImagePreview(null); // Do not clear preview, keep showing avatar
      // Re-fetch profile after save to ensure UI is up-to-date
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (data) {
        setProfile(data);
        setSkillsOffered(Array.isArray(data.skills_offered) ? data.skills_offered : []);
        setSkillsWanted(Array.isArray(data.skills_wanted) ? data.skills_wanted : []);
        if (data.avatar) setImagePreview(data.avatar);
        console.log('Fetched profile after save:', data);
      }
      toast({
        title: "Profile updated!",
        description: "Your changes have been saved successfully.",
      });
    } else {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">My Profile</h1>
              <p className="text-muted-foreground">
                Manage your skills and preferences
              </p>
            </div>
            <Button 
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className="group"
            >
              {isEditing ? (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              ) : (
                "Edit Profile"
              )}
            </Button>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile Info</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="history">Swap History</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Picture */}
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={imagePreview || profile?.avatar} />
                      <AvatarFallback className="bg-primary text-white text-3xl">M</AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <div className="flex flex-col space-y-2">
                        <Button variant="outline" size="sm" onClick={triggerFileInput}>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Photo
                        </Button>
                        {selectedImage && (
                          <Button variant="outline" size="sm" onClick={removeSelectedImage} className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        )}
                      </div>
                    )}
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      placeholder="Upload profile photo"
                      title="Upload profile photo"
                    />
                  </div>

                  {/* Profile Details */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profile?.name ?? ""}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile?.email ?? ""}
                        onChange={(e) => setProfile({...profile, email: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location (Optional)</Label>
                      <Input
                        id="location"
                        value={profile?.location ?? ""}
                        onChange={(e) => setProfile({...profile, location: e.target.value})}
                        disabled={!isEditing}
                        placeholder="City, State"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="availability">Availability</Label>
                      <Input
                        id="availability"
                        value={profile?.availability ?? ""}
                        onChange={(e) => setProfile({...profile, availability: e.target.value})}
                        disabled={!isEditing}
                        placeholder="e.g., Weekends, Evenings"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profile?.bio ?? ""}
                      onChange={(e) => setProfile({...profile, bio: e.target.value})}
                      disabled={!isEditing}
                      placeholder="Tell others about yourself and what you're passionate about..."
                      className="min-h-[100px]"
                    />
                  </div>

                  {/* Privacy Settings */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {isPublic ? <Eye className="h-5 w-5 text-primary" /> : <EyeOff className="h-5 w-5 text-muted-foreground" />}
                      <div>
                        <Label htmlFor="public-profile" className="font-medium">
                          Public Profile
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Make your profile visible to other users
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="public-profile"
                      checked={isPublic}
                      onCheckedChange={setIsPublic}
                      disabled={!isEditing}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="skills" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Skills Offered */}
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="text-primary">Skills I Offer</CardTitle>
                    <CardDescription>
                      What can you teach others?
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {skillsOffered.map((skill, index) => (
                        <Badge key={index} variant="default" className="group">
                          {skill}
                          {isEditing && (
                            <X
                              className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive"
                              onClick={() => removeSkillOffered(skill)}
                            />
                          )}
                        </Badge>
                      ))}
                    </div>
                    
                    {isEditing && (
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Add a skill you can teach"
                          value={newSkillOffered ?? ""}
                          onChange={(e) => setNewSkillOffered(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addSkillOffered()}
                        />
                        <Button onClick={addSkillOffered} size="sm">
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Skills Wanted */}
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="text-secondary">Skills I Want</CardTitle>
                    <CardDescription>
                      What would you like to learn?
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {skillsWanted.map((skill, index) => (
                        <Badge key={index} variant="outline" className="group">
                          {skill}
                          {isEditing && (
                            <X
                              className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive"
                              onClick={() => removeSkillWanted(skill)}
                            />
                          )}
                        </Badge>
                      ))}
                    </div>
                    
                    {isEditing && (
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Add a skill you want to learn"
                          value={newSkillWanted ?? ""}
                          onChange={(e) => setNewSkillWanted(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addSkillWanted()}
                        />
                        <Button onClick={addSkillWanted} size="sm">
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Swap History</CardTitle>
                  <CardDescription>
                    Your past skill exchanges and feedback
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row md:space-x-8 mb-6">
                    <div className="flex-1 flex flex-col items-center justify-center mb-4 md:mb-0">
                      <span className="text-3xl font-bold text-primary">{swapStats.total}</span>
                      <span className="text-muted-foreground">Total Swaps</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center mb-4 md:mb-0">
                      <span className="text-3xl font-bold text-orange-500">{swapStats.streak}</span>
                      <span className="text-muted-foreground">Streak (days)</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-yellow-500">{swapStats.points}</span>
                      <span className="text-muted-foreground">Points</span>
                    </div>
                  </div>
                  {swapHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No completed swaps yet. Start swapping to build your history!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {swapHistory.map((swap) => (
                        <Card key={swap.id} className="border p-4">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-lg mb-1">
                                {swap.from_user_id === profile?.user_id
                                  ? `You swapped with ${swap.to_user_name || swap.to_user_id}`
                                  : `You swapped with ${swap.from_user_name || swap.from_user_id}`}
                              </div>
                              <div className="text-sm text-muted-foreground mb-1">
                                {swap.skill_offered} ↔ {swap.skill_wanted}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(swap.created_at).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="flex flex-col items-end mt-2 md:mt-0">
                              <Badge variant="default">Completed</Badge>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}