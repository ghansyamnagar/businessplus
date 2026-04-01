'use client'

// React Imports
import type { ReactElement } from 'react'

// Next Imports
import dynamic from 'next/dynamic'

// Component Imports
import UserProfile from '@views/pages/user-profile'
import type { UserProfileData } from '@views/pages/user-profile'

const ProfilePage = () => {
  return <UserProfile />
}

export default ProfilePage
