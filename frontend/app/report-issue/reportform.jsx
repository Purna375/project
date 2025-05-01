"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function ReportIssue({ onSuccess }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const local_uri = "http://localhost:8000";

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      if (file) formData.append("file", file);
  
      const res = await axios.post(`${local_uri}/api/reports/create`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
  
      if (res.data.success) {
        toast.success("Issue reported successfully!");
        setTitle("");
        setDescription("");
        setFile(null);
  
        if (onSuccess) onSuccess(res.data.report);
      } else {
        toast.error("Failed to report issue");
      }
    } catch (error) {
      console.error("Report submit error:", error);
      toast.error("An error occurred while submitting the issue.");
    }
  };  

  return (
    <div className="md:w-2xl mx-auto p-6 bg-white dark:bg-gray-800 shadow-lg rounded-md transition-colors duration-300 sm:w-lg">
      <h1 className="md:text-3xl text-center font-bold mb-4 text-gray-900 dark:text-white sm:text-2xl">
        Report an Issue
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Issue Title */}
        <div>
          <label className="block text-gray-700 dark:text-gray-200 font-medium">
            Issue Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
            placeholder="Enter issue title"
            required
          />
        </div>

        {/* Issue Description */}
        <div>
          <label className="block text-gray-700 dark:text-gray-200 font-medium">
            Issue Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
            rows="4"
            placeholder="Describe the issue"
            required
          />
        </div>

        {/* File Upload (Optional) */}
        <div>
          <label className="block text-gray-700 dark:text-gray-200 font-medium">
            Upload Screenshot (Optional)
          </label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-2 px-4 rounded-md bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 text-white transition-colors"
        >
          Submit Issue
        </button>
      </form>
    </div>
  );
}