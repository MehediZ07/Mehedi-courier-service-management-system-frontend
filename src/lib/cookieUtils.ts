"use server";

import { cookies } from "next/headers";

export const setCookie = async (
    name : string,
    value : string,
    maxAgeInSeconds : number,
) => {
    const cookieStore = await cookies();

    cookieStore.set(name, value, {
        httpOnly : false, // Changed to false so client-side JavaScript can read it
        secure : process.env.NODE_ENV === "production",
        sameSite : "lax",
        path : "/",
        maxAge : maxAgeInSeconds,
    })
    
    console.log('[setCookie]', name, 'set with maxAge:', maxAgeInSeconds);
}

export const getCookie = async (name : string) => {
    const cookieStore = await cookies();
    return cookieStore.get(name)?.value;
}

export const deleteCookie = async (name : string) => {
    const cookieStore = await cookies();
    cookieStore.delete(name);
}