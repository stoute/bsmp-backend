import { toast as sonnerToast } from "sonner";

type ToastProps = {
  title: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
  duration?: number;
};

// Export the showToast function with the original object-based API
export const showToast = ({
  title,
  description,
  variant = "default",
  duration = 3000,
}: ToastProps) => {
  try {
    switch (variant) {
      case "destructive":
        return sonnerToast.error(title, {
          description,
          duration,
        });
      case "success":
        return sonnerToast.success(title, {
          description,
          duration,
        });
      default:
        return sonnerToast(title, {
          description,
          duration,
        });
    }
  } catch (error) {
    console.error("Error showing toast:", error);
    console.warn(
      `TOAST (${variant}): ${title}`,
      description ? `\n${description}` : "",
    );
  }
};

// Create a more flexible toast function that handles both string and object inputs
export const toast = (titleOrOptions: string | ToastProps, options?: any) => {
  // If first argument is a string, use it as title and pass the rest as options
  if (typeof titleOrOptions === "string") {
    return sonnerToast(titleOrOptions, options);
  }

  // If first argument is an object with title property, use showToast
  if (
    titleOrOptions &&
    typeof titleOrOptions === "object" &&
    "title" in titleOrOptions
  ) {
    return showToast(titleOrOptions as ToastProps);
  }

  // Fallback to original sonnerToast
  return sonnerToast(String(titleOrOptions), options);
};
