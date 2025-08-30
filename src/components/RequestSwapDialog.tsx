import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

interface RequestSwapDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: {
    id: string;
    name: string;
    skillsOffered: string[];
    skillsWanted: string[];
  };
  currentUser: {
    id: string;
    name: string;
    skillsOffered: string[];
    skillsWanted: string[];
  };
}

export default function RequestSwapDialog({ isOpen, onClose, targetUser, currentUser }: RequestSwapDialogProps) {
  const [skillOffered, setSkillOffered] = useState("");
  const [skillWanted, setSkillWanted] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Expanded skills for current user
  const mockCurrentUserSkills = [
    "Web Development",
    "React", 
    "JavaScript",
    "Node.js",
    "Python",
    "Data Analysis",
    "Graphic Design",
    "UI/UX",
    "Figma",
    "Brand Identity",
    "Yoga",
    "Meditation",
    "Wellness Coaching",
    "Nutrition",
    "Photography",
    "Photo Editing",
    "Lightroom",
    "Event Photography",
    "Cooking",
    "Baking",
    "Meal Planning",
    "Music Theory",
    "Piano",
    "Guitar",
    "Music Production",
    "Hindi",
    "English",
    "Tutoring",
    "French",
    "Spanish",
    "German",
    "Running",
    "Fitness Coaching",
    "Pilates",
    "Drawing",
    "Painting",
    "Illustration",
    "Web Design",
    "Animation",
    "3D Modeling",
    "Salsa Dancing",
    "Teaching",
    "Machine Learning",
    "Social Media Marketing"
  ];

  const handleSubmit = async () => {
    if (!skillOffered || !skillWanted || !message.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Get current user from Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be signed in to send a swap request.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      const { error } = await supabase.from('swaps').insert([
        {
          from_user: user.id,
          to_user: targetUser.id,
          skill_offered: skillOffered,
          skill_wanted: skillWanted,
          message,
          status: 'pending',
        }
      ]);
      if (!error) {
      toast({
        title: "Success! 🎉",
        description: `Swap request sent to ${targetUser.name}! They will review your proposal.`,
      });
      setSkillOffered("");
      setSkillWanted("");
      setMessage("");
      setLoading(false);
      onClose();
      } else {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        setLoading(false);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request Skill Swap with {targetUser.name}</DialogTitle>
          <DialogDescription>
            Propose a skill exchange. Choose what you can offer and what you'd like to learn.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="skill-offered">I can offer:</Label>
            <Select value={skillOffered} onValueChange={setSkillOffered}>
              <SelectTrigger>
                <SelectValue placeholder="Select a skill you can teach" />
              </SelectTrigger>
              <SelectContent>
                {mockCurrentUserSkills.map((skill) => (
                  <SelectItem key={skill} value={skill}>
                    {skill}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="skill-wanted">I want to learn:</Label>
            <Select value={skillWanted} onValueChange={setSkillWanted}>
              <SelectTrigger>
                <SelectValue placeholder="Select a skill you want to learn" />
              </SelectTrigger>
              <SelectContent>
                {/* Show all possible skills for learning, not just targetUser's skills */}
                {mockCurrentUserSkills.map((skill) => (
                  <SelectItem key={skill} value={skill}>
                    {skill}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message to {targetUser.name}:</Label>
            <Textarea
              id="message"
              placeholder="Introduce yourself and explain why you'd like to swap skills..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Sending..." : "Send Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 