import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BusCard } from '@/components/BusCard';
import { Bus } from '@/contexts/AppContext';
import { Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const SearchBuses = () => {
  const navigate = useNavigate();
  const [buses, setBuses] = useState<Bus[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [fromLocation, setFromLocation] = useState<string>('all');
  const [toLocation, setToLocation] = useState<string>('all');
  const [filter, setFilter] = useState<'all' | 'morning' | 'afternoon'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocations();
    fetchBuses();
  }, []);

  const fetchLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      setLocations(data || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast.error('Failed to load locations');
    }
  };

  const fetchBuses = async () => {
    try {
      const { data, error } = await supabase
        .from('buses')
        .select(`
          *,
          from_location:locations!buses_from_location_id_fkey(id, name),
          to_location:locations!buses_to_location_id_fkey(id, name)
        `)
        .order('departure_time', { ascending: true });

      if (error) throw error;

      // Transform database data to match Bus interface
      const transformedBuses: Bus[] = (data || []).map((bus: any) => {
        const departureTime = new Date(`1970-01-01T${bus.departure_time}`);
        const arrivalTime = new Date(`1970-01-01T${bus.arrival_time}`);
        const durationMs = arrivalTime.getTime() - departureTime.getTime();
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

        return {
          id: bus.id,
          departure: departureTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
          arrival: arrivalTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
          duration: `${hours}h ${minutes}m`,
          price: Number(bus.price),
          totalSeats: bus.total_seats,
          availableSeats: bus.available_seats,
          busNumber: bus.bus_number,
          fromLocation: bus.from_location?.name,
          toLocation: bus.to_location?.name,
          fromLocationId: bus.from_location_id,
          toLocationId: bus.to_location_id,
        };
      });

      setBuses(transformedBuses);
    } catch (error) {
      console.error('Error fetching buses:', error);
      toast.error('Failed to load buses');
    } finally {
      setLoading(false);
    }
  };

  const filteredBuses = buses.filter(bus => {
    // Location filter
    if (fromLocation !== 'all' && bus.fromLocationId !== fromLocation) return false;
    if (toLocation !== 'all' && bus.toLocationId !== toLocation) return false;

    // Time filter
    if (filter === 'all') return true;
    const hour = parseInt(bus.departure.split(':')[0]);
    const isPM = bus.departure.includes('PM');
    const hour24 = isPM && hour !== 12 ? hour + 12 : (!isPM && hour === 12 ? 0 : hour);
    
    if (filter === 'morning') return hour24 < 12;
    if (filter === 'afternoon') return hour24 >= 12;
    return true;
  });

  const handleBook = (bus: Bus) => {
    navigate('/booking', { state: { busId: bus.id } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-muted-foreground">Loading buses...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold text-foreground">Available Buses</h1>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium text-foreground mb-2 block">From</label>
                <Select value={fromLocation} onValueChange={setFromLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select origin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map(loc => (
                      <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <label className="text-sm font-medium text-foreground mb-2 block">To</label>
                <Select value={toLocation} onValueChange={setToLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map(loc => (
                      <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <label className="text-sm font-medium text-foreground mb-2 block">Time</label>
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-muted-foreground" />
                  <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Times</SelectItem>
                      <SelectItem value="morning">Morning</SelectItem>
                      <SelectItem value="afternoon">Afternoon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {filteredBuses.map(bus => (
              <BusCard key={bus.id} bus={bus} onBook={handleBook} />
            ))}
          </div>

          {filteredBuses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No buses available for selected filters</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SearchBuses;
