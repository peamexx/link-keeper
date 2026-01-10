import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/components/ui/toast'
import { getLink, updateLink, deleteLink } from '@/lib/firestore'

export default function EditScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (id) {
      loadLink()
    }
  }, [id])

  const loadLink = async () => {
    if (!id) return
    try {
      setIsLoading(true)
      const link = await getLink(id)
      if (link) {
        setTitle(link.title)
        setUrl(link.url)
      } else {
        showToast('url을 찾을 수 없습니다')
        navigate('/')
      }
    } catch (error) {
      console.error('Error loading link:', error)
      showToast('url 로드 실패')
      navigate('/')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return

    // Validation
    if (!title.trim() || !url.trim()) {
      showToast('제목과 url은 필수 입력 항목입니다')
      return
    }

    if (title.trim().length < 1 || url.trim().length < 1) {
      showToast('제목과 url은 1자 이상이어야 합니다')
      return
    }

    try {
      setIsSubmitting(true)
      await updateLink(id, title.trim(), url.trim())
      showToast('url 수정 완료')
      navigate('/')
    } catch (error) {
      console.error('Error updating link:', error)
      showToast('url 수정 실패')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!id) return
    try {
      setIsDeleting(true)
      await deleteLink(id)
      showToast('url 삭제 완료')
      navigate('/')
    } catch (error) {
      console.error('Error deleting link:', error)
      showToast('url 삭제 실패')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 bg-background border-b z-10">
        <div className="container mx-auto px-4 h-14 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">편집</h1>
        </div>
      </header>

      <div className="pt-14 pb-4">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>url 수정</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="title" className="text-sm font-medium mb-2 block">
                    Title
                  </label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="Enter link title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    minLength={1}
                  />
                </div>
                <div>
                  <label htmlFor="url" className="text-sm font-medium mb-2 block">
                    URL
                  </label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                    minLength={1}
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="submit" className="flex-1 text-white bg-blue-500" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : '수정 완료'}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="h-10 w-10"
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>삭제 확인</AlertDialogTitle>
                        <AlertDialogDescription>
                          url을 삭제하시겠습니까?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          className="bg-red-500 text-white hover:bg-destructive/90"
                        >
                          삭제
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
