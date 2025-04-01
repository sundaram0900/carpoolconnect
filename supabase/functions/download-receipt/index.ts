
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

// Configure CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { receiptId } = await req.json();
    
    if (!receiptId) {
      throw new Error("Receipt ID is required");
    }
    
    // Fetch receipt data with all necessary joins
    const { data: receipt, error: receiptError } = await supabase.rpc("get_receipt_details", {
      receipt_id_param: receiptId,
    });
    
    if (receiptError) {
      throw receiptError;
    }
    
    if (!receipt || receipt.length === 0) {
      throw new Error("Receipt not found");
    }
    
    const receiptData = receipt[0];
    
    // Generate a PDF as a string (in a real implementation, you'd use a PDF library)
    // Here we're just creating a simple HTML-like structure
    const pdfContent = `
      <html>
        <head>
          <title>Receipt #${receiptData.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .details { margin-bottom: 20px; }
            .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .total { font-weight: bold; border-top: 1px solid #000; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>RECEIPT</h1>
            <p>Date: ${new Date(receiptData.created_at).toLocaleDateString()}</p>
            <p>Receipt ID: ${receiptData.id}</p>
          </div>
          
          <div class="details">
            <h2>Ride Details</h2>
            <div class="item">
              <span>From:</span>
              <span>${receiptData.booking_details.ride.start_city}</span>
            </div>
            <div class="item">
              <span>To:</span>
              <span>${receiptData.booking_details.ride.end_city}</span>
            </div>
            <div class="item">
              <span>Date:</span>
              <span>${receiptData.booking_details.ride.date}</span>
            </div>
            <div class="item">
              <span>Time:</span>
              <span>${receiptData.booking_details.ride.time}</span>
            </div>
            <div class="item">
              <span>Seats:</span>
              <span>${receiptData.booking_details.seats}</span>
            </div>
          </div>
          
          <div class="details">
            <h2>Payment Details</h2>
            <div class="item">
              <span>Payment Method:</span>
              <span>${receiptData.payment_method}</span>
            </div>
            <div class="item">
              <span>Payment Status:</span>
              <span>${receiptData.payment_status}</span>
            </div>
            <div class="item total">
              <span>Total Amount:</span>
              <span>₹${receiptData.amount}</span>
            </div>
          </div>
        </body>
      </html>
    `;

    // In a real implementation, convert the HTML to a PDF
    // For now, we'll just return the HTML encoded as base64
    const encoder = new TextEncoder();
    const pdfBytes = encoder.encode(pdfContent);
    const base64Pdf = btoa(String.fromCharCode(...pdfBytes));
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        pdf: base64Pdf 
      }),
      { 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        } 
      }
    );
    
  } catch (error) {
    console.error("Error generating receipt:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        } 
      }
    );
  }
});
