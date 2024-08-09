import { SignUp } from '@clerk/nextjs'
import React from 'react'

const page = () => {
  return (
    <main className='auth-page'>
      <SignUp />
    </main>
  )
}

export default page