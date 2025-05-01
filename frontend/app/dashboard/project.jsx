"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Menu,
  Pencil,
  X,
  Search,
  Filter,
  CircleDollarSign,
  TicketCheck,
  LogOutIcon,
} from "lucide-react";
import ReportIssue from "../report-issue/reportform";
import ProjectDetails from "../project-details/projectform";
import ThemeToggle from "@/components/ThemeToggle";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("projects");
  const [isMobile, setIsMobile] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const local_uri = "http://localhost:8000";
  const [reports, setReports] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newDomain, setNewDomain] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showNewProject, setShowNewProject] = useState(false);
  const [showReportIssue, setShowReportIssue] = useState(false);
  
  const handleLogout = () => {
    localStorage.removeItem("token");

    router.push("/");
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(`${local_uri}/api/projects/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userProjects = response.data.map(project => ({
        id: project.project_id,
        name: project.project_name,
        status: project.project_status,
        domain: project.domain,
        ...project
      }));

      setProjects(userProjects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSection === "payments") {
      fetchPayments();
    }
  }, [activeSection]);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem("token");
  
      const response = await axios.get(`${local_uri}/api/payments/all/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const allPayments = Array.isArray(response.data.payments) ? response.data.payments : [];
      setPayments(allPayments);
      setFilteredPayments(allPayments);
  
    } catch (error) {
      console.error("Error fetching payments:", error);
    }
  };  

  useEffect(() => {
    fetchProjects();
  }, []);
  
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${local_uri}/api/reports/user`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const allReports = Array.isArray(res.data.reports) ? res.data.reports : [];
        setReports(allReports);
        setFilteredTickets(allReports);
      } catch (err) {
        console.error('Failed to fetch reports:', err);
      }
    };
  
    if (activeSection === "reports") {
      fetchReports();
    }
  }, [activeSection]);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleEditClick = (project) => {
    setSelectedProject(project);
    setNewDomain(project.domain);
  };

  const handleDomainChange = (value) => {
    setNewDomain(value);
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${local_uri}/api/projects/change-domain/${selectedProject.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ domain: newDomain }),
      });
  
      if (!res.ok) {
        throw new Error("Failed to update domain");
      }
  
      setProjects(prev =>
        prev.map(p => p.id === selectedProject.id ? { ...p, domain: newDomain } : p)
      );
      setSelectedProject(null);
      toast.success("Domain updated successfully!");
    } catch (error) {
      console.error("Failed to update domain:", error);
      toast.error("Failed to update domain!");
    }
  };  
  
  const changeSection = (section) => {
    setActiveSection(section);
    setShowNewProject(false);
    setShowReportIssue(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Handler for project addition completion
  const handleProjectAdded = () => {
    setShowNewProject(false);
    fetchProjects(); // Refresh projects after adding
    toast.success("Project added successfully!");
  };

 //colors decllaration for status
  const getStatusStyle = (status) => {
    switch(status) {
      case "accepted & payment pending":
        return "bg-blue-500";
      case "payment completed":
        return "bg-green-500";
      case "rejected":
        return "bg-red-500";
      case "approved":
        return "bg-blue-600";
      case "partially_paid":
        return "bg-yellow-500";
      case "pending":
        return "bg-orange-500";
      case "completed":
        return "bg-green-600";
      case "paid":
        return "bg-green-600";
      case "done":
        return "bg-green-600";
      case "open":
        return "bg-green-500";
      case "closed":
        return "bg-orange-500";
      default:
        return "bg-gray-400";
    }
  };

  // Filter projects based on search and status for rendering
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = 
      project.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.domain?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatStatus = (status) => {
    if (status === "partially_paid") return "Partially Paid";
    if (status === "paid") return "Paid";
    if (status === "pending") return "Pending";
    return status;
  };

  const handlePayNow = (projectId) => {
    console.log("Pay now for project", projectId);
  };  

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 w-full">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 shadow transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out md:translate-x-0 md:relative`}
      >
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Dashboard
          </h2>
          {isMobile && (
            <button
              onClick={toggleSidebar}
              className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
            >
              <X size={24} />
            </button>
          )}
        </div>

        <nav className="mt-4">
          {/* Projects Section - No subsections */}
          <div
            className={`mb-1 ${
              activeSection === "projects" ? "bg-blue-50 dark:bg-gray-700" : ""
            }`}
          >
            <button
              onClick={() => changeSection("projects")}
              className={`w-full flex items-center p-3 text-left ${
                activeSection === "projects"
                  ? "text-blue-600 dark:text-blue-400 font-medium border-l-4 border-blue-600 dark:border-blue-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <Filter size={18} className="mr-2" />
              <span>Projects</span>
            </button>
          </div>

          {/* Reports Section - No subsections */}
          <div
            className={`mb-1 ${
              activeSection === "reports" ? "bg-blue-50 dark:bg-gray-700" : ""
            }`}
          >
            <button
              onClick={() => changeSection("reports")}
              className={`w-full flex items-center p-3 text-left ${
                activeSection === "reports"
                  ? "text-blue-600 dark:text-blue-400 font-medium border-l-4 border-blue-600 dark:border-blue-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <TicketCheck size={18} className="mr-2" />
              <span>Reports</span>
            </button>
          </div>

          {/* Payments Section - No subsections */}
          <div
            className={`mb-1 ${
              activeSection === "payments" ? "bg-blue-50 dark:bg-gray-700" : ""
            }`}
          >
            <button
              onClick={() => changeSection("payments")}
              className={`w-full flex items-center p-3 text-left ${
                activeSection === "payments"
                  ? "text-blue-600 dark:text-blue-400 font-medium border-l-4 border-blue-600 dark:border-blue-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <CircleDollarSign size={18} className="mr-2" />
              <span>Payments</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Nav with Hamburger Menu */}
        <div className="bg-white dark:bg-gray-800 shadow p-4 flex items-center justify-between">
          <div className="flex items-center">
            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="mr-4 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
              >
                <Menu size={24} />
              </button>
            )}
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">
              {activeSection === "projects" && "Project Dashboard"}
              {activeSection === "reports" && "Ticket Reports"}
              {activeSection === "payments" && "Payment Management"}
            </h1>
          </div>
          <span className="relative -top-9"><ThemeToggle/></span>
          <Button onClick={handleLogout}><LogOutIcon/>Logout</Button>
        </div>

        {/* Projects Section */}
        {activeSection === "projects" && (
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
              <button
                onClick={() => setShowNewProject(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add New Project
              </button>

              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                {/* Search Input */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <Search
                    size={18}
                    className="absolute left-3 top-2.5 text-gray-400"
                  />
                </div>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Status</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {showNewProject ? (
              <ProjectDetails onProjectAdded={handleProjectAdded} />
            ) : loading ? (
              <div className="flex justify-center items-center h-60">
                <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500 border-solid"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => (
                    <div
                      key={project.project_id}
                      className="relative p-4 shadow-lg rounded-lg bg-white dark:bg-gray-800"
                    >
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {project.name}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        Domain: {project.domain}
                      </p>
                      <div className="flex items-center mb-1">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusStyle(project.status)}`}
                        >
                          {project.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900 dark:text-gray-400 mb-1">
                        Requested on: {new Date(project.created_at).toISOString().split('T')[0]}
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-400 mb-2">
                        Delivery by: {new Date(project.delivery_date).toISOString().split('T')[0]}
                      </p>
                      {/* Edit Icon */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            onClick={() => handleEditClick(project)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-blue-600"
                          >
                            <Pencil size={18} />
                          </button>
                        </AlertDialogTrigger>
                        {selectedProject?.id === project.id && (
                          <div className="dark:bg-gray-800">
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Edit Domain</AlertDialogTitle>
                                <AlertDialogDescription>
                                  You can update the domain for{" "}
                                  <strong>{selectedProject.name}</strong>.
                                </AlertDialogDescription>
                              </AlertDialogHeader>

                              <div className="mt-4 space-y-2">
                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                  <strong>Project Name:</strong>{" "}
                                  {selectedProject.name}
                                </div>

                                <Select
                                  value={newDomain}
                                  onValueChange={handleDomainChange}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a domain" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Artificial Intelligence">
                                      Artificial Intelligence
                                    </SelectItem>
                                    <SelectItem value="Web Development">
                                      Web Development
                                    </SelectItem>
                                    <SelectItem value="Blockchain">
                                      Blockchain
                                    </SelectItem>
                                    <SelectItem value="Full Stack">
                                      Full Stack
                                    </SelectItem>
                                    <SelectItem value="Data Science">
                                      Data Science
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <AlertDialogFooter>
                                <AlertDialogCancel 
                                  onClick={() => setSelectedProject(null)}
                                >
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction onClick={handleSave}>
                                  Save
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </div>
                        )}
                      </AlertDialog>
                        {project.project_status === 'approved' && project.payment_status !== 'paid' && (
                        <div className="absolute bottom-4 right-4">
                          <button
                            onClick={() => handlePayNow(project.project_id)}
                            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-green-700 transition cursor-pointer"
                          >
                            Pay Now
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-10 text-gray-500 dark:text-gray-400">
                    No projects found matching your criteria
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Reports Section */}
        {activeSection === "reports" && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Ticket Reports</h2>
              <button
                onClick={() => setShowReportIssue(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Report Issue
              </button>
            </div>

            {showReportIssue ? (
              <ReportIssue 
              onSuccess={(newReport) => {
                if (!newReport) return;
                setShowReportIssue(false);
                setReports((prev) => [newReport, ...prev]);
                setFilteredTickets((prev) => [newReport, ...prev]);
              }}              
              />
            ) : (
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Reported On
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredTickets.length > 0 ? (
                        filteredTickets.map((ticket) => (
                          <tr key={ticket.report_id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {ticket.report_id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {ticket.title}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                              {new Date(ticket.created_at).toISOString().split('T')[0]}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="flex items-center">
                                <span
                                  className={`w-2 h-2 mr-2 rounded-full ${getStatusStyle(ticket.report_status)}`}
                                ></span>
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                  {ticket.report_status}
                                </span>
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                            No tickets found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Payments Section */}
        {activeSection === "payments" && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Payment Management</h2>
            </div>

            {/* Payments Table */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Total Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Paid Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Pending Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredPayments.length > 0 ? (
                    filteredPayments.map((payment) => (
                      <tr key={payment.payment_id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {payment.payment_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {payment.project_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                          ₹{payment.total_amount?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                          ₹{payment.paid_amount?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                          ₹{payment.pending_amount?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="flex items-center">
                            <span
                            className={`w-2 h-2 mr-2 rounded-full ${
                            getStatusStyle(
                              payment.payment_status
                            )
                          }`}>
                            </span>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {payment.payment_status === "partially_paid"
                                ? "Partially Paid"
                                : payment.payment_status.charAt(0).toUpperCase() + payment.payment_status.slice(1)}
                            </span>
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                        No payments found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
}