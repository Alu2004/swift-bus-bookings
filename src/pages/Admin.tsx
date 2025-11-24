import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Edit, Trash, Loader2 } from 'lucide-react';

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

interface Booking {
  id: string;
  passenger_name: string;
  passenger_email: string;
  passenger_phone: string;
  seat_numbers: number[];
  total_amount: number;
  status: string;
  payment_status: string;
  booking_date: string;
  bus_id: string;
}

const Admin = () => {
  const { user, loading } = useApp();
  const navigate = useNavigate();
  
  const [locations, setLocations] = useState<Location[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  // Location form state
  const [locationForm, setLocationForm] = useState({ name: '' });
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  
  // Bus form state
  const [busForm, setBusForm] = useState({
    bus_number: '',
    from_location_id: '',
    to_location_id: '',
    departure_time: '',
    arrival_time: '',
    price: '',
    total_seats: '40',
  });
  const [editingBus, setEditingBus] = useState<Bus | null>(null);

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      toast.error('Access denied. Admin only.');
      navigate('/');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user?.isAdmin) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    setLoadingData(true);
    await Promise.all([
      fetchLocations(),
      fetchBuses(),
      fetchBookings()
    ]);
    setLoadingData(false);
  };

  const fetchLocations = async () => {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('name');
    
    if (error) {
      toast.error('Failed to fetch locations');
      console.error(error);
    } else {
      setLocations(data || []);
    }
  };

  const fetchBuses = async () => {
    const { data, error } = await supabase
      .from('buses')
      .select('*')
      .order('departure_time');
    
    if (error) {
      toast.error('Failed to fetch buses');
      console.error(error);
    } else {
      setBuses(data || []);
    }
  };

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast.error('Failed to fetch bookings');
      console.error(error);
    } else {
      setBookings(data || []);
    }
  };

  // Location CRUD
  const handleAddLocation = async () => {
    if (!locationForm.name.trim()) {
      toast.error('Location name is required');
      return;
    }

    const { error } = await supabase
      .from('locations')
      .insert({ name: locationForm.name.trim() });

    if (error) {
      toast.error('Failed to add location');
      console.error(error);
    } else {
      toast.success('Location added successfully');
      setLocationForm({ name: '' });
      fetchLocations();
    }
  };

  const handleUpdateLocation = async () => {
    if (!editingLocation || !locationForm.name.trim()) return;

    const { error } = await supabase
      .from('locations')
      .update({ name: locationForm.name.trim() })
      .eq('id', editingLocation.id);

    if (error) {
      toast.error('Failed to update location');
      console.error(error);
    } else {
      toast.success('Location updated successfully');
      setEditingLocation(null);
      setLocationForm({ name: '' });
      fetchLocations();
    }
  };

  const handleDeleteLocation = async (id: string) => {
    if (!confirm('Are you sure? This will affect existing buses using this location.')) return;

    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete location. It may be in use by buses.');
      console.error(error);
    } else {
      toast.success('Location deleted successfully');
      fetchLocations();
    }
  };

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location);
    setLocationForm({ name: location.name });
  };

  // Bus CRUD
  const handleAddBus = async () => {
    if (!busForm.bus_number || !busForm.from_location_id || !busForm.to_location_id || 
        !busForm.departure_time || !busForm.arrival_time || !busForm.price) {
      toast.error('Please fill all required fields');
      return;
    }

    const { error } = await supabase
      .from('buses')
      .insert({
        bus_number: busForm.bus_number,
        from_location_id: busForm.from_location_id,
        to_location_id: busForm.to_location_id,
        departure_time: busForm.departure_time,
        arrival_time: busForm.arrival_time,
        price: parseFloat(busForm.price),
        total_seats: parseInt(busForm.total_seats),
        available_seats: parseInt(busForm.total_seats)
      });

    if (error) {
      toast.error('Failed to add bus');
      console.error(error);
    } else {
      toast.success('Bus added successfully');
      resetBusForm();
      fetchBuses();
    }
  };

  const handleUpdateBus = async () => {
    if (!editingBus) return;

    const { error } = await supabase
      .from('buses')
      .update({
        bus_number: busForm.bus_number,
        from_location_id: busForm.from_location_id,
        to_location_id: busForm.to_location_id,
        departure_time: busForm.departure_time,
        arrival_time: busForm.arrival_time,
        price: parseFloat(busForm.price),
        total_seats: parseInt(busForm.total_seats)
      })
      .eq('id', editingBus.id);

    if (error) {
      toast.error('Failed to update bus');
      console.error(error);
    } else {
      toast.success('Bus updated successfully');
      resetBusForm();
      fetchBuses();
    }
  };

  const handleDeleteBus = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bus?')) return;

    const { error } = await supabase
      .from('buses')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete bus');
      console.error(error);
    } else {
      toast.success('Bus deleted successfully');
      fetchBuses();
    }
  };

  const handleEditBus = (bus: Bus) => {
    setEditingBus(bus);
    setBusForm({
      bus_number: bus.bus_number,
      from_location_id: bus.from_location_id,
      to_location_id: bus.to_location_id,
      departure_time: bus.departure_time,
      arrival_time: bus.arrival_time,
      price: bus.price.toString(),
      total_seats: bus.total_seats.toString()
    });
  };

  const resetBusForm = () => {
    setEditingBus(null);
    setBusForm({
      bus_number: '',
      from_location_id: '',
      to_location_id: '',
      departure_time: '',
      arrival_time: '',
      price: '',
      total_seats: '40'
    });
  };

  const getLocationName = (locationId: string) => {
    return locations.find(loc => loc.id === locationId)?.name || 'Unknown';
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>

          <Tabs defaultValue="locations">
            <TabsList>
              <TabsTrigger value="locations">Locations</TabsTrigger>
              <TabsTrigger value="buses">Buses</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
            </TabsList>

            {/* Locations Tab */}
            <TabsContent value="locations" className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">
                  {editingLocation ? 'Edit Location' : 'Add New Location'}
                </h2>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="location-name">Location Name</Label>
                    <Input
                      id="location-name"
                      placeholder="e.g., Kathmandu, Pokhara"
                      value={locationForm.name}
                      onChange={(e) => setLocationForm({ name: e.target.value })}
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <Button onClick={editingLocation ? handleUpdateLocation : handleAddLocation}>
                      {editingLocation ? 'Update' : 'Add'}
                    </Button>
                    {editingLocation && (
                      <Button variant="outline" onClick={() => {
                        setEditingLocation(null);
                        setLocationForm({ name: '' });
                      }}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">All Locations</h2>
                {locations.length === 0 ? (
                  <p className="text-muted-foreground">No locations added yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Location Name</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {locations.map((location) => (
                        <TableRow key={location.id}>
                          <TableCell>{location.name}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditLocation(location)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteLocation(location.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Card>
            </TabsContent>

            {/* Buses Tab */}
            <TabsContent value="buses" className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">
                  {editingBus ? 'Edit Bus' : 'Add New Bus'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bus-number">Bus Number</Label>
                    <Input
                      id="bus-number"
                      placeholder="e.g., KTM-001"
                      value={busForm.bus_number}
                      onChange={(e) => setBusForm({ ...busForm, bus_number: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="from-location">From Location</Label>
                    <select
                      id="from-location"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={busForm.from_location_id}
                      onChange={(e) => setBusForm({ ...busForm, from_location_id: e.target.value })}
                    >
                      <option value="">Select location</option>
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="to-location">To Location</Label>
                    <select
                      id="to-location"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={busForm.to_location_id}
                      onChange={(e) => setBusForm({ ...busForm, to_location_id: e.target.value })}
                    >
                      <option value="">Select location</option>
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="departure-time">Departure Time</Label>
                    <Input
                      id="departure-time"
                      type="time"
                      value={busForm.departure_time}
                      onChange={(e) => setBusForm({ ...busForm, departure_time: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="arrival-time">Arrival Time</Label>
                    <Input
                      id="arrival-time"
                      type="time"
                      value={busForm.arrival_time}
                      onChange={(e) => setBusForm({ ...busForm, arrival_time: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Price (NPR)</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="500"
                      value={busForm.price}
                      onChange={(e) => setBusForm({ ...busForm, price: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="total-seats">Total Seats</Label>
                    <Input
                      id="total-seats"
                      type="number"
                      placeholder="40"
                      value={busForm.total_seats}
                      onChange={(e) => setBusForm({ ...busForm, total_seats: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={editingBus ? handleUpdateBus : handleAddBus}>
                    {editingBus ? 'Update Bus' : 'Add Bus'}
                  </Button>
                  {editingBus && (
                    <Button variant="outline" onClick={resetBusForm}>
                      Cancel
                    </Button>
                  )}
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">All Buses</h2>
                {buses.length === 0 ? (
                  <p className="text-muted-foreground">No buses added yet. Add locations first, then create bus routes.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Bus Number</TableHead>
                          <TableHead>Route</TableHead>
                          <TableHead>Departure</TableHead>
                          <TableHead>Arrival</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Seats</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {buses.map((bus) => (
                          <TableRow key={bus.id}>
                            <TableCell className="font-medium">{bus.bus_number}</TableCell>
                            <TableCell>
                              {getLocationName(bus.from_location_id)} → {getLocationName(bus.to_location_id)}
                            </TableCell>
                            <TableCell>{bus.departure_time}</TableCell>
                            <TableCell>{bus.arrival_time}</TableCell>
                            <TableCell>NPR {bus.price}</TableCell>
                            <TableCell>{bus.available_seats}/{bus.total_seats}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditBus(bus)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteBus(bus.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Bookings Tab */}
            <TabsContent value="bookings" className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">All Bookings</h2>
                {bookings.length === 0 ? (
                  <p className="text-muted-foreground">No bookings yet.</p>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => {
                      const bus = buses.find(b => b.id === booking.bus_id);
                      return (
                        <Card key={booking.id} className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2 flex-1">
                              <div>
                                <p className="font-semibold">{booking.passenger_name}</p>
                                <p className="text-sm text-muted-foreground">{booking.passenger_email}</p>
                                <p className="text-sm text-muted-foreground">📱 {booking.passenger_phone}</p>
                              </div>
                              {bus && (
                                <div className="text-sm">
                                  <p className="font-medium">
                                    {getLocationName(bus.from_location_id)} → {getLocationName(bus.to_location_id)}
                                  </p>
                                  <p className="text-muted-foreground">Bus: {bus.bus_number}</p>
                                  <p className="text-muted-foreground">Departure: {bus.departure_time}</p>
                                </div>
                              )}
                              <div>
                                <p className="text-sm">Seats: {booking.seat_numbers.join(', ')}</p>
                                <p className="text-sm font-medium">Total: NPR {booking.total_amount}</p>
                                <p className="text-sm text-muted-foreground">
                                  Payment: {booking.payment_status === 'cash_on_delivery' ? 'Cash on Delivery' : booking.payment_status}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Booked: {new Date(booking.booking_date).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 items-end">
                              <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                                {booking.status}
                              </Badge>
                              {booking.payment_status === 'cash_on_delivery' && (
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                                  COD
                                </Badge>
                              )}
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Admin;
