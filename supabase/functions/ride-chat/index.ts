
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
    
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    
    // Create Resend client (if API key is available)
    const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null
    
    const { method } = req.url.split('?')[0].split('/').pop() || ''
    
    if (method === 'send') {
      const { senderId, recipientId, rideId, content } = await req.json()
      
      if (!senderId || !recipientId || !rideId || !content) {
        return new Response(
          JSON.stringify({ 
            error: "Missing required fields" 
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400
          }
        )
      }
      
      // Insert message into database
      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          sender_id: senderId,
          recipient_id: recipientId,
          ride_id: rideId,
          content,
          read: false
        })
        .select()
        .single()
      
      if (error) {
        return new Response(
          JSON.stringify({ error: "Failed to send message" }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500
          }
        )
      }
      
      // Get recipient email for notification
      const { data: recipient, error: recipientError } = await supabase
        .from('profiles')
        .select('email, name')
        .eq('id', recipientId)
        .single()
      
      // Get sender name
      const { data: sender, error: senderError } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', senderId)
        .single()
      
      // Get ride details
      const { data: ride, error: rideError } = await supabase
        .from('rides')
        .select('start_city, end_city')
        .eq('id', rideId)
        .single()
      
      // Send email notification if Resend is configured
      if (resend && recipient && sender && ride && !recipientError && !senderError && !rideError) {
        try {
          await resend.emails.send({
            from: 'RideShare <onboarding@resend.dev>',
            to: [recipient.email],
            subject: `New message from ${sender.name} about your ride`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Hello ${recipient.name},</h2>
                <p>You have received a new message from ${sender.name} regarding your ride from ${ride.start_city} to ${ride.end_city}.</p>
                <div style="padding: 15px; background-color: #f0f0f0; border-left: 4px solid #333; margin: 20px 0;">
                  <p style="margin: 0;">"${content}"</p>
                </div>
                <p>Log in to the RideShare app to respond.</p>
                <p>Safe travels,<br>The RideShare Team</p>
              </div>
            `,
          })
        } catch (emailError) {
          console.error("Failed to send email notification:", emailError)
          // Continue even if email fails
        }
      }
      
      return new Response(
        JSON.stringify(message),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        }
      )
    } else if (method === 'list') {
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
      
      // Get messages for this user and ride
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(*),
          recipient:recipient_id(*)
        `)
        .eq('ride_id', rideId)
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .order('created_at', { ascending: true })
      
      if (error) {
        return new Response(
          JSON.stringify({ error: "Failed to fetch messages" }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500
          }
        )
      }
      
      // Mark messages as read
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('ride_id', rideId)
        .eq('recipient_id', userId)
        .eq('read', false)
      
      return new Response(
        JSON.stringify(data),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        }
      )
    }
    
    return new Response(
      JSON.stringify({ error: "Invalid method" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
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
