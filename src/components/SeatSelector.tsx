import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SeatSelectorProps {
  totalSeats: number;
  availableSeats: number;
  onSeatSelect: (seats: number[]) => void;
  selectedSeats: number[];
}

export const SeatSelector = ({ totalSeats, availableSeats, onSeatSelect, selectedSeats }: SeatSelectorProps) => {
  const bookedSeatsCount = totalSeats - availableSeats;
  const bookedSeats = Array.from({ length: bookedSeatsCount }, (_, i) => i + 1);

  const toggleSeat = (seatNumber: number) => {
    if (bookedSeats.includes(seatNumber)) return;
    
    if (selectedSeats.includes(seatNumber)) {
      onSeatSelect(selectedSeats.filter(s => s !== seatNumber));
    } else {
      onSeatSelect([...selectedSeats, seatNumber]);
    }
  };

  const renderSeats = () => {
    const seats = [];
    const seatsPerRow = 4;
    
    for (let i = 1; i <= totalSeats; i++) {
      const isBooked = bookedSeats.includes(i);
      const isSelected = selectedSeats.includes(i);
      
      seats.push(
        <button
          key={i}
          onClick={() => toggleSeat(i)}
          disabled={isBooked}
          className={cn(
            "w-12 h-12 rounded-lg border-2 font-semibold text-sm transition-all",
            "hover:scale-105 disabled:cursor-not-allowed disabled:hover:scale-100",
            isBooked && "bg-muted border-muted text-muted-foreground cursor-not-allowed",
            isSelected && "bg-primary border-primary text-primary-foreground",
            !isBooked && !isSelected && "bg-card border-border hover:border-primary"
          )}
        >
          {i}
        </button>
      );
      
      if (i % seatsPerRow === 2) {
        seats.push(<div key={`space-${i}`} className="w-8" />);
      }
    }
    
    return seats;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-6 justify-center items-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border-2 border-border bg-card" />
          <span className="text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border-2 border-primary bg-primary" />
          <span className="text-muted-foreground">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border-2 border-muted bg-muted" />
          <span className="text-muted-foreground">Booked</span>
        </div>
      </div>

      <div className="bg-muted/30 rounded-lg p-6 max-w-md mx-auto">
        <div className="text-center mb-4 pb-4 border-b border-border">
          <div className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-t-lg font-semibold">
            Driver
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-3 place-items-center">
          {renderSeats()}
        </div>
      </div>
    </div>
  );
};
