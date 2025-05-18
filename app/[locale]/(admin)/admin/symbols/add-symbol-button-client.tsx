'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { AddSymbolDialog } from '@/components/blocks/symbol/add-symbol-dialog';

export default function AddSymbolButtonClient() {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full px-4 md:px-8 py-4">
      <Button className="flex items-center gap-1 mb-4" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        <span>添加符号</span>
      </Button>
      <AddSymbolDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
