import { useState } from 'react';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp, Bus } from '@/contexts/AppContext';
import { toast } from 'sonner';
import { Plus, Edit, Trash } from 'lucide-react';

const Admin = () => {
  const { buses, setBuses, bookings } = useApp();
  const [editingBus, setEditingBus] = useState<Bus | null>(null);
  const [formData, setFormData] = useState({
    departure: '',
    arrival: '',
    duration: '',
    price: '',
    totalSeats: '',
    busNumber: '',
    isUncertain: false
  });

  const handleAddBus = () => {
    if (!formData.departure || !formData.arrival || !formData.price || !formData.busNumber) {
      toast.error('Please fill all required fields');
      return;
    }

    const newBus: Bus = {
      id: Math.random().toString(36).substr(2, 9),
      departure: formData.departure,
      arrival: formData.arrival,
      duration: formData.duration,
      price: parseInt(formData.price),
      totalSeats: parseInt(formData.totalSeats) || 40,
      availableSeats: parseInt(formData.totalSeats) || 40,
      busNumber: formData.busNumber,
      isUncertain: formData.isUncertain
    };

    setBuses([...buses, newBus]);
    toast.success('Bus added successfully');
    resetForm();
  };

  const handleUpdateBus = () => {
    if (!editingBus) return;

    const updatedBuses = buses.map(bus => 
      bus.id === editingBus.id 
        ? {
            ...bus,
            departure: formData.departure,
            arrival: formData.arrival,
            duration: formData.duration,
            price: parseInt(formData.price),
            totalSeats: parseInt(formData.totalSeats),
            busNumber: formData.busNumber,
            isUncertain: formData.isUncertain
          }
        : bus
    );

    setBuses(updatedBuses);
    toast.success('Bus updated successfully');
    resetForm();
  };

  const handleDeleteBus = (busId: string) => {
    if (confirm('Are you sure you want to delete this bus?')) {
      setBuses(buses.filter(bus => bus.id !== busId));
      toast.success('Bus deleted successfully');
    }
  };

  const handleEditBus = (bus: Bus) => {
    setEditingBus(bus);
    setFormData({
      departure: bus.departure,
      arrival: bus.arrival,
      duration: bus.duration,
      price: bus.price.toString(),
      totalSeats: bus.totalSeats.toString(),
      busNumber: bus.busNumber,
      isUncertain: bus.isUncertain || false
    });
  };

  const resetForm = () => {
    setEditingBus(null);
    setFormData({
      departure: '',
      arrival: '',
      duration: '',
      price: '',
      totalSeats: '',
      busNumber: '',
      isUncertain: false
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>

          <Tabs defaultValue="buses">
            <TabsList>
              <TabsTrigger value="buses">Bus Management</TabsTrigger>
              <TabsTrigger value="bookings">All Bookings</TabsTrigger>
            </TabsList>

            <TabsContent value="buses" className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">
                  {editingBus ? 'Edit Bus' : 'Add New Bus'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Departure Time (e.g., 7:00 AM)"
                    value={formData.departure}
                    onChange={(e) => setFormData({ ...formData, departure: e.target.value })}
                  />
                  <Input
                    placeholder="Arrival Time (e.g., 9:30 AM)"
                    value={formData.arrival}
                    onChange={(e) => setFormData({ ...formData, arrival: e.target.value })}
                  />
                  <Input
                    placeholder="Duration (e.g., 2h 30m)"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  />
                  <Input
                    placeholder="Price (NPR)"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                  <Input
                    placeholder="Total Seats"
                    type="number"
                    value={formData.totalSeats}
                    onChange={(e) => setFormData({ ...formData, totalSeats: e.target.value })}
                  />
                  <Input
                    placeholder="Bus Number (e.g., KTM-001)"
                    value={formData.busNumber}
                    onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="uncertain"
                      checked={formData.isUncertain}
                      onChange={(e) => setFormData({ ...formData, isUncertain: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="uncertain" className="text-sm text-foreground">
                      Mark as Uncertain Schedule
                    </label>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button 
                    onClick={editingBus ? handleUpdateBus : handleAddBus}
                    className="bg-gradient-to-r from-primary to-accent"
                  >
                    {editingBus ? 'Update Bus' : 'Add Bus'}
                  </Button>
                  {editingBus && (
                    <Button variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  )}
                </div>
              </Card>

              <div className="space-y-4">
                {buses.map(bus => (
                  <Card key={bus.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{bus.busNumber}</Badge>
                          {bus.isUncertain && (
                            <Badge variant="secondary">Uncertain</Badge>
                          )}
                        </div>
                        <p className="text-sm text-foreground">
                          {bus.departure} → {bus.arrival} ({bus.duration})
                        </p>
                        <p className="text-sm text-muted-foreground">
                          NPR {bus.price} | {bus.availableSeats}/{bus.totalSeats} seats available
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditBus(bus)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleDeleteBus(bus.id)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="bookings">
              <div className="space-y-4">
                {bookings.map(booking => {
                  const bus = buses.find(b => b.id === booking.busId);
                  return (
                    <Card key={booking.id} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Booking ID</p>
                          <p className="font-semibold text-foreground">
                            {booking.id.slice(0, 8).toUpperCase()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Passenger</p>
                          <p className="font-semibold text-foreground">{booking.customerName}</p>
                          <p className="text-xs text-muted-foreground">{booking.customerEmail}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Bus & Seats</p>
                          <p className="font-semibold text-foreground">
                            {bus?.busNumber} - Seats {booking.seatNumbers.join(', ')}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Status</p>
                          <Badge 
                            variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                            className={booking.status === 'confirmed' ? 'bg-success' : ''}
                          >
                            {booking.status}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Admin;
