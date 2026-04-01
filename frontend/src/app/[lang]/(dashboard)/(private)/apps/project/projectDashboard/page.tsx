'use client'

// React Imports
import { useEffect, useState } from 'react'

// Next Auth Imports
import { useSession } from 'next-auth/react'
import { usePDF } from "react-to-pdf";

// Redux Imports
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '@/redux-store'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import { getProjectDashboardRequest } from '@/redux-store/slices/project/project.slice'
import ProjectDashboard from '@/views/apps/project/dashboard/ProjectDashboard'
import ProjectStatusTable from '@/components/common/ProjectStatusTable'


const ProjectDashboardPage = () => {
    // Hooks
    const { data: session } = useSession()
    const dispatch = useDispatch<AppDispatch>()
    const [totalProjectStatusData, setTotalProjectStatusData] = useState<any>(null)
    const [projectDepartmentData, setProjectDepartmentData] = useState<any[]>([])
    const [projectYearData, setProjectYearData] = useState<any[]>([])
    const user = session?.user as any
    const year = (session?.user as any)?.userSelectedYear || "N/A"
    const unitName = user?.unit_selected?.unit_name || user?.unit_selected?.name || 'Select Unit'

    const { toPDF, targetRef } = usePDF({
        filename: "Project_Dashboard.pdf",
    });

    useEffect(() => {
        if (session && session.user) {
            dispatch(getProjectDashboardRequest({
                payload: {},
                callback: (response: any, error: any) => {
                    if (response?.data) {
                        // project_Dept_Year_Data has the overall yearly totals
                        const yearData = response.data.project_Dept_Year_Data || []

                        if (yearData.length > 0) {
                            setTotalProjectStatusData(yearData[0])
                        }

                        setProjectYearData(yearData)

                        // project_Dept_Data has per-department breakdown
                        setProjectDepartmentData(response.data.project_Dept_Data || [])
                    }
                }
            }))
        }
    }, [dispatch, session])

    return (
        <>
            <Grid container spacing={6}>
                <Grid size={{ xs: 12 }}>
                    <ProjectDashboard totalTaskStatusData={totalProjectStatusData} onDownload={toPDF} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <ProjectStatusTable
                        title='Year Wise Project Status'
                        firstColumnLabel='Year'
                        data={projectYearData}
                        showTotal={false}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <ProjectStatusTable
                        title='Department Wise Project Status'
                        firstColumnLabel='Department'
                        data={projectDepartmentData}
                    />
                </Grid>
            </Grid>

            <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
                <div ref={targetRef} style={{ padding: "20px" }}>

                    <div style={{ position: "relative" }}>
                        <h2 style={{ textAlign: "center" }}>Project Dashboard</h2>

                        <div style={{ position: "absolute", right: 0, top: 0 }}>
                            <p style={{ margin: 0 }}>
                                <strong>Year:</strong> {year} &nbsp;&nbsp;
                                <strong>Unit:</strong> {unitName}
                            </p>
                        </div>
                    </div>

                    <ProjectDashboard
                        totalTaskStatusData={totalProjectStatusData}
                        hideDownload={true}
                    />

                    <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>

                        <div style={{ width: "50%" }}>
                            <ProjectStatusTable
                                title='Year Wise Project Status'
                                firstColumnLabel='Year'
                                data={projectYearData}
                                showTotal={false}
                            />
                        </div>

                        <div style={{ width: "50%" }}>
                            <ProjectStatusTable
                                title='Department Wise Project Status'
                                firstColumnLabel='Department'
                                data={projectDepartmentData}
                            />
                        </div>

                    </div>

                </div>
            </div>
        </>
    )
}

export default ProjectDashboardPage
