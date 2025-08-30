import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Navigation } from '@/components/ui/navigation';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function TestSupabase() {
  const [testResult, setTestResult] = useState<string>('Not tested yet');
  const [error, setError] = useState<string | null>(null);
  const [envInfo, setEnvInfo] = useState<string>('');
  const [networkInfo, setNetworkInfo] = useState<string>('');
  const [email, setEmail] = useState<string>('test@example.com');
  const [password, setPassword] = useState<string>('password123');
  const [customEndpoint, setCustomEndpoint] = useState<string>('/auth/v1/token?grant_type=password');
  const [consoleLog, setConsoleLog] = useState<string>('');
  const originalConsoleLog = useRef(window.console.log);
  const originalConsoleError = useRef(window.console.error);
  const originalConsoleWarn = useRef(window.console.warn);

  useEffect(() => {
    // Get environment information on component mount
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKeyLength = import.meta.env.VITE_SUPABASE_ANON_KEY?.length || 0;
    
    setEnvInfo(`Supabase URL: ${supabaseUrl || 'Not set'}\nSupabase Key Length: ${supabaseKeyLength}\nVite Base URL: ${import.meta.env.BASE_URL || 'Not set'}`);
    
    // Intercept console logs
    window.console.log = (...args) => {
      const logString = args.map(arg => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2);
          } catch (e) {
            return String(arg);
          }
        }
        return String(arg);
      }).join(' ');
      
      setConsoleLog(prev => prev + '\n[LOG] ' + logString);
      originalConsoleLog.current.apply(console, args);
    };
    
    window.console.error = (...args) => {
      const logString = args.map(arg => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2);
          } catch (e) {
            return String(arg);
          }
        }
        return String(arg);
      }).join(' ');
      
      setConsoleLog(prev => prev + '\n[ERROR] ' + logString);
      originalConsoleError.current.apply(console, args);
    };
    
    window.console.warn = (...args) => {
      const logString = args.map(arg => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2);
          } catch (e) {
            return String(arg);
          }
        }
        return String(arg);
      }).join(' ');
      
      setConsoleLog(prev => prev + '\n[WARN] ' + logString);
      originalConsoleWarn.current.apply(console, args);
    };
    
    // Cleanup function
    return () => {
      window.console.log = originalConsoleLog.current;
      window.console.error = originalConsoleError.current;
      window.console.warn = originalConsoleWarn.current;
    };
  }, []);

  const testConnection = async () => {
    try {
      setTestResult('Testing connection...');
      setError(null);
      setNetworkInfo('');
      
      // Test network connectivity first
      try {
        const startTime = Date.now();
        const response = await fetch(import.meta.env.VITE_SUPABASE_URL, {
          method: 'HEAD',
          cache: 'no-cache',
        });
        const endTime = Date.now();
        
        setNetworkInfo(`Network test to Supabase URL:\nStatus: ${response.status}\nResponse time: ${endTime - startTime}ms`);
      } catch (netErr) {
        setNetworkInfo(`Network test failed: ${netErr instanceof Error ? netErr.message : String(netErr)}`);
      }
      
      // Test if we can connect to Supabase
      const { data, error, count } = await supabase.from('profiles').select('*', { count: 'exact' });
      
      if (error) {
        console.error('Supabase connection error:', error);
        setError(error.message);
        setTestResult('Connection failed');
        return;
      }
      
      console.log('Supabase connection successful:', data);
      console.log('Count:', count);
      setTestResult(`Connection successful! Count: ${count !== null ? count : 'unknown'}`);
    } catch (err) {
      console.error('Exception during test:', err);
      setError(err instanceof Error ? err.message : String(err));
      setTestResult('Connection failed with exception');
    }
  };

  const testAuth = async () => {
    try {
      setTestResult('Testing auth...');
      setError(null);
      
      // Test if auth is working
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Supabase auth error:', error);
        setError(error.message);
        setTestResult('Auth test failed');
        return;
      }
      
      console.log('Supabase auth test:', data);
      setTestResult('Auth test successful: ' + (data.session ? 'Session exists' : 'No active session'));
    } catch (err) {
      console.error('Exception during auth test:', err);
      setError(err instanceof Error ? err.message : String(err));
      setTestResult('Auth test failed with exception');
    }
  };
  
  const testSignIn = async () => {
    try {
      setTestResult('Testing sign in...');
      setError(null);
      setNetworkInfo('Running sign in test...');
      
      // Test sign in with test credentials using Supabase client
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      
      if (error) {
        console.error('Supabase sign in error:', error);
        setError(error.message);
        setTestResult('Sign in test failed');
        setNetworkInfo(prev => prev + '\nSupabase client error: ' + error.message);
        return;
      }
      
      console.log('Supabase sign in test:', data);
      setTestResult('Sign in test result: ' + (data.user ? 'Success' : 'Failed'));
      setNetworkInfo(prev => prev + '\nSupabase client sign in successful');
    } catch (err) {
      console.error('Exception during sign in test:', err);
      setError(err instanceof Error ? err.message : String(err));
      setTestResult('Sign in test failed with exception');
      setNetworkInfo(prev => prev + '\nException: ' + (err instanceof Error ? err.message : String(err)));
    }
  };
  
  const testDirectFetch = async () => {
    try {
      setTestResult('Testing direct fetch...');
      setError(null);
      setNetworkInfo('Running direct fetch test...');
      
      // First try with direct fetch to diagnose potential CORS issues
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const endpoint = customEndpoint.startsWith('/') ? customEndpoint : '/' + customEndpoint;
      const fullUrl = supabaseUrl + endpoint;
      
      console.log('Attempting direct fetch to:', fullUrl);
      setNetworkInfo(prev => prev + '\nAttempting direct fetch to: ' + fullUrl);
      
      try {
        const directResponse = await fetch(fullUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY as string,
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        });
        
        // Get response details
        const responseText = await directResponse.text();
        const responseHeaders = {};
        directResponse.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });
        
        console.log('Direct auth test response:', directResponse.status, directResponse.statusText);
        console.log('Response headers:', responseHeaders);
        console.log('Response body:', responseText);
        
        setNetworkInfo(prev => prev + `\nDirect fetch response:\nStatus: ${directResponse.status} ${directResponse.statusText}\nHeaders: ${JSON.stringify(responseHeaders, null, 2)}\nBody: ${responseText}`);
        setTestResult(`Direct fetch test: ${directResponse.ok ? 'Success' : 'Failed'} (${directResponse.status})`);
      } catch (directErr) {
        console.error('Direct auth test error:', directErr);
        setNetworkInfo(prev => prev + `\nDirect fetch failed: ${directErr instanceof Error ? directErr.message : String(directErr)}\nThis may indicate a CORS or network issue.`);
        setTestResult('Direct fetch test failed with exception');
        setError(directErr instanceof Error ? directErr.message : String(directErr));
      }
    } catch (err) {
      console.error('Exception during direct fetch test:', err);
      setError(err instanceof Error ? err.message : String(err));
      setTestResult('Direct fetch test failed with exception');
    }
  };

  const clearLogs = () => {
    setConsoleLog('');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto py-8">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Supabase Connection Test</CardTitle>
            <CardDescription>Diagnose Supabase connection and authentication issues</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="tests">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="tests">Tests</TabsTrigger>
                <TabsTrigger value="logs">Console Logs</TabsTrigger>
                <TabsTrigger value="config">Configuration</TabsTrigger>
              </TabsList>
              
              <TabsContent value="tests" className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <div className="font-medium">Test Result:</div>
                  <div className={`p-2 rounded ${testResult.includes('successful') || testResult.includes('Success') ? 'bg-green-100' : testResult === 'Not tested yet' ? 'bg-gray-100' : 'bg-red-100'}`}>
                    {testResult}
                  </div>
                  {error && (
                    <div className="text-red-500 text-sm mt-2">
                      Error: {error}
                    </div>
                  )}
                </div>
                
                {networkInfo && (
                  <div className="flex flex-col space-y-2">
                    <div className="font-medium">Network Info:</div>
                    <Textarea readOnly value={networkInfo} className="h-32 font-mono text-xs" />
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Test Email</Label>
                      <Input 
                        id="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="Email for testing"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Test Password</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="Password for testing"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endpoint">Custom Endpoint</Label>
                    <Input 
                      id="endpoint" 
                      value={customEndpoint} 
                      onChange={(e) => setCustomEndpoint(e.target.value)} 
                      placeholder="/auth/v1/token?grant_type=password"
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={testConnection} variant="default">
                      Test Connection
                    </Button>
                    <Button onClick={testAuth} variant="outline">
                      Test Auth
                    </Button>
                    <Button onClick={testSignIn} variant="secondary">
                      Test Sign In
                    </Button>
                    <Button onClick={testDirectFetch} variant="destructive">
                      Test Direct Fetch
                    </Button>
                    <Button onClick={() => {
                      setNetworkInfo('Running network test...');
                      setTimeout(() => {
                        fetch('https://qdovtwhmsamamdqvvkvv.supabase.co/rest/v1/health', {
                          method: 'GET',
                          headers: {
                            'Content-Type': 'application/json',
                            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY as string,
                          },
                        })
                        .then(res => res.text().then(text => {
                          setNetworkInfo(`Network test: ${res.status} ${res.statusText}\nResponse: ${text}`);
                        }))
                        .catch(err => setNetworkInfo(`Network test failed: ${err.message}`));
                      }, 100);
                    }}>
                      Network Test
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="logs" className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="font-medium">Console Logs:</div>
                  <Button onClick={clearLogs} variant="outline" size="sm">Clear Logs</Button>
                </div>
                <Textarea 
                  readOnly 
                  value={consoleLog} 
                  className="h-[400px] font-mono text-xs whitespace-pre" 
                />
              </TabsContent>
              
              <TabsContent value="config" className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <div className="font-medium">Environment Info:</div>
                  <Textarea readOnly value={envInfo} className="h-24 font-mono text-xs" />
                </div>
                
                <div className="flex flex-col space-y-2">
                  <div className="font-medium">Browser Info:</div>
                  <Textarea 
                    readOnly 
                    value={`User Agent: ${navigator.userAgent}\nPlatform: ${navigator.platform}\nCookies Enabled: ${navigator.cookieEnabled}\nLanguage: ${navigator.language}`} 
                    className="h-24 font-mono text-xs" 
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}