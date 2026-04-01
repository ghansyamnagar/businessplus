'use client'

// React Imports
import { useEffect, useRef } from 'react'

// MUI Imports
import Typography from '@mui/material/Typography'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Grid from '@mui/material/Grid2'

// Third-party Imports
import classnames from 'classnames'

// Hook Imports
import { useIntersection } from '@/hooks/useIntersection'

// SVG Imports
import ElementOne from './ElementOne'
import Lines from './Lines'

// Styles Imports
import frontCommonStyles from '@views/front-pages/styles.module.css'


type HelpPageDataTypes = {
  id: string
  question: string
  active?: boolean
  answer: string
}

const HelpPageData: HelpPageDataTypes[] = [
  {
    id: 'panel1',
    question: 'Company name of your organization & address',
    answer: 'Please enter the name of your Organization/Company and also the address.',
    active: true
  },
  {
    id: 'panel2',
    question: 'Enter Business Units and Locations',
    answer:
      'If you want to enter other locations addresses of your organization, now you can do it, Else you can enter these details later after the registration process is over.'
  },
  {
    id: 'panel3',
    question: 'Create Departments & Department Head',
    answer:
      'Please enter the name of the user, Department and also the role of the user. All users should be registered in the Prima Plus tool using this menu. You can enter users names at a later stage as well. However, you need to make at least one entry to start the process.'
  },
  {
    id: 'panel4',
    question: 'Create Sections',
    answer:
      'Please enter various Sections within a department for Tracking Initiatives and Action plans. Each and every Section under various departments has to be listed. You may enter all sections now or you may decide to do at a later stage. MAKE AT LEAST ONE ENTRY.'
  },
  {
    id: 'panel5',
    question: 'User control setting',
    answer:
      'Select your financial year - January-December or April-March. Monthly data update date - when you would like to generate all reports of the previous month. 1st of every month, 2nd of every month and so on. The report will be for the month but the report will be published by the date selected.  Reminder Date - Suggest how many days in advance the alert should be sent for reminders - 1 day in advance, 2 days in advance.'
  }
]

const HelpPage = () => {
  // Refs
  const skipIntersection = useRef(true)
  const ref = useRef<null | HTMLDivElement>(null)

  // Hooks
  const { updateIntersections } = useIntersection()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (skipIntersection.current) {
          skipIntersection.current = false

          return
        }

        updateIntersections({ [entry.target.id]: entry.isIntersecting })
      },
      { threshold: 0.35 }
    )

    ref.current && observer.observe(ref.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section
      id='faq'
      ref={ref}
      className={classnames('flex flex-col gap-16 plb-[40px]', frontCommonStyles.layoutSpacing)}
    >
      <div className='flex flex-col items-center justify-center'>
        <div className='flex is-full justify-center items-center relative'>
          <ElementOne className='absolute inline-end-0' />
          <div className='flex items-center justify-center mbe-6 gap-3'>
            <Lines />
            <Typography variant='h6' className='uppercase'>
              HELP
            </Typography>
          </div>
        </div>
        <div className='flex items-baseline flex-wrap gap-2 mbe-3 sm:mbe-2'>
          <Typography variant='h5'>Registration Process Help</Typography>
        </div>
        <Typography className='font-medium text-center'>
          Get help with registration by exploring these frequently asked questions.
        </Typography>
      </div>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, lg: 5 }} className='text-center'>
          <img
            src='/images/front-pages/landing-page/sitting-girl-with-laptop.png'
            alt='girl with laptop'
            className='is-[80%] max-is-[320px]'
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 7 }}>
          {HelpPageData.map((data, index) => {
            return (
              <Accordion key={index} defaultExpanded={data.active}>
                <AccordionSummary aria-controls={data.id + '-content'} id={data.id + '-header'} className='font-medium'>
                  {data.question}
                </AccordionSummary>
                <AccordionDetails>{data.answer}</AccordionDetails>
              </Accordion>
            )
          })}
        </Grid>
      </Grid>
    </section>
  )
}

export default HelpPage
