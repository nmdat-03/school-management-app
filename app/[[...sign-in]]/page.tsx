"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const LoginPage = () => {
    const { user } = useUser();
    const router = useRouter();

    useEffect(() => {
        const role = user?.publicMetadata.role;
        if (role) {
            router.push(`/${role}`);
        }
    }, [user, router]);

    return (
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 overflow-hidden">
            {/* LEFT SIDE */}
            <div className="relative flex items-center justify-center p-6 bg-gradient-to-br from-blue-600 via-blue-500 to-sky-500 animate-gradient-x overflow-hidden">

                {/* Glow background */}
                <div className="absolute w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl top-[-150px] left-[-150px]" />

                {/* moved purple glow so it won't appear in center-bottom */}
                <div className="absolute w-[350px] h-[350px] bg-purple-400/10 rounded-full blur-3xl bottom-[-180px] left-[-120px]" />

                <SignIn.Root>
                    <SignIn.Step
                        name="start"
                        className="relative z-10 w-full max-w-md bg-white p-10 rounded-2xl shadow-2xl flex flex-col gap-6 animate-fade-in"
                    >
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <Image src="/logo.png" alt="Logo" width={32} height={32} />
                            <h2 className="text-2xl font-bold tracking-wide text-gray-800">
                                School Name
                            </h2>
                        </div>

                        <Clerk.GlobalError className="text-sm text-red-500 font-medium" />

                        {/* Username */}
                        <Clerk.Field
                            name="identifier"
                            className="flex flex-col gap-2"
                        >
                            <Clerk.Label className="text-sm font-medium text-gray-700">
                                Username
                            </Clerk.Label>

                            <Clerk.Input
                                type="text"
                                required
                                placeholder="Enter your username"
                                className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            />

                            <Clerk.FieldError className="text-xs text-red-500" />
                        </Clerk.Field>

                        {/* Password */}
                        <Clerk.Field
                            name="password"
                            className="flex flex-col gap-2"
                        >
                            <Clerk.Label className="text-sm font-medium text-gray-700">
                                Password
                            </Clerk.Label>

                            <Clerk.Input
                                type="password"
                                required
                                placeholder="Enter your password"
                                className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            />

                            <Clerk.FieldError className="text-xs text-red-500" />
                        </Clerk.Field>

                        {/* Sign In */}
                        <SignIn.Action submit asChild>
                            <button
                                type="submit"
                                className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-70"
                            >
                                <Clerk.Loading>
                                    {(isLoading) =>
                                        isLoading ? (
                                            <>
                                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Signing in...
                                            </>
                                        ) : (
                                            "Sign In"
                                        )
                                    }
                                </Clerk.Loading>
                            </button>
                        </SignIn.Action>
                    </SignIn.Step>
                </SignIn.Root>
            </div>

            {/* RIGHT SIDE */}
            <div className="hidden md:flex bg-white rounded-l-[120px] items-center justify-center p-10">
                <div className="max-w-md text-center space-y-6">
                    <h1 className="text-4xl font-bold text-gray-800">
                        School Name
                    </h1>

                    <p className="text-lg text-gray-500">
                        Welcome back 👋 Please sign in to continue
                    </p>

                    <div className="w-full h-2 bg-gradient-to-r from-indigo-500 to-sky-500 rounded-full" />
                </div>
            </div>
        </div>
    );
};

export default LoginPage;