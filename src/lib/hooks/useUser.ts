import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

type UserData = {
  id: string
  email: string
  credits: number
  is_paid: boolean
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // 1. Auth 유저 가져오기
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        // 2. DB 데이터 가져오기 (이게 없으면 생성 시도)
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (data) setUserData(data)
      }
      setLoading(false)
    }

    getUser()

    // 3. 실시간 상태 변경 감지 (로그아웃 등)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      getUser()
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, userData, loading, supabase }
}