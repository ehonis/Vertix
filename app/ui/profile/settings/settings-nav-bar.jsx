'use client';

import { useState, useEffect } from 'react';
import ProfileSettingsPane from './profile-settings-pane';
import clsx from 'clsx';
import Onboarding from './onboarding';
import SignOut from '@/app/ui/general/sign-out-button';
export default function SettingsNavBar({ userData }) {
  const [activeTab, setActiveTab] = useState(
    userData.isOnboarded ? 'profile-settings' : 'finish-onboarding'
  );

  useEffect(() => {
    if (userData.isOnboarded) {
      setActiveTab('profile-settings');
    }
  }, [userData.isOnboarded]);

  return (
    <div className="w-full">
      <div className="flex gap-2  items-center w-sm">
        {!userData.isOnboarded && (
          <button
            onClick={() => setActiveTab('finish-onboarding')}
            className={clsx(
              'font-barlow font-bold text-white text-sm flex gap-2 items-center',
              activeTab === 'finish-onboarding' && 'bg-black p-2 rounded-t-md'
            )}
          >
            <div className="h-2 w-2 bg-green-500 rounded-full" />
            <p>Finish Onboarding</p>
          </button>
        )}
        <button
          onClick={() => setActiveTab('profile-settings')}
          className={clsx(
            'font-barlow font-bold text-white text-sm',
            activeTab === 'profile-settings' && 'bg-black p-2 rounded-t-md'
          )}
        >
          Profile Settings
        </button>
        <div className="flex justify-end">
          <SignOut />
        </div>
      </div>
      <div className="flex flex-col gap-2 w-full">
        {activeTab === 'finish-onboarding' && (
          <Onboarding userData={userData} />
        )}
        {activeTab === 'profile-settings' && (
          <ProfileSettingsPane userData={userData} />
        )}
      </div>
    </div>
  );
}
