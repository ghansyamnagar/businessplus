'use client'

// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import { useSession } from 'next-auth/react'

// MUI Imports
import Grid from '@mui/material/Grid2'
import CardHeader from '@mui/material/CardHeader'
// Third-party Imports
import { useDispatch } from 'react-redux'

// Type Imports
import type { AppDispatch } from '@/redux-store'

// Component Imports
import KpiData from '@/views/apps/dashboard/KpiData'
// import DepartmentWiseKpiaaa from '@/views/apps/dashboard/DepartmentWiseKpi'
import DepartmentWiseData from '@/components/common/DepartmentWiseData'
import BusinessPlan from '@/views/apps/dashboard/BusinessPlan'
import TaskStatusData from '@views/apps/dashboard/TaskStatusData'
import PriorityTaskDataByStatus from '@/views/apps/dashboard/PriorityTaskDataByStatus'

// Slice Imports
import { getKpiDashboardRequest, getLeadKpiDashboardRequest, reminderReviewKPIRequest } from '@/redux-store/slices/kpiTracker/kpiTracker.slice'
import { Card } from '@mui/material'
import { getStrategicObjectivesDashRequest, reminderActionPlanRequest } from '@/redux-store/slices/strategicObjectives/strategicObjectives.slice'
import { getTaskDashboardRequest, getTaskListRequest } from '@/redux-store/slices/taskTracker/taskTracker.slice'
import ReminderActionPlanAndKpi from '@/views/apps/dashboard/ReminderActionPlanAndKpi'

const DashboardMain = () => {
  // Hooks
  const { data: session } = useSession()
  const dispatch = useDispatch<AppDispatch>()

  // State
  const [kpiData, setKpiData] = useState<any[]>([])
  const [leadKpiData, setLeadKpiData] = useState<any[]>([])
  const [strategicObjectivesDash, setStrategicObjectivesDash] = useState<any[]>([])
  const [totalTaskStatusData, setTotalTaskStatusData] = useState<any[]>([])
  const [priorityTaskData, setPriorityTaskData] = useState<any[]>([])
  const [reminderActionPlanData, setReminderActionPlanData] = useState<any[]>([])
  const [reminderKpiData, setReminderKpiData] = useState<any[]>([])
  useEffect(() => {
    if (session && session.user) {
      const payload = {}
      dispatch(
        getKpiDashboardRequest({
          payload,
          callback: (data: any) => {
            if (data?.data) {
              setKpiData(data.data)
            }
          }
        })
      )

      dispatch(
        getLeadKpiDashboardRequest({
          payload,
          callback: (data: any) => {
            if (data?.data) {
              setLeadKpiData(data.data)
            }
          }
        })
      )
      dispatch(getStrategicObjectivesDashRequest({
        payload: {},
        callback: (response: any) => {
          setStrategicObjectivesDash(response?.data)
        }
      }))
      dispatch(getTaskDashboardRequest({
        payload: {

        },
        callback: (response: any) => {
          setTotalTaskStatusData(response?.data?.task_data)
        }
      }))

      dispatch(getTaskListRequest({
        payload: {

        },
        callback: (response: any) => {
          if (response?.status === 'success') {
            setPriorityTaskData(response.data);
          } else {
            setPriorityTaskData([]);
          }

        }
      }))
      dispatch(reminderActionPlanRequest({
        payload: {

        },
        callback: (response: any) => {
          if (response?.status === 'success') {
            setReminderActionPlanData(response.data);
          } else {
            setReminderActionPlanData([]);
          }

        }
      }))
      dispatch(reminderReviewKPIRequest({
        payload: {

        },
        callback: (response: any) => {
          if (response?.status === 'success') {
            setReminderKpiData(response.data);
          } else {
            setReminderKpiData([]);
          }

        }
      }))
    }
  }, [dispatch, session])

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 7 }}>
        <KpiData kpiData={kpiData} leadKpiData={leadKpiData} />
      </Grid>
      <Grid size={{ xs: 12, md: 5 }}>
        <Card>
          <DepartmentWiseData departmentData={kpiData} />
        </Card>
        {/* <DepartmentWiseKpiaaa /> */}
      </Grid>
      <Grid size={{ xs: 12 }}>
        <BusinessPlan strategicObjectivesDash={strategicObjectivesDash} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Card className='pl-3 pr-3 pb-4'>
          <CardHeader
            title='Task Status'
            titleTypographyProps={{ align: 'center', fontWeight: 'bold' }}
          />
          <TaskStatusData data={totalTaskStatusData} />
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <PriorityTaskDataByStatus priorityTaskData={priorityTaskData} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <ReminderActionPlanAndKpi reminderActionPlanData={reminderActionPlanData} reminderKpiData={reminderKpiData} />
      </Grid>
    </Grid>
  )
}

export default DashboardMain
