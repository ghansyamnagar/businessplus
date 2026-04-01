
export interface StrategicObjectivesActionPayload<T = any> {
    payload: T
    callback?: (response: any | null, error: any | null) => void
}

export type SwotActionPayload = {
    payload?: any
    callback?: (response: any, error: any) => void
}
