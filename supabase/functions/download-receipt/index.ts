
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";
import { format } from "https://deno.land/std@0.190.0/datetime/mod.ts";

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
    
    console.log("SUPABASE_URL exists:", !!supabaseUrl);
    console.log("SUPABASE_SERVICE_ROLE_KEY exists:", !!supabaseServiceKey);
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse the request body
    let receiptId;
    try {
      const body = await req.json();
      receiptId = body.receiptId;
      console.log("Receipt ID from request:", receiptId);
    } catch (error) {
      console.error("Error parsing request body:", error);
      throw new Error("Invalid request body");
    }
    
    if (!receiptId) {
      throw new Error("Receipt ID is required");
    }
    
    // Fetch receipt data with all necessary joins
    console.log("Fetching receipt details for ID:", receiptId);
    const { data: receipt, error: receiptError } = await supabase.rpc("get_receipt_details", {
      receipt_id_param: receiptId,
    });
    
    if (receiptError) {
      console.error("Error fetching receipt details:", receiptError);
      throw receiptError;
    }
    
    if (!receipt || receipt.length === 0) {
      console.error("No receipt found with ID:", receiptId);
      throw new Error("Receipt not found");
    }
    
    const receiptData = receipt[0];
    console.log("Receipt data fetched successfully:", receiptData.id);
    
    const formattedDate = format(new Date(receiptData.created_at), "yyyy-MM-dd");
    const receiptNumber = receiptData.id.substring(0, 8).toUpperCase();
    
    // Generate a PDF as a string (in a real implementation, you'd use a PDF library)
    const pdfContent = `
      <html>
        <head>
          <title>Receipt #${receiptNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .details { margin-bottom: 20px; }
            .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .total { font-weight: bold; border-top: 1px solid #000; padding-top: 10px; }
            .logo { text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
            .receipt-id { font-size: 12px; color: #666; margin-top: 10px; }
            .divider { border-top: 1px dashed #ccc; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">RideShare</div>
            <h1>RECEIPT</h1>
            <p>Date: ${formattedDate}</p>
            <p class="receipt-id">Receipt ID: ${receiptNumber}</p>
          </div>
          
          <div class="divider"></div>
          
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
            <div class="item">
              <span>Price per seat:</span>
              <span>₹${receiptData.booking_details.ride.price}</span>
            </div>
          </div>
          
          <div class="divider"></div>
          
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
            <div class="item">
              <span>Subtotal:</span>
              <span>₹${(receiptData.amount * 0.95).toFixed(2)}</span>
            </div>
            <div class="item">
              <span>Service Fee (5%):</span>
              <span>₹${(receiptData.amount * 0.05).toFixed(2)}</span>
            </div>
            <div class="item total">
              <span>Total Amount:</span>
              <span>₹${receiptData.amount}</span>
            </div>
          </div>
          
          <div class="divider"></div>
          
          <div style="text-align: center; margin-top: 50px; font-size: 12px; color: #666;">
            <p>Thank you for choosing RideShare for your journey!</p>
            <p>For customer support, please contact us at support@rideshare.com</p>
          </div>
        </body>
      </html>
    `;

    console.log("PDF content generated successfully");
    
    // In a real implementation, convert the HTML to a PDF
    // For now, we'll just return the HTML encoded as base64
    const encoder = new TextEncoder();
    const pdfBytes = encoder.encode(pdfContent);
    const base64Pdf = btoa(String.fromCharCode(...pdfBytes));
    
    console.log("Base64 PDF generated successfully, length:", base64Pdf.length);
    console.log("Sending response...");
    
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
