import NextAuth, { DefaultSession, DefaultUser } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            id: string
            name: string
            email: string
            role: any
            accessToken: any
            designation?: any
            profile_picture?: any
            company_id?: any
            step_no?: any
            company_step_id?: any
            step_name?: any
            company_details?: any
            role_name?: any
            unit_id?: any
            dept_id?: any
            unit_selected?: any
            userSelectedYear?: any
        } & DefaultSession["user"]
    }

    interface User {
        id: string
        name: string
        email: string
        role: any
        accessToken: any
        refreshToken: any
        designation?: any
        profile_picture?: any
        company_id?: any
        step_no?: any
        company_step_id?: any
        step_name?: any
        company_details?: any
        role_name?: any
        unit_id?: any
        dept_id?: any
        unit_selected?: any
        userSelectedYear?: any
    }
}

declare module "next-auth/jwt" {
    /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
    interface JWT {
        id: string
        name: string
        email: string
        role: any
        accessToken: any
        refreshToken: any
        designation?: any
        profile_picture?: any
        company_id?: any
        step_no?: any
        company_step_id?: any
        step_name?: any
        company_details?: any
        role_name?: any
        unit_id?: any
        dept_id?: any
        unit_selected?: any
        userSelectedYear?: any
    }
}
