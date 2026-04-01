
export interface TaskTrackerPayload<T = any> {
    payload: T
    callback?: (response: any | null, error: any | null) => void
}

export interface EventsTaskType {
    id: number
    event_name: string
    event_area: string
    event_objective: string
    event_description: string
    created_at: string
    updated_at: string
    deleted_at: string | null
}

export interface TaskType {
    id: number
    task_name: string
    event_id: number
    project_id: number
    department_master_id: number
    unit_id: number
    user_id: number
    start_date: string
    end_date: string
    completion_date: string
    status_id: number
    enable: string
    deleted_at: string | null
    created_at: string
    updated_at: string
    assign_to: string
    task_owner_id: number
    reminder_frequency: string
    priority_id: number
    tasks_id: number
    priority_name: string
    project_name: string
    unit_name: string
    dept_name: string
    task_owaner_name: string
    create_to_user_name: string
    status_name: string
    create_to_user_id: number
    event_name: string
    task_assigns_data: TaskAssignData[]
}

export interface TaskAssignData {
    task_id: number
    task_name: string
    user_id: number
    name: string
}
