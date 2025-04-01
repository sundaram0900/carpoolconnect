
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { databaseService } from "@/lib/services/database";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ReceiptDownloadProps {
  receiptId: string;
  receiptNumber: string;
}

const ReceiptDownload = ({ receiptId, receiptNumber }: ReceiptDownloadProps) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const pdfBlob = await databaseService.downloadReceipt(receiptId);
      
      if (!pdfBlob) {
        toast.error("Failed to download receipt");
        return;
      }
      
      // Create a download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Receipt-${receiptNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Receipt downloaded successfully");
    } catch (error) {
      console.error("Error downloading receipt:", error);
      toast.error("Failed to download receipt");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleDownload}
      disabled={isDownloading}
      className="flex items-center gap-1"
    >
      {isDownloading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <Download className="h-4 w-4 mr-2" />
      )}
      Download Receipt
    </Button>
  );
};

export default ReceiptDownload;
