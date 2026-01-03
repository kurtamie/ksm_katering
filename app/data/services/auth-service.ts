import { getStrapiURL } from "@/lib/utils";

interface RegisterUserProps {
  username: string;
  password: string;
  email: string;
}

interface LoginUserProps {
  identifier: string;
  password: string;
}

const baseUrl = getStrapiURL();

export async function registerUserService(userData: RegisterUserProps) {
  const registerUrl = new URL("/api/auth/local/register", baseUrl);
  const usersUrl = new URL("/api/users/me", baseUrl);

  try {
    const registerResponse = await fetch(registerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const registerData = await registerResponse.json();

    if (registerData.error) {
      return registerData;
    }

    const updateResponse = await fetch(usersUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${registerData.jwt}`,
      },
      body: JSON.stringify({ part: "user" }),
    });

    const updateData = await updateResponse.json();

    return {
      ...registerData,
      user: {
        ...registerData.user,
        ...updateData,
      },
    };
  } catch (error) {
    console.error("Registration Service Error:", error);
    throw error;
  }
}

export async function loginUserService(userData: LoginUserProps) {
  const url = new URL("/api/auth/local", baseUrl);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...userData }),
    });

    return response.json();
  } catch (error) {
    console.error("Login Service Error:", error);
    throw error;
  }
}