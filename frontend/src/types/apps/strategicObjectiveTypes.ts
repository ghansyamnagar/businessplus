
export type StrategicObjectiveType = {
    strategic_objectives_id: number
    so_sno: number
    target: string
    start_date: string
    end_date: string
    unit_id: number
    unit_name: string
    department_id: number
    dept_name: string
    user_id: number
    user_name: string
    description: string
    status_id: number
    status_name: string
    percentage: string
    uom_id: number
    uom_name: string
    department_masters: {
        dept_id: number
        dept_name: string
    }
    comment?: string
}
