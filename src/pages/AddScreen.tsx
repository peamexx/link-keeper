import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'
import { addLink } from '@/lib/firestore'

export default function AddScreen() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const isButtonEnabled = title.trim().length >= 1 && url.trim().length >= 1

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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
      await addLink(title.trim(), url.trim())
      showToast('url 추가 완료')
      navigate('/')
    } catch (error) {
      console.error('Error adding link:', error)
      showToast('url 추가 실패')
    } finally {
      setIsSubmitting(false)
    }
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
          <h1 className="text-lg font-semibold">등록</h1>
        </div>
      </header>

      <div className="pt-14 pb-4">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>추가할 링크</CardTitle>
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
                <Button
                  type="submit"
                  className={`w-full ${
                    isButtonEnabled && !isSubmitting
                      ? 'text-white bg-blue-500 hover:bg-blue-600'
                      : ''
                  }`}
                  disabled={!isButtonEnabled || isSubmitting}
                >
                  {isSubmitting ? '추가 중...' : 'URL 추가하기'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
