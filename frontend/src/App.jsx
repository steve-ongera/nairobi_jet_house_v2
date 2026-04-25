import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/normal/HomePage'
import LoginPage from './pages/normal/LoginPage'
import NotFoundPage from './pages/normal/NotFoundPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='*' element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
