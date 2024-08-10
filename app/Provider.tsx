'use client' 

import Loader from "@/components/Loader";
import { getClerkUsers } from "@/lib/actions/users.actions";
import {
    LiveblocksProvider,
    RoomProvider,
    ClientSideSuspense,
  } from "@liveblocks/react/suspense";
import React from "react";

const Provider = ({children} : {children: React.ReactNode}) => {
  return (
    <LiveblocksProvider 
      authEndpoint="/api/liveblocks-auth"
      resolveUsers={async ({userIds}) => {
        const users = await getClerkUsers({userIds}); 
        
        return users
      }}
    >
      <ClientSideSuspense fallback={<Loader />}>
        {children}
      </ClientSideSuspense>
    </ LiveblocksProvider>
  )
}

export default Provider