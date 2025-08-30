import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/ui/navigation";
import { ArrowRight, Users, MessageSquare, Star, Shield, Search, Heart } from "lucide-react";
import { Link } from "react-router-dom";

// Custom Logo Component for Footer
const CustomLogo = () => (
  <Link to="/" className="inline-flex items-center space-x-3 hover:opacity-80 transition-opacity">
    <div className="relative w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 p-1 shadow-lg">
      {/* Gear Icon - Left Side */}
      <div className="absolute left-0.5 top-0.5 w-3 h-3">
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
      <div className="absolute right-0.5 bottom-0.5 w-3 h-3">
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
    <span className="text-2xl font-bold">
      <span className="text-blue-700">Skill</span>
      <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Swap</span>
    </span>
  </Link>
);

export default function HomePage() {
  const features = [
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Find Skills",
      description: "Browse and search for skills offered by community members"
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-secondary" />,
      title: "Request Swaps",
      description: "Send and receive skill swap requests with ease"
    },
    {
      icon: <Star className="h-8 w-8 text-primary" />,
      title: "Rate & Review",
      description: "Build trust through ratings and feedback after swaps"
    },
    {
      icon: <Shield className="h-8 w-8 text-secondary" />,
      title: "Secure Platform",
      description: "Safe and moderated environment for skill sharing"
    }
  ];

  const popularSkills = [
    "Web Development", "Graphic Design", "Photography", "Language Teaching", 
    "Music Lessons", "Cooking", "Writing", "Marketing", "Yoga", "Tutoring"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-hero">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              Share Skills, Build Community
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connect with your neighbors and trade skills. Learn something new while sharing what you know best.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="group" asChild>
                <Link to="/browse">
                  Browse Skills
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/signin">Create Profile</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Simple steps to start sharing and learning new skills
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Make each card a Link to its feature page */}
            <Link to="/find-skills">
              <Card className="border-0 shadow-soft hover:shadow-hover transition-all duration-300 bg-gradient-card">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 rounded-full bg-muted/50">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Find Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    Browse and search for skills offered by community members
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
            <Link to="/request-swaps">
              <Card className="border-0 shadow-soft hover:shadow-hover transition-all duration-300 bg-gradient-card">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 rounded-full bg-muted/50">
                    <MessageSquare className="h-8 w-8 text-secondary" />
                  </div>
                  <CardTitle className="text-xl">Request Swaps</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    Send and receive skill swap requests with ease
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
            <Link to="/rate-review">
              <Card className="border-0 shadow-soft hover:shadow-hover transition-all duration-300 bg-gradient-card">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 rounded-full bg-muted/50">
                    <Star className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Rate & Review</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    Build trust through ratings and feedback after swaps
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
            <Link to="/secure-platform">
              <Card className="border-0 shadow-soft hover:shadow-hover transition-all duration-300 bg-gradient-card">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 rounded-full bg-muted/50">
                    <Shield className="h-8 w-8 text-secondary" />
                  </div>
                  <CardTitle className="text-xl">Secure Platform</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    Safe and moderated environment for skill sharing
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Skills */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Popular Skills</h2>
            <p className="text-xl text-muted-foreground">
              Discover what's trending in our community
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {popularSkills.map((skill, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="px-4 py-2 text-sm hover:bg-primary hover:text-primary-foreground transition-all duration-300 cursor-pointer animate-bounce-in"
                style={{animationDelay: `${index * 50}ms`}}
              >
                {skill}
              </Badge>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Button variant="outline" size="lg" asChild>
              <Link to="/browse">
                <Search className="mr-2 h-4 w-4" />
                Browse All Skills
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <div className="max-w-2xl mx-auto">
            <Heart className="h-16 w-16 mx-auto mb-6 animate-bounce-in" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Swapping?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join our community of learners and teachers. Your next skill is just a swap away!
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/signin">
                Create Your Profile Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t">
        <div className="container mx-auto text-center">
          <div className="mb-6">
            <CustomLogo />
          </div>
          <p className="text-muted-foreground">
            Built with ❤️ for the community
          </p>
        </div>
      </footer>
    </div>
  );
}