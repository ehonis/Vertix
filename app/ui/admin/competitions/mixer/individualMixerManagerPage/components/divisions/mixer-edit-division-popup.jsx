import { motion } from "motion/react";
import { useState } from "react";
import ElementLoadingAnimation from "@/app/ui/general/element-loading-animation";
import { useNotification } from "@/app/contexts/NotificationContext";
import { useRouter } from "next/navigation";

export default function EditDivisionPopUp({
  divisionId,
  divisionText,
  onCancel,

  type,

  compId,
}) {
  const { showNotification } = useNotification();
  const router = useRouter();
  const [tempDivision, setTempDivision] = useState(divisionText ? divisionText : "");
  const [isSaveButton, setIsSaveButton] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [infoText, setInfoText] = useState(
    "No Changes have been made. Edit the text above to update the division"
  );
  const handleDivisionTextChange = e => {
    const tempText = e.target.value;
    setTempDivision(tempText);
    if (tempText === "") {
      setInfoText("Text Box is empty, you cannot update with nothing inside");
      setIsSaveButton(false);
    } else if (tempText === divisionText) {
      setInfoText("No Changes have been made. Edit the text above to update the division");
      setIsSaveButton(false);
    } else {
      setIsSaveButton(true);
    }
  };

  const handleUpdateDivision = async () => {
    const data = {
      divisionName: tempDivision,
      divisionId: divisionId,
      compId: compId,
    };
    setIsLoading(true);
    try {
      const response = await fetch("/api/mixer/manager/division/updateDivision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        console.error(response.message);
      }
      showNotification({
        message: `Updated Division`,
        color: "green",
      });
      setIsLoading(false);
      onCancel();
      router.refresh();
    } catch (error) {
      setIsLoading(false);
      showNotification({
        message: `Update Failed`,
        color: "red",
      });
    } finally {
    }
  };

  const handleNewDivision = async () => {
    const data = { divisionName: tempDivision, compId: compId };

    setIsLoading(true);
    try {
      const response = await fetch("/api/mixer/manager/division/newDivision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        console.error(response.message);
      }
      const responseData = await response.json();

      setIsLoading(false);
      showNotification({
        message: `Added Division`,
        color: "green",
      });
      router.refresh();
      onCancel();
    } catch (error) {
      setIsLoading(false);
      showNotification({
        message: `New Division Failed ${error}`,
        color: "red",
      });
    }
  };
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 flex items-center justify-center bg-black/50 z-20 "
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="bg-bg2 p-3 rounded-lg shadow-lg text-white max-w-sm w-full relative flex flex-col gap-2 z-30"
        >
          <button className="absolute top-2 right-2" onClick={onCancel}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-7"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
          {isLoading ? (
            <ElementLoadingAnimation />
          ) : (
            <div className="flex flex-col gap-2 w-full">
              <h2 className="text-xl">
                {type === "NEW" && "New "}Division {type === "EDIT" && "Editor"}
              </h2>
              <input
                type="text"
                value={tempDivision}
                onChange={handleDivisionTextChange}
                className="bg-slate-900 text-white rounded-sm px-2 py-1 focus:outline-hidden"
                placeholder="V# - V# / 5.# - 5.# or >V# / >5.#"
              />
              {isSaveButton ? (
                <div className="w-full flex justify-end">
                  {type === "NEW" ? (
                    <button
                      className="px-2 py-1 bg-green-500/35 outline outline-green-500 outline-1 rounded-sm text-white font-barlow"
                      onClick={handleNewDivision}
                    >
                      Submit
                    </button>
                  ) : (
                    <button
                      className="px-2 py-1 bg-green-500/35 outline outline-green-500 outline-1 rounded-sm text-white font-barlow"
                      onClick={handleUpdateDivision}
                    >
                      Update Division
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-gray-300 font-barlow font-light italic text-sm">{infoText}</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
