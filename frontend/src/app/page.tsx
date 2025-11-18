import { useState } from "react"
import LoginPage from "@/components/auth/login-page"
import WorkbenchLayout from "@/components/workbench/workbench-layout"

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleLogin = (email: string, password: string) => {
    // Mock authentication
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />
  }

  return <WorkbenchLayout onLogout={handleLogout} />
}
