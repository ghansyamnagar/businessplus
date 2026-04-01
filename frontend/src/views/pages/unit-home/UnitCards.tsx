
// import { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import { useDispatch } from 'react-redux'
// import { useSession } from 'next-auth/react'
// import Typography from '@mui/material/Typography'
// import Card from '@mui/material/Card'
// import CardContent from '@mui/material/CardContent'
// import { MapPinHouse } from 'lucide-react'
// import type { TrackDetails } from 'keen-slider/react'
// import { useKeenSlider } from 'keen-slider/react'
// import classnames from 'classnames'
// import AppKeenSlider from '@/libs/styles/AppKeenSlider'
// import Lines from '@assets/svg/front-pages/landing-page/Lines'
// import frontCommonStyles from '@views/front-pages/styles.module.css'
// import { getUnitListRequest } from '@/redux-store/slices/user/user.slice'


// const UnitCards = () => {
//   const [loaded, setLoaded] = useState(false)
//   const [details, setDetails] = useState<TrackDetails | undefined>(undefined)
//   const [selectedIndex, setSelectedIndex] = useState<number>(0)
//   const [units, setUnits] = useState<any[]>([])
//   const router = useRouter()
//   const dispatch = useDispatch()
//  const { data: session, update } = useSession()


//   useEffect(() => {
//     if (session?.user) {
//       const payload = {
//         login_access_token: session.user.accessToken,
//        unit_id: session.user.unit_id
//       }
//      dispatch(getUnitListRequest({
//         payload,
//         callback: (response) => {
//           if (response?.status === 'success') {
//             setUnits(response.data)
//             // if (response.data && response.data.length > 0) {
//             //   update({ unit_selected: response.data[0] })
//             // }
//           }
//         }
//       }))
//     }
//   }, [session, dispatch])
//   // }, [session, dispatch])
//   const shouldUseData = units.length > 0 ? units : []
//   const shouldSlide = shouldUseData.length > 4
//   const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
//     loop: shouldSlide,
//     created: () => setLoaded(true),
//     detailsChanged: s => setDetails(s.track.details),
//     slides: {
//       perView: 4,
//       spacing: 10,
//       origin: shouldSlide ? 'center' : 'auto'
//     },
//     breakpoints: {
//       '(max-width: 1200px)': {
//         slides: {
//           perView: 3,
//           spacing: 10,
//           origin: shouldSlide ? 'center' : 'auto'
//         }
//       },
//       '(max-width: 900px)': {
//         slides: {
//           perView: 2,
//           spacing: 10,
//           origin: shouldSlide ? 'center' : 'auto'
//         }
//       },
//       '(max-width: 600px)': {
//         slides: {
//           perView: 1,
//           spacing: 10,
//           origin: shouldSlide ? 'center' : 'auto'
//         }
//       }
//     }
//   })
//   const scaleStyle = (idx: number) => {
//     if (!shouldSlide)
//       return {
//         transition: 'transform 0.2s ease-in-out, opacity 0.2s ease-in-out',
//         transform: 'scale(1)',
//         opacity: 1,
//         border: '1px solid'
//       }
//     return {
//       transition: 'transform 0.2s ease-in-out, opacity 0.2s ease-in-out',
//       ...(selectedIndex === idx
//         ? { transform: 'scale(1)', opacity: 1, border: '1px solid' }
//         : { transform: 'scale(0.9)', opacity: 0.5, border: 'none' })
//     }
//   }

//   const handleCardClick = async (index: number, item: any) => {
//     setSelectedIndex(index)
//     if (shouldSlide) {
//       instanceRef.current?.moveToIdx(index)
//     }
//     await update({ unit_selected: item })
//     router.push('/apps/dashboard')
//   }
//   const handleKeyDown = (e: React.KeyboardEvent, index: number, item: any) => {
//     if (e.key === 'Enter' || e.key === ' ') {
//       e.preventDefault()
//       handleCardClick(index, item)
//     }
//   }
//   return (
//     <section className={classnames('flex flex-col gap-16 plb-[10px] nagar', frontCommonStyles.layoutSpacing)}>
//       <div className={classnames('flex flex-col items-center justify-center', frontCommonStyles.layoutSpacing)}>
//         <div className='flex items-center justify-center mbe-6 gap-3'>
//           <Lines />
//           <Typography color='text.primary' className='font-medium uppercase'>
//             Locations
//           </Typography>
//         </div>
//         <div className='flex items-baseline flex-wrap gap-2 mbe-3 sm:mbe-2'>
//           <Typography variant='h4' className='font-medium'>
//             Select Location
//           </Typography>
//         </div>
//         <Typography className='font-medium text-center'>
//           Please select the office you would like to view. Click or tab to a location to access the dashboard.
//         </Typography>
//       </div>
//       <AppKeenSlider>
//         <div ref={sliderRef} className={classnames('keen-slider mbe-6 flex', { 'justify-center': !shouldSlide })}>
//           {shouldUseData.map((item: any, index: number) => (
//             <div
//               key={index
//               className={classnames('keen-slider__slide flex p-6 sm:p-4', { 'justify-center': !shouldSlide })}
//             >
//               <Card
//                 elevation={8}
//                 className='flex items-center'
//                 style={scaleStyle(index)}
//                 sx={{
//                   width: '300px',
//                   height: '280px',
//                   display: 'flex',
//                   justifyContent: 'center',
//                   alignItems: 'center',
//                   cursor: 'pointer'
//                 }}
//                 tabIndex={0}
//                 onClick={() => handleCardClick(index, item)}
//                 onKeyDown={e => handleKeyDown(e, index, item)}
//                 role='button'
//                 aria-label={`Select ${item.unit_name || item.name} location`}
//               >
//                 <CardContent className='p-8 items-center mlb-auto'>
//                   <div className='flex flex-col gap-4 items-center justify-center text-center'>
//                     <MapPinHouse style={{ fontSize: '100px' }} />
//                     <Typography style={{ fontSize: 25 }} color='text.primary' className='font-medium'>
//                       {item.unit_name || item.name}
//                     </Typography>
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>
//           ))}
//         </div>
//       </AppKeenSlider>
//     </section>
//   )
// }

// export default UnitCards

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { useSession } from 'next-auth/react'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import { MapPinHouse } from 'lucide-react'
import classnames from 'classnames'

import Lines from '@assets/svg/front-pages/landing-page/Lines'
import frontCommonStyles from '@views/front-pages/styles.module.css'
import { getUnitListForSelectUnitPageRequest } from '@/redux-store/slices/user/user.slice'

const UnitCards = () => {
  const { lang } = useParams()
  const [units, setUnits] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const router = useRouter()

  const dispatch = useDispatch()
  const { data: session, update } = useSession()

  useEffect(() => {
    if (session?.user) {
      const payload = {
        login_access_token: session.user.accessToken,
        unit_id: session.user.unit_id
      }
      dispatch(getUnitListForSelectUnitPageRequest({
        payload,
        callback: (response: any) => {
          setLoading(false)
          if (response?.status === 'success') {
            setUnits(response.data)
          }
        }
      }))
    } else {
      setLoading(false)
    }
  }, [session, dispatch])

  const handleCardClick = async (item: any) => {
    await update({ unit_selected: item })
    router.push(`/${lang}/apps/dashboard`)
  }

  const handleKeyDown = (e: React.KeyboardEvent, item: any) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleCardClick(item)
    }
  }

  return (
    <section className={classnames('flex flex-col gap-16 plb-[10px] nagar', frontCommonStyles.layoutSpacing)}>
      <div className={classnames('flex flex-col items-center justify-center', frontCommonStyles.layoutSpacing)}>
        <div className='flex items-center justify-center mbe-6 gap-3'>
          <Lines />
          <Typography color='text.primary' className='font-medium uppercase'>
            Locations
          </Typography>
        </div>
        <div className='flex items-baseline flex-wrap gap-2 mbe-3 sm:mbe-2'>
          <Typography variant='h4' className='font-medium'>
            Select Location
          </Typography>
        </div>
        <Typography className='font-medium text-center'>
          Please select the office you would like to view. Click or tab to a location to access the dashboard.
        </Typography>
      </div>
      <div className='flex flex-wrap justify-center gap-6'>
        {loading ? (
          <div className='flex flex-col items-center justify-center bs-[100px]'>
            <CircularProgress />

          </div>
        ) : (
          units.map((item: any, index: number) => (
            <Card
              key={index}
              elevation={8}
              className='flex items-center'
              sx={{
                width: '250px',
                height: '200px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.05)'
                }
              }}
              tabIndex={0}
              onClick={() => handleCardClick(item)}
              onKeyDown={e => handleKeyDown(e, item)}
              role='button'
              aria-label={`Select ${item.unit_name || item.name} location`}
            >
              <CardContent className='p-4 items-center mlb-auto'>
                <div className='flex flex-col gap-4 items-center justify-center text-center'>
                  <MapPinHouse style={{ fontSize: '100px' }} />
                  <Typography style={{ fontSize: 20 }} color='text.primary' className='font-medium'>
                    {item.unit_name || item.name}
                  </Typography>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </section>
  )
}

export default UnitCards
