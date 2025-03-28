
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0"
import { Resend } from "npm:resend@1.0.0"
import { format } from "npm:date-fns@2.30.0"

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
    
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    
    // Create Resend client (if API key is available)
    const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null
    
    // Get request body
    const { bookingId, paymentStatus = "completed", transactionId = null } = await req.json()
    
    if (!bookingId) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required field: bookingId is required" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400
        }
      )
    }
    
    // Get booking details including ride and user information
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        ride:ride_id(*,
          driver:driver_id(*)
        ),
        user:user_id(*)
      `)
      .eq('id', bookingId)
      .single()
    
    if (bookingError || !booking) {
      return new Response(
        JSON.stringify({ error: "Booking not found" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404
        }
      )
    }
    
    // Generate a receipt if it doesn't exist
    const { data: existingReceipt, error: receiptError } = await supabase
      .from('receipts')
      .select('*')
      .eq('booking_id', bookingId)
      .maybeSingle()
    
    let receipt
    
    if (!existingReceipt) {
      // Calculate total amount
      const totalAmount = booking.seats * booking.ride.price
      
      // Create receipt
      const { data: newReceipt, error: createError } = await supabase
        .from('receipts')
        .insert({
          booking_id: bookingId,
          amount: totalAmount,
          payment_method: booking.payment_method,
          payment_status: paymentStatus,
          transaction_id: transactionId
        })
        .select()
        .single()
      
      if (createError) {
        return new Response(
          JSON.stringify({ error: "Failed to generate receipt" }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500
          }
        )
      }
      
      receipt = newReceipt
    } else {
      // Update existing receipt
      const { data: updatedReceipt, error: updateError } = await supabase
        .from('receipts')
        .update({
          payment_status: paymentStatus,
          transaction_id: transactionId || existingReceipt.transaction_id
        })
        .eq('id', existingReceipt.id)
        .select()
        .single()
      
      if (updateError) {
        return new Response(
          JSON.stringify({ error: "Failed to update receipt" }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500
          }
        )
      }
      
      receipt = updatedReceipt
    }
    
    // Send email with receipt if resend is configured
    if (resend && booking.user.email) {
      try {
        const formattedDate = format(new Date(booking.ride.date), "MMMM dd, yyyy")
        const receiptTotal = booking.seats * booking.ride.price
        const serviceFee = Math.round(receiptTotal * 0.05) // 5% service fee
        const grandTotal = receiptTotal + serviceFee
        
        await resend.emails.send({
          from: 'RideShare <onboarding@resend.dev>',
          to: [booking.user.email],
          subject: 'Your RideShare Receipt',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
              <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #333; margin-bottom: 5px;">Receipt</h1>
                <p style="color: #666; margin-top: 0;">Transaction ID: ${receipt.transaction_id || 'N/A'}</p>
              </div>
              
              <div style="margin-bottom: 20px;">
                <h2 style="color: #333; font-size: 18px; margin-bottom: 10px;">Ride Details</h2>
                <p><strong>From:</strong> ${booking.ride.start_city}</p>
                <p><strong>To:</strong> ${booking.ride.end_city}</p>
                <p><strong>Date:</strong> ${formattedDate}</p>
                <p><strong>Time:</strong> ${booking.ride.time}</p>
                <p><strong>Driver:</strong> ${booking.ride.driver.name}</p>
              </div>
              
              <div style="margin-bottom: 20px;">
                <h2 style="color: #333; font-size: 18px; margin-bottom: 10px;">Booking Summary</h2>
                <p><strong>Number of Seats:</strong> ${booking.seats}</p>
                <p><strong>Payment Method:</strong> ${booking.payment_method}</p>
              </div>
              
              <div style="border-top: 1px solid #eee; padding-top: 15px;">
                <table style="width: 100%;">
                  <tr>
                    <td style="text-align: left;"><strong>Price per seat:</strong></td>
                    <td style="text-align: right;">₹${booking.ride.price.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="text-align: left;"><strong>Subtotal (${booking.seats} seats):</strong></td>
                    <td style="text-align: right;">₹${receiptTotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="text-align: left;"><strong>Service Fee:</strong></td>
                    <td style="text-align: right;">₹${serviceFee.toFixed(2)}</td>
                  </tr>
                  <tr style="font-size: 18px; font-weight: bold;">
                    <td style="text-align: left; padding-top: 10px;">Total:</td>
                    <td style="text-align: right; padding-top: 10px;">₹${grandTotal.toFixed(2)}</td>
                  </tr>
                </table>
              </div>
              
              <div style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">
                <p>Thank you for using RideShare!</p>
                <p>For any questions, please contact our support team.</p>
              </div>
            </div>
          `,
        })
      } catch (emailError) {
        console.error("Failed to send receipt email:", emailError)
        // Continue even if email fails
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        receipt,
        message: "Receipt generated successfully"
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    )
    
  } catch (error) {
    console.error("Error:", error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    )
  }
})
