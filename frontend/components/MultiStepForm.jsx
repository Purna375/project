"use client";
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";


const domains = [
  { name: "Web Development", pdf: "/pdfs/web-development.pdf" },
  { name: "Machine Learning", pdf: "/pdfs/machine-learning.pdf" },
  { name: "Cyber Security", pdf: "/pdfs/cyber-security.pdf" },
];

export default function MultiStepForm() {
  const [step, setStep] = useState(1);
  const [selectedDomain, setSelectedDomain] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const local_uri = "http://localhost:8000";
  const [loading, setIsLoading] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    trigger,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: {
      students: [{ name: "", rollNo: "", branch: "", email: "", phone: "" }],
      college: { name: "", branch: "", domain: "" },
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "students",
  });

  const validateStep = async () => {
    let valid = false;
    
    if (step === 1) {
      valid = await trigger("students");
      if (!valid) {
        toast.error("Please fill all required student details correctly.");
      }
    } else if (step === 2) {
      valid = await trigger("college");
      if (!valid) {
        toast.error("Please complete the college information correctly.");
      }
    } else if (step === 3) {
      valid = !!selectedDomain;
      if (!valid) {
        toast.error("Please select a study material domain before submitting.");
      }
    }
    
    return valid;
  };
  
  const nextStep = async () => {
    setIsLoading(true);
    const isValid = await validateStep();
    
    if (isValid && step < 3) {
      setTransitionDirection("next");
      setTimeout(() => {
        setStep(step + 1);
        setIsLoading(false);
      }, 400);
    } else {
      setIsLoading(false);
    }
  };

  const prevStep = () => {
    setIsLoading(true);
    setTransitionDirection("prev");
    
    // Small delay to show loading state
    setTimeout(() => {
      if (step > 1) setStep(step - 1);
      setIsLoading(false);
    }, 400);
  };

  const router = useRouter(); 
  const onSubmit = async (data) => {
    setIsSubmitting(true);
  
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?.id;
      
      await new Promise(resolve => setTimeout(resolve, 800));

      const response = await fetch(`${local_uri}/api/users/submit-multistep-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: userId,
          students: data.students,
          college: {
            name: data.college.name,
            branch: data.college.branch,
            domain: data.college.domain,
          },
          domain: selectedDomain 
        })
      });      
  
      const result = await response.json();
  
      if (response.ok) {
        console.log("Server Response:", result);
        router.push("/project-details");
      }else if (response.status === 401) {
        toast.error("Session expired. Please log in again.");
        router.push("/");
      } else {
        toast.error(result.error || "Failed to submit form");
      }
    } catch (error) {
      console.error("Form Submission Error:", error);
      toast.error("An error occurred during submission");
    } finally {
      setIsSubmitting(false);
    }
  };  

  return (
    <div className="w-xl mx-auto p-8 bg-white dark:bg-gray-800 shadow-xl rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Student Registration</h1>
        <p className="text-gray-600 dark:text-gray-300">Complete all steps to register</p>
      </div>

      <div className="mb-8">
        <div className="relative after:mt-4 after:block after:h-1 after:w-full after:rounded-lg after:bg-gray-200 dark:after:bg-gray-700">
          <ol className="grid grid-cols-3 gap-y-8 text-sm font-medium text-gray-500">
            {["Students", "College", "Domain"].map((label, index) => {
              const stepIndex = index + 1;
              const isCompleted = stepIndex < step;
              const isActive = stepIndex === step;

              return (
                <li
                  key={label}
                  className={`relative flex ${
                    stepIndex === 1 ? "justify-start" : stepIndex === 2 ? "justify-center" : "justify-end"
                  } ${isCompleted ? "text-green-600" : isActive ? "text-blue-600" : "text-gray-400"}`}
                >
                  <span
                    className={`absolute -bottom-[1.75rem] flex items-center justify-center w-8 h-8 rounded-full ${
                      stepIndex === 1 ? "start-0" : stepIndex === 2 ? "left-1/2 -translate-x-1/2" : "end-0"
                    } ${
                      isCompleted 
                        ? "bg-green-600 text-white" 
                        : isActive 
                          ? "bg-blue-600 text-white" 
                          : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                      </svg>
                    ) : (
                      stepIndex
                    )}
                  </span>

                  <span className="hidden sm:block font-medium mb-4">{label}</span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-10">
        <div className="min-h-96 mb-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Student Details</h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">{fields.length} of 10 students</span>
              </div>

              <div className="max-h-80 overflow-y-auto pr-2">
                {fields.map((item, index) => (
                  <div key={item.id} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-700 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium text-gray-700 dark:text-gray-200">Student {index + 1}</h3>
                      {index > 0 && (
                        <button 
                          type="button"
                          onClick={() => remove(index)} 
                          className="text-red-500 hover:text-red-700 text-sm flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path>
                          </svg>
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                        <input
                          {...register(`students.${index}.name`, { required: "Name is required" })}
                          placeholder="Full Name"
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                        />
                        {errors.students?.[index]?.name && (
                          <p className="mt-1 text-sm text-red-600">{errors.students[index].name.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Roll No</label>
                        <input
                          {...register(`students.${index}.rollNo`, { required: "Roll No is required" })}
                          placeholder="e.g. A12345"
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                        />
                        {errors.students?.[index]?.rollNo && (
                          <p className="mt-1 text-sm text-red-600">{errors.students[index].rollNo.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Branch</label>
                        <input
                          {...register(`students.${index}.branch`, { required: "Branch is required" })}
                          placeholder="e.g. Computer Science"
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                        />
                        {errors.students?.[index]?.branch && (
                          <p className="mt-1 text-sm text-red-600">{errors.students[index].branch.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                        <input
                          type="email"
                          {...register(`students.${index}.email`, { 
                            required: "Email is required",
                            pattern: {
                              value: /\S+@\S+\.\S+/,
                              message: "Please enter a valid email"
                            }
                          })}
                          placeholder="email@example.com"
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                        />
                        {errors.students?.[index]?.email && (
                          <p className="mt-1 text-sm text-red-600">{errors.students[index].email.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                        <input
                          type="tel"
                          {...register(`students.${index}.phone`, { 
                            required: "Phone is required",
                            pattern: {
                              value: /^[0-9]{10}$/,
                              message: "Please enter a valid 10-digit phone number"
                            }
                          })}
                          placeholder="10-digit number"
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                        />
                        {errors.students?.[index]?.phone && (
                          <p className="mt-1 text-sm text-red-600">{errors.students[index].phone.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {fields.length < 10 && (
                <button
                type="button"
                onClick={() => {
                  const container = document.querySelector('.custom-scrollbar');
                  append({ name: "", rollNo: "", branch: "", email: "", phone: "" });
                  setTimeout(() => {
                    container.scrollTop = container.scrollHeight;
                  }, 10);
                }}
                className="w-full py-2 px-4 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors flex items-center justify-center gap-2 hover:shadow-sm"
              >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path>
                  </svg>
                  Add Another Student
                </button>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-700 min-h-64">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">College Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">College Name</label>
                  <input
                    {...register("college.name", { required: "College Name is required" })}
                    placeholder="e.g. University of Technology"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                  />
                  {errors.college?.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.college.name.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Branch</label>
                  <input
                    {...register("college.branch", { required: "Branch is required" })}
                    placeholder="e.g. Main Campus"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                  />
                  {errors.college?.branch && (
                    <p className="mt-1 text-sm text-red-600">{errors.college.branch.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Primary Domain</label>
                  <input
                    {...register("college.domain", { required: "Domain is required" })}
                    placeholder="e.g. Engineering"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                  />
                  {errors.college?.domain && (
                    <p className="mt-1 text-sm text-red-600">{errors.college.domain.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-700 min-h-64">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Resource Selection</h2>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Study Material</label>
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                >
                  <option value="">-- Select a Domain --</option>
                  {domains.map((d) => (
                    <option key={d.name} value={d.pdf}>
                      {d.name}
                    </option>
                  ))}
                </select>
                {step === 3 && !selectedDomain && (
                  <p className="mt-1 text-sm text-red-600">Please select a domain</p>
                )}
              </div>

              {selectedDomain && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                  <h3 className="font-medium text-gray-800 dark:text-white mb-2">Selected Resource</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    You've selected {domains.find(d => d.pdf === selectedDomain)?.name} study materials.
                  </p>
                  <a 
                    href={selectedDomain} 
                    download 
                    className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"></path>
                    </svg>
                    Download PDF
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-between mt-8 pt-4 border-t dark:border-gray-700">
          {step > 1 ? (
            <button 
              type="button" 
              onClick={prevStep} 
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white rounded-md transition-colors"
            >
              ← Previous
            </button>
          ) : (
            <div></div>
          )}

          {step < 3 ? (
            <button 
              type="button" 
              onClick={nextStep} 
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center gap-2"
            >
              Next
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
            </button>
          ) : (
            <button 
              type="submit" 
              disabled={!selectedDomain || isSubmitting}
              className={`px-6 py-2 ${isSubmitting ? 'bg-purple-400' : 'bg-purple-600 hover:bg-purple-700'} text-white rounded-md transition-colors flex items-center gap-2`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  Submit Registration
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}