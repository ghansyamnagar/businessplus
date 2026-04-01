import { select } from 'redux-saga/effects'

const getCompanyDetails = (state: any) => state.companyReducer.companyDetails

export function* getCompanyDetailsHelper(): any {
    let companyDetails = yield select(getCompanyDetails)
    if (!companyDetails) {
        if (typeof window !== 'undefined') {
            const localData = localStorage.getItem('allDetailsCompany')
            companyDetails = localData ? JSON.parse(localData) : null
        }
    }
    return companyDetails
}

const getPermissions = (state: any) => state.permissionReducer.permissions

export function* getPermissionsHelper(): any {
    let permissions = yield select(getPermissions)
    if (!permissions) {
        if (typeof window !== 'undefined') {
            const localData = localStorage.getItem('userModulePermission')
            permissions = localData ? JSON.parse(localData) : null
        }
    }
    return permissions
}

export const getPermissionsFromLocal = () => {
    if (typeof window !== 'undefined') {
        const localData = localStorage.getItem('userModulePermission')
        const permissions = localData ? JSON.parse(localData) : null
        return permissions
    }
    return null
}

export const getCompanyDetailsFromLocal = () => {
    if (typeof window !== 'undefined') {
        const localData = localStorage.getItem('allDetailsCompany')
        const companyDetails = localData ? JSON.parse(localData) : null
        return companyDetails
    }
    return null
}

export const getModulePermissionFromLocal = (moduleName: string) => {
    const permissions = getPermissionsFromLocal()
    return permissions?.find((m: any) => m.module_name === moduleName) || null
}
