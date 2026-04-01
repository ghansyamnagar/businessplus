export interface LoginPayload {
    email: string
    password: string
}
export interface ChangePasswordPayload {
    current_password: string
    new_password: string
    confirm_password: string
}
export interface ResetPasswordPayload {
    email: string
}
export interface ResetPasswordUpdatePayload {
    reset_password_token: string
    new_password: string
    confirm_password: string
}
export interface ViewProfilePayload { }
export interface UpdateProfilePayload {
    name: string
    designation: string
    gender: string
    mobile: string
    mobile2: string
    email: string
    city: string
    address: string
    date_birth: string | null
    date_hire: string | null
    pan_card_no: string
    emp_id: number
    multi_unit_id: number[]
    multi_dept_id: number[]
    multi_section_id: number[]
}
export interface ViewUnitPayload { }
export interface GetDeptSignupPayload {
    unit_id: number[]
    profile: string
}
export interface GetSectionSignupPayload {
    dept_id: number[]
    profile: string
}
export interface ViewProfileJoinedGroupPayload { }
export interface GetUserDetailsPayload { }
export interface CreateGroupPayload {
    group_name: string
    group_description: string
    user_id: number[]
}
export interface GetProfileGroupDetailsPayload {
    group_id: number
}
export interface EditProfileGroupUpdatePayload {
    id: number
    group_name: string
    group_description: string
}
export interface ProfileDeleteGroupPayload {
    group_id: number
}
export interface GetProfileUserByGroupIdPayload {
    group_id: number
}
export interface AddParticipantToGroupPayload {
    group_id: number
    user_id: Array<{ user_id: number; name: string }>
}
export interface AuthActionPayload<T = any> {
    payload: T
    callback?: (response: any | null, error: any | null) => void
}

export interface VerifyOtpPayload {
    email: string
    otp: string
}

export interface UpdatePasswordPayload {
    token: string
    password: string
    confirm_password: string
}

export interface ResendOtpPayload {
    email: string
}
