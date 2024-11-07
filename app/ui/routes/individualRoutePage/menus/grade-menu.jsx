import { useState } from 'react';
import { useNotification } from '@/app/contexts/NotificationContext';
import { getGradeRange } from '@/lib/routes';
import { useRouter } from 'next/navigation';
export default function GradeMenu({
  route,
  userId,
  isComplete,
  isGraded,
  onCancel,
  proposedGrade,
}) {
  const router = useRouter();
  const gradeOptions = getGradeRange(route.grade);
  const [selectedGrade, setSelectedGrade] = useState(gradeOptions[0]);
  const { showNotification } = useNotification();
  const handleSelectGradeChange = (event) => {
    setSelectedGrade(event.target.value);
  };

  const renderGradeMenuText = () => {
    if (isGraded) {
      return (
        <div className="flex flex-col items-center gap-3">
          <p className="text-center">
            You have already graded this problem, you can change your proposed
            grade below <br />
            <br />
            <span className="text-blue-500 underline">
              Your Proposed Grade : {proposedGrade}
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
    } else {
      return (
        <div className="flex flex-col items-center gap-3">
          <p className="text-center">
            You have not graded this problem, You can grade the problem below
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
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('/api/menus/gradeMenu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          routeId: route.id,
          isGraded: isGraded,
          selectedGrade: selectedGrade,
        }),
      });
      if (!response.ok) {
        throw new Error('Error in API Call');
      }
      showNotification({
        message: `Graded ${route.title} w/ grade: ${selectedGrade}`,
        color: 'green',
      });
    } catch (error) {
      showNotification({ message: `could not grade route error:${error}` });
      console.error(error);
    }
    router.refresh();
    onCancel();
  };
  return (
    <div className="flex flex-col items-center">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 items-center"
      >
        {renderGradeMenuText()}

        <button type="submit" className="bg-green-500 p-1 rounded m-3">
          Submit
        </button>
      </form>
    </div>
  );
}
