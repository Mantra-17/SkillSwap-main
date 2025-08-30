import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, RefreshCw, CheckCircle } from "lucide-react";

export default function RequestSwapsPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-background p-6">
      <Card className="max-w-2xl w-full shadow-xl border-0 bg-gradient-card">
        <CardHeader className="flex flex-col items-center gap-2">
          <div className="mb-2 p-4 rounded-full bg-primary/10">
            <MessageSquare size={48} className="text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Request Swaps</CardTitle>
          <CardDescription className="text-center text-lg text-muted-foreground">
            Send and receive skill swap requests with ease. Connect, negotiate, and agree on the perfect exchange.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 mt-2">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-primary/10 text-primary"><Send size={18} className="mr-1" /> Send Request</Badge>
              <span className="text-muted-foreground">Choose a skill and send a swap request to the user.</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-primary/10 text-primary"><RefreshCw size={18} className="mr-1" /> Negotiate</Badge>
              <span className="text-muted-foreground">Chat and negotiate the details of your swap.</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-primary/10 text-primary"><CheckCircle size={18} className="mr-1" /> Confirm</Badge>
              <span className="text-muted-foreground">Accept or decline requests and confirm your swap agreement.</span>
            </div>
          </div>
          <div className="mt-6 text-center">
            <span className="text-primary font-semibold">Start your first swap and grow your skills together!</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 