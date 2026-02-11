import React from "react";

interface AdminLoadingPlaceholderProps {
  heightClassName?: string;
}

const AdminLoadingPlaceholder: React.FC<AdminLoadingPlaceholderProps> = ({
  heightClassName = "h-96",
}) => {
  return (
    <div className={`self-stretch ${heightClassName} flex flex-col justify-center items-center gap-3 bg-white`}>
      <div className="w-32 h-3 bg-gray-200 rounded-full animate-pulse" />
      <div className="w-48 h-2.5 bg-gray-100 rounded-full animate-pulse" />
    </div>
  );
};

export default AdminLoadingPlaceholder;
