'use client';

import { useState } from 'react';

export default function ConfirmationPopUp({
  onConfirmation,
  onCancel,
  message,
  submessage,
}) {
  return (
    <>
      <div className="fixed inset-0 bg-black opacity-50 z-30" />
      <div className="z-[100] bg-[#181a1c] text-white fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 m-5 p-5 self-center rounded outline shadow-lg outline-white">
        <p className="font-bold">{message}</p>
        <p className="text-red-500 underline">{submessage}</p>
        <div className="flex justify-between">
          <button
            onClick={onConfirmation}
            className="mt-4 rounded-lg bg-blue-500 p-2 text-white"
          >
            Confirm
          </button>
          <button
            onClick={onCancel}
            className="mt-4 rounded-lg bg-red-500 p-2 text-white"
          >
            {' '}
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
