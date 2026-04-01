'use client'

import { useRouter, useParams } from 'next/navigation'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import classnames from 'classnames'

// Style Imports
import frontCommonStyles from '@views/front-pages/styles.module.css'
import { getPermissionsFromLocal } from '@/redux-store/sagaHelpers'

const modules = [
    {
        title: 'My DashBoard',
        icon: 'ri-layout-grid-fill',
        href: '/apps/dashboard',
        acc_view: true
    },
    {
        title: 'Set New Business Plans',
        icon: 'ri-building-2-line',
        href: '/apps/strategicObjective/strategicObjective',
        acc_view: true
    },
    {
        title: 'KPI Tracker',
        icon: 'ri-sun-line',
        href: '/apps/kpiTracker/dashboard',
        acc_view: true
    },
    {
        title: 'Prima Project',
        icon: 'ri-repeat-2-line',
        href: '/apps/project/projectDashboard',
        acc_view: true
    },
    {
        title: 'Task Tracker',
        icon: 'ri-file-line',
        href: '/apps/taskTracker/dashboard',
        acc_view: true
    },
    {
        title: 'Business Vitals',
        icon: 'ri-briefcase-line',
        href: '#',
        acc_view: true
    },
    {
        title: 'Administration',
        icon: 'ri-settings-4-line',
        href: '/apps/administration/units',
        acc_view: true
    },
    // {
    //     title: 'People Competency',
    //     icon: 'ri-profile-line',
    //     href: '#'
    // },
    // {
    //     title: 'MoM Tracker',
    //     icon: 'ri-calendar-todo-line',
    //     href: '#'
    // }
]

const MainHome = () => {
    const router = useRouter()
    const params = useParams()
    const { lang: locale } = params

    const userModulePermission = getPermissionsFromLocal()
    console.log('ffffffffffffffffffffffff', userModulePermission)
    const handleCardClick = (href: string) => {
        if (href !== '#') {
            router.push(`/${locale}${href}`)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent, href: string) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleCardClick(href)
        }
    }

    return (

        <>
            <div className={classnames('flex flex-col items-center justify-center', frontCommonStyles.layoutSpacing)}>
                <div className='flex items-baseline flex-wrap gap-2 mbe-1 sm:mbe-1'>
                    <Typography variant='h4' className='font-medium'>
                        Business Modules
                    </Typography>
                </div>
            </div>

            {/* Responsive Grid: Mobile: 2, SM: 2, MD: 3, LG: 4, XL: 5, 2XL: 6 */}
            <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6 justify-items-center max-w-[1600px] mx-auto w-full mt-5'>
                {modules.map((item, index) => (
                    <Card
                        key={index}
                        elevation={8}
                        className='flex items-center w-full'
                        sx={{
                            maxWidth: { xs: '100%', sm: '250px' },
                            height: { xs: '160px', sm: '180px' },
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            cursor: item.href !== '#' ? 'pointer' : 'default',
                            transition: 'transform 0.2s ease-in-out',
                            '&:hover': {
                                transform: item.href !== '#' ? 'scale(1.05)' : 'none'
                            }
                        }}
                        tabIndex={item.href !== '#' ? 0 : -1}
                        onClick={() => handleCardClick(item.href)}
                        onKeyDown={e => handleKeyDown(e, item.href)}
                        role='button'
                        aria-label={`Select ${item.title} module`}
                    >
                        <CardContent className='p-2 sm:p-4 items-center mlb-auto w-full'>
                            <div className='flex flex-col gap-2 sm:gap-4 items-center justify-center text-center'>
                                <i
                                    className={`${item.icon}`}
                                    style={{
                                        fontSize: 'clamp(32px, 10vw, 40px)',
                                        color: 'var(--mui-palette-text-secondary)'
                                    }}
                                />
                                <Typography
                                    sx={{
                                        fontSize: { xs: '14px', sm: '16px' },
                                        lineHeight: 1.2
                                    }}
                                    color='text.primary'
                                    className='font-medium'
                                >
                                    {item.title}
                                </Typography>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>


        </>
    )
}

export default MainHome
// 'use client'

// import { useRouter, useParams } from 'next/navigation'
// import Typography from '@mui/material/Typography'
// import Card from '@mui/material/Card'
// import CardContent from '@mui/material/CardContent'
// import classnames from 'classnames'

// // Style Imports
// import frontCommonStyles from '@views/front-pages/styles.module.css'
// import { getPermissionsFromLocal } from '@/redux-store/sagaHelpers'

// const modules = [
//     {
//         title: 'My DashBoard',
//         icon: 'ri-layout-grid-fill',
//         href: '/apps/dashboard',
//         acc_view: true
//     },
//     {
//         title: 'Set New Business Plans',
//         icon: 'ri-building-2-line',
//         href: '/apps/strategicObjective/strategicObjective',
//         acc_view: true
//     },
//     {
//         title: 'KPI Tracker',
//         icon: 'ri-sun-line',
//         href: '/apps/kpiTracker/dashboard',
//         acc_view: true
//     },
//     {
//         title: 'Prima Project',
//         icon: 'ri-repeat-2-line',
//         href: '/apps/project/projectDashboard',
//         acc_view: true
//     },
//     {
//         title: 'Task Tracker',
//         icon: 'ri-file-line',
//         href: '/apps/taskTracker/dashboard',
//         acc_view: true
//     },
//     {
//         title: 'Business Vitals',
//         icon: 'ri-briefcase-line',
//         href: '#',
//         acc_view: true
//     },
//     {
//         title: 'Administration',
//         icon: 'ri-settings-4-line',
//         href: '/apps/administration/units',
//         acc_view: true
//     },
//     // {
//     //     title: 'People Competency',
//     //     icon: 'ri-profile-line',
//     //     href: '#'
//     // },
//     // {
//     //     title: 'MoM Tracker',
//     //     icon: 'ri-calendar-todo-line',
//     //     href: '#'
//     // }
// ]

// const MainHome = () => {
//     const router = useRouter()
//     const params = useParams()
//     const { lang: locale } = params

//     const userModulePermission = getPermissionsFromLocal()

//     const updatedModules = modules.map(mod => {
//         const permission = userModulePermission?.find((p: any) => p.display_name === mod.title)
//         if (mod.title == "My DashBoard") {
//             return {
//                 ...mod,
//                 acc_view: true
//             }
//         } else {
//             return {
//                 ...mod,
//                 acc_view: permission ? permission.acc_view === 1 : false
//             }
//         }
//     })

//     const handleCardClick = (href: string) => {
//         if (href !== '#') {
//             router.push(`/${locale}${href}`)
//         }
//     }

//     const handleKeyDown = (e: React.KeyboardEvent, href: string) => {
//         if (e.key === 'Enter' || e.key === ' ') {
//             e.preventDefault()
//             handleCardClick(href)
//         }
//     }

//     return (

//         <>
//             <div className={classnames('flex flex-col items-center justify-center', frontCommonStyles.layoutSpacing)}>
//                 <div className='flex items-baseline flex-wrap gap-2 mbe-1 sm:mbe-1'>
//                     <Typography variant='h4' className='font-medium'>
//                         Business Modules
//                     </Typography>
//                 </div>
//             </div>

//             {/* Responsive Grid: Mobile: 2, SM: 2, MD: 3, LG: 4, XL: 5, 2XL: 6 */}
//             <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6 justify-items-center max-w-[1600px] mx-auto w-full mt-5'>
//                 {updatedModules.map((item, index) => (
//                     item.acc_view && (
//                         <Card
//                             key={index}
//                             elevation={8}
//                             className='flex items-center w-full'
//                             sx={{
//                                 maxWidth: { xs: '100%', sm: '250px' },
//                                 height: { xs: '160px', sm: '180px' },
//                                 display: 'flex',
//                                 justifyContent: 'center',
//                                 alignItems: 'center',
//                                 cursor: item.href !== '#' ? 'pointer' : 'default',
//                                 transition: 'transform 0.2s ease-in-out',
//                                 '&:hover': {
//                                     transform: item.href !== '#' ? 'scale(1.05)' : 'none'
//                                 }
//                             }}
//                             tabIndex={item.href !== '#' ? 0 : -1}
//                             onClick={() => handleCardClick(item.href)}
//                             onKeyDown={e => handleKeyDown(e, item.href)}
//                             role='button'
//                             aria-label={`Select ${item.title} module`}
//                         >
//                             <CardContent className='p-2 sm:p-4 items-center mlb-auto w-full'>
//                                 <div className='flex flex-col gap-2 sm:gap-4 items-center justify-center text-center'>
//                                     <i
//                                         className={`${item.icon}`}
//                                         style={{
//                                             fontSize: 'clamp(32px, 10vw, 40px)',
//                                             color: 'var(--mui-palette-text-secondary)'
//                                         }}
//                                     />
//                                     <Typography
//                                         sx={{
//                                             fontSize: { xs: '14px', sm: '16px' },
//                                             lineHeight: 1.2
//                                         }}
//                                         color='text.primary'
//                                         className='font-medium'
//                                     >
//                                         {item.title}
//                                     </Typography>
//                                 </div>
//                             </CardContent>
//                         </Card>
//                     )
//                 ))}
//             </div>


//         </>
//     )
// }

// export default MainHome
