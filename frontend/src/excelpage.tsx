// UploadForm.tsx
import React, { useState } from 'react';
import axios from 'axios';

const UploadForm = () => {
  const [file, setFile] = useState<File | null>(null);
  const [departmentId, setDepartmentId] = useState("");

  const handleUpload = async () => {
    if (!file || !departmentId) {
      alert("Please provide both department ID and file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("departmentId", departmentId);

    try {
      const response = await axios.post("http://localhost:3000/api/excel/upload-with-scheme", formData);
      alert(response.data.message);
    } catch (error) {
      console.error("Upload failed", error);
      alert("Upload failed. See console for details.");
    }
  };

  return (
    <div>
      <h2>Upload Scheme Excel</h2>
      <input type="text" placeholder="Enter Department ID" onChange={(e) => setDepartmentId(e.target.value)} />
      <input type="file" accept=".xlsx, .xls" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default UploadForm;
