'use client'

// React Imports
import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useSession } from 'next-auth/react'
import { getViewCompanySetupRequest, getUserUnitsRequest } from '@/redux-store/slices/user/user.slice'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepConnector from '@mui/material/StepConnector'
import StepLabel from '@mui/material/StepLabel'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'

// Component Imports
import StepBasicDetails from './StepBasicDetails'
import StepUnitDetails from './StepUnitDetails'
import StepDepartmentDetails from './StepDepartmentDetails'
import StepUserControl from './StepUserControl'
import StepSectionDetails from './StepReview'

// Styled Component Imports
import StepperWrapper from '@core/styles/stepper'
import StepperCustomDot from '@components/stepper-dot'

// Vars
const steps = [
  {
    title: 'Company Basic Details',
    subtitle: 'Enter Organization with address.'
  },
  {
    title: 'Business Units',
    subtitle: 'Enter business units & locations'
  },
  {
    title: 'Department',
    subtitle: 'Create department & department admin'
  },
  {
    subtitle: 'Create the user sections',
    title: 'Sections'
  },
  {
    subtitle: 'Enter User control setting',
    title: 'Setting'
  }
]

// Styled Components
const ConnectorHeight = styled(StepConnector)(() => ({
  '& .MuiStepConnector-line': {
    minHeight: 30
  }
}))

const CenteredContainer = styled('div')(() => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  padding: '10px',
  boxSizing: 'border-box'
}))

const getStepContent = (step: number, handleNext: () => void, handlePrev: () => void, companyData: any, unitOptions: any[], fetchCompanyData: () => void) => {
  const Tag =
    step === 0
      ? StepBasicDetails
      : step === 1
        ? StepUnitDetails
        : step === 2
          ? StepDepartmentDetails
          : step === 3
            ? StepSectionDetails
            : StepUserControl

  return <Tag activeStep={step} handleNext={handleNext} handlePrev={handlePrev} steps={steps} companyData={companyData} unitOptions={unitOptions} fetchCompanyData={fetchCompanyData} />
}

const CreateCompany = () => {
  // States
  const [activeStep, setActiveStep] = useState(0)
  const [companyData, setCompanyData] = useState<any>(null)
  const [unitOptions, setUnitOptions] = useState<any[]>([])
  const dispatch = useDispatch()
  const { data: session, update } = useSession()

  // const fetchCompanyData = () => {
  //   if (session?.user && (session.user as any).accessToken) {
  //     dispatch(
  //       getViewCompanySetupRequest({
  //         payload: {
  //           login_access_token: (session.user as any).accessToken,
  //           company_id: (session.user as any).company_id,
  //           user_id: (session.user as any).id,
  //         },
  //         callback: async (response, error) => {
  //           if (response && response.status === 'success') {
  //             console.log('Company Setup Data:', response)

  //             // if (response.data?.comanyInfo?.length > 0) {
  //             //   await update({
  //             //     user: {
  //             //       ...session?.user,
  //             //       step_no: response.data.comanyInfo[0].step_no,
  //             //     }
  //             //   })
  //             // }

  //             setCompanyData(response.data)
  //           } else {
  //             console.error('Company Setup Error:', error)
  //           }
  //         }
  //       })
  //     )
  //   }
  // }

  const fetchCompanyData = () => {
    console.log('ggggggggggggg', session?.user)
    if (session?.user && (session.user as any).accessToken) {
      if (session?.user?.company_id != "") {
        dispatch(
          getViewCompanySetupRequest({
            payload: {
              login_access_token: (session.user as any).accessToken,
              company_id: (session.user as any).company_id,
              user_id: (session.user as any).id,
            },
            callback: (response, error) => {
              if (response && response.status === 'success') {
                //console.log('Company Setup Data:', response)
                let stepNo = 0;
                if (response.data.comanyInfo?.length > 0) {
                  stepNo = 1;
                }
                if (response.data.comanyUnit?.length > 0) {
                  stepNo = 2;
                }
                if (response.data.comanyDept?.length > 0) {
                  stepNo = 3;
                }
                if (response.data.comanySection?.length > 0) {
                  stepNo = 4;
                }
                if (response.data.comanyUserContSet?.length > 0) {
                  stepNo = 5;
                }
                updateSessionData(stepNo);

                setCompanyData(response.data)
              } else {

                console.error('Company Setup Error:', error)
              }
            }
          })
        )
      }

    }
  }
  const updateSessionData = async (step_no: any) => {
    if (session?.user && (session.user as any).step_no != step_no) {
      await update({
        user: {
          ...session?.user,
          step_no: step_no,
        }
      })
    }
  }
  const fetchUserUnitsData = () => {
    if (session?.user && (session.user as any).accessToken) {
      // Fetch Units
      dispatch(getUserUnitsRequest({
        payload: {
          login_access_token: (session.user as any).accessToken,
          company_id: (session.user as any).company_id,
        },
        callback: (response, error) => {
          if (response && response.status === 'success') {
            const options = response.data.map((u: any) => ({
              value: u.id,
              label: u.unit_name
            }))
            setUnitOptions(options)
          }
        }
      }))
    }
  }

  useEffect(() => {
    if (session?.user && (session.user as any).accessToken) {
      fetchCompanyData()
      fetchUserUnitsData()
    }
  }, [session, dispatch])

  const handleNext = () => {
    if (activeStep !== steps.length - 1) {
      setActiveStep(activeStep + 1)
    } else {
      //alert('Submitted..!!')
    }
    console.log('aaaaaaaaaaaaaaaaaaaaaaaaaa', activeStep, ' == ', steps.length)
    if (activeStep == 1) {
      fetchUserUnitsData()
    }
  }

  const handlePrev = () => {
    if (activeStep !== 0) {
      setActiveStep(activeStep - 1)
    }
  }

  return (
    <CenteredContainer>
      <Card className='flex flex-col md:flex-row'>
        <CardContent className='max-md:border-be md:border-ie md:min-is-[300px]'>
          <StepperWrapper className='bs-full'>
            <Stepper activeStep={activeStep} connector={<ConnectorHeight />} orientation='vertical'>
              {steps.map((step, index) => {
                const isEnabled = index === 0 || (session?.user?.step_no && index <= parseInt(session.user.step_no))

                return (
                  <Step key={index} onClick={() => {
                    if (isEnabled) {
                      setActiveStep(index)
                    }
                  }} disabled={!isEnabled}>
                    <StepLabel
                      slots={{
                        stepIcon: StepperCustomDot
                      }}
                      className='p-0'
                    >
                      <div className={`step-label ${!isEnabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                        <Typography className='step-number'>{`0${index + 1}`}</Typography>
                        <div>
                          <Typography className='step-title'>{step.title}</Typography>
                          <Typography className='step-subtitle'>{step.subtitle}</Typography>
                        </div>
                      </div>
                    </StepLabel>
                  </Step>
                )
              })}
            </Stepper>
          </StepperWrapper>
        </CardContent>
        <CardContent className='flex-1 pbs-5 flex flex-col'>
          {getStepContent(activeStep, handleNext, handlePrev, companyData, unitOptions, fetchCompanyData)}
        </CardContent>
      </Card>
    </CenteredContainer>
  )
}

export default CreateCompany
