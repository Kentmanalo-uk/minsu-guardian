import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import { authApi } from './api'

export function useAuth() {
  const [currentUser, setCurrentUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)

      if (user) {
        // Fetch user role from the Auth service
        try {
          const profile = await authApi.me()
          setUserRole(profile.role)
        } catch (error) {
          console.error('Error fetching user role:', error)
          setUserRole('officer')
        }
      } else {
        setUserRole(null)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  return { currentUser, userRole, loading }
}
