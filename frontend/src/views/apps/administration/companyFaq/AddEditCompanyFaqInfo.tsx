// React Imports
import { useEffect, useState } from 'react'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, string, nonEmpty, pipe, minLength } from 'valibot'
import type { SubmitHandler } from 'react-hook-form'
import type { InferInput } from 'valibot'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import Divider from '@mui/material/Divider'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import classnames from 'classnames'
import { useEditor, EditorContent } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { Underline } from '@tiptap/extension-underline'
import { Placeholder } from '@tiptap/extension-placeholder'
import { TextAlign } from '@tiptap/extension-text-align'
import '@/libs/styles/tiptapEditor.css'
import type { Editor } from '@tiptap/core'
// MUI Imports
// Components Imports
import CustomIconButton from '@core/components/mui/IconButton'
import Grid from '@mui/material/Grid2'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import FormHelperText from '@mui/material/FormHelperText'
// Slice Imports
import { addCompanyFaqRequest, updateCompanyFaqRequest } from '@/redux-store/slices/master/master.slice'
// Types Imports
import type { CompanyFaqType } from '@/types/apps/companyFaqTypes'

type AddEditCompanyFaqInfoProps = {
    open: boolean
    handleClose: (refresh: boolean) => void
    data?: CompanyFaqType
}

const EditorToolbar = ({ editor }: { editor: Editor | null }) => {
    if (!editor) {
        return null
    }

    return (
        <div className='flex flex-wrap gap-x-3 gap-y-1 pbs-5 pbe-4 pli-5'>
            <CustomIconButton
                {...(editor.isActive('bold') && { color: 'primary' })}
                variant='outlined'
                size='small'
                onClick={() => editor.chain().focus().toggleBold().run()}
            >
                <i className={classnames('ri-bold', { 'text-textSecondary': !editor.isActive('bold') })} />
            </CustomIconButton>
            <CustomIconButton
                {...(editor.isActive('underline') && { color: 'primary' })}
                variant='outlined'
                size='small'
                onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
                <i className={classnames('ri-underline', { 'text-textSecondary': !editor.isActive('underline') })} />
            </CustomIconButton>
            <CustomIconButton
                {...(editor.isActive('italic') && { color: 'primary' })}
                variant='outlined'
                size='small'
                onClick={() => editor.chain().focus().toggleItalic().run()}
            >
                <i className={classnames('ri-italic', { 'text-textSecondary': !editor.isActive('italic') })} />
            </CustomIconButton>
            <CustomIconButton
                {...(editor.isActive('strike') && { color: 'primary' })}
                variant='outlined'
                size='small'
                onClick={() => editor.chain().focus().toggleStrike().run()}
            >
                <i className={classnames('ri-strikethrough', { 'text-textSecondary': !editor.isActive('strike') })} />
            </CustomIconButton>
            <CustomIconButton
                {...(editor.isActive({ textAlign: 'left' }) && { color: 'primary' })}
                variant='outlined'
                size='small'
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
            >
                <i className={classnames('ri-align-left', { 'text-textSecondary': !editor.isActive({ textAlign: 'left' }) })} />
            </CustomIconButton>
            <CustomIconButton
                {...(editor.isActive({ textAlign: 'center' }) && { color: 'primary' })}
                variant='outlined'
                size='small'
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
            >
                <i
                    className={classnames('ri-align-center', {
                        'text-textSecondary': !editor.isActive({ textAlign: 'center' })
                    })}
                />
            </CustomIconButton>
            <CustomIconButton
                {...(editor.isActive({ textAlign: 'right' }) && { color: 'primary' })}
                variant='outlined'
                size='small'
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
            >
                <i
                    className={classnames('ri-align-right', {
                        'text-textSecondary': !editor.isActive({ textAlign: 'right' })
                    })}
                />
            </CustomIconButton>
            <CustomIconButton
                {...(editor.isActive({ textAlign: 'justify' }) && { color: 'primary' })}
                variant='outlined'
                size='small'
                onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            >
                <i
                    className={classnames('ri-align-justify', {
                        'text-textSecondary': !editor.isActive({ textAlign: 'justify' })
                    })}
                />
            </CustomIconButton>
        </div>
    )
}

const schema = object({
    question: pipe(string(), nonEmpty('Question is required'), minLength(1, 'Question is required')),
    answer: pipe(string(), nonEmpty('Answer is required'), minLength(1, 'Answer is required'))
})

type FormData = InferInput<typeof schema>

const AddEditCompanyFaqInfo = ({ open, handleClose, data }: AddEditCompanyFaqInfoProps) => {
    const dispatch = useDispatch()

    const {
        control,
        reset,
        handleSubmit,
        setValue,
        formState: { errors }
    } = useForm<FormData>({
        resolver: valibotResolver(schema),
        defaultValues: {
            question: '',
            answer: ''
        }
    })

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                paragraph: { HTMLAttributes: { class: 'faq-paragraph' } }
            }),
            Placeholder.configure({
                placeholder: 'Write answer here...'
            }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Underline
        ],
        immediatelyRender: false,
        autofocus: 'end', // ✅ auto focus cursor
        content: '<p></p>', // ✅ default paragraph
        onUpdate: ({ editor }) => {
            setValue('answer', editor.getHTML(), { shouldValidate: true })
        }
    })

    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!open) return

        reset({
            question: data?.question || '',
            answer: data?.answer || ''
        })

        if (editor) {
            editor.commands.setContent(data?.answer || '')
        }
    }, [open, data, editor, reset])

    const handleDialogClose = (refresh: boolean) => {
        handleClose(refresh)
        reset({
            question: '',
            answer: ''
        })
        editor?.commands.setContent('')
    }

    const onSubmit: SubmitHandler<FormData> = (formData) => {
        setLoading(true)

        if (data?.faq_id) {
            // Edit mode
            dispatch(updateCompanyFaqRequest({
                payload: {
                    ...formData,
                    faq_id: data.faq_id
                },
                callback: (response: any, error: any) => {
                    if (response && response.status === 'success') {
                        toast.success(response.message || 'FAQ updated successfully')
                        handleDialogClose(true)
                    } else {
                        toast.error(response?.message || 'Error updating FAQ')
                    }
                    setLoading(false)
                }
            }))
        } else {
            // Add mode
            dispatch(addCompanyFaqRequest({
                payload: {
                    ...formData
                },
                callback: (response: any, error: any) => {
                    if (response && response.status === 'success') {
                        toast.success(response.message || 'FAQ added successfully')
                        handleDialogClose(true)
                    } else {
                        toast.error(response?.message || 'Error adding FAQ')
                    }
                    setLoading(false)
                }
            }))
        }
    }

    return (
        <Dialog
            fullWidth
            open={open}
            onClose={() => handleDialogClose(false)}
            maxWidth={false}
            scroll='body'
            PaperProps={{ className: 'max-is-[600px]' }}
        >
            <DialogTitle variant='h5' className='flex gap-2 flex-col items-center sm:pbs-8 sm:pbe-6 sm:pli-8'>
                <div className='max-sm:is-[80%] max-sm:text-center'>{data ? 'Edit' : 'Add'} Company Faq</div>
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent className='overflow-visible pbs-0 sm:pbe-6 sm:pli-8'>
                    <IconButton onClick={() => handleDialogClose(false)} className='absolute block-start-4 inline-end-4'>
                        <i className='ri-close-line text-textSecondary' />
                    </IconButton>
                    <Grid container spacing={5}>
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name='question'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label='Question'
                                        placeholder='Enter Question'
                                        error={!!errors.question}
                                        helperText={errors.question?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Typography className='mbe-1' color={errors.answer ? 'error' : 'text.primary'}>
                                Answer
                            </Typography>
                            <CardContent
                                className='p-0 border rounded'
                                sx={{
                                    ...(errors.answer && {
                                        borderColor: 'error.main'
                                    })
                                }}
                            >
                                <EditorToolbar editor={editor} />
                                <Divider className='mli-5' />
                                <EditorContent
                                    editor={editor}
                                    className='bs-[135px] overflow-y-auto cursor-text'
                                    onClick={() => editor?.chain().focus().run()}
                                />
                            </CardContent>
                            {errors.answer && <FormHelperText error>{errors.answer.message}</FormHelperText>}
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions className='justify-between pbs-0 sm:pbe-8 sm:pli-8'>
                    <Button variant='contained' type='submit' disabled={loading} className='min-is-[120px]'>
                        {loading ? <CircularProgress size={22} color='inherit' /> : data ? 'Update' : 'Submit'}
                    </Button>
                    <Button variant='outlined' color='secondary' type='reset' onClick={() => handleDialogClose(false)}>
                        Cancel
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

export default AddEditCompanyFaqInfo
