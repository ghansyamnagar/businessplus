// MUI Imports
import Grid from '@mui/material/Grid2'

// Type Imports
import type { UserProfileData } from '../index'

// Component Imports
import AboutOverview from './AboutOverview'
import JoinedGroups from './JoinedGroups'

interface ProfileTabProps {
  profileData?: UserProfileData | null
  onEditClick?: () => void
}

const ProfileTab = ({ profileData, onEditClick }: ProfileTabProps) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 6, lg: 6 }}>
        <AboutOverview profileData={profileData} onEditClick={onEditClick} />
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 6 }}>
        <JoinedGroups />
      </Grid>
    </Grid>
  )
}

export default ProfileTab
