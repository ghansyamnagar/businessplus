'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'
import CircularProgress from '@mui/material/CircularProgress'

// Redux Imports
import { useDispatch } from 'react-redux'

// Type Imports
import type { FaqType, QuestionAnswer } from '@/types/pages/faqTypes'
import FaqHeader from './FaqHeader'
import FaqFooter from './FaqFooter'
import Faqs from './Faqs'

// Actions Imports
import { getCompanyFaqListRequest } from '@/redux-store/slices/master/master.slice'

const PrimaPluseFAQ = () => {
  // States
  const [data, setData] = useState<FaqType[]>([])
  const [searchValue, setSearchValue] = useState('')
  const [loading, setLoading] = useState(true)

  // Hooks
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getCompanyFaqListRequest({
      payload: {},
      callback: (response: any) => {
        if (response?.status === 'success' && response?.data) {
          const mappedQuestions: QuestionAnswer[] = response.data.map((item: any) => ({
            id: item.faq_id.toString(),
            question: item.question,
            answer: item.answer
          }))

          const faqData: FaqType[] = [
            {
              id: 'general',
              title: 'General',
              subtitle: 'Common questions and answers',
              icon: 'ri-question-answer-line',
              questionsAnswers: mappedQuestions
            }
          ]
          setData(faqData)
        }
        setLoading(false)
      }
    }))
  }, [dispatch])

  if (loading) {
    return <div className="flex justify-center p-10"><CircularProgress /></div>
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <FaqHeader searchValue={searchValue} setSearchValue={setSearchValue} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Faqs faqData={data} searchValue={searchValue} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <FaqFooter />
      </Grid>
    </Grid>
  )
}

export default PrimaPluseFAQ
