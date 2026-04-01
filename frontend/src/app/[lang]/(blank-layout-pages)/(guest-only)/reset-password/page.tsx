// Next Imports
import type { Metadata } from 'next'

// Component Imports
// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'
import ResetPasswordV1 from '@/views/pages/auth/ResetPasswordV1'

export const metadata: Metadata = {
    title: 'Reset Password',
    description: 'Reset your password'
}

const ResetPasswordPage = async () => {
    // Vars
    const mode = await getServerMode()

    return <ResetPasswordV1 mode={mode} />
}

export default ResetPasswordPage
