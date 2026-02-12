import { Loader2Icon } from "lucide-react";

const LoadingPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-100">
      <Loader2Icon className="animate-spin h-12 w-12 text-primary-500" />
      <p className="mt-4 text-lg font-semibold text-neutral-700">
        Checking authentication...
      </p>
    </div>
  );
};

export default LoadingPage;