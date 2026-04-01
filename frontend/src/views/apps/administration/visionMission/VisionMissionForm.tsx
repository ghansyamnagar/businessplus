'use client'

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
// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import FormHelperText from '@mui/material/FormHelperText'

// Third-party Imports
import classnames from 'classnames'
import { useEditor, EditorContent } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { Underline } from '@tiptap/extension-underline'
import { Placeholder } from '@tiptap/extension-placeholder'
import { TextAlign } from '@tiptap/extension-text-align'
import type { Editor } from '@tiptap/core'
import Box from "@mui/material/Box";
// Components Imports
import CustomIconButton from '@core/components/mui/IconButton'

// Slice Imports
import { getVisionMissionRequest, updateVisionMissionRequest } from '@/redux-store/slices/master/master.slice'

// Types Imports
import type { VisionMissionType } from '@/types/apps/visionMissionTypes'



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

const RichTextEditor = ({ value, onChange, placeholder, error }: { value: string, onChange: (val: string) => void, placeholder?: string, error?: boolean }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: placeholder || 'Write something here...'
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph']
            }),
            Underline
        ],
        immediatelyRender: false,
        content: value,
        onUpdate: ({ editor }) => {
            if (editor.isEmpty || editor.getText().trim().length === 0) {
                onChange('')
            } else {
                onChange(editor.getHTML())
            }
        }
    })



    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value)
        }
    }, [value, editor])

    return (
        <CardContent
            className='p-0 border rounded'
            sx={{
                ...(error && {
                    borderColor: 'error.main'
                })
            }}
        >
            <EditorToolbar editor={editor} />
            <Divider className='mli-5' />
            <EditorContent editor={editor} className='bs-[135px] overflow-y-auto flex' />
        </CardContent>
    )
}

const schema = object({
    vision: pipe(string(), nonEmpty('Vision is required'), minLength(1, 'Vision is required')),
    mission: pipe(string(), nonEmpty('Mission is required'), minLength(1, 'Mission is required')),
    values: pipe(string(), nonEmpty('Values is required'), minLength(1, 'Values is required')),
    message_of_ceo: pipe(string(), nonEmpty('Message of CEO is required'), minLength(1, 'Message of CEO is required')),
    highlights: pipe(string(), nonEmpty('Highlights is required'), minLength(1, 'Highlights is required'))
})

type FormData = InferInput<typeof schema>

const VisionMissionForm = ({ onSuccess, initialData
}: {
    onSuccess?: () => void
    initialData?: VisionMissionType | null
}) => {
    const dispatch = useDispatch()
    const [data, setData] = useState<VisionMissionType | null>(null)
    const [loading, setLoading] = useState(false)
    // const [fetching, setFetching] = useState(true)

    const {
        control,
        reset,
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm<FormData>({
        resolver: valibotResolver(schema),
        defaultValues: {
            vision: '',
            mission: '',
            values: '',
            message_of_ceo: '',
            highlights: ''
        }
    })


    const visionEditor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Enter Vision'
            }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Underline
        ],
        immediatelyRender: false,
        content: '<p></p>',
        onUpdate: ({ editor }) => {
            const text = editor.getText().trim()
            const html = editor.getHTML()

            setValue('vision', text ? html : '', { shouldValidate: true }) // 🔥 important
        }
    })
    const missionEditor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({ placeholder: 'Enter Mission' }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Underline
        ],
        immediatelyRender: false,
        content: '<p></p>',
        onUpdate: ({ editor }) => {
            const text = editor.getText().trim()
            const html = editor.getHTML()

            setValue('mission', text ? html : '', { shouldValidate: true })
        }
    })
    const valuesEditor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({ placeholder: 'Enter Values' }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Underline
        ],
        immediatelyRender: false,
        content: '<p></p>',
        onUpdate: ({ editor }) => {
            const text = editor.getText().trim()
            const html = editor.getHTML()

            setValue('values', text ? html : '', { shouldValidate: true })
        }
    })

    const ceoEditor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({ placeholder: 'Enter Message of CEO' }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Underline
        ],
        immediatelyRender: false,
        content: '<p></p>',
        onUpdate: ({ editor }) => {
            const text = editor.getText().trim()
            const html = editor.getHTML()

            setValue('message_of_ceo', text ? html : '', { shouldValidate: true })
        }
    })

    const highlightsEditor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({ placeholder: 'Enter Highlights' }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Underline
        ],
        immediatelyRender: false,
        content: '<p></p>',
        onUpdate: ({ editor }) => {
            const text = editor.getText().trim()
            const html = editor.getHTML()

            setValue('highlights', text ? html : '', { shouldValidate: true })
        }
    })


    useEffect(() => {
        if (initialData) {
            visionEditor?.commands.setContent(initialData.vision || '')
            missionEditor?.commands.setContent(initialData.mission || '')
            valuesEditor?.commands.setContent(initialData.values || '')
            ceoEditor?.commands.setContent(initialData.message_of_ceo || '')
            highlightsEditor?.commands.setContent(initialData.highlights || '')
        }
    }, [initialData, visionEditor, missionEditor, valuesEditor, ceoEditor, highlightsEditor])

    // useEffect(() => {
    //     fetchData()
    // }, [])
    useEffect(() => {
        if (initialData) {
            setData(initialData)

            reset({
                vision: initialData.vision || '',
                mission: initialData.mission || '',
                values: initialData.values || '',
                message_of_ceo: initialData.message_of_ceo || '',
                highlights: initialData.highlights || ''
            })
        }
    }, [initialData, reset])

    const fetchData = () => {
        // setFetching(true)
        dispatch(getVisionMissionRequest({
            payload: {},
            callback: (response: any, error: any) => {
                if (response && response.status === 'success' && response.data) {
                    setData(response.data)
                    reset({
                        vision: response.data.vision || '',
                        mission: response.data.mission || '',
                        values: response.data.values || '',
                        message_of_ceo: response.data.message_of_ceo || '',
                        highlights: response.data.highlights || ''
                    })
                }
                // setFetching(false)
            }
        }))
    }

    const onSubmit: SubmitHandler<FormData> = (formData) => {
        setLoading(true)
        dispatch(updateVisionMissionRequest({
            payload: {
                ...formData,
                id: data?.id || 0 // Should have ID if editing
            },
            callback: (response: any, error: any) => {
                if (response && response.status === 'success') {
                    toast.success(response.message || 'Updated successfully')
                    fetchData()
                    if (onSuccess) onSuccess()
                } else {
                    toast.error(response?.message || 'Error updating')
                }
                setLoading(false)
            }
        }))
    }

    // if (fetching) {
    //     return <div className="flex justify-center p-10"><CircularProgress /></div>
    // }

    return (
        <Card>
            <CardHeader title='Vision / Mission' />
            <Divider />
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className='max-bs-[70vh] overflow-y-auto'>
                    <Grid container spacing={5}>
                        <Grid size={{ xs: 12 }}>
                            {/* <Typography className='mbe-1' color={errors.vision ? 'error' : 'text.primary'}>Vision</Typography>
                            <Controller
                                name='vision'
                                control={control}
                                render={({ field }) => (
                                    <RichTextEditor
                                        value={field.value || ''}
                                        onChange={field.onChange}
                                        placeholder="Enter Vision"
                                        error={!!errors.vision}
                                    />
                                )}
                            />
                            {errors.vision && <FormHelperText error>{errors.vision.message}</FormHelperText>} */}
                            <Typography color={errors.vision ? 'error' : 'text.primary'}>
                                Vision
                            </Typography>

                            <CardContent
                                className='p-0 border rounded'
                                sx={{
                                    ...(errors.vision && {
                                        borderColor: 'error.main'
                                    })
                                }}
                            >
                                <EditorToolbar editor={visionEditor} />
                                <Divider className='mli-5' />

                                <EditorContent
                                    editor={visionEditor}
                                    className='bs-[135px] overflow-y-auto cursor-text'
                                    onClick={() => visionEditor?.chain().focus().run()}
                                />
                            </CardContent>

                            {errors.vision && (
                                <FormHelperText error>{errors.vision.message}</FormHelperText>
                            )}
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Typography className='mbe-1' color={errors.mission ? 'error' : 'text.primary'}>Mission</Typography>
                            <CardContent
                                className='p-0 border rounded'
                                sx={{
                                    ...(errors.mission && {
                                        borderColor: 'error.main'
                                    })
                                }}
                            >
                                <EditorToolbar editor={missionEditor} />
                                <Divider className='mli-5' />

                                <EditorContent
                                    editor={missionEditor}
                                    className='bs-[135px] overflow-y-auto cursor-text'
                                    onClick={() => missionEditor?.chain().focus().run()}
                                />
                            </CardContent>
                            {errors.mission && <FormHelperText error>{errors.mission.message}</FormHelperText>}
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Typography className='mbe-1' color={errors.values ? 'error' : 'text.primary'}>Values</Typography>
                            <CardContent className='p-0 border rounded'
                                sx={{ ...(errors.values && { borderColor: 'error.main' }) }}>

                                <EditorToolbar editor={valuesEditor} />
                                <Divider className='mli-5' />

                                <EditorContent
                                    editor={valuesEditor}
                                    className='bs-[135px] overflow-y-auto cursor-text'
                                    onClick={() => valuesEditor?.chain().focus().run()}
                                />
                            </CardContent>

                            {errors.values && <FormHelperText error>{errors.values.message}</FormHelperText>}
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Typography className='mbe-1' color={errors.message_of_ceo ? 'error' : 'text.primary'}>Message of CEO</Typography>
                            <CardContent className='p-0 border rounded'
                                sx={{ ...(errors.message_of_ceo && { borderColor: 'error.main' }) }}>

                                <EditorToolbar editor={ceoEditor} />
                                <Divider className='mli-5' />

                                <EditorContent
                                    editor={ceoEditor}
                                    className='bs-[135px] overflow-y-auto cursor-text'
                                    onClick={() => ceoEditor?.chain().focus().run()}
                                />
                            </CardContent>

                            {errors.message_of_ceo && <FormHelperText error>{errors.message_of_ceo.message}</FormHelperText>}
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Typography className='mbe-1' color={errors.highlights ? 'error' : 'text.primary'}>Highlights</Typography>
                            <CardContent className='p-0 border rounded'
                                sx={{ ...(errors.highlights && { borderColor: 'error.main' }) }}>

                                <EditorToolbar editor={highlightsEditor} />
                                <Divider className='mli-5' />

                                <EditorContent
                                    editor={highlightsEditor}
                                    className='bs-[135px] overflow-y-auto cursor-text'
                                    onClick={() => highlightsEditor?.chain().focus().run()}
                                />
                            </CardContent>

                            {errors.highlights && <FormHelperText error>{errors.highlights.message}</FormHelperText>}
                        </Grid>
                        <Grid size={{ xs: 12 }} className='flex gap-4'>
                            <Button variant='contained' type='submit' disabled={loading} className='min-is-[120px]'>
                                {loading ? <CircularProgress size={24} color='inherit' /> : 'Save Changes'}
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </form>
        </Card>
    )
}

export default VisionMissionForm
