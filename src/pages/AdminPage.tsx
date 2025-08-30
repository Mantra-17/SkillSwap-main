import { useState } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Ban, CheckCircle, XCircle, AlertTriangle, Users, MessageSquare, Download, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function AdminPage() {
  const [selectedReport, setSelectedReport] = useState<number | null>(null);
  const [banReason, setBanReason] = useState("");
  const [messageText, setMessageText] = useState("");

  // Mock data for reports and user management
  const [skillReports, setSkillReports] = useState([
    {
      id: 1,
      reportedSkill: "Advanced Hacking",
      reportedBy: "Sarah Johnson",
      reason: "Inappropriate skill description",
      description: "This skill description contains inappropriate content and doesn't seem legitimate.",
      date: "2024-01-20",
      status: "pending",
      skillOwner: "Anonymous User"
    },
    {
      id: 2,
      reportedSkill: "Get Rich Quick Schemes",
      reportedBy: "Mike Chen",
      reason: "Spam/Scam content",
      description: "This appears to be a scam offering unrealistic financial promises.",
      date: "2024-01-19",
      status: "pending",
      skillOwner: "BadActor123"
    }
  ]);

  const [userReports, setUserReports] = useState([
    {
      id: 1,
      reportedUser: {
        name: "TrollUser456",
        avatar: "/placeholder-avatar.jpg",
        email: "troll@example.com"
      },
      reportedBy: "Emily Rodriguez",
      reason: "Harassment",
      description: "User has been sending inappropriate messages and harassing other members.",
      date: "2024-01-20",
      status: "pending"
    }
  ]);

  const [allUsers, setAllUsers] = useState([
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah@example.com",
      avatar: "/placeholder-avatar.jpg",
      status: "active",
      joinDate: "2024-01-01",
      swapsCompleted: 5,
      rating: 4.9
    },
    {
      id: 2,
      name: "Mike Chen",
      email: "mike@example.com",
      avatar: "/placeholder-avatar.jpg",
      status: "active",
      joinDate: "2024-01-05",
      swapsCompleted: 3,
      rating: 4.8
    },
    {
      id: 3,
      name: "TrollUser456",
      email: "troll@example.com",
      avatar: "/placeholder-avatar.jpg",
      status: "active",
      joinDate: "2024-01-15",
      swapsCompleted: 0,
      rating: 0
    }
  ]);

  const [allSwaps, setAllSwaps] = useState([
    {
      id: 1,
      user1: "Sarah Johnson",
      user2: "Mike Chen",
      skill1: "React Development",
      skill2: "Photography",
      status: "completed",
      date: "2024-01-18",
      rating1: 5,
      rating2: 4
    },
    {
      id: 2,
      user1: "Emily Rodriguez",
      user2: "David Kim",
      skill1: "UI/UX Design",
      skill2: "Piano Lessons",
      status: "pending",
      date: "2024-01-20",
      rating1: null,
      rating2: null
    },
    {
      id: 3,
      user1: "Lisa Thompson",
      user2: "Alex Parker",
      skill1: "Yoga",
      skill2: "Cooking",
      status: "cancelled",
      date: "2024-01-19",
      rating1: null,
      rating2: null
    }
  ]);

  const handleRejectSkill = (reportId: number) => {
    setSkillReports(prev => 
      prev.map(report => 
        report.id === reportId 
          ? { ...report, status: 'resolved' }
          : report
      )
    );
    toast({
      title: "Skill removed",
      description: "The inappropriate skill has been removed from the platform.",
    });
  };

  const handleBanUser = (userId: number) => {
    if (!banReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for the ban.",
        variant: "destructive"
      });
      return;
    }

    setAllUsers(prev => 
      prev.map(user => 
        user.id === userId 
          ? { ...user, status: 'banned' }
          : user
      )
    );
    
    setUserReports(prev => 
      prev.map(report => 
        report.reportedUser.name === allUsers.find(u => u.id === userId)?.name
          ? { ...report, status: 'resolved' }
          : report
      )
    );

    setBanReason("");
    setSelectedReport(null);
    
    toast({
      title: "User banned",
      description: "The user has been banned from the platform.",
    });
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message to send.",
        variant: "destructive"
      });
      return;
    }

    setMessageText("");
    toast({
      title: "Message sent",
      description: "Platform-wide message has been sent to all users.",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'banned':
        return <Badge variant="destructive">Banned</Badge>;
      case 'completed':
        return <Badge variant="default">Completed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center">
                <Shield className="h-8 w-8 mr-3 text-primary" />
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage users, moderate content, and oversee platform activity
              </p>
            </div>
            <Button onClick={handleSendMessage} className="group">
              <Send className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
              Send Platform Message
            </Button>
          </div>

          <Tabs defaultValue="reports" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="reports" className="relative">
                Reports
                {(skillReports.filter(r => r.status === 'pending').length + 
                  userReports.filter(r => r.status === 'pending').length) > 0 && (
                  <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                    {skillReports.filter(r => r.status === 'pending').length + 
                     userReports.filter(r => r.status === 'pending').length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="swaps">Swaps</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="reports" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Skill Reports */}
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
                      Skill Reports
                    </CardTitle>
                    <CardDescription>
                      Reports about inappropriate skill descriptions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {skillReports.filter(r => r.status === 'pending').map((report) => (
                      <div key={report.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">"{report.reportedSkill}"</h4>
                          <span className="text-xs text-muted-foreground">{report.date}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Reported by: {report.reportedBy}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Owner: {report.skillOwner}
                        </p>
                        <p className="text-sm">{report.description}</p>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="destructive" onClick={() => handleRejectSkill(report.id)}>
                            <XCircle className="h-3 w-3 mr-1" />
                            Remove Skill
                          </Button>
                          <Button size="sm" variant="outline">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    ))}
                    {skillReports.filter(r => r.status === 'pending').length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No pending skill reports
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* User Reports */}
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2 text-red-500" />
                      User Reports
                    </CardTitle>
                    <CardDescription>
                      Reports about user behavior and violations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {userReports.filter(r => r.status === 'pending').map((report) => (
                      <div key={report.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={report.reportedUser.avatar} />
                              <AvatarFallback className="text-xs">
                                {report.reportedUser.name.substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm">{report.reportedUser.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{report.date}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Reported by: {report.reportedBy}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Reason: {report.reason}
                        </p>
                        <p className="text-sm">{report.description}</p>
                        <div className="flex space-x-2">
                          <Dialog open={selectedReport === report.id} onOpenChange={() => setSelectedReport(selectedReport === report.id ? null : report.id)}>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                <Ban className="h-3 w-3 mr-1" />
                                Ban User
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Ban User</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to ban {report.reportedUser.name}? This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="ban-reason">Reason for ban</Label>
                                  <Textarea
                                    id="ban-reason"
                                    placeholder="Enter the reason for banning this user..."
                                    value={banReason}
                                    onChange={(e) => setBanReason(e.target.value)}
                                    className="mt-2"
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button 
                                  variant="destructive" 
                                  onClick={() => {
                                    const userId = allUsers.find(u => u.name === report.reportedUser.name)?.id;
                                    if (userId) handleBanUser(userId);
                                  }}
                                >
                                  Ban User
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button size="sm" variant="outline">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    ))}
                    {userReports.filter(r => r.status === 'pending').length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No pending user reports
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Platform Message */}
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-blue-500" />
                    Send Platform-Wide Message
                  </CardTitle>
                  <CardDescription>
                    Send announcements, updates, or alerts to all users
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Enter your message (e.g., maintenance notifications, feature updates, policy changes)..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <Button onClick={handleSendMessage} disabled={!messageText.trim()}>
                    <Send className="h-4 w-4 mr-2" />
                    Send to All Users
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    View and manage all platform users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {allUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between border rounded-lg p-4">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">{user.name}</h4>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <p className="text-xs text-muted-foreground">
                              Joined: {user.joinDate} • {user.swapsCompleted} swaps • ⭐ {user.rating}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(user.status)}
                          {user.status === 'active' && (
                            <Button size="sm" variant="outline">
                              <Ban className="h-3 w-3 mr-1" />
                              Ban
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="swaps" className="space-y-4">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Swap Management</CardTitle>
                  <CardDescription>
                    Monitor and manage all skill swaps on the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {allSwaps.map((swap) => (
                      <div key={swap.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{swap.user1}</span>
                            <span className="text-muted-foreground">↔</span>
                            <span className="font-medium">{swap.user2}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(swap.status)}
                            <span className="text-sm text-muted-foreground">{swap.date}</span>
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <Badge variant="default">{swap.skill1}</Badge>
                            {swap.rating1 && <span className="ml-2 text-muted-foreground">⭐ {swap.rating1}</span>}
                          </div>
                          <div>
                            <Badge variant="outline">{swap.skill2}</Badge>
                            {swap.rating2 && <span className="ml-2 text-muted-foreground">⭐ {swap.rating2}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="text-lg">Total Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">
                      {allUsers.length}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {allUsers.filter(u => u.status === 'active').length} active
                    </p>
                  </CardContent>
                </Card>

                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="text-lg">Total Swaps</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-secondary">
                      {allSwaps.length}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {allSwaps.filter(s => s.status === 'completed').length} completed
                    </p>
                  </CardContent>
                </Card>

                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="text-lg">Pending Reports</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-orange-500">
                      {skillReports.filter(r => r.status === 'pending').length + 
                       userReports.filter(r => r.status === 'pending').length}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Needs attention
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Download className="h-5 w-5 mr-2" />
                    Download Reports
                  </CardTitle>
                  <CardDescription>
                    Generate and download platform activity reports
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <Button variant="outline" className="h-auto flex-col space-y-2 p-4">
                      <Users className="h-6 w-6" />
                      <span>User Activity Report</span>
                    </Button>
                    <Button variant="outline" className="h-auto flex-col space-y-2 p-4">
                      <MessageSquare className="h-6 w-6" />
                      <span>Swap Statistics</span>
                    </Button>
                    <Button variant="outline" className="h-auto flex-col space-y-2 p-4">
                      <AlertTriangle className="h-6 w-6" />
                      <span>Feedback Logs</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}