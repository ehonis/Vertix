'use client';
import { useState, useEffect } from 'react';
import { getGradeRange } from '@/lib/routes';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/app/contexts/NotificationContext';

export default function CompleteMenu({
  route,
  userId,
  isComplete,
  isGraded,
  onCancel,
}) {
  const { showNotification } = useNotification();
  const gradeOptions = getGradeRange(route.grade);
  const router = useRouter();
  const [selectedGrade, setSelectedGrade] = useState(gradeOptions[0]);
  const [selectedSends, setSelectedSends] = useState('1'); // Default sends to 1
  const [cases, setCases] = useState('');
  const handleSelectGradeChange = (event) => {
    setSelectedGrade(event.target.value);
  };
  const handleSelectSendsChange = (event) => {
    setSelectedSends(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('/api/menus/completeMenu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          routeId: route.id,
          cases: cases,
          selectedGrade: selectedGrade,
          selectedSends: selectedSends,
        }),
      });
      if (!response.ok) {
        throw new Error('Error in API Call');
      }
      showNotification({
        message: `completed ${route.title}`,
        color: 'green',
      });
    } catch (error) {
      console.error('submission failed:', error);
      showNotification({
        message: `could not complete ${route.title}`,
        color: 'red',
      });
    }
    router.refresh();
    onCancel();
  };

  useEffect(() => {
    if (isComplete && isGraded) {
      setCases('completedGraded');
    } else if (isComplete && !isGraded) {
      setCases('completedNotGraded');
    } else if (!isComplete && isGraded) {
      setCases('notCompletedGraded');
    } else {
      setCases('notCompletedNotGraded');
    }
  }, [isComplete, isGraded]);

  const renderCompleteMenu = () => {
    if (cases === 'completedGraded') {
      return (
        <p className="text-center">
          You have completed this route once, add another send! If you want to
          edit your community grade, go to the grade menu.
        </p>
      );
    } else if (cases === 'completedNotGraded') {
      return (
        <div className="flex flex-col items-center gap-1">
          <p className="text-center">
            You have completed this route once, but did not grade it. If you
            want to add a grade but not any sends, go to the grade menu. <br />
            <br />
            <span className="text-blue-500">
              Add a grade and add some sends!
            </span>
          </p>
          <label className="flex gap-3 font-bold">
            Grade:
            <select
              value={selectedGrade}
              onChange={handleSelectGradeChange}
              className="w-12 rounded bg-bg2"
            >
              {gradeOptions.map((grade, idx) => (
                <option key={idx} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </label>
        </div>
      );
    } else if (cases === 'notCompletedGraded') {
      return (
        <p className="text-center">
          You already graded this route but did not complete it. If you want to
          edit your community grade, go to the grade menu.
        </p>
      );
    } else {
      return (
        <label className="flex gap-3 font-bold">
          Grade:
          <select
            value={selectedGrade}
            onChange={handleSelectGradeChange}
            className="w-12 rounded bg-bg2"
          >
            {gradeOptions.map((grade, idx) => (
              <option key={idx} value={grade}>
                {grade}
              </option>
            ))}
          </select>
        </label>
      );
    }
  };

  return (
    <div className="flex flex-col items-center">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 items-center"
      >
        {renderCompleteMenu()}

        <label className="flex gap-3 font-bold">
          Sends:
          <select
            value={selectedSends}
            onChange={handleSelectSendsChange}
            className="w-8 rounded bg-bg2"
          >
            <option value=""></option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
            <option value="10">10</option>
          </select>
        </label>
        <button type="submit" className="bg-green-500 p-1 rounded m-3">
          Submit
        </button>
      </form>
    </div>
  );
}
