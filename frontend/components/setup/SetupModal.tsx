'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { SetupForm } from '@/app/(dashboard)/dashboard/setup/setup-form'

export function SetupModal() {
  const [open, setOpen] = useState(true)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Set up your store</DialogTitle>
          <DialogDescription>
            Complete your store setup to start creating invoices. You can update these details anytime from Settings.
          </DialogDescription>
        </DialogHeader>
        <SetupForm initialData={null} onComplete={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
