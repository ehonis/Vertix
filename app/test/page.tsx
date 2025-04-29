"use client";

import { useNotification } from "@/app/contexts/NotificationContext";

export default function Test() {
  // Function to generate and download a sample spreadsheet
  const handleDownloadSpreadsheet = () => {
    try {
      // Create sample data for the spreadsheet
      const data = [
        ["Name", "Age", "City"],
        ["John Doe", "30", "New York"],
        ["Jane Smith", "25", "Los Angeles"],
        ["Bob Wilson", "45", "Chicago"],
      ];

      // Convert data array to CSV format
      const csvContent = data.map(row => row.join(",")).join("\n");

      // Create a Blob containing the CSV data
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

      // Create a temporary link element
      const link = document.createElement("a");

      // Create the download URL
      const url = URL.createObjectURL(blob);

      // Set link properties
      link.href = url;
      link.download = "sample_spreadsheet.csv";

      // Append link to document, trigger download, and cleanup
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Show success notification
      showNotification({ message: "Spreadsheet downloaded successfully!", color: "green" });
    } catch (error) {
      // Show error notification if download fails
      showNotification({ message: "Failed to download spreadsheet", color: "red" });
    }
  };

  const { showNotification } = useNotification();
  return (
    <div>
      <button onClick={() => handleDownloadSpreadsheet()}>Download Spreadsheet</button>
    </div>
  );
}
