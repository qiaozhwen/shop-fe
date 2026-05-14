import { Toaster as SonnerToaster, toast } from 'sonner';
export const Toaster = () => (
  <SonnerToaster
    position="top-right"
    toastOptions={{
      classNames: {
        toast: 'rounded-[12px] border border-border bg-surface text-text shadow-[var(--shadow-md)]',
        success: 'border-l-4 border-l-success',
        error: 'border-l-4 border-l-danger',
        warning: 'border-l-4 border-l-warning',
      },
    }}
  />
);
export { toast };
