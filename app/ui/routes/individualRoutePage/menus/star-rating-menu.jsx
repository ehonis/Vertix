'use client';

import { use, useState } from 'react';
import clsx from 'clsx';
import ConfirmationPopUp from '@/app/ui/edit/new_route/confirmation-pop-up';
import { useNotification } from '@/app/contexts/NotificationContext';

export default function StarRatingMenu({ route, userId, onCancel, rating }) {
  const { showNotification } = useNotification();
  const [selectedRating, setSelectedRating] = useState(
    rating?.stars ? rating.stars : 0
  );
  const [isPopUp, setIsPopUp] = useState(false);
  const [submessage, Setsubmessage] = useState('');
  const [message, SetMessage] = useState('');
  const [comment, SetComment] = useState(rating?.comment ? rating.comment : '');
  const handleStarClick = (rating) => {
    setSelectedRating(rating);
  };
  const handleConfirmation = () => {
    if (selectedRating === 0) {
      SetMessage('You are about to rate zero stars, are you sure?');
      Setsubmessage('');
      setIsPopUp(true);
    } else {
      handleSubmit();
    }
  };
  const handleSubmit = async () => {
    setIsPopUp(false);
    try {
      const response = await fetch('/api/menus/starMenu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          routeId: route.id,
          rating: selectedRating,
          comment: comment,
          isRated: rating !== null,
        }),
      });
      if (!response.ok) {
        throw new Error('Error in API Call');
      }
      showNotification({
        message: `Succesfully rated route!`,
        color: 'green',
      });
      onCancel();
    } catch (error) {
      showNotification({
        message: `Could not rate route with error:${error}`,
        color: 'red',
      });
    }
  };
  const handleCancel = () => {
    setIsPopUp(false);
  };

  const handleCommentChange = (event) => {
    SetComment(event.target.value);
  };

  return (
    <>
      {isPopUp && (
        <ConfirmationPopUp
          message={message}
          submessage={submessage}
          onConfirmation={handleSubmit}
          onCancel={handleCancel}
        />
      )}
      <div className="flex items-center flex-col gap-1">
        {rating ? (
          <div className="flex flex-col items-center">
            <p className="font-barlow text-white">Edit Rating</p>
            <p className="font-barlow text-xs text-slate-500 italic text-center">
              You have already rated this route, but you can still change your
              rating
            </p>{' '}
          </div>
        ) : (
          <p className="font-barlow text-white">Rate the Route!</p>
        )}
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              onClick={() => handleStarClick(star)}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className={clsx(
                'fill-slate-500 shadow-lg size-8 cursor-pointer',
                star <= selectedRating ? 'fill-yellow-500' : null
              )}
            >
              <path
                fillRule="evenodd"
                d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                clipRule="evenodd"
              />
            </svg>
          ))}
        </div>
        <div className="flex flex-col items-center gap-1">
          {!rating ? (
            <p className="font-barlow text-slate-500 text-sm">
              Write a comment to the routesetter {'(optional)'}
            </p>
          ) : (
            <p className="font-barlow text-slate-500 text-sm">
              Edit Your Comment {'(optional)'}
            </p>
          )}

          <textarea
            name=""
            id=""
            value={comment}
            onChange={handleCommentChange}
            placeholder="Optional Comment"
            className="bg-bg2 rounded w-full text-sm h-16 p-2 max-h-40 min-h-10"
          ></textarea>
          <p className="font-barlow text-xs text-slate-500 italic">
            Only the routesetter can see what you write
          </p>
        </div>
      </div>

      <div className="flex justify-end p-2">
        <button
          className="text-white bg-blue-400 p-2 rounded "
          onClick={handleConfirmation}
        >
          {rating?.stars ? 'Update' : 'Submit'}
        </button>
      </div>
    </>
  );
}
