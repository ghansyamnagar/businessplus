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

interface ReminderActionPlanAndKpiProps {
  reminderActionPlanData?: any[]
  reminderKpiData?: any[]
}

const ReminderActionPlanAndKpi = ({ reminderActionPlanData, reminderKpiData }: ReminderActionPlanAndKpiProps) => {
  // Hooks
  const { data: session } = useSession()

  // States
  const [value, setValue] = useState<string>('ActionPlan')
  const [reminderActionPlan, setReminderActionPlan] = useState<any[]>([])
  const [kpiReminder, setKpiReminder] = useState<any[]>([])

  useEffect(() => {
    if (reminderActionPlanData) {
      setReminderActionPlan(reminderActionPlanData)
    }
  }, [reminderActionPlanData])

  useEffect(() => {
    if (reminderKpiData) {
      const processedKpis: any[] = []

      reminderKpiData.forEach((item: any) => {
        // Handle actual_array
        if (item.actual_array && item.actual_array.length > 0) {
          const review = item.actual_array[0]

          processedKpis.push({
            kpi_name: review.kpi_name,
            month: Array.isArray(review.month) ? review.month.join(', ') : review.month,
            dept_id: review.dept_id
          })
        }

        // Handle upcomig_review
        const comingReview = item.upcomig_review

        if (comingReview && !Array.isArray(comingReview)) {
          processedKpis.push({
            kpi_name: (comingReview as any).kpi_name,
            month: (comingReview as any).month
          })
        }
      })

      setKpiReminder(processedKpis)
    }
  }, [reminderKpiData])

  const handleChange = (event: SyntheticEvent, actionPlanValue: string) => {
    setValue(actionPlanValue)
  }

  const getActiveData = () => {
    if (value === 'ActionPlan') return reminderActionPlan
    if (value === 'kpi') return kpiReminder

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
      <CardHeader title='Reminder' />
      <TabContext value={value}>
        <TabList variant='fullWidth' onChange={handleChange} aria-label='full width tabs example'>
          <Tab value='ActionPlan' label='Action Plan Reminder' />
          <Tab value='kpi' label='KPI Reminder' />
        </TabList>
        <TabPanel value={value} className='pbs-0'>
          <CardContent className='pl-2 pr-2 pt-3'>
            {value === 'ActionPlan' ? (
              <>
                <Grid container spacing={2} sx={{ mb: 4, px: 2, borderBottom: '1px solid', borderColor: 'divider', pb: 2 }}>
                  <Grid size={{ xs: 1 }}>
                    <Typography variant='overline' className='font-bold' color='text.primary'>
                      Sr.No.
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 7 }}>
                    <Typography variant='overline' className='font-bold' color='text.primary'>
                      Category
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 1.5 }}>
                    <Typography variant='overline' className='font-bold' color='text.primary'>
                      Status
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 2.5 }}>
                    <Typography variant='overline' className='font-bold' color='text.primary'>
                      Date
                    </Typography>
                  </Grid>
                </Grid>
                <div className={styles.scrollableReminderContent}>
                  {activeData.length > 0 ? (
                    activeData.map((item: any, index: number) => (
                      <Fragment key={index}>
                        <Grid
                          container
                          spacing={2}
                          alignItems='center'
                          sx={{ px: 2, py: 3, '&:hover': { bgcolor: 'action.hover' } }}
                        >
                          <Grid size={{ xs: 1 }}>
                            <Typography variant='body2' color='text.secondary'>
                              {index + 1}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 7 }}>
                            <Typography variant='body2' className='font-medium'>
                              {item.definition}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 1.5 }}>
                            <Typography variant='body2' color={getColorByStatus(item.status)}>
                              {item.status}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 2.5 }}>
                            <Typography variant='body2' color='text.secondary'>
                              {item.review_month_date || 'N/A'}
                            </Typography>
                          </Grid>
                        </Grid>
                        {index !== activeData.length - 1 && <Divider />}
                      </Fragment>
                    ))
                  ) : (
                    <Typography sx={{ p: 4, textAlign: 'center' }}>No tasks found</Typography>
                  )}
                </div>
              </>
            ) : (
              <>
                <Grid container spacing={2} sx={{ mb: 2, px: 2, borderBottom: '1px solid', borderColor: 'divider', pb: 2 }}>
                  <Grid size={{ xs: 1 }}>
                    <Typography variant='overline' className='font-bold' color='text.primary'>
                      Sr.No.
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 7 }}>
                    <Typography variant='overline' className='font-bold' color='text.primary'>
                      KPI
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <Typography variant='overline' className='font-bold' color='text.primary'>
                      Month
                    </Typography>
                  </Grid>
                </Grid>
                <div className={styles.scrollableReminderContent}>
                  {activeData.length > 0 ? (
                    activeData.map((item: any, index: number) => (
                      <Fragment key={index}>
                        <Grid
                          container
                          spacing={2}
                          alignItems='center'
                          sx={{ px: 2, py: 3, '&:hover': { bgcolor: 'action.hover' } }}
                        >
                          <Grid size={{ xs: 1 }}>
                            <Typography variant='body2' color='text.secondary'>
                              {index + 1}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 7 }}>
                            <Typography variant='body2' className='font-medium'>
                              {item.kpi_name}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 4 }}>
                            <Typography variant='body2' color='text.secondary'>
                              {item.month || 'N/A'}
                            </Typography>
                          </Grid>
                        </Grid>
                        {index !== activeData.length - 1 && <Divider />}
                      </Fragment>
                    ))
                  ) : (
                    <Typography sx={{ p: 4, textAlign: 'center' }}>No tasks found</Typography>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </TabPanel>
      </TabContext>
    </Card>
  )
}

export default ReminderActionPlanAndKpi
