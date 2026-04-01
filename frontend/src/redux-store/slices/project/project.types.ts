
export interface ProjectType {
    project_id: number
    project_name: string
    department_id: number
    dept_name: string
    user_id: number
    status_id: number
    project_cost: number
    start_date: string
    end_date: string
    currency: string
    project_duration: string
    project_leader: number
    leader_name: string
    project_step_id: number
    status_name: string
}

export interface ProjectPayload<T = any> {
    payload: T
    callback?: (response: any | null, error: any | null) => void
}

