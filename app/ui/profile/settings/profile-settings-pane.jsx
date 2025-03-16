'use client';
import { useState } from 'react';
import { useNotification } from '@/app/contexts/NotificationContext';
import Image from 'next/image';

export default function ProfileSettingsPane({ userData }) {
  console.log(userData);
  return (
    <div className=" bg-black p-5 rounded-lg flex-col flex gap-3 font-barlow text-white">
      {userData.image && (
        <Image src={userData.image} alt="profile" width={100} height={100} />
      )}
      <p>{userData.name}</p>
      <p>{userData.username}</p>
      <p>{userData.tag}</p>
    </div>
  );
}
