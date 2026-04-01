// src/utils/api.ts
import axios from 'axios'

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL, // 👈 env se
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 30000
})

/* =========================
   REQUEST INTERCEPTOR
========================= */
api.interceptors.request.use(
    config => {
        // When sending FormData (file uploads), remove the default JSON content-type
        // so axios automatically sets multipart/form-data with the correct boundary
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type']
        }

        return config
    },
    error => Promise.reject(error)
)

/* =========================
   RESPONSE INTERCEPTOR
========================= */
api.interceptors.response.use(
    response => response,
    error => {
        // yahan common error handling bhi kar sakte ho
        return Promise.reject(error)
    }
)

export default api
