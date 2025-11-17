import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { Calendar, Clock, MapPin, User, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';

const MyBookings = () => {
  const { bookings, buses, cancelBooking } = useApp();

  const handleCancelBooking = (bookingId: string) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      cancelBooking(bookingId);
      toast.success('Booking cancelled successfully');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold text-foreground">My Bookings</h1>

          {bookings.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No bookings yet</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {bookings.map(booking => {
                const bus = buses.find(b => b.id === booking.busId);
                if (!bus) return null;

                return (
                  <Card key={booking.id} className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-4 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-bold text-foreground">
                            Booking #{booking.id.slice(0, 8).toUpperCase()}
                          </h3>
                          <Badge 
                            variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                            className={booking.status === 'confirmed' ? 'bg-success' : ''}
                          >
                            {booking.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-muted-foreground">Bus Number</p>
                              <p className="font-semibold text-foreground">{bus.busNumber}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-muted-foreground">Departure</p>
                              <p className="font-semibold text-foreground">{bus.departure}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-muted-foreground">Passenger</p>
                              <p className="font-semibold text-foreground">{booking.customerName}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-muted-foreground">Seats</p>
                              <p className="font-semibold text-foreground">
                                {booking.seatNumbers.join(', ')}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-muted-foreground">Email</p>
                              <p className="font-semibold text-foreground">{booking.customerEmail}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-muted-foreground">Phone</p>
                              <p className="font-semibold text-foreground">{booking.customerPhone}</p>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-border">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Total Amount</span>
                            <span className="text-2xl font-bold text-primary">
                              NPR {booking.seatNumbers.length * bus.price}
                            </span>
                          </div>
                        </div>
                      </div>

                      {booking.status === 'confirmed' && (
                        <div className="flex items-end">
                          <Button 
                            variant="destructive"
                            onClick={() => handleCancelBooking(booking.id)}
                          >
                            Cancel Booking
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyBookings;
