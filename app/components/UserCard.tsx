import { Ellipsis } from "lucide-react";

const UserCard = ({ type }: { type: string }) => {
  return (
    <div className="p-4 rounded-2xl flex-1 odd:bg-primary even:bg-secondary min-w-[130px]">
      <div className="flex justify-between items-center">
        <span className="text-xs bg-white px-2 py-1 rounded-full">2025/26</span>
        <Ellipsis className="text-white" />
      </div>
      <h1 className="text-2xl font-semibold my-4">1,234</h1>
      <h2 className="capitalize text-sm font-medium">{type}s</h2>
    </div>
  );
};

export default UserCard;
