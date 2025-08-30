import { useState, useEffect } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, Star, Send, User, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

export default function RequestsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [completedSwaps, setCompletedSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingRequest, setProcessingRequest] = useState(null);
  const { toast } = useToast();

  // Get current user and fetch requests
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
          await fetchAllRequests(user.id);
        }
      } catch (error) {
        console.error('Error getting current user:', error);
        toast({
          title: "Error",
          description: "Failed to load user data",
          variant: "destructive",
        });
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
        fetchAllRequests(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setIncomingRequests([]);
        setOutgoingRequests([]);
        setCompletedSwaps([]);
      }
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  // Fetch all requests for the current user
  const fetchAllRequests = async (userId) => {
    try {
      // Fetch incoming requests (where user is the recipient)
      const { data: incomingData, error: incomingError } = await supabase
        .from('swap_requests')
        .select(`
          *,
          from_user:profiles!from_user_id(name, avatar, rating)
        `)
        .eq('to_user_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (incomingError) {
        console.error('Error fetching incoming requests:', incomingError);
      } else {
        setIncomingRequests(incomingData || []);
      }

      // Fetch outgoing requests (where user is the requester)
      const { data: outgoingData, error: outgoingError } = await supabase
        .from('swap_requests')
        .select(`
          *,
          to_user:profiles!to_user_id(name, avatar, rating)
        `)
        .eq('from_user_id', userId)
        .order('created_at', { ascending: false });

      if (outgoingError) {
        console.error('Error fetching outgoing requests:', outgoingError);
      } else {
        setOutgoingRequests(outgoingData || []);
      }

      // Fetch completed swaps
      const { data: completedData, error: completedError } = await supabase
        .from('swap_requests')
        .select(`
          *,
          from_user:profiles!from_user_id(name, avatar, rating),
          to_user:profiles!to_user_id(name, avatar, rating)
        `)
        .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (completedError) {
        console.error('Error fetching completed swaps:', completedError);
      } else {
        setCompletedSwaps(completedData || []);
      }

    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: "Error",
        description: "Failed to load requests",
        variant: "destructive",
      });
    }
  };

  // Handle accepting a swap request
  const handleAcceptRequest = async (requestId) => {
    setProcessingRequest(requestId);
    try {
      const { error } = await supabase
        .from('swap_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (error) {
        throw error;
      }

      toast({
        title: "Request Accepted! 🎉",
        description: "The swap request has been accepted. You can now coordinate with your partner.",
      });

      // Refresh the data
      if (currentUser) {
        await fetchAllRequests(currentUser.id);
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      toast({
        title: "Error",
        description: "Failed to accept request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingRequest(null);
    }
  };

  // Handle declining a swap request
  const handleDeclineRequest = async (requestId) => {
    setProcessingRequest(requestId);
    try {
      const { error } = await supabase
        .from('swap_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) {
        throw error;
      }

      toast({
        title: "Request Declined",
        description: "The swap request has been declined.",
      });

      // Refresh the data
      if (currentUser) {
        await fetchAllRequests(currentUser.id);
      }
    } catch (error) {
      console.error('Error declining request:', error);
      toast({
        title: "Error",
        description: "Failed to decline request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingRequest(null);
    }
  };

  // Handle completing a swap
  const handleCompleteSwap = async (requestId) => {
    setProcessingRequest(requestId);
    try {
      const { error } = await supabase
        .from('swap_requests')
        .update({ status: 'completed' })
        .eq('id', requestId);

      if (error) {
        throw error;
      }

      toast({
        title: "Swap Completed! 🎉",
        description: "Congratulations on completing your skill swap!",
      });

      // Refresh the data
      if (currentUser) {
        await fetchAllRequests(currentUser.id);
      }
    } catch (error) {
      console.error('Error completing swap:', error);
      toast({
        title: "Error",
        description: "Failed to complete swap. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingRequest(null);
    }
  };

  // Handle deleting an outgoing request
  const handleDeleteRequest = async (requestId) => {
    setProcessingRequest(requestId);
    try {
      const { error } = await supabase
        .from('swap_requests')
        .delete()
        .eq('id', requestId);

      if (error) {
        throw error;
      }

      toast({
        title: "Request Deleted",
        description: "Your swap request has been deleted.",
      });

      // Refresh the data
      if (currentUser) {
        await fetchAllRequests(currentUser.id);
      }
    } catch (error) {
      console.error('Error deleting request:', error);
      toast({
        title: "Error",
        description: "Failed to delete request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingRequest(null);
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!currentUser) return;

    const subscription = supabase
      .channel('swap_requests_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'swap_requests',
          filter: `from_user_id=eq.${currentUser.id} OR to_user_id=eq.${currentUser.id}`
        }, 
        (payload) => {
          console.log('Real-time update:', payload);
          // Refresh data when changes occur
          fetchAllRequests(currentUser.id);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading your requests...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground mb-4">
              Please sign in to view your swap requests
            </p>
            <Button asChild>
              <a href="/signin">Sign In</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Swap Requests</h1>
            <p className="text-muted-foreground">
              Manage your incoming and outgoing skill swap requests
            </p>
          </div>
          
          <Tabs defaultValue="incoming" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="incoming" className="relative">
                Incoming
                {incomingRequests.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                    {incomingRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="outgoing">
                Outgoing
                {outgoingRequests.length > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                    {outgoingRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed
                {completedSwaps.length > 0 && (
                  <Badge variant="default" className="ml-2 h-5 w-5 p-0 text-xs">
                    {completedSwaps.length}
                </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Incoming Requests Tab */}
            <TabsContent value="incoming" className="space-y-4">
              {incomingRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2">No incoming requests</h3>
                  <p className="text-muted-foreground">
                    You don't have any pending swap requests at the moment.
                  </p>
                </div>
              ) : (
                incomingRequests.map((request) => (
                <Card key={request.id} className="shadow-soft animate-slide-up">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={request.from_user?.avatar} />
                          <AvatarFallback>
                              {request.from_user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-lg">
                              {request.from_user?.name || 'Unknown User'}
                            </CardTitle>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                              <span className="text-sm text-muted-foreground">
                                {request.from_user?.rating || 'N/A'}
                              </span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                          {new Date(request.created_at).toLocaleDateString()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">They offer:</Label>
                          <Badge variant="default" className="mt-1">{request.skill_offered}</Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">They want:</Label>
                          <Badge variant="outline" className="mt-1">{request.skill_wanted}</Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Message:</Label>
                      <p className="mt-1 text-sm">{request.message}</p>
                    </div>
                    <div className="flex space-x-2 pt-2">
                        <Button 
                          className="flex-1"
                          onClick={() => handleAcceptRequest(request.id)}
                          disabled={processingRequest === request.id}
                        >
                          {processingRequest === request.id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                        Accept
                        </Button>
                        <Button 
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleDeclineRequest(request.id)}
                          disabled={processingRequest === request.id}
                        >
                          {processingRequest === request.id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                          )}
                        Decline
                        </Button>
                    </div>
                  </CardContent>
                </Card>
                ))
              )}
            </TabsContent>

            {/* Outgoing Requests Tab */}
            <TabsContent value="outgoing" className="space-y-4">
              {outgoingRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Send className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2">No outgoing requests</h3>
                  <p className="text-muted-foreground">
                    You haven't sent any swap requests yet.
                  </p>
                </div>
              ) : (
                outgoingRequests.map((request) => (
                <Card key={request.id} className="shadow-soft animate-slide-up">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={request.to_user?.avatar} />
                          <AvatarFallback>
                              {request.to_user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-lg">
                              {request.to_user?.name || 'Unknown User'}
                            </CardTitle>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                              <span className="text-sm text-muted-foreground">
                                {request.to_user?.rating || 'N/A'}
                              </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={request.status === 'accepted' ? 'default' : 'secondary'}
                          className="flex items-center"
                        >
                          {request.status === 'accepted' ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <Clock className="h-3 w-3 mr-1" />
                          )}
                          {request.status}
                        </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(request.created_at).toLocaleDateString()}
                          </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">You offer:</Label>
                          <Badge variant="default" className="mt-1">{request.skill_offered}</Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">You want:</Label>
                          <Badge variant="outline" className="mt-1">{request.skill_wanted}</Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Your message:</Label>
                      <p className="mt-1 text-sm">{request.message}</p>
                    </div>
                    {request.status === 'pending' && (
                      <div className="flex justify-end pt-2">
                          <Button 
                            variant="outline"
                            onClick={() => handleDeleteRequest(request.id)}
                            disabled={processingRequest === request.id}
                          >
                            {processingRequest === request.id ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                          <Send className="h-4 w-4 mr-2" />
                            )}
                          Delete Request
                          </Button>
                        </div>
                      )}
                      {request.status === 'accepted' && (
                        <div className="flex justify-end pt-2">
                          <Button 
                            onClick={() => handleCompleteSwap(request.id)}
                            disabled={processingRequest === request.id}
                          >
                            {processingRequest === request.id ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            Mark as Completed
                          </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
                ))
              )}
            </TabsContent>

            {/* Completed Swaps Tab */}
            <TabsContent value="completed" className="space-y-4">
              {completedSwaps.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2">No completed swaps</h3>
                  <p className="text-muted-foreground">
                    Complete your first skill swap to see it here!
                  </p>
                </div>
              ) : (
                completedSwaps.map((swap) => {
                  const isRequester = swap.from_user_id === currentUser.id;
                  const partner = isRequester ? swap.to_user : swap.from_user;
                  const skillGiven = isRequester ? swap.skill_offered : swap.skill_wanted;
                  const skillReceived = isRequester ? swap.skill_wanted : swap.skill_offered;

                  return (
                <Card key={swap.id} className="shadow-soft animate-slide-up">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                              <AvatarImage src={partner?.avatar} />
                          <AvatarFallback>
                                {partner?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                              <CardTitle className="text-lg">
                                {partner?.name || 'Unknown User'}
                              </CardTitle>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                                <span className="text-sm text-muted-foreground">
                                  {partner?.rating || 'N/A'}
                                </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="default" className="flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(swap.created_at).toLocaleDateString()}
                            </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">You taught:</Label>
                            <Badge variant="default" className="mt-1">{skillGiven}</Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">You learned:</Label>
                            <Badge variant="outline" className="mt-1">{skillReceived}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                  );
                })
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}