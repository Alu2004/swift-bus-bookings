// Mock email service for demonstration
// In production, this would integrate with a real email service like SendGrid, AWS SES, etc.

interface EmailData {
  to: string;
  subject: string;
  body: string;
}

export const sendEmail = async (data: EmailData): Promise<boolean> => {
  console.log('📧 Mock Email Sent:');
  console.log('To:', data.to);
  console.log('Subject:', data.subject);
  console.log('Body:', data.body);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return true;
};

export const sendBookingConfirmation = async (
  email: string,
  bookingDetails: {
    bookingId: string;
    busNumber: string;
    departure: string;
    seatNumbers: number[];
    passengerName: string;
    totalAmount: number;
  }
) => {
  const emailBody = `
    Dear ${bookingDetails.passengerName},
    
    Your bus ticket has been confirmed!
    
    Booking ID: ${bookingDetails.bookingId}
    Bus Number: ${bookingDetails.busNumber}
    Departure Time: ${bookingDetails.departure}
    Seats: ${bookingDetails.seatNumbers.join(', ')}
    Total Amount: NPR ${bookingDetails.totalAmount}
    
    Route: Kathmandu → Palung
    
    Please arrive at the bus stop 15 minutes before departure.
    
    Thank you for choosing BusBook!
  `;

  return sendEmail({
    to: email,
    subject: `Booking Confirmation - ${bookingDetails.bookingId}`,
    body: emailBody
  });
};
