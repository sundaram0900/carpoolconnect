
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0"
import { Resend } from "npm:resend@1.0.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || ""
    const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
    
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing Resend API key" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      )
    }
    
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    
    // Create Resend client
    const resend = new Resend(RESEND_API_KEY)
    
    // Get request body
    const { booking, ride, user, seats } = await req.json()
    
    if (!booking || !ride || !user) {
      return new Response(
        JSON.stringify({ error: "Missing required data" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      )
    }
    
    // Format price and dates
    const pricePerSeat = ride.price
    const totalPrice = seats * pricePerSeat
    const serviceFee = Math.round(totalPrice * 0.05) // 5% service fee
    const finalPrice = totalPrice + serviceFee
    const formattedDate = new Date(ride.date).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    
    // Customer email notification
    try {
      if (user.email) {
        await resend.emails.send({
          from: 'RideShare <onboarding@resend.dev>',
          to: [user.email],
          subject: 'Your Ride Booking Confirmation',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
              <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #333;">Booking Confirmation</h1>
                <p style="color: #666;">Reference: ${booking.id}</p>
              </div>
              
              <div style="margin-bottom: 20px;">
                <h2 style="color: #333; font-size: 18px;">Ride Details</h2>
                <p><strong>From:</strong> ${ride.start_city}</p>
                <p><strong>To:</strong> ${ride.end_city}</p>
                <p><strong>Date:</strong> ${formattedDate}</p>
                <p><strong>Time:</strong> ${ride.time}</p>
                <p><strong>Driver:</strong> ${ride.driver.name}</p>
                <p><strong>Vehicle:</strong> ${ride.car_color} ${ride.car_make} ${ride.car_model}</p>
              </div>
              
              <div style="margin-bottom: 20px;">
                <h2 style="color: #333; font-size: 18px;">Booking Summary</h2>
                <p><strong>Number of Seats:</strong> ${seats}</p>
                <p><strong>Payment Method:</strong> ${booking.payment_method}</p>
                <p><strong>Contact Phone:</strong> ${booking.contact_phone}</p>
                ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ''}
              </div>
              
              <div style="border-top: 1px solid #eee; padding-top: 15px;">
                <table style="width: 100%;">
                  <tr>
                    <td style="text-align: left;"><strong>Price per seat:</strong></td>
                    <td style="text-align: right;">₹${pricePerSeat.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="text-align: left;"><strong>Subtotal (${seats} seats):</strong></td>
                    <td style="text-align: right;">₹${totalPrice.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="text-align: left;"><strong>Service Fee:</strong></td>
                    <td style="text-align: right;">₹${serviceFee.toFixed(2)}</td>
                  </tr>
                  <tr style="font-size: 18px; font-weight: bold;">
                    <td style="text-align: left; padding-top: 10px;">Total:</td>
                    <td style="text-align: right; padding-top: 10px;">₹${finalPrice.toFixed(2)}</td>
                  </tr>
                </table>
              </div>
              
              <div style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">
                <p>Thank you for using RideShare! Safe travels.</p>
                <p>For any questions, please contact our support team.</p>
              </div>
            </div>
          `,
        });
      }
    } catch (emailError) {
      console.error("Error sending customer email:", emailError);
    }
    
    // Driver email notification
    try {
      if (ride.driver && ride.driver.email) {
        await resend.emails.send({
          from: 'RideShare <onboarding@resend.dev>',
          to: [ride.driver.email],
          subject: 'New Booking for Your Ride',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
              <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #333;">New Booking Alert</h1>
                <p style="color: #666;">Booking Reference: ${booking.id}</p>
              </div>
              
              <div style="margin-bottom: 20px;">
                <h2 style="color: #333; font-size: 18px;">Ride Details</h2>
                <p><strong>From:</strong> ${ride.start_city}</p>
                <p><strong>To:</strong> ${ride.end_city}</p>
                <p><strong>Date:</strong> ${formattedDate}</p>
                <p><strong>Time:</strong> ${ride.time}</p>
              </div>
              
              <div style="margin-bottom: 20px;">
                <h2 style="color: #333; font-size: 18px;">Passenger Details</h2>
                <p><strong>Name:</strong> ${user.name}</p>
                <p><strong>Contact Phone:</strong> ${booking.contact_phone}</p>
                <p><strong>Number of Seats Booked:</strong> ${seats}</p>
                ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ''}
              </div>
              
              <div style="border-top: 1px solid #eee; padding-top: 15px;">
                <p><strong>Total amount:</strong> ₹${totalPrice.toFixed(2)}</p>
                <p><strong>Available seats remaining:</strong> ${ride.available_seats - seats}</p>
              </div>
              
              <div style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">
                <p>Thank you for using RideShare to offer rides!</p>
                <p>For any questions, please contact our support team.</p>
              </div>
            </div>
          `,
        });
      }
    } catch (emailError) {
      console.error("Error sending driver email:", emailError);
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Booking notifications sent successfully"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
    
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
