import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import { SeatSelector } from '@/components/SeatSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useApp, Bus } from '@/contexts/AppContext';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Booking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, addBooking } = useApp();
  const bus = location.state?.bus as Bus;

  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  if (!bus) {
    navigate('/search');
    return null;
  }

  const handleConfirmBooking = async () => {
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat');
      return;
    }
    if (!name || !email || !phone) {
      toast.error('Please fill all passenger details');
      return;
    }

    const bookingId = Math.random().toString(36).substr(2, 9).toUpperCase();
    
    const booking = {
      id: bookingId,
      busId: bus.id,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      seatNumbers: selectedSeats,
      bookingDate: new Date().toISOString(),
      status: 'confirmed' as const
    };

    addBooking(booking);
    
    // Send email confirmation via edge function
    toast.loading('Sending confirmation email...');
    
    try {
      const { data, error } = await supabase.functions.invoke('send-booking-email', {
        body: {
          customerEmail: email,
          customerName: name,
          bookingId: bookingId,
          busNumber: bus.busNumber,
          departure: bus.departure,
          arrival: bus.arrival,
          seatNumbers: selectedSeats,
          totalAmount: selectedSeats.length * bus.price,
          bookingDate: booking.bookingDate
        }
      });

      if (error) {
        console.error('Email sending error:', error);
        toast.dismiss();
        toast.success('Booking confirmed! (Email notification failed, but your booking is saved)');
      } else {
        console.log('Email sent successfully:', data);
        toast.dismiss();
        toast.success('Booking confirmed! Check your email for details.');
      }
    } catch (error) {
      console.error('Email error:', error);
      toast.dismiss();
      toast.success('Booking confirmed! (Email notification unavailable, but your booking is saved)');
    }
    
    navigate('/bookings');
  };

  const totalPrice = selectedSeats.length * bus.price;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/search')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Buses
          </Button>

          <Card className="p-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">Bus Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Bus Number</p>
                <p className="font-semibold text-foreground">{bus.busNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Departure</p>
                <p className="font-semibold text-foreground">{bus.departure}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Arrival</p>
                <p className="font-semibold text-foreground">{bus.arrival}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Price/Seat</p>
                <p className="font-semibold text-primary">NPR {bus.price}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-bold text-foreground mb-6">Select Seats</h2>
            <SeatSelector
              totalSeats={bus.totalSeats}
              availableSeats={bus.availableSeats}
              onSeatSelect={setSelectedSeats}
              selectedSeats={selectedSeats}
            />
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Selected Seats</p>
              <p className="text-lg font-bold text-foreground">
                {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">Passenger Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <Input
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-foreground">Phone Number</label>
                <Input
                  type="tel"
                  placeholder="+977 98XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-primary/5 border-primary">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-foreground">Total Amount</span>
              <span className="text-3xl font-bold text-primary">NPR {totalPrice}</span>
            </div>
            <Button 
              onClick={handleConfirmBooking}
              className="w-full h-12 text-lg bg-gradient-to-r from-primary to-accent hover:opacity-90"
              disabled={selectedSeats.length === 0}
            >
              Confirm Booking
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Booking;
