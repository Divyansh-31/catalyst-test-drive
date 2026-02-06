import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Order } from '@/types';
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface RefundRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order;
}

export const RefundRequestModal = ({
  open,
  onOpenChange,
  order,
}: RefundRequestModalProps) => {
  const [reason, setReason] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles].slice(0, 5));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
    maxFiles: 5,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    console.log('[FraudX] Refund request submitted:', {
      orderId: order.id,
      reason,
      fileCount: files.length,
      timestamp: Date.now(),
    });

    setIsSuccess(true);
    setIsSubmitting(false);

    setTimeout(() => {
      onOpenChange(false);
      setIsSuccess(false);
      setReason('');
      setFiles([]);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Request Refund</DialogTitle>
          <DialogDescription>
            Submit a refund request for order {order.id}
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="flex flex-col items-center py-8 animate-fadeIn">
            <div className="h-16 w-16 rounded-full bg-success/20 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <h3 className="font-semibold text-lg mb-1">Request Submitted</h3>
            <p className="text-sm text-muted-foreground text-center">
              We'll review your request and get back to you within 24 hours.
            </p>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Items being returned */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Items</Label>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {order.items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex-shrink-0 h-14 w-14 rounded-lg overflow-hidden bg-muted"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for refund</Label>
              <Textarea
                id="reason"
                placeholder="Please describe why you're requesting a refund..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>

            {/* File upload */}
            <div className="space-y-2">
              <Label>Evidence (optional)</Label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {isDragActive
                    ? 'Drop files here...'
                    : 'Drag & drop images, or click to select'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Up to 5 images, max 5MB each
                </p>
              </div>

              {/* File previews */}
              {files.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-3">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="relative h-16 w-16 rounded-lg overflow-hidden bg-muted group"
                    >
                      {file.type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              className="w-full gradient-primary border-0"
              disabled={!reason.trim() || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
