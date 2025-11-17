import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Bus {
  id: string;
  departure: string;
  arrival: string;
  duration: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  busNumber: string;
  isUncertain?: boolean;
}

export interface Booking {
  id: string;
  busId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  seatNumbers: number[];
  bookingDate: string;
  status: 'confirmed' | 'cancelled';
}

export interface User {
  id: string;
  contact: string;
  isAdmin: boolean;
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  buses: Bus[];
  setBuses: (buses: Bus[]) => void;
  bookings: Booking[];
  addBooking: (booking: Booking) => void;
  cancelBooking: (bookingId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultBuses: Bus[] = [
  { id: '1', departure: '6:00 AM', arrival: '8:30 AM', duration: '2h 30m', price: 500, totalSeats: 40, availableSeats: 40, busNumber: 'KTM-001', isUncertain: true },
  { id: '2', departure: '7:00 AM', arrival: '9:30 AM', duration: '2h 30m', price: 500, totalSeats: 40, availableSeats: 40, busNumber: 'KTM-002' },
  { id: '3', departure: '8:00 AM', arrival: '10:30 AM', duration: '2h 30m', price: 500, totalSeats: 40, availableSeats: 40, busNumber: 'KTM-003' },
  { id: '4', departure: '9:00 AM', arrival: '11:30 AM', duration: '2h 30m', price: 500, totalSeats: 40, availableSeats: 40, busNumber: 'KTM-004' },
  { id: '5', departure: '10:00 AM', arrival: '12:30 PM', duration: '2h 30m', price: 500, totalSeats: 40, availableSeats: 40, busNumber: 'KTM-005' },
  { id: '6', departure: '11:00 AM', arrival: '1:30 PM', duration: '2h 30m', price: 500, totalSeats: 40, availableSeats: 40, busNumber: 'KTM-006' },
  { id: '7', departure: '12:00 PM', arrival: '2:30 PM', duration: '2h 30m', price: 500, totalSeats: 40, availableSeats: 40, busNumber: 'KTM-007' },
  { id: '8', departure: '1:00 PM', arrival: '3:30 PM', duration: '2h 30m', price: 500, totalSeats: 40, availableSeats: 40, busNumber: 'KTM-008' },
  { id: '9', departure: '2:00 PM', arrival: '4:30 PM', duration: '2h 30m', price: 500, totalSeats: 40, availableSeats: 40, busNumber: 'KTM-009' },
  { id: '10', departure: '3:00 PM', arrival: '5:30 PM', duration: '2h 30m', price: 500, totalSeats: 40, availableSeats: 40, busNumber: 'KTM-010' },
  { id: '11', departure: '4:00 PM', arrival: '6:30 PM', duration: '2h 30m', price: 500, totalSeats: 40, availableSeats: 40, busNumber: 'KTM-011', isUncertain: true },
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [buses, setBuses] = useState<Bus[]>(defaultBuses);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const addBooking = (booking: Booking) => {
    setBookings(prev => [...prev, booking]);
    // Update available seats
    setBuses(prev => prev.map(bus => 
      bus.id === booking.busId 
        ? { ...bus, availableSeats: bus.availableSeats - booking.seatNumbers.length }
        : bus
    ));
  };

  const cancelBooking = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      setBookings(prev => prev.map(b => 
        b.id === bookingId ? { ...b, status: 'cancelled' } : b
      ));
      // Restore available seats
      setBuses(prev => prev.map(bus => 
        bus.id === booking.busId 
          ? { ...bus, availableSeats: bus.availableSeats + booking.seatNumbers.length }
          : bus
      ));
    }
  };

  return (
    <AppContext.Provider value={{ user, setUser, buses, setBuses, bookings, addBooking, cancelBooking }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
