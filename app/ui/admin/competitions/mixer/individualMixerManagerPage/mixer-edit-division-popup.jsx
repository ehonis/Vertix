import { motion } from 'motion/react';
import { useState } from 'react';

export default function EditDivisionPopUp({
  divisionId,
  divisionText,
  onCancel,
  updateDivision,
}) {
  const [tempDivision, setTempDivision] = useState(divisionText);
  const [isSaveButton, setIsSaveButton] = useState(false);
  const [infoText, setInfoText] = useState(
    'No Changes have been made. Edit the text above to update the division'
  );
  const handleDivisionTextChange = (e) => {
    const tempText = e.target.value;
    setTempDivision(tempText);
    if (tempText === '') {
      setInfoText('Text Box is empty, you cannot update with nothing inside');
      setIsSaveButton(false);
    } else if (tempText === divisionText) {
      setInfoText(
        'No Changes have been made. Edit the text above to update the division'
      );
      setIsSaveButton(false);
    } else {
      setIsSaveButton(true);
    }
  };

  const handleUpdateDivision = () => {
    updateDivision(tempDivision, divisionId);
    onCancel();
  };
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 flex items-center justify-center bg-black/50 z-20"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="bg-bg2 p-3 rounded-lg shadow-lg text-white max-w-xs w-full relative flex flex-col gap-2"
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
          <h2 className="text-xl">Division Editor</h2>
          <input
            type="text"
            value={tempDivision}
            onChange={handleDivisionTextChange}
            className="bg-bg1 text-white rounded px-2 py-1"
            placeholder="V# - V# / 5.# - 5.# or >V# / >5.#"
          />
          {isSaveButton ? (
            <div className="w-full flex justify-end">
              <button
                className="px-2 py-1 bg-green-500 rounded text-white font-barlow"
                onClick={handleUpdateDivision}
              >
                Update Division
              </button>
            </div>
          ) : (
            <div>
              <p className="text-gray-300 font-barlow font-light italic text-sm">
                {infoText}
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
