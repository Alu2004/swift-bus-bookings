import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BookingEmailRequest {
  customerEmail: string;
  customerName: string;
  bookingId: string;
  busNumber: string;
  departure: string;
  arrival: string;
  seatNumbers: number[];
  totalAmount: number;
  bookingDate: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const bookingData: BookingEmailRequest = await req.json();

    console.log("Sending booking confirmation email to:", bookingData.customerEmail);

    const emailResponse = await resend.emails.send({
      from: "BusBook <onboarding@resend.dev>",
      to: [bookingData.customerEmail],
      subject: `🚌 Booking Confirmed - ${bookingData.bookingId}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #0e7490 0%, #0891b2 100%);
                color: white;
                padding: 30px;
                border-radius: 10px 10px 0 0;
                text-align: center;
              }
              .content {
                background: #f9fafb;
                padding: 30px;
                border: 1px solid #e5e7eb;
                border-top: none;
              }
              .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin: 20px 0;
              }
              .info-item {
                background: white;
                padding: 15px;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
              }
              .info-label {
                font-size: 12px;
                color: #6b7280;
                text-transform: uppercase;
                margin-bottom: 5px;
              }
              .info-value {
                font-size: 16px;
                font-weight: 600;
                color: #0e7490;
              }
              .seats {
                background: #0e7490;
                color: white;
                padding: 15px;
                border-radius: 8px;
                text-align: center;
                font-size: 20px;
                font-weight: bold;
                margin: 20px 0;
              }
              .total {
                background: #fed7aa;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
                margin: 20px 0;
              }
              .total-label {
                font-size: 14px;
                color: #78350f;
                margin-bottom: 5px;
              }
              .total-amount {
                font-size: 32px;
                font-weight: bold;
                color: #ea580c;
              }
              .footer {
                text-align: center;
                color: #6b7280;
                font-size: 14px;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
              }
              .important {
                background: #fef3c7;
                border-left: 4px solid #f59e0b;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 style="margin: 0;">🚌 BusBook</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Your Ticket is Confirmed!</p>
            </div>
            
            <div class="content">
              <h2 style="color: #0e7490; margin-top: 0;">Hello ${bookingData.customerName}!</h2>
              <p>Your bus ticket has been successfully booked. Here are your booking details:</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; border: 2px solid #0e7490; margin: 20px 0;">
                <div style="text-align: center;">
                  <div style="font-size: 12px; color: #6b7280;">BOOKING ID</div>
                  <div style="font-size: 24px; font-weight: bold; color: #0e7490; font-family: monospace;">
                    ${bookingData.bookingId}
                  </div>
                </div>
              </div>

              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Bus Number</div>
                  <div class="info-value">${bookingData.busNumber}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Route</div>
                  <div class="info-value">Kathmandu → Palung</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Departure Time</div>
                  <div class="info-value">${bookingData.departure}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Arrival Time</div>
                  <div class="info-value">${bookingData.arrival}</div>
                </div>
              </div>

              <div class="seats">
                Seat Number${bookingData.seatNumbers.length > 1 ? 's' : ''}: ${bookingData.seatNumbers.join(', ')}
              </div>

              <div class="total">
                <div class="total-label">TOTAL AMOUNT PAID</div>
                <div class="total-amount">NPR ${bookingData.totalAmount}</div>
              </div>

              <div class="important">
                <strong>⚠️ Important Information:</strong>
                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                  <li>Please arrive at the bus stop <strong>15 minutes before departure</strong></li>
                  <li>Carry a valid ID proof with you</li>
                  <li>Keep this booking confirmation email for reference</li>
                  <li>For any queries, contact us immediately</li>
                </ul>
              </div>

              <p style="text-align: center; color: #6b7280; margin-top: 30px;">
                Booked on: ${new Date(bookingData.bookingDate).toLocaleString('en-NP', {
                  dateStyle: 'full',
                  timeStyle: 'short'
                })}
              </p>
            </div>

            <div class="footer">
              <p><strong>BusBook</strong> - Your Trusted Bus Booking Partner</p>
              <p style="margin: 5px 0;">Kathmandu → Palung Route</p>
              <p style="font-size: 12px; color: #9ca3af;">This is an automated email. Please do not reply.</p>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true,
      message: "Booking confirmation email sent"
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-booking-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
