import { useState, useEffect } from 'react'
import { getModulePermissionFromLocal } from '@/redux-store/sagaHelpers'

export const useModulePermission = (moduleName: string) => {
    const [permission, setPermission] = useState<any>(null)

    useEffect(() => {
        setPermission(getModulePermissionFromLocal(moduleName))
    }, [moduleName])

    return permission
}
