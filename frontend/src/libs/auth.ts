// // Third-party Imports
// import CredentialProvider from 'next-auth/providers/credentials'
// import GoogleProvider from 'next-auth/providers/google'
// import { PrismaAdapter } from '@auth/prisma-adapter'
// import { PrismaClient } from '@prisma/client'
// import type { NextAuthOptions } from 'next-auth'
// import type { Adapter } from 'next-auth/adapters'

// const prisma = new PrismaClient()

// export const authOptions: NextAuthOptions = {
//   adapter: PrismaAdapter(prisma) as Adapter,

//   // ** Configure one or more authentication providers
//   // ** Please refer to https://next-auth.js.org/configuration/options#providers for more `providers` options
//   providers: [
//     CredentialProvider({
//       // ** The name to display on the sign in form (e.g. 'Sign in with...')
//       // ** For more details on Credentials Provider, visit https://next-auth.js.org/providers/credentials
//       name: 'Credentials',
//       type: 'credentials',

//       /*
//        * As we are using our own Sign-in page, we do not need to change
//        * username or password attributes manually in following credentials object.
//        */
//       credentials: {},
//       async authorize(credentials) {
//         /*
//          * You need to provide your own logic here that takes the credentials submitted and returns either
//          * an object representing a user or value that is false/null if the credentials are invalid.
//          * For e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
//          * You can also use the `req` object to obtain additional parameters (i.e., the request IP address)
//          */
//         const { email, password } = credentials as { email: string; password: string }

//         try {
//           // ** Login API Call to match the user credentials and receive user data in response along with his role
//           const res = await fetch(`${process.env.API_URL}/login`, {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ email, password })
//           })

//           const data = await res.json()

//           if (res.status === 401) {
//             throw new Error(JSON.stringify(data))
//           }

//           if (res.status === 200) {
//             /*
//              * Please unset all the sensitive information of the user either from API response or before returning
//              * user data below. Below return statement will set the user object in the token and the same is set in
//              * the session which will be accessible all over the app.
//              */
//             return data
//           }

//           return null
//         } catch (e: any) {
//           throw new Error(e.message)
//         }
//       }
//     }),

//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID as string,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
//     })

//     // ** ...add more providers here
//   ],

//   // ** Please refer to https://next-auth.js.org/configuration/options#session for more `session` options
//   session: {
//     /*
//      * Choose how you want to save the user session.
//      * The default is `jwt`, an encrypted JWT (JWE) stored in the session cookie.
//      * If you use an `adapter` however, NextAuth default it to `database` instead.
//      * You can still force a JWT session by explicitly defining `jwt`.
//      * When using `database`, the session cookie will only contain a `sessionToken` value,
//      * which is used to look up the session in the database.
//      * If you use a custom credentials provider, user accounts will not be persisted in a database by NextAuth.js (even if one is configured).
//      * The option to use JSON Web Tokens for session tokens must be enabled to use a custom credentials provider.
//      */
//     strategy: 'jwt',

//     // ** Seconds - How long until an idle session expires and is no longer valid
//     maxAge: 30 * 24 * 60 * 60 // ** 30 days
//   },

//   // ** Please refer to https://next-auth.js.org/configuration/options#pages for more `pages` options
//   pages: {
//     signIn: '/login'
//   },

//   // ** Please refer to https://next-auth.js.org/configuration/options#callbacks for more `callbacks` options
//   callbacks: {
//     /*
//      * While using `jwt` as a strategy, `jwt()` callback will be called before
//      * the `session()` callback. So we have to add custom parameters in `token`
//      * via `jwt()` callback to make them accessible in the `session()` callback
//      */
//     async jwt({ token, user }) {
//       if (user) {
//         /*
//          * For adding custom parameters to user in session, we first need to add those parameters
//          * in token which then will be available in the `session()` callback
//          */
//         token.name = user.name
//       }

//       return token
//     },
//     async session({ session, token }) {
//       if (session.user) {
//         // ** Add custom params to user in session which are added in `jwt()` callback via `token` parameter
//         session.user.name = token.name
//       }

//       return session
//     }
//   }
// }
import NextAuth, { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'
import type { Adapter } from 'next-auth/adapters'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,

  providers: [
    CredentialsProvider({
      name: 'Credentials',
      type: 'credentials',

      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },

      async authorize(credentials) {
        if (!credentials) return null

        const { email, password } = credentials
        // console.log('API URL', process.env.API_URL + '/api-user-login');
        try {
          // const res = await fetch(`${process.env.API_URL}/users/login/`, {
          const res = await fetch(`${process.env.API_URL}/api-user-login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email,
              password
            })
          })

          // Stop if API fails
          //if (!res.ok) return null;
          const data = await res.json()
          //console.log('dddddddddddddddd', data);
          // if (res.status === 401) {
          //   throw new Error(JSON.stringify(data))
          // }



          // ✅ Match your API response
          if (data.status === "success" && data.data) {
            return {
              id: data.data.id.toString(), // MUST be string
              name: `${data.data.name} ${data.data.name}`,
              email: data.data.email,
              designation: data.data.email,
              profile_picture: data.data.profile_picture,
              company_id: data.data.company_id,
              step_no: data.data.step_no,
              company_step_id: data.data.company_step_id,
              step_name: data.data.step_name,
              company_details: data.data.company_details,
              role: data.role_id,
              role_name: data.role_name,
              unit_id: data.unit_id,
              dept_id: data.dept_id,
              accessToken: data.login_access_token,
              refreshToken: data.login_access_token
            }
          }
          return null
        } catch (error) {
          console.error('Authorize error:', error)
          return null
        }
      }
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
    })
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },

  pages: {
    signIn: '/login'
  },

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      const currentYear = new Date().getFullYear()
      if (user) {

        token.id = user.id
        token.name = user.name
        token.email = user.email
        token.role = user.role
        token.accessToken = user.accessToken
        token.refreshToken = user.refreshToken
        token.designation = user.designation
        token.profile_picture = user.profile_picture
        token.company_id = user.company_id
        token.step_no = user.step_no
        token.company_step_id = user.company_step_id
        token.step_name = user.step_name
        token.company_details = user.company_details
        token.role_name = user.role_name
        token.unit_id = user.unit_id
        token.dept_id = user.dept_id
        //  Default Current Year Set
        token.userSelectedYear = currentYear
      }

      if (trigger === "update" && session) {
        // if (session.unit_id) {
        //   token.unit_id = session.unit_id
        // }
        if (session.unit_selected) {
          token.unit_selected = session.unit_selected
        }
        if (session.userSelectedYear) {
          token.userSelectedYear = session.userSelectedYear
        }


        if (session.user) {
          token = { ...token, ...session.user }
        }
      }
      if (!token.userSelectedYear) {
        token.userSelectedYear = currentYear
      }

      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.name = token.name as string
        session.user.email = token.email as string
        session.user.role = token.role
        session.user.accessToken = token.accessToken
        session.user.designation = token.designation
        session.user.profile_picture = token.profile_picture
        session.user.company_id = token.company_id
        session.user.step_no = token.step_no
        session.user.company_step_id = token.company_step_id
        session.user.step_name = token.step_name
        session.user.company_details = token.company_details
        session.user.role_name = token.role_name
        session.user.unit_id = token.unit_id
        session.user.dept_id = token.dept_id
        session.user.unit_selected = token.unit_selected
        session.user.userSelectedYear = token.userSelectedYear
      }
      return session
    }
  },

  secret: process.env.NEXTAUTH_SECRET
}

export default NextAuth(authOptions)
