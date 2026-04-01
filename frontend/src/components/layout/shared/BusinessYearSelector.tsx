// 'use client'

// // React Imports
// import { useState, useEffect } from 'react'

// // Third-party Imports
// import { useSession } from 'next-auth/react'
// import { FormControl, InputLabel, Select, MenuItem } from '@mui/material'
// import type { SelectChangeEvent } from '@mui/material/Select'

// const BusinessYearSelector = () => {
//     // Hooks
//     const currentYear = new Date().getFullYear()
//     const { data: session, update } = useSession()

//     // Extract unit name safely
//     const user = session?.user as any

//     const [year, setYear] = useState<string>(String(currentYear))

//     useEffect(() => {
//         if (user?.userSelectedYear) {
//             setYear(String(user.userSelectedYear))
//         }
//     }, [user?.userSelectedYear])

//     const handleChange = async (event: SelectChangeEvent) => {
//         const selectedYear = event.target.value as string
//         setYear(selectedYear)
//         await update({ userSelectedYear: Number(selectedYear) })
//     }

//     // Generate Financial Years
//     const years = [
//         '2022',
//         '2023',
//         '2024',
//         '2025',
//         '2026',
//         '2027',
//         '2028',
//         '2029',
//         '2030'
//     ]

//     return (
//         <FormControl size='small' className='min-w-[170px]'>
//             <InputLabel id='business-year-select-label'>Select Business Year</InputLabel>
//             <Select
//                 labelId='business-year-select-label'
//                 id='business-year-select'
//                 value={year}
//                 label='Select Business Year'
//                 onChange={handleChange}
//             >
//                 {years.map(item => (
//                     <MenuItem key={item} value={item}>
//                         {item}
//                     </MenuItem>
//                 ))}
//             </Select>
//         </FormControl>
//     )
// }

// export default BusinessYearSelector



'use client'

// React Imports
import { useState, useEffect } from 'react'

// Third-party Imports
import { useSession } from 'next-auth/react'
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import type { SelectChangeEvent } from '@mui/material/Select'
import { getCompanyDetailsFromLocal } from '@/redux-store/sagaHelpers'

const BusinessYearSelector = () => {
    // Hooks
    const currentYear = new Date().getFullYear()
    const { data: session, update } = useSession()

    // Extract unit name safely
    const user = session?.user as any

    const [year, setYear] = useState<string>(String(currentYear))
    const [showCompanyYearList, setShowCompanyYearList] = useState<any[]>([])

    useEffect(() => {
        if (user?.userSelectedYear) {
            setYear(String(user.userSelectedYear))
        }
    }, [user?.userSelectedYear])

    useEffect(() => {
        const allDetailsCompany = getCompanyDetailsFromLocal()
        if (allDetailsCompany) {
            try {
                const companyFinancialYear = allDetailsCompany?.general_data?.[0]?.financial_year
                const companyCreateData = allDetailsCompany?.general_data?.[0]?.company_created_date

                const currentYear = new Date().getFullYear()
                let companyDataCreateYear = companyCreateData ? new Date(companyCreateData).getFullYear() : currentYear

                const yearList: any[] = []
                // Loop from company creation year to currentYear + 10 as per angular logic
                for (let a = companyDataCreateYear; a <= currentYear + 10; a++) {
                    if (companyFinancialYear === "april-march") {
                        yearList.push({ "year_key": a, "year_value": `${a}-${(a + 1).toString().substr(2, 2)}` })
                    } else {
                        yearList.push({ "year_key": a, "year_value": String(a) })
                    }
                }
                setShowCompanyYearList(yearList)
            } catch (error) {
                console.error("Error processing company details", error)
            }
        }
    }, [])

    const handleChange = async (event: SelectChangeEvent) => {
        const selectedYear = event.target.value as string

        console.log('hhhhhhhhhhhhhhhhhh', selectedYear)
        setYear(selectedYear)
        await update({ userSelectedYear: Number(selectedYear) })
    }

    return (
        <FormControl size='small' className='min-w-[170px]'>
            <InputLabel id='business-year-select-label'>Select Business Year</InputLabel>
            <Select
                labelId='business-year-select-label'
                id='business-year-select'
                value={year}
                label='Select Business Year'
                onChange={handleChange}
                MenuProps={{
                    PaperProps: {
                        className: 'max-h-[300px]'
                    },
                }}
            >
                {showCompanyYearList.length > 0 ? (
                    showCompanyYearList.map(item => (
                        <MenuItem key={item.year_key} value={String(item.year_key)}>
                            {item.year_value}
                        </MenuItem>
                    ))
                ) : (
                    <MenuItem value={year}>{year}</MenuItem>
                )}
            </Select>
        </FormControl>
    )
}

export default BusinessYearSelector
