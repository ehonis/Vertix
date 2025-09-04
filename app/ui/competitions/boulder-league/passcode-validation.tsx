"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/app/contexts/NotificationContext";
import clsx from "clsx";

type PasscodeValidationProps = {
  passcode: string | null;
  compId: string;
};

export default function PasscodeValidation({ passcode, compId }: PasscodeValidationProps) {
  const { showNotification } = useNotification();
  const router = useRouter();
  const [passcodeInput, setPasscodeInput] = useState("");
  const [isPasscodeCorrect, setIsPasscodeCorrect] = useState(false);

  const handleSubmit = () => {
    if (passcodeInput === passcode) {
      setIsPasscodeCorrect(true);
      showNotification({ message: "Passcode accepted, Redirecting!", color: "green" });
      router.push(`/competitions/mixer/${compId}/scroller`);
    } else {
      setIsPasscodeCorrect(false);
      showNotification({ message: "Passcode incorrect, Please try again", color: "red" });
    }
  };
  return (
    <div className="font-barlow text-white">
      <p>Passcode</p>
      <div className="flex gap-2">
        <input
          type="text"
          value={passcodeInput}
          onChange={e => setPasscodeInput(e.target.value)}
          className={clsx(
            "bg-gray-800 rounded-md p-2",
            isPasscodeCorrect ? "border-green-500 border" : "border-red-500 border"
          )}
        />
        <button onClick={handleSubmit} className="bg-green-500 rounded-md p-2">
          Submit
        </button>
      </div>
    </div>
  );
}
