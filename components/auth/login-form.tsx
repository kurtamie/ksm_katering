"use client";

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useActionState } from "react";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { loginUserAction } from "@/app/data/actions/auth-actions";
import { ZodErrors } from "../custom/zod-errors";
import { SubmitButton } from "../custom/submit-button";
import { StrapiErrors } from "../custom/strapi-errors";

const INITIAL_STATE = {
  zodErrors: null,
  strapiErrors: null,
  data: null,
  message: null,
};

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const [formState, formAction] = useActionState(loginUserAction, INITIAL_STATE);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Masuk</h1>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Nama Pengguna/Nomor Telepon</Label>
          <Input
            id="identifier"
            name="identifier"
            type="text"
            placeholder="Masukkan Nama Pengguna/Nomor Telepon"
            defaultValue={formState?.username || ""}
            />             
             <ZodErrors error={formState?.zodErrors?.identifier} />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Kata sandi</Label>
          </div>
          <div className="relative">
            <Input 
              id="password" 
              name="password" 
              type={showPassword ? "text" : "password"} 
              placeholder="Masukkan kata sandi" 
              required 
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <ZodErrors error={formState?.zodErrors?.password} />
        </div>
        <SubmitButton text="Masuk" loadingText="Loading" className="cursor-pointer w-full bg-[#8D0000] text-white hover:bg-red-700"/>
        <StrapiErrors error={formState?.strapiErrors} />
      </div>
      <div className="text-center text-sm text-muted-foreground">
        Belum punya akun?{" "}
        <Link href="/auth/register" className="underline underline-offset-4 text-black">
          Daftar
        </Link>
      </div>
      <Button className="cursor-pointer w-full border border-red-900 bg-white text-red-900 hover:bg-red-700 hover:text-white">Verifikasi Nomor Telepon</Button>
    </form>
  )
}