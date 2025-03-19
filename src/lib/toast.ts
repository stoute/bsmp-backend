import { toast as sonnerToast } from "sonner";

type ToastProps = {
  title: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
  duration?: number;
};

export const toast = ({ 
  title, 
  description, 
  variant = "default", 
  duration = 3000 
}: ToastProps) => {
  const options = {
    description,
    duration,
  };

  switch (variant) {
    case "destructive":
      return sonnerToast.error(title, options);
    case "success":
      return sonnerToast.success(title, options);
    default:
      return sonnerToast(title, options);
  }
};