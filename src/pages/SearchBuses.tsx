import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BusCard } from '@/components/BusCard';
import { useApp, Bus } from '@/contexts/AppContext';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const SearchBuses = () => {
  const navigate = useNavigate();
  const { buses } = useApp();
  const [filter, setFilter] = useState<'all' | 'morning' | 'afternoon'>('all');

  const filteredBuses = buses.filter(bus => {
    if (filter === 'all') return true;
    const hour = parseInt(bus.departure.split(':')[0]);
    if (filter === 'morning') return hour < 12;
    if (filter === 'afternoon') return hour >= 12;
    return true;
  });

  const handleBook = (bus: Bus) => {
    navigate('/booking', { state: { bus } });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Available Buses</h1>
              <p className="text-muted-foreground">Kathmandu → Palung</p>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Buses</SelectItem>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="afternoon">Afternoon</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredBuses.map(bus => (
              <BusCard key={bus.id} bus={bus} onBook={handleBook} />
            ))}
          </div>

          {filteredBuses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No buses available for selected filter</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SearchBuses;
