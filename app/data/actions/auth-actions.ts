"use server";
import { z } from "zod";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  registerUserService,
  loginUserService,
} from "@/app/data/services/auth-service";
import { getStrapiURL } from "@/lib/utils";

const cookieDomain = process.env.COOKIE_DOMAIN?.trim();

const config = {
  maxAge: 60 * 60 * 24 * 7, // 1 week
  path: "/",
  domain: cookieDomain && cookieDomain.length > 0 ? cookieDomain : undefined,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
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
  if (responseData.user?.username) {
    cookieStore.set("user_name", String(responseData.user.username), config);
  }
  if (responseData.user?.email) {
    cookieStore.set("user_email", String(responseData.user.email), config);
  }
  const userRole = await getUserRoleFromToken(responseData.jwt);

  if (userRole?.position) {
    cookieStore.set("user_position", userRole.position, config);
  } else {
    cookieStore.set("user_position", "", { ...config, maxAge: 0 });
  }

  if (userRole?.department) {
    cookieStore.set("user_department", userRole.department, config);
  } else {
    cookieStore.set("user_department", "", { ...config, maxAge: 0 });
  }

  if (userRole?.staffId) {
    cookieStore.set("user_staff_id", String(userRole.staffId), config);
  } else {
    cookieStore.set("user_staff_id", "", { ...config, maxAge: 0 });
  }

  if (userRole?.staffDocumentId) {
    cookieStore.set("user_staff_document_id", userRole.staffDocumentId, config);
  } else {
    cookieStore.set("user_staff_document_id", "", { ...config, maxAge: 0 });
  }

  redirect("/admin/order");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.set("jwt", "", { ...config, maxAge: 0 });
  cookieStore.set("user_position", "", { ...config, maxAge: 0 });
  cookieStore.set("user_department", "", { ...config, maxAge: 0 });
  cookieStore.set("userId", "", { ...config, maxAge: 0 });
  cookieStore.set("user_name", "", { ...config, maxAge: 0 });
  cookieStore.set("user_email", "", { ...config, maxAge: 0 });
  cookieStore.set("user_staff_id", "", { ...config, maxAge: 0 });
  cookieStore.set("user_staff_document_id", "", { ...config, maxAge: 0 });
  redirect("/");
}

async function getUserRoleFromToken(token: string) {
  try {
    const url = new URL("/api/users/me", getStrapiURL());
    url.searchParams.set("populate", "staff");

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch user role:", response.status);
      return null;
    }

    const data = await response.json();
    const staff = data?.staff?.data ?? data?.staff ?? null;
    const staffAttributes = staff?.attributes ?? staff ?? null;
    const staffIdRaw =
      staff?.id ?? staffAttributes?.id ?? data?.staff?.id ?? data?.staff?.data?.id;
    const staffDocumentIdRaw =
      staffAttributes?.documentId ??
      staffAttributes?.document_id ??
      staff?.documentId ??
      staff?.document_id ??
      data?.staff?.documentId ??
      data?.staff?.document_id;
    const position =
      staffAttributes?.position ?? data?.position ?? null;
    const department =
      staffAttributes?.department ?? data?.department ?? null;
    const normalizedPosition =
      typeof position === "string" && position.trim().length > 0
        ? position.toLowerCase()
        : null;
    const normalizedDepartment =
      typeof department === "string" && department.trim().length > 0
        ? department.toLowerCase()
        : null;

    const staffId =
      typeof staffIdRaw === "string" || typeof staffIdRaw === "number"
        ? Number(staffIdRaw)
        : null;
    const normalizedStaffId = Number.isFinite(staffId) ? staffId : null;
    const staffDocumentId =
      typeof staffDocumentIdRaw === "string" && staffDocumentIdRaw.trim().length > 0
        ? staffDocumentIdRaw
        : null;

    if (
      !normalizedPosition &&
      !normalizedDepartment &&
      !normalizedStaffId &&
      !staffDocumentId
    ) {
      return null;
    }

    return {
      position: normalizedPosition,
      department: normalizedDepartment,
      staffId: normalizedStaffId,
      staffDocumentId,
    };
  } catch (error) {
    console.error("Error fetching user role:", error);
    return null;
  }
}
