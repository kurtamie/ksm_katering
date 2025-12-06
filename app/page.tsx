import { Button } from "@/components/ui/button";
import Link from "next/dist/client/link";

export default function Home() {
  return ( 
    <div className="h-screen flex items-center justify-center">
      <div className="flex gap-12 items-center justify-center text-xl text-black">
        <Link href="/auth/login">
          <Button className="bg-slate-800 text-white">Login</Button>
        </Link>
      </div>
    </div> 
  );
}
