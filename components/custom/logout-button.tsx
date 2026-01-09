import { logoutAction } from "@/app/data/actions/auth-actions";
import { MdLogout } from "react-icons/md";

interface LogoutButtonProps {
  onClick: () => void;
}

export function LogoutButton({ onClick }: LogoutButtonProps) {
  return (
    <button 
      type="button" 
      onClick={onClick}
      className="flex items-center gap-3 text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 w-full"
    >
      <MdLogout className="text-xl" />
      <span>Keluar</span>
    </button>
  );
}