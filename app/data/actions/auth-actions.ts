"use server";
import { z } from "zod";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  registerUserService,
  loginUserService,
} from "@/app/data/services/auth-service";

const config = {
  maxAge: 60 * 60 * 24 * 7, // 1 week
  path: "/",
  domain: process.env.NODE_ENV === "production" 
    ? "ksm-katering.id" 
    : "localhost",
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const
};

const schemaRegister = z.object({
  username: z.string().min(3).max(20, {
    message: "Username harus terdiri dari 3 hingga 20 karakter",
  }),
  password: z.string()
    .min(8, {
      message: "Password harus minimal 8 karakter",
    })
    .max(100, {
      message: "Password maksimal 100 karakter",
    })
    .regex(/[A-Z]/, {
      message: "Password harus mengandung minimal 1 huruf besar",
    })
    .regex(/[0-9]/, {
      message: "Password harus mengandung minimal 1 angka",
    })
    .regex(/[^A-Za-z0-9]/, {
      message: "Password harus mengandung minimal 1 karakter khusus",
    }),
  email: z.string().email({
    message: "Masukkan alamat email yang valid",
  }),
});

export async function registerUserAction(prevState: any, formData: FormData) {
  const rawFormData = {
    username: formData.get("username"),
    password: formData.get("password"),
    email: formData.get("email"),
  };

  const validatedFields = schemaRegister.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      ...prevState,
      ...rawFormData, 
      zodErrors: validatedFields.error.flatten().fieldErrors,
      strapiErrors: null,
      message: "Missing Fields. Failed to Register.",
    };
  }

  const responseData = await registerUserService(validatedFields.data);

  if (!responseData) {
    return {
      ...prevState,
      ...rawFormData,
      strapiErrors: null,
      zodErrors: null,
      message: "Ops! Something went wrong. Please try again.",
    };
  }

  if (responseData.error) {
    return {
      ...prevState,
      ...rawFormData,
      strapiErrors: responseData.error,
      zodErrors: null,
      message: "Failed to Register.",
    };
  }

  const cookieStore = await cookies();
  cookieStore.set("jwt", responseData.jwt, config);
  
  redirect("/auth/login");
}


const schemaLogin = z.object({
  identifier: z
    .string()
    .min(3, {
      message: "Identifier harus memiliki minimal 3 karakter atau lebih",
    })
    .max(20, {
      message: "Masukkan username atau alamat email yang valid",
    }),
  password: z
    .string()
    .min(6, {
      message: "Password harus memiliki minimal 6 karakter atau lebih",
    })
    .max(100, {
      message: "Password harus antara 6 sampai 100 karakter",
    }),
});

export async function loginUserAction(prevState: any, formData: FormData) {
  const rawFormData = {
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  };

  const validatedFields = schemaLogin.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      ...prevState,
      ...rawFormData,
      zodErrors: validatedFields.error.flatten().fieldErrors,
      strapiErrors: null,
      message: "Missing Fields. Failed to Login.",
    };
  }

  const responseData = await loginUserService(validatedFields.data);

  if (!responseData) {
    return {
      ...prevState,
      ...rawFormData,
      strapiErrors: null,
      zodErrors: null,
      message: "Ops! Something went wrong. Please try again.",
    };
  }

  if (responseData.error) {
    return {
      ...prevState,
      ...rawFormData,
      strapiErrors: responseData.error,
      zodErrors: null,
      message: "Failed to Login.",
    };
  }

  const cookieStore = await cookies();
  cookieStore.set("jwt", responseData.jwt, config);
  cookieStore.set("userId", String(responseData.user.id), config);

  redirect("/admin/order");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.set("jwt", "", { ...config, maxAge: 0 });
  redirect("/");
}