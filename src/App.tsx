import { Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import ExperiencePage from './pages/Experience/ExperiencePage'
import MenuPage from './pages/Menu/MenuPage'
import FeedbackPage from './pages/Feedback/FeedbackPage'
import LeaderboardPage from './pages/Leaderboard/LeaderboardPage'
import ARPreviewPage from './pages/ARPreview/ARPreviewPage'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<ExperiencePage />} />
        <Route path="menu" element={<MenuPage />} />
        <Route path="feedback" element={<FeedbackPage />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />
        <Route path="ar-preview" element={<ARPreviewPage />} />
      </Route>
    </Routes>
  )
}

export default App
