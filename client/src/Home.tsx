import React from 'react'
import { Link } from 'react-router-dom'

// Function to construct the Google OAuth URL
const getOauthGoogleUrl = (): string => {
  const { VITE_GOOGLE_CLIENT_ID, VITE_GOOGLE_AUTHORIZED_REDIRECT_URI } = import.meta.env
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth'

  const options = {
    redirect_uri: VITE_GOOGLE_AUTHORIZED_REDIRECT_URI as string,
    client_id: VITE_GOOGLE_CLIENT_ID as string,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ].join(' ')
  }

  const qs = new URLSearchParams(options)
  return `${rootUrl}?${qs.toString()}`
}

// Home component
const Home: React.FC = () => {
  const isAuthenticated = Boolean(localStorage.getItem('access_token'))
  const oauthURL = getOauthGoogleUrl()

  // Logout function to clear localStorage tokens
  const logout = () => {
    localStorage.removeItem('access_token')
    window.location.reload()
  }

  return (
    <>
      <h1>OAuth Google</h1>
      <div>
        {isAuthenticated ? (
          <div>
            <p>Xin chào, bạn đã login thành công</p>
            <button onClick={logout}>Click để logout</button>
          </div>
        ) : (
          <Link to={oauthURL}>Login with Google</Link>
        )}
      </div>
    </>
  )
}

export default Home
