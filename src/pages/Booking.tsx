import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import { SeatSelector } from '@/components/SeatSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface BusData {
  id: string;
  bus_number: string;
  from_location_id: string;
  to_location_id: string;
  departure_time: string;
  arrival_time: string;
  total_seats: number;
  available_seats: number;
  price: number;
  from_location?: { name: string };
  to_location?: { name: string };
}

const Booking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useApp();
  const busId = location.state?.busId as string;

  const [bus, setBus] = useState<BusData | null>(null);
  const [bookedSeats, setBookedSeats] = useState<number[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!busId) {
      navigate('/search');
      return;
    }

    fetchBusDetails();
    
    // Restore booking state if available
    const pendingBooking = localStorage.getItem('pendingBooking');
    if (pendingBooking && user) {
      const booking = JSON.parse(pendingBooking);
      if (booking.busId === busId) {
        setSelectedSeats(booking.selectedSeats);
        setName(booking.name);
        setEmail(booking.email);
        setPhone(booking.phone);
        localStorage.removeItem('pendingBooking');
        toast.success('Welcome back! Your seat selection has been restored.');
      }
    }
  }, [busId, navigate, user]);

  const fetchBusDetails = async () => {
    try {
      // Fetch bus with location names
      const { data: busData, error: busError } = await supabase
        .from('buses')
        .select(`
          *,
          from_location:locations!buses_from_location_id_fkey(name),
          to_location:locations!buses_to_location_id_fkey(name)
        `)
        .eq('id', busId)
        .single();

      if (busError) throw busError;

      setBus(busData);

      // Fetch all confirmed bookings for this bus to get booked seats
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('seat_numbers')
        .eq('bus_id', busId)
        .eq('status', 'confirmed');

      if (bookingsError) throw bookingsError;

      // Flatten all booked seat numbers
      const allBookedSeats = bookings.flatMap(b => b.seat_numbers);
      setBookedSeats(allBookedSeats);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching bus details:', error);
      toast.error('Failed to load bus details');
      navigate('/search');
    }
  };

  if (loading || !bus) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
      </div>
    );
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

    // Check if user is logged in, if not redirect to auth with booking state
    if (!user) {
      // Save booking state to localStorage for after login
      localStorage.setItem('pendingBooking', JSON.stringify({
        busId: bus.id,
        selectedSeats,
        name,
        email,
        phone
      }));
      toast.error('Please login to confirm your booking');
      navigate('/auth', { state: { returnTo: '/booking', busId: bus.id } });
      return;
    }

    try {
      toast.loading('Processing booking...');

      // Insert booking into database
      const { data: newBooking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          bus_id: bus.id,
          seat_numbers: selectedSeats,
          total_amount: selectedSeats.length * bus.price,
          passenger_name: name,
          passenger_email: email,
          passenger_phone: phone,
          status: 'confirmed',
          payment_status: 'pending'
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Update available seats on the bus
      const { error: updateError } = await supabase
        .from('buses')
        .update({ 
          available_seats: bus.available_seats - selectedSeats.length 
        })
        .eq('id', bus.id);

      if (updateError) throw updateError;

      toast.dismiss();
      
      // Send email confirmation via edge function
      try {
        const fromLocation = bus.from_location?.name || 'Unknown';
        const toLocation = bus.to_location?.name || 'Unknown';
        
        await supabase.functions.invoke('send-booking-email', {
          body: {
            customerEmail: email,
            customerName: name,
            bookingId: newBooking.id,
            busNumber: bus.bus_number,
            departure: bus.departure_time,
            arrival: bus.arrival_time,
            route: `${fromLocation} → ${toLocation}`,
            seatNumbers: selectedSeats,
            totalAmount: selectedSeats.length * bus.price,
            bookingDate: newBooking.booking_date
          }
        });
      } catch (emailError) {
        console.error('Email error:', emailError);
      }

      toast.success('Booking confirmed successfully!');
      navigate('/bookings');
    } catch (error) {
      console.error('Booking error:', error);
      toast.dismiss();
      toast.error('Failed to complete booking. Please try again.');
    }
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
                <p className="font-semibold text-foreground">{bus.bus_number}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Route</p>
                <p className="font-semibold text-foreground">
                  {bus.from_location?.name} → {bus.to_location?.name}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Departure</p>
                <p className="font-semibold text-foreground">{bus.departure_time}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Arrival</p>
                <p className="font-semibold text-foreground">{bus.arrival_time}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Price/Seat</p>
                <p className="font-semibold text-primary">NPR {bus.price}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Available Seats</p>
                <p className="font-semibold text-foreground">{bus.available_seats}/{bus.total_seats}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-bold text-foreground mb-6">Select Seats</h2>
            <SeatSelector
              totalSeats={bus.total_seats}
              bookedSeats={bookedSeats}
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
