import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const Login: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const access_token = searchParams.get('access_token')
    console.log(access_token);
    // Ensure tokens are not null before storing them
    if (access_token) {
      localStorage.setItem('access_token', access_token)
    }

    navigate('/')
  }, [searchParams, navigate])

  return <div>Login</div>
}

export default Login
