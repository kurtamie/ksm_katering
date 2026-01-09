import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function Home() {
  cookies().then((cookies) => {
    const hasSession = cookies.has("jwt");

    if (hasSession) {
      redirect("/admin/order");
    }

    redirect("/auth/login");
  });
}
