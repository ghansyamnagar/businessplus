// MUI Imports
import Grid from '@mui/material/Grid2'
import TaskStatusDataCard from './TaskStatusDataCard'

const TaskStatusData = ({ data }: { data?: any[] | any }) => {
    // If data is the task_data object from API, map it
    const finalData = Array.isArray(data) ? data : (data ? [
        {
            title: 'Total Task',
            stats: data?.total || 0,
            avatarIcon: 'ri-file-list-3-line',
            color: 'primary'
        },
        {
            title: 'Closed Task',
            stats: data?.closed || 0,
            avatarIcon: 'ri-check-double-line',
            color: 'success'
        },
        {
            title: 'WIP Task',
            stats: data?.open || 0,
            avatarIcon: 'ri-hourglass-line',
            color: 'info'
        },
        {
            title: 'Delayed Task',
            stats: data?.delayed || 0,
            avatarIcon: 'ri-alarm-warning-line',
            color: 'error'
        },
        {
            title: 'Closed With Delay',
            stats: data?.closedWithDelay || 0,
            avatarIcon: 'ri-calendar-check-line',
            color: 'warning'
        },
        {
            title: 'Hold Task',
            stats: data?.onHold || 0,
            avatarIcon: 'ri-pause-circle-line',
            color: 'secondary'
        }
    ] : [])

    return (
        finalData.length > 0 && (
            <Grid container spacing={6}>
                {finalData.map((item: any, index: number) => (
                    <Grid size={{ xs: 12, sm: 6, md: 2 }} key={index}>
                        <TaskStatusDataCard {...item} />
                    </Grid>
                ))}
            </Grid>
        )
    )
}

export default TaskStatusData
