import React from 'react'
import Grid from '@mui/material/Grid2'
import UnitHome from '@/views/pages/unit-home/UnitHome'

const UnitPage = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <UnitHome />
      </Grid>
    </Grid>
  )
}

export default UnitPage
