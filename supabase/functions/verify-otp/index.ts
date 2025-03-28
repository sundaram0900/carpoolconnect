
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0"

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
    
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    
    // Get request body
    const { userId, rideId, code } = await req.json()
    
    if (!userId || !rideId || !code) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields: userId, rideId, and code are required" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      )
    }
    
    // Check if the code exists and is valid
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('user_id', userId)
      .eq('ride_id', rideId)
      .eq('code', code)
      .gt('expires_at', now)
      .eq('verified', false)
      .single()
    
    if (error || !data) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Invalid or expired verification code" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400
        }
      )
    }
    
    // Mark the code as verified
    const { error: updateError } = await supabase
      .from('verification_codes')
      .update({ verified: true })
      .eq('id', data.id)
    
    if (updateError) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Failed to verify code" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500
        }
      )
    }
    
    // Update ride status to in-progress if this is a ride start verification
    const { data: rideData, error: rideError } = await supabase
      .from('rides')
      .select('status')
      .eq('id', rideId)
      .single()
    
    if (!rideError && rideData && rideData.status === 'scheduled') {
      await supabase
        .from('rides')
        .update({ status: 'in-progress' })
        .eq('id', rideId)
    }
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Verification successful" 
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
