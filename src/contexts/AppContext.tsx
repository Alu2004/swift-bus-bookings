import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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
  email: string;
  full_name?: string;
  phone?: string;
  isAdmin: boolean;
}

interface AppContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  loading: boolean;
  buses: Bus[];
  setBuses: (buses: Bus[]) => void;
  bookings: Booking[];
  addBooking: (booking: Booking) => void;
  cancelBooking: (bookingId: string) => void;
  signOut: () => Promise<void>;
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
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [buses, setBuses] = useState<Bus[]>(defaultBuses);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSupabaseUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => {
          fetchUserRole(session.user.id);
        }, 0);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      // Fetch user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', userId)
        .single();

      // Check if user has admin role
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      const isAdmin = roles?.some(r => r.role === 'admin') ?? false;

      setUser({
        id: userId,
        email: supabaseUser?.email ?? '',
        full_name: profile?.full_name,
        phone: profile?.phone,
        isAdmin,
      });
    } catch (error) {
      console.error('Error fetching user role:', error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
  };

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
    <AppContext.Provider value={{ 
      user, 
      supabaseUser,
      loading,
      buses, 
      setBuses, 
      bookings, 
      addBooking, 
      cancelBooking,
      signOut 
    }}>
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
