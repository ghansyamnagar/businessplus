'use client'

// React Imports
import { useState, useEffect } from 'react'
import type { SyntheticEvent } from 'react'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

// Component Imports
import UserProfileHeader from './UserProfileHeader'
import EditProfileModal from './EditProfileModal'
import CustomTabList from '@core/components/mui/TabList'

// Redux Imports
import { useDispatch } from 'react-redux'
import { viewProfileRequest } from '@/redux-store/slices/auth/auth.slice'

// Dynamic Imports
const ProfileTab = dynamic(() => import('@/views/pages/user-profile/profile'))
const SecurityTab = dynamic(() => import('@/views/pages/account-settings/security'))

export type UserProfileData = {
  user_data: {
    emp_id: number
    name: string
    designation: string
    gender: string
    mobile: string
    mobile2: string
    email: string
    city: string
    address: string
    date_birth: string
    date_hire: string | null
    multi_unit_id: string
    multi_dept_id: string
    multi_section_id: string
    pan_card_no: string
    user_id: number
    photo_id: number
    profile_picture: string
  }
  unit_data: Array<{ unit_id: number; unit_name: string }>
  department_masters: Array<{ dept_id: number; dept_name: string }>
  sections: Array<{ section_id: number; section_name: string }>
}

const UserProfile = () => {
  // States
  const [activeTab, setActiveTab] = useState('profile')
  const [profileData, setProfileData] = useState<UserProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editModalOpen, setEditModalOpen] = useState(false)

  // Hooks
  const dispatch = useDispatch()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = () => {
    setLoading(true)

    dispatch(
      viewProfileRequest({
        payload: {},
        callback: (response: any, error: any) => {
          setLoading(false)

          if (response && !error && response?.status === 'success') {
            setProfileData(response.data)
          }
        }
      })
    )
  }

  const handleChange = (event: SyntheticEvent, value: string) => {
    setActiveTab(value)
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab profileData={profileData} onEditClick={() => setEditModalOpen(true)} />
      case 'security':
        return <SecurityTab />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <UserProfileHeader profileData={profileData} />
        </Grid>
        <Grid size={{ xs: 12 }} className='flex flex-col gap-6'>
          <TabContext value={activeTab}>
            <CustomTabList onChange={handleChange} variant='scrollable' pill='true'>
              <Tab
                label={
                  <div className='flex items-center gap-2'>
                    <i className='ri-user-3-line text-lg' />
                    Profile
                  </div>
                }
                value='profile'
              />
              <Tab
                label={
                  <div className='flex items-center gap-2'>
                    <i className='ri-lock-2-line text-lg' />
                    Security
                  </div>
                }
                value='security'
              />
            </CustomTabList>

            <TabPanel value={activeTab} className='p-0'>
              {renderTabContent()}
            </TabPanel>
          </TabContext>
        </Grid>
      </Grid>

      {/* Edit Profile Modal */}
      <EditProfileModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        profileData={profileData}
        onSuccess={fetchProfile}
      />
    </>
  )
}

export default UserProfile
