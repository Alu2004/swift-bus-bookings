import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { useApp } from '@/contexts/AppContext';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  const [from] = useState('Kathmandu');
  const [to] = useState('Palung');

  const handleSearch = () => {
    if (!user) {
      navigate('/auth');
    } else {
      navigate('/search');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Book Your Bus Journey
            </h1>
            <p className="text-lg text-muted-foreground">
              Reliable bus service from Kathmandu to Palung
            </p>
          </div>

          <Card className="p-8 shadow-lg">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">From</label>
                  <div className="flex items-center gap-2 p-4 border-2 border-border rounded-lg bg-muted">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-foreground">{from}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">To</label>
                  <div className="flex items-center gap-2 p-4 border-2 border-border rounded-lg bg-muted">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-foreground">{to}</span>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleSearch}
                className="w-full h-14 text-lg bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                <Search className="w-5 h-5 mr-2" />
                Search Buses
              </Button>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
            <Card className="p-6 text-center space-y-3 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">🚌</span>
              </div>
              <h3 className="font-semibold text-foreground">13 Daily Buses</h3>
              <p className="text-sm text-muted-foreground">
                Multiple departure times from 6 AM to 4 PM
              </p>
            </Card>

            <Card className="p-6 text-center space-y-3 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">✉️</span>
              </div>
              <h3 className="font-semibold text-foreground">Email Confirmation</h3>
              <p className="text-sm text-muted-foreground">
                Instant booking confirmation via email
              </p>
            </Card>

            <Card className="p-6 text-center space-y-3 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="font-semibold text-foreground">Secure Booking</h3>
              <p className="text-sm text-muted-foreground">
                OTP-based authentication for safety
              </p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
