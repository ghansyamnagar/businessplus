'use client'

// React Imports
import { useEffect, useState } from 'react'

// Next Auth Imports
import { useSession } from 'next-auth/react'

// Redux Imports
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '@/redux-store'
import { usePDF } from "react-to-pdf";
// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import DashboardTask from '@/views/apps/taskTracker/dashboard/DashboardTask'
import DepartmentWiseData from '@/components/common/DepartmentWiseData'
import DepartmentBarChart from '@/components/common/chart/DepartmentBarChart'
import { getTaskDashboardRequest } from '@/redux-store/slices/taskTracker/taskTracker.slice'


const DashboardTaskTracker = () => {
  // Hooks
  const { data: session } = useSession()
  const dispatch = useDispatch<AppDispatch>()
  const [totalTaskStatusData, setTotalTaskStatusData] = useState<any[]>([])
  const [taskDepartmentData, setTaskDepartmentData] = useState<any[]>([])

  useEffect(() => {
    if (session && session.user) {
      dispatch(getTaskDashboardRequest({
        payload: {

        },
        callback: (response: any) => {
          if (response?.data) {
            setTotalTaskStatusData(response.data.task_data)
            setTaskDepartmentData(response.data_acording_to_dept || [])
          }
        }
      }))
    }
  }, [dispatch, session])

  const user = session?.user as any
  const year = (session?.user as any)?.userSelectedYear || "N/A"
  const unitName = user?.unit_selected?.unit_name || user?.unit_selected?.name || 'Select Unit'

  const { toPDF, targetRef } = usePDF({
    filename: "Task_Dashboard.pdf",
  });

  return (
    <>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, md: 12 }}>
          <DashboardTask totalTaskStatusData={totalTaskStatusData} onDownload={toPDF} />
        </Grid>
        <Grid size={{ xs: 12, md: 12 }}>
          <Card>
            <CardHeader
              title='Task Dashboard By Department'
              titleTypographyProps={{ align: 'center', fontWeight: 'bold' }}
            />
            <CardContent>
              <Grid container spacing={6}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <DepartmentWiseData departmentData={taskDepartmentData} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <DepartmentBarChart chartData={taskDepartmentData} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
        <div ref={targetRef} style={{ padding: "20px" }}>

          <div style={{ position: "relative" }}>

            <h2 style={{ textAlign: "center" }}>Task Dashboard</h2>

            <div style={{ position: "absolute", right: 0, top: 0 }}>
              <p style={{ margin: 0 }}>
                <strong>Year:</strong> {year} &nbsp;&nbsp;
                <strong>Unit:</strong> {unitName}
              </p>
            </div>

          </div>

          <DashboardTask
            totalTaskStatusData={totalTaskStatusData}
            hideDownload={true}
          />

          <Card>
            <CardHeader title="Task Dashboard By Department" />
            <CardContent>
              <div style={{ display: "flex", gap: "20px" }}>

                <div style={{ width: "60%" }}>
                  <DepartmentWiseData departmentData={taskDepartmentData} />
                </div>

                <div style={{ width: "40%" }}>
                  <DepartmentBarChart chartData={taskDepartmentData} />
                </div>

              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </>
  )
}

export default DashboardTaskTracker
