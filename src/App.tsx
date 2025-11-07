import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { ScrollToTop } from './components/ScrollToTop'
import { HomePage } from './pages/HomePage'
import { CampaignsList } from './pages/CampaignsList'
import { CampaignCreation } from './pages/CampaignCreation'
import { FundraisingForm } from './pages/FundraisingForm'
import { BloodDonationForm } from './pages/BloodDonationForm'
import { CampaignDetails } from './pages/CampaignDetails'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Dashboard } from './pages/Dashboard'
import { EditCampaign } from './pages/EditCampaign'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { NotFound } from './pages/NotFound'
import styles from './App.module.css'

function AppContent() {
  return (
    <div className={styles.app}>
      <Header />
      <main className={styles.main}>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/campaigns" element={<CampaignsList />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            } />
            <Route path="/create" element={
              <ProtectedRoute>
                <CampaignCreation />
              </ProtectedRoute>
            } />
            <Route path="/create/fundraising" element={
              <ProtectedRoute>
                <FundraisingForm />
              </ProtectedRoute>
            } />
            <Route path="/create/blood-donation" element={
              <ProtectedRoute>
                <BloodDonationForm />
              </ProtectedRoute>
            } />
            <Route path="/campaign/:id/edit" element={
              <ProtectedRoute>
                <EditCampaign />
              </ProtectedRoute>
            } />
            <Route path="/campaign/:id" element={<CampaignDetails />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App