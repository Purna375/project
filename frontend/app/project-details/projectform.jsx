"use client";

import { useState, useEffect } from "react";
import Terms from "./Terms";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useRouter } from "next/navigation"; 
import { toast } from "react-toastify";

export default function ProjectDetails({ onProjectAdded }) {
  const [projectId, setProjectId] = useState("");
  const [domain, setDomain] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [file, setFile] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const local_uri = "http://localhost:8000";
  const router = useRouter(); 
  
  // Calculate tomorrow's date for the minimum delivery date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];
  
  // Fetch project ID on component mount
  useEffect(() => {
    async function getProjectId() {
      try {
        const id = await fetchProjectId();
        if (id) {
          console.log("Setting project ID:", id);
          setProjectId(id);
        } else {
          toast.error("Could not generate project ID. Please refresh the page.");
        }
      } catch (error) {
        toast.error("Error fetching project ID");
        console.error("Error in getProjectId:", error);
      }
    }
  
    getProjectId();
  }, []);  

  const validateForm = () => {
    const errors = {};
    
    if (!projectId) errors.projectId = "Project ID is required";
    if (!domain) errors.domain = "Please select a domain";
    if (!description) errors.description = "Project Description Required";
    if (!name) errors.name = "Project name is required";
    if (!deliveryDate) errors.deliveryDate = "Delivery date is required";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Reset form to initial state
  const resetForm = () => {
    setDomain("");
    setName("");
    setDescription("");
    setDeliveryDate("");
    setFile(null);
    setFormErrors({});
  };

  const handleSubmit = async () => {
    if (loading) return;
    
    setLoading(true);
    
    if (!validateForm()) {
      toast.error("Please fill in all required fields.");
      setLoading(false);
      return;
    }
  
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication error. Please log in again.");
        setLoading(false);
        return;
      }
      
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?.id;
      
      if (!userId) {
        toast.error("User information not found. Please log in again.");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("domain", domain);
      formData.append("projectName", name);
      formData.append("description", description);
      formData.append("deliveryDate", deliveryDate);
      formData.append("termsAgreed", 1);
      
      if (file) {
        formData.append("referenceFile", file);
      }
    
      const response = await axios.post(
        `${local_uri}/api/projects/request`,
        formData,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
    
      console.log("Project submitted:", response.data);
      
      resetForm();
      
      setShowDialog(false);
      
      toast.success("Project request submitted successfully!");
      router.push('/dashboard');
      if (onProjectAdded) {
        onProjectAdded();
      }      
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Something went wrong while submitting. Please try again.";
      console.error("Error submitting project:", errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  async function fetchProjectId() {
    const token = localStorage.getItem("token");
    
    if (!token) {
      toast.error("Authentication error. Please log in again.");
      return null;
    }
    
    try {
      const res = await axios.get(`${local_uri}/api/projects/generate-id`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { projectId } = res.data;
      console.log("Fetched project ID:", projectId);
      return projectId;
    } catch (error) {
      console.error("Error fetching project ID:", error.response?.data?.message || error.message);
      return null;
    }
  }

  const handleOpenDialog = () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setShowDialog(true);
  };

  return (
    <div className="md:w-2xl sm:xl mx-auto p-6 bg-white dark:bg-gray-900 shadow-lg rounded-md transition-colors duration-300 border dark:border-gray-700 border-gray-300">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Project Details
      </h1>
      
      {/* ToastContainer is now in layout.jsx */}
      
      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 dark:text-gray-200 font-medium">
            Project ID
          </label>
          <input
            type="text"
            value={projectId || "Loading..."}
            readOnly
            className={`w-full p-2 border ${formErrors.projectId ? 'border-red-500' : 'border-gray-300'} bg-gray-100 dark:bg-gray-800 dark:text-white rounded`}
          />
          {formErrors.projectId && (
            <p className="text-red-500 text-sm mt-1">{formErrors.projectId}</p>
          )}
        </div>

        <div>
          <label className="block text-gray-700 dark:text-gray-200 font-medium">
            Project Domain
          </label>
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className={`w-full p-2 border ${formErrors.domain ? 'border-red-500' : 'border-gray-300'} bg-gray-100 dark:bg-gray-800 dark:text-white rounded`}
            required
          >
            <option value="">Select Domain</option>
            <option value="AI">Artificial Intelligence</option>
            <option value="Web">Web Development</option>
            <option value="Blockchain">Blockchain</option>
            <option value="Data Science">Data Science</option>
          </select>
          {formErrors.domain && (
            <p className="text-red-500 text-sm mt-1">{formErrors.domain}</p>
          )}
        </div>

        <div>
          <label className="block text-gray-700 dark:text-gray-200 font-medium">
            Project Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full p-2 border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} bg-gray-100 dark:bg-gray-800 dark:text-white rounded`}
            required
          />
          {formErrors.name && (
            <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-gray-700 dark:text-gray-200 font-medium">
            Project Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 bg-gray-100 dark:bg-gray-800 dark:text-white rounded"
            rows="4"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 dark:text-gray-200 font-medium">
            Upload Documents (Optional)
          </label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full p-2 border border-gray-300 bg-gray-100 dark:bg-gray-800 dark:text-white rounded"
          />
        </div>

        <div>
          <label className="block text-gray-700 dark:text-gray-200 font-medium">
            Delivery Date
          </label>
          <input
            type="date"
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
            min={minDate}
            className={`w-full p-2 border ${formErrors.deliveryDate ? 'border-red-500' : 'border-gray-300'} bg-gray-100 dark:bg-gray-800 dark:text-white rounded`}
            required
          />
          {formErrors.deliveryDate && (
            <p className="text-red-500 text-sm mt-1">{formErrors.deliveryDate}</p>
          )}
        </div>
        
        <Button
          type="button"
          onClick={handleOpenDialog}
          disabled={loading}
          className={loading ? "opacity-70 cursor-not-allowed" : ""}
        >
          {loading ? 
            <span className="flex items-center">
              <span className="inline-block h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></span>
              Processing...
            </span> 
            : "Submit"
          }
        </Button>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="sm:max-w-[425px] dark:bg-gray-800 dark:text-white">
            <DialogTitle>Terms & Conditions</DialogTitle>
            <DialogDescription>
              Please read and accept the terms to continue.
            </DialogDescription>
            <Terms onAccept={handleSubmit} loading={loading} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}