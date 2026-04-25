import { useState } from 'react'

export default function useAuth() {
  const [user, setUser] = useState(null)

  const login = (data) => {
    localStorage.setItem('token', data.token)
    setUser(data.user)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return { user, login, logout }
}
