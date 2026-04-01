// MUI Imports
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'

// Type Imports
import type { UserProfileData } from './index'

const UserProfileHeader = ({ profileData }: { profileData?: UserProfileData | null }) => {
  const userData = profileData?.user_data

  return (
    <Card>
      <CardMedia image='/images/pages/profile-banner.png' className='bs-[250px]' />
      <CardContent className='flex justify-center flex-col items-center gap-6 md:items-end md:flex-row !pt-0 md:justify-start'>
        <div className='flex rounded-bs-xl mbs-[-30px] mli-[-5px] border-[5px] border-be-0 border-backgroundPaper bg-backgroundPaper'>
          {userData?.profile_picture ? (
            <img
              height={120}
              width={120}
              src={userData.profile_picture}
              className='rounded'
              alt='Profile Picture'
            />
          ) : (
            <Avatar
              sx={{ width: 120, height: 120, fontSize: '3rem' }}
              className='rounded'
            >
              <i className='ri-user-3-line' style={{ fontSize: '3rem' }} />
            </Avatar>
          )}
        </div>
        <div className='flex is-full flex-wrap justify-start flex-col items-center sm:flex-row sm:justify-between sm:items-end gap-5'>
          <div className='flex flex-col items-center sm:items-start gap-2'>
            <Typography variant='h4'>{userData?.name || ''}</Typography>
            <div className='flex flex-wrap gap-6 gap-y-3 justify-center sm:justify-normal min-bs-[38px]'>
              {userData?.designation && (
                <div className='flex items-center gap-2'>
                  <i className='ri-briefcase-line' />
                  <Typography className='font-medium'>{userData.designation}</Typography>
                </div>
              )}
              {userData?.city && (
                <div className='flex items-center gap-2'>
                  <i className='ri-map-pin-line' />
                  <Typography className='font-medium'>{userData.city}</Typography>
                </div>
              )}
              {userData?.email && (
                <div className='flex items-center gap-2'>
                  <i className='ri-mail-line' />
                  <Typography className='font-medium'>{userData.email}</Typography>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default UserProfileHeader
