
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
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set")
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || ""
    const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    
    // Create Resend client
    const resend = new Resend(RESEND_API_KEY)
    
    // Get request body
    const { userId, rideId } = await req.json()
    
    if (!userId || !rideId) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields: userId and rideId are required" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      )
    }
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Set expiration time (15 minutes from now)
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 15)
    
    // Get user email
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('email, name')
      .eq('id', userId)
      .single()
    
    if (userError || !userData) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404 
        }
      )
    }
    
    // Get ride details
    const { data: rideData, error: rideError } = await supabase
      .from('rides')
      .select('start_city, end_city, date, time')
      .eq('id', rideId)
      .single()
    
    if (rideError || !rideData) {
      return new Response(
        JSON.stringify({ error: "Ride not found" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404 
        }
      )
    }
    
    // Store OTP in database (we'll need to create this table)
    const { error: insertError } = await supabase
      .from('verification_codes')
      .insert({
        user_id: userId,
        ride_id: rideId,
        code: otp,
        expires_at: expiresAt.toISOString(),
        verified: false
      })
    
    if (insertError) {
      return new Response(
        JSON.stringify({ error: "Failed to generate verification code" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500 
        }
      )
    }
    
    // Send email with OTP
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'RideShare <onboarding@resend.dev>',
      to: [userData.email],
      subject: 'Your RideShare Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hello ${userData.name},</h2>
          <p>Your verification code for the ride from <strong>${rideData.start_city}</strong> to <strong>${rideData.end_city}</strong> on ${rideData.date} at ${rideData.time} is:</p>
          <div style="text-align: center; padding: 20px; background-color: #f0f0f0; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <p>Safe travels,<br>The RideShare Team</p>
        </div>
      `,
    })
    
    if (emailError) {
      return new Response(
        JSON.stringify({ error: "Failed to send verification email" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500 
        }
      )
    }
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Verification code sent successfully" 
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
