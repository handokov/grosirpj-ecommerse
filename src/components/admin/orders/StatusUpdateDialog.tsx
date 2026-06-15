'use client'

import { useState } from 'react'
import { toast } from 'sonner'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { type Order } from '@/types'
import { STATUS_CONFIG } from '@/lib/order-config'

interface StatusUpdateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order | null
  onSuccess: () => void
}

export function StatusUpdateDialog({ open, onOpenChange, order, onSuccess }: StatusUpdateDialogProps) {
  const [newStatus, setNewStatus] = useState<string>('')
  const [updating, setUpdating] = useState(false)

  // Reset newStatus when order changes
  const handleOpenChange = (value: boolean) => {
    if (value && order) {
      setNewStatus(order.status)
    }
    onOpenChange(value)
  }

  const handleUpdateStatus = async () => {
    if (!order || !newStatus) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Gagal mengupdate status')
      }
      toast.success('Status pesanan berhasil diperbarui')
      onOpenChange(false)
      onSuccess()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Update Status Pesanan</DialogTitle>
          <DialogDescription className="text-sm">
            Pesanan {order?.orderNumber}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-700">
              Status Baru
            </label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-2 text-xs">
                      <span
                        className={cn(
                          'w-2 h-2 rounded-full',
                          config.dotColor
                        )}
                      />
                      {config.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updating}
            className="text-xs"
          >
            Batal
          </Button>
          <Button
            onClick={handleUpdateStatus}
            disabled={updating}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
          >
            {updating && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
