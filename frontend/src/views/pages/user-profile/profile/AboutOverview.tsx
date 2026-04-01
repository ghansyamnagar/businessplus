// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'

// Type Imports
import type { UserProfileData } from '../index'

interface AboutOverviewProps {
  profileData?: UserProfileData | null
  onEditClick?: () => void
}

const AboutOverview = ({ profileData, onEditClick }: AboutOverviewProps) => {
  const userData = profileData?.user_data

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent className='flex flex-col gap-6'>
            {/* Header with Edit Button */}
            <div className='flex justify-between items-center'>
              <Typography variant='h6' className='flex items-center gap-2'>
                <i className='ri-user-3-line text-xl' />
                About
              </Typography>
              <Button
                variant='outlined'
                size='small'
                startIcon={<i className='ri-edit-line' />}
                onClick={onEditClick}
              >
                Edit Profile
              </Button>
            </div>

            {/* About Section */}
            <div className='flex flex-col gap-4'>
              {userData?.name && (
                <div className='flex items-center gap-2'>
                  <i className='ri-user-3-line' />
                  <div className='flex items-center flex-wrap gap-2'>
                    <Typography className='font-medium'>Full Name:</Typography>
                    <Typography>{userData.name}</Typography>
                  </div>
                </div>
              )}
              {userData?.designation && (
                <div className='flex items-center gap-2'>
                  <i className='ri-briefcase-line' />
                  <div className='flex items-center flex-wrap gap-2'>
                    <Typography className='font-medium'>Designation:</Typography>
                    <Typography>{userData.designation}</Typography>
                  </div>
                </div>
              )}
              {userData?.gender && (
                <div className='flex items-center gap-2'>
                  <i className='ri-user-line' />
                  <div className='flex items-center flex-wrap gap-2'>
                    <Typography className='font-medium'>Gender:</Typography>
                    <Typography>{userData.gender.charAt(0).toUpperCase() + userData.gender.slice(1)}</Typography>
                  </div>
                </div>
              )}
              {userData?.date_birth && (
                <div className='flex items-center gap-2'>
                  <i className='ri-cake-2-line' />
                  <div className='flex items-center flex-wrap gap-2'>
                    <Typography className='font-medium'>Date of Birth:</Typography>
                    <Typography>{userData.date_birth}</Typography>
                  </div>
                </div>
              )}
              {userData?.city && (
                <div className='flex items-center gap-2'>
                  <i className='ri-map-pin-line' />
                  <div className='flex items-center flex-wrap gap-2'>
                    <Typography className='font-medium'>City:</Typography>
                    <Typography>{userData.city}</Typography>
                  </div>
                </div>
              )}
              {userData?.address && (
                <div className='flex items-center gap-2'>
                  <i className='ri-home-line' />
                  <div className='flex items-center flex-wrap gap-2'>
                    <Typography className='font-medium'>Address:</Typography>
                    <Typography>{userData.address}</Typography>
                  </div>
                </div>
              )}
            </div>

            {/* Contacts Section */}
            <div className='flex flex-col gap-4'>
              <Typography className='uppercase' variant='body2' color='text.disabled'>
                Contacts
              </Typography>
              {userData?.email && (
                <div className='flex items-center gap-2'>
                  <i className='ri-mail-line' />
                  <div className='flex items-center flex-wrap gap-2'>
                    <Typography className='font-medium'>Email:</Typography>
                    <Typography>{userData.email}</Typography>
                  </div>
                </div>
              )}
              {userData?.mobile && (
                <div className='flex items-center gap-2'>
                  <i className='ri-phone-line' />
                  <div className='flex items-center flex-wrap gap-2'>
                    <Typography className='font-medium'>Mobile:</Typography>
                    <Typography>{userData.mobile}</Typography>
                  </div>
                </div>
              )}
              {userData?.mobile2 && (
                <div className='flex items-center gap-2'>
                  <i className='ri-phone-line' />
                  <div className='flex items-center flex-wrap gap-2'>
                    <Typography className='font-medium'>Mobile 2:</Typography>
                    <Typography>{userData.mobile2}</Typography>
                  </div>
                </div>
              )}
            </div>

            {/* Units Section */}
            {profileData?.unit_data && profileData.unit_data.length > 0 && (
              <div className='flex flex-col gap-4'>
                <Typography className='uppercase' variant='body2' color='text.disabled'>
                  Units
                </Typography>
                <div className='flex flex-wrap gap-2'>
                  {profileData.unit_data.map(unit => (
                    <Chip key={unit.unit_id} label={unit.unit_name} size='small' variant='tonal' color='primary' />
                  ))}
                </div>
              </div>
            )}

            {/* Departments Section */}
            {profileData?.department_masters && profileData.department_masters.length > 0 && (
              <div className='flex flex-col gap-4'>
                <Typography className='uppercase' variant='body2' color='text.disabled'>
                  Departments
                </Typography>
                <div className='flex flex-wrap gap-2'>
                  {profileData.department_masters.map(dept => (
                    <Chip key={dept.dept_id} label={dept.dept_name} size='small' variant='tonal' color='info' />
                  ))}
                </div>
              </div>
            )}

            {/* Sections */}
            {profileData?.sections && profileData.sections.length > 0 && (
              <div className='flex flex-col gap-4'>
                <Typography className='uppercase' variant='body2' color='text.disabled'>
                  Sections
                </Typography>
                <div className='flex flex-wrap gap-2'>
                  {profileData.sections.map(section => (
                    <Chip key={section.section_id} label={section.section_name} size='small' variant='tonal' color='success' />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default AboutOverview
