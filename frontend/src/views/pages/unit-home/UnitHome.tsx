// 'use client'

// import { BrowserRouter } from 'react-router-dom'
// import UnitCards from './UnitCards'

// MUI Imports

// Types Imports

// const UnitHome = () => {
//   // Props

//   return (
//     <>
//       <BrowserRouter>
//         <UnitCards />
//       </BrowserRouter>
//     </>
//   )
// }

// export default UnitHome



'use client'

import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
//import Faqs from '@/views/front-pages/landing-page/Faqs'
import { useSession } from 'next-auth/react'
import { IntersectionProvider } from '@/contexts/intersectionContext'
import UnitCards from './UnitCards'
import Header from '@/components/layout/front-pages/Header'

const UnitHome = () => {
  const { data: session } = useSession()

  return (
    <IntersectionProvider>
      <Header mode={'system'} />
      <div>
        <Grid
          container
          spacing={6}
          sx={{
            px: { xs: 2, sm: 4, md: 8 },
            pt: { xs: 2, sm: 3, md: 4 },
            mx: { xs: 2, sm: 4, md: 8 }
          }}
        >
          {/* Heading Section */}
          {/* <Grid size={{ xs: 12 }} textAlign='center'>
            <Typography
              variant='h4'
              sx={{
                fontSize: { xs: '1.3rem', sm: '1.5rem', md: '1.7rem' },
                fontWeight: 600
              }}
            >
              Welcome {session?.user?.name || 'User'}
            </Typography>

            <Typography
              sx={{
                fontSize: { xs: '0.9rem', sm: '1rem', md: '1rem' },
                mt: 1
              }}
            >
              Please follow simple steps to complete the registration process.
            </Typography>
          </Grid> */}

          {/* Components */}
          <Grid size={{ xs: 12 }}>
            <UnitCards />
          </Grid>
        </Grid>
      </div>
    </IntersectionProvider>
  )
}

export default UnitHome
