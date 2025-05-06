import { useState, useEffect } from "react";
import axios from "axios";

export default function UploadDomainSection() {
  const [domains, setDomains] = useState([]);

  useEffect(() => {
    axios
      .get("/api/admin/domains", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => setDomains(res.data.domains))
      .catch((err) => console.error("Error fetching domains", err));
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 justify-items-center">
      <h3 className="text-lg font-medium mb-6">Upload Domain PDF</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 justify-items-center">
            <h3 className="text-lg font-medium mb-6">Upload Domain PDF</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="text-md font-semibold mb-3">Upload to Existing Domain</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Select Domain</label>
                    <select className="w-full p-2 border border-gray-300 rounded dark:bg-gray-800">
                    <option value="">-- Select a Domain --</option>
                      {domains.map((domain) => (
                        <option key={domain.domain_id} value={domain.domain_name}>
                          {domain.domain_name}
                        </option>
                      ))}
                  </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Upload PDF</label>
                    <input type="file" accept="application/pdf" className="w-full" />
                  </div>

                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full">
                    Upload
                  </button>
                </div>
              </div>

                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h4 className="text-md font-semibold mb-3">Add New Domain and Upload PDF</h4>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">New Domain Name</label>
                        <input
                          type="text"
                          placeholder="Enter domain name"
                          className="w-full p-2 border border-gray-300 rounded"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Upload PDF</label>
                        <input type="file" accept="application/pdf" className="w-full" />
                      </div>

                      <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full">
                        Add Domain & Upload
                      </button>
                    </div>
                  </div>

                </div>
              </div>      </div>

      {/* 🔽 Show Available Domains and PDFs */}
      <div className="mt-8">
        <h4 className="text-md font-semibold mb-3">Available Domains</h4>
        <ul className="space-y-2">
          {domains.map((domain) => (
            <li key={domain.domain_id} className="flex justify-between items-center border-b pb-2">
              <span>{domain.domain_name}</span>
              <a
                href={domain.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View PDF
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}