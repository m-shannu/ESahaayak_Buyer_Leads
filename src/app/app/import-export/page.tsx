// "use client";

// import { useState } from "react";

// export default function ImportExportPage() {
//   const [file, setFile] = useState<File | null>(null);
//   const [message, setMessage] = useState("");

//   // Handle Import
//   const handleImport = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!file) return;

//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       const res = await fetch("/api/buyers/import", {
//         method: "POST",
//         body: formData,
//       });

//       const data = await res.json();
//       if (data.success) {
//         setMessage(`✅ Imported ${data.count} buyers`);
//       } else {
//         setMessage("❌ Import failed");
//       }
//     } catch (err) {
//       setMessage("❌ Import failed (server error)");
//     }
//   };

//   // Handle Export
//   const handleExport = async () => {
//     try {
//       const res = await fetch("/api/buyers/export");
//       if (!res.ok) {
//         setMessage("❌ Export failed");
//         return;
//       }

//       const blob = await res.blob();
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = "buyers.csv";
//       document.body.appendChild(a);
//       a.click();
//       a.remove();
//       window.URL.revokeObjectURL(url);

//       setMessage("✅ Exported buyers.csv");
//     } catch (err) {
//       setMessage("❌ Export failed (server error)");
//     }
//   };

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">Import / Export Buyers</h1>

//       {/* Export */}
//       <div className="mb-6">
//         <button
//           onClick={handleExport}
//           className="bg-blue-600 text-white px-4 py-2 rounded"
//         >
//           Export CSV
//         </button>
//       </div>

//       {/* Import */}
//       <form onSubmit={handleImport} className="space-y-4">
//         <input
//           type="file"
//           accept=".csv"
//           onChange={(e) => setFile(e.target.files?.[0] || null)}
//         />
//         <button
//           type="submit"
//           className="bg-green-600 text-white px-4 py-2 rounded"
//         >
//           Import CSV
//         </button>
//       </form>

//       {message && <p className="mt-4">{message}</p>}
//     </div>
//   );
// }

"use client";

import React, { useState } from "react";

export default function ImportExportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/buyers/import", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setMessage("✅ Import successful!");
      } else {
        setMessage("❌ Import failed. Check file format.");
      }
    } catch (err) {
      setMessage("⚠️ Error uploading file.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    window.location.href = "/api/buyers/export";
  };

  return (
    <div className="import-export-container">
      <h2 className="title">📂 Import / Export Leads</h2>

      <div className="card">
        <h3>📥 Import Buyers</h3>
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button onClick={handleImport} disabled={loading}>
          {loading ? "⏳ Importing..." : "Import File"}
        </button>
        {message && <p className="message">{message}</p>}
      </div>

      <div className="card">
        <h3>📤 Export Buyers</h3>
        <p>You can export all buyer leads into Excel file.</p>
        <button onClick={handleExport}>Export File</button>
      </div>
    </div>
  );
}

