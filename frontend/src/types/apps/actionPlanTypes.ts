
export type ActionPlanType = {
    action_plan_id: number
    sr_no: string
    action_plan_definition: string
    user_id: number
    unit_id: number
    start_date: string
    end_date: string
    initiatives_definition: string
    initiatives_id: number
    s_o_id: number
    dept_id: number
    dept_name: string
    target: string
    reminder_date: string
    control_point: string
    status_id: number
    status_name: string
    percentage: string
    assign_action_plan_user: { co_owner: number; user_name: string }[]
    kpi_data: { kpi_name: string | null; kpi_id: number | null }[]
    comment?: string
}
