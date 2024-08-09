import { SignIn } from '@clerk/nextjs'
import React from 'react'

const page = () => {
  return (
    <main className='auth-page'>
      <SignIn />
    </main>
  )
}

export default page