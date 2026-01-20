"use client";

import { useRegisterMutation } from "@/auth/queries";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const router = useRouter();
  const { mutateAsync, isPending } = useRegisterMutation();
  const { setAccessToken } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    const res = await mutateAsync({ name, email, password });

    if (res?.accessToken) {
      setAccessToken(res.accessToken);
      router.push("/dashboard");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <input name="name" placeholder="Full Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" required />

      <button disabled={isPending} type="submit">
        {isPending ? "Creating..." : "Create Account"}
      </button>
    </form>
  );
}
