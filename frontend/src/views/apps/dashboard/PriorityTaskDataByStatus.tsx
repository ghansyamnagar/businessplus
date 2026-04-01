'use client'

// React Imports
import { Fragment, useState, useEffect } from 'react'
import type { SyntheticEvent } from 'react'

// Next Auth Imports
import { useSession } from 'next-auth/react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid2'
import { styled } from '@mui/material/styles'
import Tab from '@mui/material/Tab'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import Typography from '@mui/material/Typography'

// Styles Imports
import styles from './styles.module.css'

const PriorityTaskDataByStatus = ({ priorityTaskData }: { priorityTaskData?: any[] | any }) => {
  // Hooks
  const { data: session } = useSession()

  // States
  const [value, setValue] = useState<string>('new')
  const [assignedSelf, setAssignedSelf] = useState<any[]>([])
  const [assignedOther, setAssignedOther] = useState<any[]>([])
  const [createdTasks, setCreatedTasks] = useState<any[]>([])

  useEffect(() => {
    if (priorityTaskData && session?.user) {
      const user_id = Number((session.user as any).id)

      const tasks = priorityTaskData.map((task: any) => {
        const newTask = { ...task }
        if (newTask.completion_date && newTask.completion_date !== '0000-00-00') {
          // You can use a date formatting library here if needed, 
          // but for consistency with previous data let's keep the raw for now 
          // or use a simple string split/reformat
          try {
            // Simple dd-MM-yyyy transform as per Angular code
            const date = new Date(newTask.completion_date);
            if (!isNaN(date.getTime())) {
              const day = String(date.getDate()).padStart(2, '0');
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const year = date.getFullYear();
              newTask.completion_date = `${day}-${month}-${year}`;
            }
          } catch (e) { /* ignore */ }
        }
        return newTask
      })

      // filter Assigned task create self (task Open and Delayed)
      const self = tasks
      const other = tasks.filter((task: any) => {
        let assignTo: number[] = []
        try {
          assignTo = typeof task.assign_to === 'string' ? JSON.parse(task.assign_to) : task.assign_to
        } catch (e) {
          assignTo = []
        }

        // Using user_id if create_to_user_id is not present, otherwise use create_to_user_id
        const creatorId = task.create_to_user_id || task.user_id;

        return (
          (task.status_name === 'Open' || task.status_name === 'Delayed') &&
          Array.isArray(assignTo) && assignTo.indexOf(user_id) !== -1 &&
          user_id !== creatorId
        )
      })

      // filter created task (task Open and Delayed)
      const created = tasks.filter((task: any) => {
        return (task.status_name === 'Open' || task.status_name === 'Delayed') && task.user_id === user_id
      })

      setAssignedSelf(self)
      setAssignedOther(other)
      setCreatedTasks(created)
    }
  }, [priorityTaskData, session])

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setValue(newValue)
  }

  const getActiveData = () => {
    if (value === 'new') return assignedSelf
    if (value === 'preparing') return assignedOther
    if (value === 'shipping') return createdTasks

    return []
  }

  const activeData = getActiveData()

  const getColorByStatus = (status: string) => {
    switch (status) {
      case 'Open':
        return 'warning.main'
      case 'Delayed':
        return 'error.main'
      case 'Closed':
        return 'success.main'
      case 'On Hold':
        return 'info.main'
      case 'Closed With Delay':
        return 'text.primary'
      default:
        return 'text.secondary'
    }
  }

  return (
    <Card>
      <CardHeader
        title='Priority Task'
      // subheader='62 deliveries in progress'
      // action={<OptionMenu options={['Show all orders', 'Share', 'Refresh']} />}
      />
      <TabContext value={value}>
        <TabList variant='fullWidth' onChange={handleChange} aria-label='full width tabs example'>
          <Tab value='new' label='Assigned To Me' />
          <Tab value='preparing' label='Assigned By Other' />
          <Tab value='shipping' label='Created By Me' />
        </TabList>
        <TabPanel value={value} className='pbs-0'>
          <CardContent className='pl-2 pr-2 pt-3'>
            {/* Header Row */}
            <Grid container spacing={2} sx={{ mb: 4, px: 2, borderBottom: '1px solid', borderColor: 'divider', pb: 2 }}>
              <Grid size={{ xs: 1 }}>
                <Typography variant='overline' className='font-bold' color='text.primary'>Sr.No.</Typography>
              </Grid>
              <Grid size={{ xs: 7 }}>
                <Typography variant='overline' className='font-bold' color='text.primary'>Task</Typography>
              </Grid>
              <Grid size={{ xs: 1.5 }}>
                <Typography variant='overline' className='font-bold' color='text.primary'>Priority</Typography>
              </Grid>
              <Grid size={{ xs: 2.5 }}>
                <Typography variant='overline' className='font-bold' color='text.primary'>Status</Typography>
              </Grid>
            </Grid>

            <div className={styles.scrollableReminderContent}>
              {activeData.length > 0 ? (
                activeData.map((item: any, index: number) => {
                  return (
                    <Fragment key={index}>
                      <Grid container spacing={2} alignItems='center' sx={{ px: 2, py: 3, '&:hover': { bgcolor: 'action.hover' } }}>
                        <Grid size={{ xs: 1 }}>
                          <Typography variant='body2' color='text.secondary'>
                            {index + 1}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 7 }}>
                          <Typography variant='body2' className='font-medium'>
                            {item.task_name}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 1.5 }}>
                          <Typography variant='body2' color='text.secondary'>
                            {item.priority_name}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 2.5 }}>
                          <Typography variant='body2' color={getColorByStatus(item.status_name)}>
                            {item.status_name}
                          </Typography>
                        </Grid>
                      </Grid>
                      {index !== activeData.length - 1 && <Divider />}
                    </Fragment>
                  )
                })
              ) : (
                <Typography sx={{ p: 4, textAlign: 'center' }}>No tasks found</Typography>
              )}
            </div>
          </CardContent>
        </TabPanel>
      </TabContext>
    </Card>
  )
}

export default PriorityTaskDataByStatus
