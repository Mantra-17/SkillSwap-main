import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, UserCheck, AlertTriangle } from "lucide-react";

export default function SecurePlatformPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-background p-6">
      <Card className="max-w-2xl w-full shadow-xl border-0 bg-gradient-card">
        <CardHeader className="flex flex-col items-center gap-2">
          <div className="mb-2 p-4 rounded-full bg-primary/10">
            <Shield size={48} className="text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Secure Platform</CardTitle>
          <CardDescription className="text-center text-lg text-muted-foreground">
            Your safety is our top priority. We use advanced security and moderation to keep the community safe and welcoming.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 mt-2">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-primary/10 text-primary"><Lock size={18} className="mr-1" /> Privacy</Badge>
              <span className="text-muted-foreground">Your data is encrypted and never shared without your consent.</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-primary/10 text-primary"><UserCheck size={18} className="mr-1" /> Moderation</Badge>
              <span className="text-muted-foreground">All users are verified and swaps are monitored for safety.</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-primary/10 text-primary"><AlertTriangle size={18} className="mr-1" /> Report & Support</Badge>
              <span className="text-muted-foreground">Easily report issues and get help from our support team.</span>
            </div>
          </div>
          <div className="mt-6 text-center">
            <span className="text-primary font-semibold">Enjoy a safe and supportive skill-sharing experience!</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 