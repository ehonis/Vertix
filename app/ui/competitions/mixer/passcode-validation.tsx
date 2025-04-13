"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PasscodeValidationProps = {
  passcode: string | null;
  compId: string;
};

export default function PasscodeValidation({ passcode, compId }: PasscodeValidationProps) {
  const router = useRouter();
  const [passcodeInput, setPasscodeInput] = useState("");
  const handleSubmit = () => {
    if (passcodeInput === passcode) {
      router.push(`/competitions/mixer/${compId}/scroller`);
    }
  };
  return (
    <div>
      <p>Passcode</p>
      <input type="text" value={passcodeInput} onChange={e => setPasscodeInput(e.target.value)} />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
