'use client'

// React Imports
import { useEffect, useState, useRef } from 'react'
import Button from "@mui/material/Button";
// Next Auth Imports
import { useSession } from 'next-auth/react'
import { usePDF } from "react-to-pdf";
// Redux Imports
import { useDispatch } from 'react-redux'
import { getKpiDashboardRequest, getLeadKpiDashboardRequest } from '@/redux-store/slices/kpiTracker/kpiTracker.slice'
import type { AppDispatch } from '@/redux-store'
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

import KpiData from '@/views/apps/kpiTracker/dashboard/KpiData'
import DepartmentWiseData from '@/components/common/DepartmentWiseData'
import DepartmentBarChart from '@/components/common/chart/DepartmentBarChart'


const DashboardKPI = () => {
  // Hooks
  const { data: session } = useSession()
  const dispatch = useDispatch<AppDispatch>()
  const [kpiData, setKpiData] = useState<any[]>([])
  const [leadKpiData, setLeadKpiData] = useState<any[]>([])

  const pdfRef = useRef(null)
  // const { toPDF } = usePDF({ filename: "dashboard.pdf" })

  const { toPDF, targetRef } = usePDF({
    filename: "KPI_Tracker_Dashboard.pdf",
  })
  const user = session?.user as any

  const year = (session?.user as any)?.userSelectedYear || "N/A"
  const unitName = user?.unit_selected?.unit_name || user?.unit_selected?.name || 'Select Unit'


  useEffect(() => {
    if (session && session.user) {
      const payload = {}

      dispatch(getKpiDashboardRequest({
        payload,
        callback: (data: any) => {
          //console.log("KPI Dashboard Data:", data)
          if (data?.data) {
            setKpiData(data.data)
          }
        }
      }))

      dispatch(getLeadKpiDashboardRequest({
        payload,
        callback: (data: any) => {
          // console.log("Lead KPI Dashboard Data:", data)
          if (data?.data) {
            setLeadKpiData(data.data)
          }
        }
      }))
    }
  }, [dispatch, session])

  return (
    <>
      {/* <Tooltip title="Download PDF" placement="top" arrow>
        <IconButton
          color="primary"
          onClick={() => toPDF()}
        >
          <i className='ri-download-2-line' />
        </IconButton>
      </Tooltip> */}
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, md: 12 }}>
          <KpiData kpiData={kpiData} leadKpiData={leadKpiData} onDownload={toPDF} />
        </Grid>
        <Grid size={{ xs: 12, md: 12 }}>
          <Card>
            <CardHeader
              title='KPI Dashboard By Department'
              titleTypographyProps={{ align: 'center', fontWeight: 'bold' }}
            />
            <CardContent>
              <Grid container spacing={6}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <DepartmentWiseData departmentData={kpiData} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <DepartmentBarChart chartData={kpiData} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
        <div ref={targetRef} style={{ padding: "20px" }}>

          <div style={{ position: "relative" }}>

            <h2 style={{ textAlign: "center" }}>KPI Dashboard</h2>

            <div style={{ position: "absolute", right: 0, top: 0 }}>
              <p style={{ margin: 0 }}>
                <strong>Year:</strong> {year} &nbsp;&nbsp;
                <strong>Unit:</strong> {unitName}
              </p>
            </div>

          </div>

          <KpiData kpiData={kpiData} leadKpiData={leadKpiData} hideDownload={true} />

          <Card>
            <CardHeader title='KPI Dashboard By Department' />
            <CardContent>
              <div style={{ display: "flex", gap: "20px" }}>

                <div style={{ width: "60%" }}>
                  <DepartmentWiseData departmentData={kpiData} />
                </div>

                <div style={{ width: "40%" }}>
                  <DepartmentBarChart chartData={kpiData} />
                </div>

              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </>
  )
}

export default DashboardKPI
