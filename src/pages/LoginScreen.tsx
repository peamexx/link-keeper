import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/toast'

export default function LoginScreen() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { showToast } = useToast()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const isButtonEnabled = !isLoading && username.trim().length >= 1 && password.length >= 6

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!username.trim()) {
      alert('아이디를 입력해주세요')
      return
    }

    if (!password || password.length < 6) {
      alert('비밀번호는 6자 이상이어야 합니다')
      return
    }

    try {
      setIsLoading(true);
      const isNewUser = await login(username.trim(), password)
      showToast(isNewUser ? '회원가입 및 로그인 성공' : '로그인 성공')
      navigate('/')
    } catch (error: any) {
      let errorMessage = '로그인에 실패했습니다'
      if (error.code === 'auth/weak-password') {
        errorMessage = '비밀번호는 6자 이상이어야 합니다'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = '유효하지 않은 이메일입니다'
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = '비밀번호가 올바르지 않습니다'
      } else if (error.code === 'auth/user-not-found') {
        // This shouldn't happen as we create user if not found
        errorMessage = '사용자를 찾을 수 없습니다'
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = '로그인 실패'
      }
      showToast(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">LinkKeeper 로그인</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="text-sm font-medium mb-2 block">
                아이디
              </label>
              <Input
                id="username"
                type="text"
                placeholder="아이디를 입력하세요"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-medium mb-2 block">
                비밀번호
              </label>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호를 입력하세요 (6자 이상)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="current-password"
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              className={`w-full ${
                isButtonEnabled
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 text-white bg-blue-500 hover:bg-blue-600 opacity-100'
                  : 'opacity-50'
              }`}
              disabled={!isButtonEnabled}
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </Button>
          </form>
          <p className='text-sm text-gray-500 text-center font-medium mt-2 block'>아이디는 관리자에게 문의</p>
        </CardContent>
      </Card>
    </div>
  )
}
