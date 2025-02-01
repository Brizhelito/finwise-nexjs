import { toast } from "sonner";

export const useToast = () => {
  const showToast = (
    message: string,
    variant: "success" | "error" | "info" = "info"
  ) => {
    switch (variant) {
      case "success":
        toast.success(message);
        break;
      case "error":
        toast.error(message);
        break;
      default:
        toast(message);
    }
  };

  return { showToast };
};
