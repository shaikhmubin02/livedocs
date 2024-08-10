'use client'

import { createDocument } from '@/lib/actions/room.actions';
import { Button } from './ui/button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const AddBoardBtn = ({ userId, email }: AddDocumentBtnProps) => {
  const router = useRouter();

  const addBoardHandler = async () => {
    try {
      const room = await createDocument({ 
        userId, 
        email, 
        isBoard: 'true'  
      });

      if (room) router.push(`/board/${room.id}`);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Button type="submit" onClick={addBoardHandler} className="gradient-light-gray flex gap-1 shadow-md">
      <Image 
        src="/assets/icons/add.png" alt="add" width={24} height={24}
      />
      <p className="hidden sm:block text-black">Start a white board</p>
    </Button>
  );
};

export default AddBoardBtn;
