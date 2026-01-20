"use client";

import { useLoginMutation } from "@/auth/queries";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const { mutateAsync, isPending } = useLoginMutation();
  const { setAccessToken } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    const res = await mutateAsync({ email, password });

    if (res?.accessToken) {
      setAccessToken(res.accessToken);
      router.push("/dashboard");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" required />

      <button disabled={isPending} type="submit">
        {isPending ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
