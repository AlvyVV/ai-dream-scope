'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AddSymbolDialog } from './add-symbol-dialog';
import { toast } from 'sonner';

export default function AddSymbolButton() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    console.log('Dialog open state:', open);
  }, [open]);

  const handleOpenDialog = () => {
    console.log('Button clicked, opening dialog');
    setOpen(true);
    toast.info('正在打开添加符号对话框...');
  };

  return (
    <>
      <Button size="sm" className="flex items-center gap-1" onClick={handleOpenDialog}>
        <Plus className="h-4 w-4" />
        <span>添加符号</span>
      </Button>
      <AddSymbolDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
