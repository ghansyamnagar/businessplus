export interface KpiTrackerActionPayload<T = any> {
    payload: T
    callback?: (response: any | null, error: any | null) => void
}
