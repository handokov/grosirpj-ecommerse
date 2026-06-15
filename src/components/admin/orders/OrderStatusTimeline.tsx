'use client'

import { X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { type OrderStatus } from '@/types'
import { STATUS_STEPS } from '@/lib/order-config'

interface OrderStatusTimelineProps {
  currentStatus: OrderStatus
}

export function OrderStatusTimeline({ currentStatus }: OrderStatusTimelineProps) {
  const isCancelled = currentStatus === 'cancelled'
  const isCompleted = currentStatus === 'completed'
  const currentStepIndex = STATUS_STEPS.findIndex(s => s.key === currentStatus)

  if (isCancelled) {
    return (
      <Card className="border-0 shadow-sm border-red-200">
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
              <X className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-800">Pesanan Dibatalkan</h3>
              <p className="text-[11px] text-red-500">
                Pesanan ini telah dibatalkan
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-5">
        <h3 className="text-sm font-bold text-gray-700 mb-3">
          Status Pesanan
        </h3>
        <div className="relative">
          {/* Progress bar behind the steps */}
          <div className="absolute top-4 left-0 right-0 px-8">
            <div className="h-0.5 bg-gray-200 rounded-full">
              <div
                className="h-0.5 bg-emerald-500 rounded-full transition-all duration-500"
                style={{
                  width: `${
                    isCompleted
                      ? 100
                      : currentStepIndex >= 0
                        ? (currentStepIndex / (STATUS_STEPS.length - 1)) * 100
                        : 0
                  }%`,
                }}
              />
            </div>
          </div>
          <div className="relative flex items-center justify-between">
            {STATUS_STEPS.map((step, index) => {
              const StepIcon = step.icon
              const isStepCompleted =
                currentStepIndex > index || isCompleted
              const isCurrent = currentStepIndex === index
              return (
                <div
                  key={step.key}
                  className="flex flex-col items-center flex-1"
                >
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors z-10',
                      isStepCompleted
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : isCurrent
                          ? 'border-emerald-500 bg-white text-emerald-600'
                          : 'border-gray-200 bg-white text-gray-400'
                    )}
                  >
                    <StepIcon className="w-3.5 h-3.5" />
                  </div>
                  <span
                    className={cn(
                      'text-[10px] mt-1.5 text-center',
                      isStepCompleted || isCurrent
                        ? 'text-emerald-700 font-semibold'
                        : 'text-gray-400'
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
