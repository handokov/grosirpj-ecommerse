'use client'

import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'

interface CancelOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: string
  orderNumber: string
  cancelling: boolean
  onConfirm: () => void
}

export function CancelOrderDialog({
  open,
  onOpenChange,
  orderNumber,
  cancelling,
  onConfirm,
}: CancelOrderDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Batalkan Pesanan</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin membatalkan pesanan{' '}
            <span className="font-semibold text-gray-900">
              {orderNumber}
            </span>
            ? Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={cancelling}
            className="text-xs"
          >
            Kembali
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            disabled={cancelling}
            className="bg-red-600 hover:bg-red-700 text-white text-xs"
          >
            {cancelling && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            Ya, Batalkan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
