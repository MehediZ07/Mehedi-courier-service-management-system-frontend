"use server";

import { logoutService } from "@/services/auth.services";
import { redirect } from "next/navigation";

export const logoutAction = async () => {
    await logoutService();
    redirect("/login");
};
