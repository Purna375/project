// AdminDashboardModals.jsx
import { useState, useEffect, useRef } from 'react';
import { X, Check, AlertCircle, Upload, Paperclip, Send, Download, Eye, Edit, User, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { toast } from 'react-toastify';

// Project View/Edit Modal
export const ProjectViewModal = ({ project, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [editedProject, setEditedProject] = useState({ ...project });
  const [files, setFiles] = useState([]);
  const [note, setNote] = useState('');
  const [pdfs, setPdfs] = useState([
    { id: 1, name: 'Project Brief.pdf' },
    { id: 2, name: 'Requirements Doc.pdf' },
  ]);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProject(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async () => {
    try {
      // Simulate API call
      // const token = localStorage.getItem("adminToken");
      // const response = await axios.put(`http://localhost:8000/api/admin/projects/${project.project_id}`, editedProject, {
      //   headers: { Authorization: `Bearer ${token}` },
      // });
      
      toast.success("Project updated successfully!");
      onUpdate(editedProject);
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update project");
      console.error("Error updating project:", error);
    }
  };

  const handleSendNote = () => {
    if (!note.trim()) return;
    toast.success("Note sent successfully!");
    setNote('');
  };

  const handleUpload = () => {
    if (files.length === 0) {
      toast.error("Please select files to upload");
      return;
    }
    
    // Simulate upload
    toast.success(`${files.length} file(s) uploaded successfully!`);
    setFiles([]);
  };

  const handleViewPdf = (pdfId) => {
    toast.info(`Viewing PDF ${pdfId}`);
    // Implement PDF viewer logic
  };

  const openFileSelector = () => {
    fileInputRef.current.click();
  };

  const openInvoice = () => {
    toast.info("Opening invoice...");
    // Implement invoice viewing logic
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-3xl overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium flex items-center">
            {isEditing ? <Edit size={18} className="mr-2" /> : <Eye size={18} className="mr-2" />}
            {isEditing ? 'Edit Project' : 'View Project'}
          </h3>
          <div className="flex items-center">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="mr-3 text-blue-600 hover:text-blue-800 flex items-center"
              >
                <Edit size={16} className="mr-1" /> Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Project ID</label>
              {isEditing ? (
                <input
                  type="text"
                  name="project_id"
                  value={editedProject.project_id || ''}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  disabled
                />
              ) : (
                <p className="p-2 border border-gray-200 rounded bg-gray-50">{project.project_id || 'N/A'}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Project Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="project_name"
                  value={editedProject.project_name || ''}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              ) : (
                <p className="p-2 border border-gray-200 rounded bg-gray-50">{project.project_name || 'N/A'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Domain</label>
              {isEditing ? (
                <input
                  type="text"
                  name="domain"
                  value={editedProject.domain || ''}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              ) : (
                <p className="p-2 border border-gray-200 rounded bg-gray-50">{project.domain || 'N/A'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Delivery Date</label>
              {isEditing ? (
                <input
                  type="date"
                  name="delivery_date"
                  value={editedProject.delivery_date ? new Date(editedProject.delivery_date).toISOString().split('T')[0] : ''}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              ) : (
                <p className="p-2 border border-gray-200 rounded bg-gray-50">
                  {project.delivery_date ? new Date(project.delivery_date).toLocaleDateString() : 'N/A'}
                </p>
              )}
            </div>
          </div>

          {/* PDFs Section */}
          <div className="mb-6">
            <h4 className="text-md font-medium mb-2">Project Documents</h4>
            <div className="border border-gray-200 rounded p-4">
              {pdfs.length > 0 ? (
                <ul className="space-y-2">
                  {pdfs.map((pdf) => (
                    <li key={pdf.id} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <FileText size={16} className="mr-2 text-blue-600" />
                        <span>{pdf.name}</span>
                      </div>
                      <button
                        onClick={() => handleViewPdf(pdf.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No documents available</p>
              )}
              
              {isEditing && (
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1">Upload New Document</label>
                  <div className="flex">
                    <input
                      type="file"
                      accept=".pdf"
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                    <button
                      className="ml-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      <Upload size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Student Details Section */}
          <div className="mb-6">
            {!showStudentDetails ? (
              <button
                onClick={() => setShowStudentDetails(true)}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <User size={16} className="mr-2" />
                View Student Details
              </button>
            ) : (
              <div className="border border-gray-200 rounded p-4">
                <h4 className="text-md font-medium mb-3">Student Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Student Name</label>
                    <p className="p-2 border border-gray-200 rounded bg-gray-50">
                      {project.student_name || 'John Doe'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Student ID</label>
                    <p className="p-2 border border-gray-200 rounded bg-gray-50">
                      {project.student_id || 'STU12345'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <p className="p-2 border border-gray-200 rounded bg-gray-50">
                      {project.student_email || 'student@example.com'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <p className="p-2 border border-gray-200 rounded bg-gray-50">
                      {project.student_phone || '+91 9876543210'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* File Upload Section */}
          <div className="mb-6">
            <h4 className="text-md font-medium mb-2">Upload Files</h4>
            <div className="border border-gray-200 rounded p-4">
              <div className="mb-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  multiple
                />
                <button
                  onClick={openFileSelector}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-blue-500 transition-colors"
                >
                  <Paperclip size={24} className="text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Click to upload files (ZIP, PDF, etc)</p>
                </button>
              </div>
              
              {files.length > 0 && (
                <div className="mb-3">
                  <h5 className="text-sm font-medium mb-2">Selected Files:</h5>
                  <ul className="space-y-1">
                    {files.map((file, index) => (
                      <li key={index} className="text-sm">{file.name}</li>
                    ))}
                  </ul>
                  <button
                    onClick={handleUpload}
                    className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
                  >
                    <Upload size={16} className="mr-2" />
                    Upload Files
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Notes Section */}
          <div className="mb-6">
            <h4 className="text-md font-medium mb-2">Add Note</h4>
            <div className="border border-gray-200 rounded p-4">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Type a message to the student..."
                className="w-full p-3 border border-gray-300 rounded-lg mb-3 min-h-24"
              ></textarea>
              <button
                onClick={handleSendNote}
                disabled={!note.trim()}
                className={`flex items-center justify-center px-4 py-2 rounded ${
                  note.trim() ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Send size={16} className="mr-2" />
                Send Message
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center p-4 border-t bg-gray-50">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Changes
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
              >
                Close
              </button>
              <button
                onClick={openInvoice}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
              >
                <Download size={16} className="mr-2" />
                Open Invoice
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Project Approval Modal
export const ProjectApprovalModal = ({ project, onClose, onApprove }) => {
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!price || isNaN(price) || Number(price) <= 0) {
      setError('Please enter a valid price amount');
      return;
    }
    onApprove(project.project_id, price);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium flex items-center">
            <Check size={18} className="mr-2 text-green-600" />
            Approve Project
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-6">
          <p className="mb-4">You are about to approve the following project:</p>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <p><span className="font-medium">Project ID:</span> {project.project_id}</p>
            <p><span className="font-medium">Project Name:</span> {project.project_name}</p>
            <p><span className="font-medium">Domain:</span> {project.domain}</p>
          </div>
          
          <div className="mb-4">
            <label htmlFor="price" className="block text-sm font-medium mb-1">
              Enter Price Amount (₹)
            </label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                setError('');
              }}
              min="1"
              step="0.01"
              className={`w-full p-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter amount"
            />
            {error && <p className="mt-1 text-red-500 text-sm">{error}</p>}
          </div>
          
          <p className="text-sm text-gray-500">
            Once approved, the student will be notified about the project acceptance and payment details.
          </p>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Approve Project
          </button>
        </div>
      </div>
    </div>
  );
};

// Project Rejection Modal
export const ProjectRejectionModal = ({ project, onClose, onReject }) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!reason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }
    onReject(project.project_id, reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium flex items-center">
            <AlertCircle size={18} className="mr-2 text-yellow-600" />
            Reject Project
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-6">
          <p className="mb-4">You are about to reject the following project:</p>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <p><span className="font-medium">Project ID:</span> {project.project_id}</p>
            <p><span className="font-medium">Project Name:</span> {project.project_name}</p>
            <p><span className="font-medium">Domain:</span> {project.domain}</p>
          </div>
          
          <div className="mb-4">
            <label htmlFor="reason" className="block text-sm font-medium mb-1">
              Reason for Rejection
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError('');
              }}
              rows="4"
              className={`w-full p-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Please provide a detailed reason for rejecting this project"
            ></textarea>
            {error && <p className="mt-1 text-red-500 text-sm">{error}</p>}
          </div>
          
          <p className="text-sm text-gray-500">
            The student will be notified about the rejection with the reason you provide.
          </p>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-yellow-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            Reject Project
          </button>
        </div>
      </div>
    </div>
  );
};

// Delete Confirmation Modal
export const DeleteConfirmationModal = ({ item, itemType, onClose, onDelete, warning }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium flex items-center">
            <AlertCircle size={18} className="mr-2 text-red-600" />
            Confirm Deletion
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-6">
          <p className="mb-4">Are you sure you want to delete this {itemType}?</p>
          <div className="bg-gray-50 p-4 rounded-lg">
            {itemType === 'project' && (
              <>
                <p><span className="font-medium">ID:</span> {item.project_id}</p>
                <p><span className="font-medium">Name:</span> {item.project_name}</p>
                <p><span className="font-medium">Status:</span> {item.project_status}</p>
              </>
            )}
            {itemType === 'report' && (
              <>
                <p><span className="font-medium">ID:</span> {item.report_id}</p>
                <p><span className="font-medium">Title:</span> {item.title}</p>
                <p><span className="font-medium">Status:</span> {item.report_status}</p>
              </>
            )}
          </div>
          
          {warning && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 flex items-start">
                <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                <span>{warning}</span>
              </p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onDelete(itemType === 'project' ? item.project_id : item.report_id);
              onClose();
            }}
            className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};



// Status Badge Component
//Reports page components


const StatusBadge = ({ status }) => {
    let bgColor = 'bg-gray-100';
    let textColor = 'text-gray-800';
    
    switch (status) {
      case 'approved':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        break;
      case 'completed':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
      case 'open':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
      case 'pending':
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        break;
      case 'partially_paid':
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        break;
      case 'closed':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        break;
      case 'rejected':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        break;
      default:
        break;
    }
    
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor} ${textColor}`}>
        {status}
      </span>
    );
  };

// Report View Modal Component
export const ReportViewModal = ({ report, onClose, onReply }) => {
    const [reply, setReply] = useState('');
    const [files, setFiles] = useState(
      report.files || [
        { id: 1, name: 'Issue Screenshot.jpg' },
        { id: 2, name: 'Error Log.txt' }
      ]
    );
  
    const handleReply = () => {
      if (!reply.trim()) {
        toast.error("Please enter a reply");
        return;
      }
      
      onReply(report.report_id, reply);
      setReply('');
      toast.success("Reply sent successfully!");
    };
  
    const handleViewFile = (fileId) => {
      toast.info(`Viewing file ${fileId}`);
      // Implement file viewing logic
    };
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-medium flex items-center">
              <Eye size={18} className="mr-2" />
              View Report
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
  
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
            <div className="grid grid-cols-1 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Report ID</label>
                <p className="p-2 border border-gray-200 rounded bg-gray-50">{report.report_id || 'N/A'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <p className="p-2 border border-gray-200 rounded bg-gray-50">{report.title || 'N/A'}</p>
              </div>
  
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <div className="p-2 border border-gray-200 rounded bg-gray-50">
                  <StatusBadge status={report.report_status || "No Status"} />
                </div>
              </div>
  
              <div>
                <label className="block text-sm font-medium mb-1">Date Created</label>
                <p className="p-2 border border-gray-200 rounded bg-gray-50">
                  {report.created_at ? new Date(report.created_at).toLocaleString() : 'N/A'}
                </p>
              </div>
  
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <div className="p-3 border border-gray-200 rounded bg-gray-50 min-h-24 whitespace-pre-wrap">
                  {report.description || 'No description provided.'}
                </div>
              </div>
            </div>
  
            {/* Files Section */}
            <div className="mb-6">
              <h4 className="text-md font-medium mb-2">Attached Files</h4>
              <div className="border border-gray-200 rounded p-4">
                {files.length > 0 ? (
                  <ul className="space-y-2">
                    {files.map((file) => (
                      <li key={file.id} className="flex justify-between items-center">
                        <div className="flex items-center">
                          <FileText size={16} className="mr-2 text-blue-600" />
                          <span>{file.name}</span>
                        </div>
                        <button
                          onClick={() => handleViewFile(file.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Eye size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">No files attached</p>
                )}
              </div>
            </div>
  
            {/* Reply Section */}
            <div className="mb-4">
              <h4 className="text-md font-medium mb-2">Reply</h4>
              <div className="border border-gray-200 rounded p-4">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type your reply here..."
                  className="w-full p-3 border border-gray-300 rounded-lg mb-3 min-h-24"
                ></textarea>
                <button
                  onClick={handleReply}
                  disabled={!reply.trim()}
                  className={`flex items-center justify-center px-4 py-2 rounded ${
                    reply.trim() ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Send size={16} className="mr-2" />
                  Send Reply
                </button>
              </div>
            </div>
          </div>
  
          <div className="flex justify-end p-4 border-t bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Close Report Confirmation Modal
  export const CloseReportModal = ({ report, onClose, onConfirm }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium flex items-center">
              <Check size={18} className="mr-2 text-blue-600" />
              Close Report
            </h3>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="mb-6">
            <p className="mb-4">Are you sure you want to close this report?</p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><span className="font-medium">Report ID:</span> {report.report_id}</p>
              <p><span className="font-medium">Title:</span> {report.title}</p>
              <p><span className="font-medium">Status:</span> <StatusBadge status={report.report_status} /></p>
            </div>
            
            <p className="mt-4 text-sm text-gray-500">
              Closing this report will mark it as resolved. It can still be viewed but won't appear in active reports.
            </p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm(report.report_id);
                onClose();
              }}
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Confirm Close
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Delete Report Confirmation Modal
  export const DeleteReportModal = ({ report, onClose, onConfirm }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium flex items-center">
              <AlertCircle size={18} className="mr-2 text-red-600" />
              Delete Report
            </h3>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="mb-6">
            <p className="mb-4">Are you sure you want to delete this report?</p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><span className="font-medium">Report ID:</span> {report.report_id}</p>
              <p><span className="font-medium">Title:</span> {report.title}</p>
              <p><span className="font-medium">Status:</span> <StatusBadge status={report.report_status} /></p>
            </div>
            
            <p className="mt-4 text-sm text-red-600 flex items-start">
              <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
              <span>This action cannot be undone. All data associated with this report will be permanently removed.</span>
            </p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm(report.report_id);
                onClose();
              }}
              className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete Report
            </button>
          </div>
        </div>
      </div>
    );
  };

  //Payments dialogs
  export const RefundDialog = ({ isOpen, payment, onClose, onConfirmRefund }) => {
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
        <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-black">Confirm Refund</h3>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-sm font-medium text-gray-500">Project ID:</div>
                <div className="text-sm text-gray-900">{payment.project_code}</div>
                
                <div className="text-sm font-medium text-gray-500">Project Name:</div>
                <div className="text-sm text-gray-900">{payment.project_name}</div>
                
                <div className="text-sm font-medium text-gray-500">Username:</div>
                <div className="text-sm text-gray-900">{payment.username || 'Not available'}</div>
                
                <div className="text-sm font-medium text-gray-500">Date:</div>
                <div className="text-sm text-gray-900">{new Date(payment.created_at).toLocaleDateString('en-GB')}</div>
                
                <div className="text-sm font-medium text-gray-500">Deadline:</div>
                <div className="text-sm text-gray-900">{payment.deadline ? new Date(payment.deadline).toLocaleDateString('en-GB') : 'Not available'}</div>
                
                <div className="text-sm font-medium text-gray-500">Total Payment:</div>
                <div className="text-sm text-gray-900">₹{isNaN(payment.total_amount) ? "0.00" : Number(payment.total_amount).toFixed(2)}</div>
                
                <div className="text-sm font-medium text-gray-500">Payment Paid:</div>
                <div className="text-sm text-gray-900">₹{isNaN(payment.paid_amount) ? "0.00" : Number(payment.paid_amount).toFixed(2)}</div>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button 
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none"
              onClick={() => onConfirmRefund(payment)}
            >
              Confirm Refund
            </button>
          </div>
        </div>
      </div>
    );
  };

export default {
  ProjectViewModal,
  ProjectApprovalModal,
  ProjectRejectionModal,
  DeleteConfirmationModal,
  ReportViewModal,
    CloseReportModal,
    DeleteReportModal,
    RefundDialog

};