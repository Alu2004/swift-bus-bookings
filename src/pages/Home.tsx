import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';

interface Location {
  id: string;
  name: string;
}

interface Bus {
  id: string;
  bus_number: string;
  from_location_id: string;
  to_location_id: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  total_seats: number;
  available_seats: number;
}

const Home = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  const [locations, setLocations] = useState<Location[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch locations
    const { data: locationsData } = await supabase
      .from('locations')
      .select('*')
      .order('name');
    
    // Fetch buses
    const { data: busesData } = await supabase
      .from('buses')
      .select('*')
      .order('departure_time')
      .limit(6);
    
    if (locationsData) setLocations(locationsData);
    if (busesData) setBuses(busesData);
    setLoading(false);
  };

  const handleSearch = () => {
    if (!user) {
      navigate('/auth');
    } else {
      navigate('/search');
    }
  };

  const getLocationName = (locationId: string) => {
    return locations.find(loc => loc.id === locationId)?.name || 'Unknown';
  };

  const totalBuses = buses.length;
  const uniqueRoutes = new Set(buses.map(b => `${b.from_location_id}-${b.to_location_id}`)).size;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Book Your Bus Journey
            </h1>
            <p className="text-lg text-muted-foreground">
              {locations.length > 0 ? `Travel across ${locations.length} destinations with ease` : 'Reliable bus booking service'}
            </p>
          </div>

          <Card className="p-8 shadow-lg">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Find Your Bus</h2>
              <Button 
                onClick={handleSearch}
                className="w-full h-14 text-lg bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                <Search className="w-5 h-5 mr-2" />
                Search Available Buses
              </Button>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 text-center space-y-3 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">🚌</span>
              </div>
              <h3 className="font-semibold text-foreground">{totalBuses > 0 ? `${totalBuses}+ Buses` : 'Multiple Buses'}</h3>
              <p className="text-sm text-muted-foreground">
                {uniqueRoutes > 0 ? `${uniqueRoutes} routes available` : 'Various departure times'}
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
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="font-semibold text-foreground">Secure Booking</h3>
              <p className="text-sm text-muted-foreground">
                Safe and authenticated booking process
              </p>
            </Card>
          </div>

          {buses.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Available Buses Today</h2>
              <div className="grid gap-4">
                {buses.map((bus) => (
                  <Card key={bus.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex-1 space-y-3 w-full">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="font-mono">
                            {bus.bus_number}
                          </Badge>
                          <span className="text-2xl font-bold text-primary">NPR {bus.price}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Route</p>
                              <p className="font-semibold text-foreground">
                                {getLocationName(bus.from_location_id)} → {getLocationName(bus.to_location_id)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Departure</p>
                              <p className="font-semibold text-foreground">{bus.departure_time}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Arrival</p>
                              <p className="font-semibold text-foreground">{bus.arrival_time}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div 
                              className="bg-accent rounded-full h-2 transition-all"
                              style={{ width: `${(bus.available_seats / bus.total_seats) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {bus.available_seats}/{bus.total_seats} seats
                          </span>
                        </div>
                      </div>

                      <Button 
                        onClick={handleSearch}
                        disabled={bus.available_seats === 0}
                        className="w-full md:w-auto bg-gradient-to-r from-primary to-accent hover:opacity-90"
                      >
                        {bus.available_seats === 0 ? 'Sold Out' : 'Book Now'}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
              
              <div className="text-center">
                <Button variant="outline" size="lg" onClick={handleSearch}>
                  View All Buses
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
