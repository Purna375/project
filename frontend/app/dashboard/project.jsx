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
  Eye,
  FileText,
  Download,
} from "lucide-react";
import ReportIssue from "../report-issue/reportform";
import ProjectDetails from "../project-details/projectform";
import ThemeToggle from "@/components/ThemeToggle";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [projectStatusFilter, setProjectStatusFilter] = useState("All");
const [reportStatusFilter, setReportStatusFilter] = useState("all");
  const [showNewProject, setShowNewProject] = useState(false);
  const [showReportIssue, setShowReportIssue] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

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

      const userProjects = response.data.map((project) => ({
        id: project.project_id,
        name: project.project_name,
        status: project.project_status,
        domain: project.domain,
        ...project,
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

      const allPayments = Array.isArray(response.data.payments)
        ? response.data.payments
        : [];
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
            Authorization: `Bearer ${token}`,
          },
        });
        const allReports = Array.isArray(res.data.reports)
          ? res.data.reports
          : [];
        setReports(allReports);
        setFilteredTickets(allReports);
      } catch (err) {
        console.error("Failed to fetch reports:", err);
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
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${local_uri}/api/projects/change-domain/${selectedProject.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ domain: newDomain }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update domain");
      }

      setProjects((prev) =>
        prev.map((p) =>
          p.id === selectedProject.id ? { ...p, domain: newDomain } : p
        )
      );
      setSelectedProject(null);
      setSelectedProjectForDetails(null);
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
    
    // Reset appropriate filters based on the section
    if (section === "projects") {
      setProjectStatusFilter("All");
    } else if (section === "reports") {
      setReportStatusFilter("all");
    }
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
    switch (status) {
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

      const matchesStatus = projectStatusFilter === "All" || project.status === projectStatusFilter;

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

  const handleViewPayment = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentDialog(true);
  };
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // Default to show all tickets
  const [selectedProjectForDetails, setSelectedProjectForDetails] =
    useState(null);

  // For file downloads
  const handleFileDownload = (fileUrl) => {
    window.open(fileUrl, "_blank");
  };

  // For downloading all files as ZIP
  const handleDownloadAllFiles = (projectId) => {
    // Implement API call to get the ZIP file
    console.log("Downloading all files for project:", projectId);
  };

  // For invoice generation
  const handleViewInvoice = async (project_code) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.get(
        `${local_uri}/api/admin/invoice/${project_code}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const invoiceUrl = response.data.invoiceUrl;

      if (invoiceUrl) {
        window.open(invoiceUrl, "_blank");
      } else {
        toast.info("No invoice available");
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        toast.info("No invoice available for this project");
      } else {
        toast.error("Failed to open invoice");
        console.error("Invoice error:", error);
      }
    }
  };

  // Filter tickets based on search term and status filter
  useEffect(() => {
    let filtered = [...reports];

    // Apply status filter
    if (reportStatusFilter !== 'all') {
      filtered = filtered.filter(ticket => 
        ticket.report_status.toLowerCase() === reportStatusFilter.toLowerCase()
      );
    }

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (ticket) =>
          ticket.title.toLowerCase().includes(term) ||
          ticket.report_id.toString().includes(term)
      );
    }

    setFilteredTickets(filtered);
  }, [reports, searchTerm, reportStatusFilter]);

  // Function to handle viewing a ticket
  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
  };

  const handleViewFile = (file) => {
    console.log("Viewing file:", file);
  };

  const projectFileUrl = selectedProjectForDetails?.project_file_url;

  const files = projectFileUrl
    ? [
        {
          filename: projectFileUrl.split(/[/\\]/).pop(),
          url: `${local_uri}/${projectFileUrl.replace(/\\/g, "/")}`,
        },
      ]
    : [];
  
    const [domains, setDomains] = useState([]);

  // Fetch data from the backend when the component mounts
  useEffect(() => {
    const fetchDomains = async () => {
      // Use mock data instead of fetching from an actual API
      const mockData = [
        { domain_id: 1, domain_name: "Domain 1", pdf_url: "/path/to/pdf1.pdf" },
        { domain_id: 2, domain_name: "Domain 2", pdf_url: "/path/to/pdf2.pdf" },
        { domain_id: 3, domain_name: "Domain 3", pdf_url: "/path/to/pdf3.pdf" }
      ];
      setDomains(mockData); // Set the mock data into state
    };

    fetchDomains();
  }, []);

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

          <div
            className={`mb-1 ${
              activeSection === "domain" ? "bg-blue-50 dark:bg-gray-700" : ""
            }`}
          >
            <button
              onClick={() => changeSection("domain")}
              className={`w-full flex items-center p-3 text-left ${
                activeSection === "domain"
                  ? "text-blue-600 dark:text-blue-400 font-medium border-l-4 border-blue-600 dark:border-blue-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <Filter size={18} className="mr-2" />
              <span>Domains</span>
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
              {activeSection === "domain" && "Domain PDF's"}
            </h1>
          </div>
          <span className="">
            <ThemeToggle />
          </span>
          <Button onClick={handleLogout}>
            <LogOutIcon />
            Logout
          </Button>
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
                <Select value={projectStatusFilter} onValueChange={setProjectStatusFilter}>
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
                      className="relative p-4 shadow-lg rounded-lg bg-white dark:bg-gray-800 cursor-pointer hover:shadow-xl transition-shadow"
                      onClick={() => setSelectedProjectForDetails(project)}
                    >
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {project.name}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        Domain: {project.domain}
                      </p>
                      <div className="flex items-center mb-1">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusStyle(
                            project.status
                          )}`}
                        >
                          {project.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900 dark:text-gray-400 mb-1">
                        Requested on:{" "}
                        {
                          new Date(project.created_at)
                            .toISOString()
                            .split("T")[0]
                        }
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-400 mb-2">
                        Delivery by:{" "}
                        {
                          new Date(project.delivery_date)
                            .toISOString()
                            .split("T")[0]
                        }
                      </p>

                      {/* Edit Icon - Prevent click propagation to not trigger details popup */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(project);
                            }}
                            className="absolute top-2 right-2 text-gray-500 hover:text-blue-600"
                          >
                            <Pencil size={18} />
                          </button>
                        </AlertDialogTrigger>
                        {selectedProject?.id === project.id && (
                          <div className="dark:bg-gray-900">
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

                      {project.project_status === "approved" &&
                        project.payment_status !== "paid" && (
                          <div className="absolute bottom-4 right-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePayNow(project.project_id);
                              }}
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

            {/* Project Details Dialog */}
            <Dialog
              open={!!selectedProjectForDetails}
              onOpenChange={(isOpen) => {
                if (!isOpen) setSelectedProjectForDetails(null);
              }}
            >
              <DialogContent className="sm:max-w-4xl dark:bg-gray-900">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">
                    Project Details
                  </DialogTitle>
                  <DialogDescription>
                    Complete information about the selected project
                  </DialogDescription>
                </DialogHeader>

                {selectedProjectForDetails && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 overflow-auto max-h-[400px] p-2 border border-gray-200 rounded">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Project Code
                        </h3>
                        <p className="text-base font-semibold">
                          {selectedProjectForDetails.project_code}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Project Name
                        </h3>
                        <p className="text-base font-semibold">
                          {selectedProjectForDetails.project_name}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Domain
                        </h3>
                        <p className="text-base">
                          {selectedProjectForDetails.domain}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Delivery Date
                        </h3>
                        <p className="text-base">
                          {new Date(
                            selectedProjectForDetails.delivery_date
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Project Status
                        </h3>
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusStyle(
                            selectedProjectForDetails.status
                          )}`}
                        >
                          {selectedProjectForDetails.status}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Reference Documents
                        </h3>
                        {selectedProjectForDetails.reference_pdf_url ? (
                          <a
                            href={`${local_uri}/${selectedProjectForDetails.reference_pdf_url.replace(
                              "\\",
                              "/"
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center"
                          >
                            <FileText size={16} className="mr-1" />
                            View Document
                          </a>
                        ) : (
                          <p className="text-base">
                            No reference documents available
                          </p>
                        )}
                      </div>
                      <div className="mt-4">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Admin Note
                        </h3>

                        {selectedProjectForDetails.admin_notes ? (
                          <div className="bg-blue-50 text-black px-4 py-3 rounded-xl shadow-sm max-w-xl border border-blue-200">
                            <p className="text-sm leading-relaxed">
                              {selectedProjectForDetails.admin_notes}
                            </p>
                          </div>
                        ) : (
                          <p className="text-base text-gray-500 italic">
                            No notes are available
                          </p>
                        )}
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Project Files
                        </h3>
                        {files.length > 0 ? (
                          <div className="space-y-2">
                            {files.map((file, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between"
                              >
                                <span>{file.filename}</span>
                              </div>
                            ))}
                            <a
                              href={files[0].url}
                              download
                              className="mt-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center"
                            >
                              <Download size={14} className="mr-1" />
                              Download ZIP
                            </a>
                          </div>
                        ) : (
                          <p className="text-base">No files available</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Description
                      </h3>
                      <p className="text-base">
                        {selectedProjectForDetails.description ||
                          "No description available"}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                  <div>
                    {selectedProjectForDetails &&
                      selectedProjectForDetails.project_status === "approved" &&
                      selectedProjectForDetails.payment_status !== "paid" && (
                        <button
                          onClick={() =>
                            handlePayNow(selectedProjectForDetails.project_id)
                          }
                          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition"
                        >
                          Pay Now
                        </button>
                      )}
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() =>
                        handleViewInvoice(selectedProjectForDetails?.project_id)
                      }
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center"
                    >
                      <FileText size={16} className="mr-2" />
                      View Invoice
                    </button>

                    <DialogClose asChild>
                      <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition">
                        Close
                      </button>
                    </DialogClose>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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
              <>
                <div className="mb-4 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                  {/* Search input */}
                  <div className="relative flex-grow">
                    <input
                      type="text"
                      placeholder="Search tickets..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 dark:text-gray-400">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        ></path>
                      </svg>
                    </span>
                  </div>

                  {/* Status filter */}
                  <select
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={reportStatusFilter}
onChange={(e) => setReportStatusFilter(e.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

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
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Action
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
                                {
                                  new Date(ticket.created_at)
                                    .toISOString()
                                    .split("T")[0]
                                }
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="flex items-center">
                                  <span
                                    className={`w-2 h-2 mr-2 rounded-full ${getStatusStyle(
                                      ticket.report_status
                                    )}`}
                                  ></span>
                                  <span className="text-sm text-gray-700 dark:text-gray-300">
                                    {ticket.report_status}
                                  </span>
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <button
                                  onClick={() => handleViewTicket(ticket)}
                                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="5"
                              className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                            >
                              No tickets found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Ticket Detail Dialog */}
                {selectedTicket && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-screen overflow-y-auto">
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-6">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Ticket Details
                          </h3>
                          <button
                            onClick={() => setSelectedTicket(null)}
                            className="text-gray-400 hover:text-gray-500 focus:outline-none"
                          >
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                              ></path>
                            </svg>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Report ID
                            </p>
                            <p className="text-base text-gray-900 dark:text-white">
                              {selectedTicket.report_id}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Status
                            </p>
                            <div className="flex items-center">
                              <span
                                className={`w-2 h-2 mr-2 rounded-full ${getStatusStyle(
                                  selectedTicket.report_status
                                )}`}
                              ></span>
                              <span className="text-base text-gray-900 dark:text-white">
                                {selectedTicket.report_status}
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Title
                            </p>
                            <p className="text-base text-gray-900 dark:text-white">
                              {selectedTicket.title}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Date Created
                            </p>
                            <p className="text-base text-gray-900 dark:text-white">
                              {new Date(
                                selectedTicket.created_at
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="mb-6">
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                            Description
                          </p>
                          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                            {selectedTicket.description}
                          </div>
                        </div>

                        {/* Files Section */}
                        <div className="mb-6">
                          <h4 className="text-md font-medium mb-2">
                            Attached File
                          </h4>
                          <div className="border border-gray-200 rounded p-4">
                            {selectedTicket.pdf_url ? (
                              <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                  <FileText
                                    size={16}
                                    className="mr-2 text-blue-600"
                                  />
                                  <span>
                                    {selectedTicket.pdf_url.split("/").pop()}
                                  </span>
                                </div>
                                <a
                                  href={`${local_uri}${selectedTicket.pdf_url.replace(
                                    "\\",
                                    "/"
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <Eye size={16} />
                                </a>
                              </div>
                            ) : (
                              <p className="text-gray-500 text-sm">
                                No file attached
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                            Replies
                          </p>
                          {selectedTicket.report_note ? (
                            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white italic">
                              <p className="text-gray-900 dark:text-white">
                                {selectedTicket.report_note}
                              </p>
                            </div>
                          ) : (
                            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white text-center italic">
                              Admin is analyzing your report
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Action
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
                              className={`w-2 h-2 mr-2 rounded-full ${getStatusStyle(
                                payment.payment_status
                              )}`}
                            ></span>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {payment.payment_status === "partially_paid"
                                ? "Partially Paid"
                                : payment.payment_status
                                    .charAt(0)
                                    .toUpperCase() +
                                  payment.payment_status.slice(1)}
                            </span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleViewPayment(payment)}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs font-medium flex items-center"
                          >
                            <Eye size={12} className="mr-1" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="8"
                        className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                      >
                        No payments found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {showPaymentDialog && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl overflow-hidden">
                  <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
                    <h3 className="text-lg font-medium">Payment Details</h3>
                    <button
                      onClick={() => setShowPaymentDialog(false)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      ×
                    </button>
                  </div>
                  <div className="p-6">
                    <div className="mb-4">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="text-lg font-semibold">
                            {selectedPayment.project_name}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Payment ID: {selectedPayment.payment_id}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <span
                            className={`w-3 h-3 mr-2 rounded-full ${getStatusStyle(
                              selectedPayment.payment_status
                            )}`}
                          ></span>
                          <span className="text-sm">
                            {selectedPayment.payment_status === "partially_paid"
                              ? "Partially Paid"
                              : selectedPayment.payment_status
                                  .charAt(0)
                                  .toUpperCase() +
                                selectedPayment.payment_status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Date:{" "}
                        {new Date(
                          selectedPayment.created_at
                        ).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Total Amount
                        </p>
                        <p className="text-lg font-semibold">
                          ₹{selectedPayment.total_amount?.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Paid Amount
                        </p>
                        <p className="text-lg font-semibold text-green-600">
                          ₹{selectedPayment.paid_amount?.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Pending Amount
                        </p>
                        <p className="text-lg font-semibold text-red-600">
                          ₹{selectedPayment.pending_amount?.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {selectedPayment.payment_history &&
                      selectedPayment.payment_history.length > 0 && (
                        <div className="mb-6">
                          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Payment History
                          </h5>
                          <div className="bg-gray-50 dark:bg-gray-700 rounded overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                              <thead className="bg-gray-100 dark:bg-gray-600">
                                <tr>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                                    Date
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                                    Amount
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                                    Method
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                {selectedPayment.payment_history.map(
                                  (payment, index) => (
                                    <tr key={index}>
                                      <td className="px-4 py-2 text-sm">
                                        {new Date(
                                          payment.date
                                        ).toLocaleDateString()}
                                      </td>
                                      <td className="px-4 py-2 text-sm">
                                        ₹{payment.amount.toLocaleString()}
                                      </td>
                                      <td className="px-4 py-2 text-sm">
                                        {payment.method}
                                      </td>
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                    {selectedPayment.notes && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Notes
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                          {selectedPayment.notes}
                        </p>
                      </div>
                    )}

                    {selectedPayment.files &&
                      selectedPayment.files.length > 0 && (
                        <div className="mt-6">
                          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Attached Files
                          </h5>
                          <ul className="space-y-2">
                            {selectedPayment.files.map((file, index) => (
                              <li key={index} className="flex items-center">
                                <Eye size={16} className="text-blue-500 mr-2" />
                                <span className="text-sm text-blue-500 hover:underline cursor-pointer">
                                  {file}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 flex justify-end">
                    <button
                      onClick={() => setShowPaymentDialog(false)}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}


          </div>
        )}
        {activeSection === "domain" && (
  <div className="p-6">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-lg font-semibold">Domains</h2>
    </div>
    <div className="grid grid-cols-3 gap-6">
      {domains.map((domain) => (
        <div key={domain.domain_id} className="bg-white shadow-md rounded-lg p-4">
          <h3 className="text-xl font-semibold mb-4">{domain.domain_name}</h3>
          <a
            href={domain.pdf_url}
            download
            className="inline-block bg-blue-500 text-white py-2 px-4 rounded-lg text-center"
          >
            Download PDF
          </a>
        </div>
      ))}
    </div>
  </div>
)}

      </div>
      <ToastContainer />
    </div>
  );
}
