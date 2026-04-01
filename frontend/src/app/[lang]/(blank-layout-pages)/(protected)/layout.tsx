// Type Imports
import type { ChildrenType } from '@core/types'
import type { Locale } from '@configs/i18n'

// HOC Imports
import AuthGuard from '@/hocs/AuthGuard'

const Layout = async (props: ChildrenType & { params: Promise<{ lang: Locale }> }) => {
    const params = await props.params

    const { children } = props

    return <AuthGuard locale={params.lang}>{children}</AuthGuard>
}

export default Layout
