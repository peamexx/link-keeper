import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Copy, ExternalLink, LogOut } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'
import { useAuth } from '@/contexts/AuthContext'
import { getLinks, updateLinksOrder } from '@/lib/firestore'
import type { LinkItem } from '../types'

function LinkItemCard({
  item,
  isReorderMode,
  onCopy,
  onOpen,
  onTap,
  onLongPress,
}: {
  item: LinkItem
  isReorderMode: boolean
  onCopy: () => void
  onOpen: () => void
  onTap: () => void
  onLongPress: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: !isReorderMode })

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleTouchStart = () => {
    if (isReorderMode) return
    longPressTimer.current = setTimeout(() => {
      onLongPress()
    }, 500)
  }

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  const handleMouseDown = () => {
    if (isReorderMode) return
    longPressTimer.current = setTimeout(() => {
      onLongPress()
    }, 500)
  }

  const handleMouseUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...(isReorderMode ? { ...attributes, ...listeners } : {})}
      className={`mt-3 p-4 cursor-pointer touch-manipulation ${
        isReorderMode ? 'cursor-grab active:cursor-grabbing' : ''
      }`}
      onClick={!isReorderMode ? onTap : undefined}
      onTouchStart={!isReorderMode ? handleTouchStart : undefined}
      onTouchEnd={!isReorderMode ? handleTouchEnd : undefined}
      onMouseDown={!isReorderMode ? handleMouseDown : undefined}
      onMouseUp={!isReorderMode ? handleMouseUp : undefined}
      onMouseLeave={!isReorderMode ? handleMouseUp : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base truncate">{item.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {item.url}
          </p>
        </div>
        {!isReorderMode && (
          <div className="flex gap-2 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              onClick={(e) => {
                e.stopPropagation()
                onCopy()
              }}
            >
              <Copy className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              onClick={(e) => {
                e.stopPropagation()
                onOpen()
              }}
            >
              <ExternalLink className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}

export default function MainScreen() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { logout } = useAuth()
  const [links, setLinks] = useState<LinkItem[]>([])
  const [isReorderMode, setIsReorderMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    loadLinks()
  }, [])

  const loadLinks = async () => {
    try {
      setIsLoading(true)
      const data = await getLinks()
      setLinks(data)
    } catch (error) {
      console.error('Error loading links:', error)
      showToast('url 로드 실패')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      showToast('url 복사 완료')
    } catch (error) {
      console.error('Failed to copy:', error)
      showToast('url 복사 실패')
    }
  }

  const handleOpen = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleLongPress = () => {
    setIsReorderMode(true)
  }

  const handleDragEnd = (event: { active: { id: string | number }; over: { id: string | number } | null }) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setLinks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        const newItems = arrayMove(items, oldIndex, newIndex)
        // Update order values
        return newItems.map((item, index) => ({
          ...item,
          order: index,
        }))
      })
    }
  }

  const handleSaveOrder = async () => {
    try {
      await updateLinksOrder(links)
      showToast('순서 저장 완료')
      setIsReorderMode(false)
    } catch (error) {
      console.error('Error saving order:', error)
      showToast('순서 저장 실패')
    }
  }

  const handleCancelReorder = () => {
    setIsReorderMode(false)
    loadLinks() // Reload to reset order
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      // Error is handled in logout function
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">로딩중...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-background border-b z-10">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          {isReorderMode ? (
            <>
              <Button variant="ghost" onClick={handleCancelReorder}>
                닫기
              </Button>
              <h1 className="text-lg font-semibold">순서 바꾸기</h1>
              <Button onClick={handleSaveOrder}>저장</Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-semibold flex-1 text-center">LinkKeeper</h1>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                onClick={() => navigate('/add')}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>
      </header>

      {/* List Area */}
      <div className="pt-14 pb-4">
        <div className="container mx-auto px-4">
          {links.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">url이 없습니다. 추가해주세요!</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={links.map((l) => l.id)}
                strategy={verticalListSortingStrategy}
              >
                {links.map((item) => (
                  <LinkItemCard
                    key={item.id}
                    item={item}
                    isReorderMode={isReorderMode}
                    onCopy={() => handleCopy(item.url)}
                    onOpen={() => handleOpen(item.url)}
                    onTap={() => navigate(`/edit/${item.id}`)}
                    onLongPress={handleLongPress}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </div>
  )
}
