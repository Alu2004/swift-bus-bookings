import { Clock, MapPin, Calendar, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bus } from '@/contexts/AppContext';

interface BusCardProps {
  bus: Bus;
  onBook: (bus: Bus) => void;
}

export const BusCard = ({ bus, onBook }: BusCardProps) => {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-1 space-y-3 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">
                {bus.busNumber}
              </Badge>
              {bus.isUncertain && (
                <Badge variant="secondary" className="bg-secondary/20 text-secondary-foreground">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Uncertain
                </Badge>
              )}
            </div>
            <span className="text-2xl font-bold text-primary">NPR {bus.price}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Departure</p>
                <p className="font-semibold text-foreground">{bus.departure}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Arrival</p>
                <p className="font-semibold text-foreground">{bus.arrival}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-semibold text-foreground">{bus.duration}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <div className="flex-1 bg-muted rounded-full h-2">
              <div 
                className="bg-success rounded-full h-2 transition-all"
                style={{ width: `${(bus.availableSeats / bus.totalSeats) * 100}%` }}
              />
            </div>
            <span className="text-sm text-muted-foreground">
              {bus.availableSeats}/{bus.totalSeats} seats available
            </span>
          </div>
        </div>

        <Button 
          onClick={() => onBook(bus)}
          disabled={bus.availableSeats === 0}
          className="w-full md:w-auto bg-gradient-to-r from-primary to-accent hover:opacity-90"
        >
          {bus.availableSeats === 0 ? 'Sold Out' : 'Book Now'}
        </Button>
      </div>
    </Card>
  );
};
