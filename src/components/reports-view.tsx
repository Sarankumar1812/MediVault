// components/reports-view.tsx
"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  Search,
  FileText,
  Download,
  Eye,
  Calendar,
  X,
  Plus,
  AlertCircle,
  Filter,
  Trash2,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ReportModal } from "./report-modal";

interface Report {
  id: number;
  title: string;
  type: string;
  category: string;
  date: Date;
  uploadDate: Date;
  status: "Normal" | "Abnormal" | "Critical" | "Pending";
  vitals: string[];
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  notes: string;
  extractedText: string;
  patientName: string;
  publicId: string;
}

export function ReportsView() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);

  // Use refs for debouncing
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const filterTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const categories = useMemo(
    () => ["All", "Blood Test", "Radiology", "Cardiac", "Imaging", "Other"],
    []
  );
  const statuses = useMemo(
    () => ["All", "Normal", "Abnormal", "Critical", "Pending"],
    []
  );

  // Main fetch function
  const fetchReports = useCallback(
    async (search?: string, category?: string, status?: string) => {
      try {
        setIsRefreshing(true);
        setError("");

        const token = localStorage.getItem("healthwallet-token");
        if (!token) {
          router.push("/login");
          return;
        }

        const params = new URLSearchParams();
        const finalCategory =
          category !== undefined ? category : selectedCategory;
        const finalStatus = status !== undefined ? status : selectedStatus;
        const finalSearch = search !== undefined ? search : searchQuery;

        if (finalCategory !== "All") params.append("category", finalCategory);
        if (finalStatus !== "All") params.append("status", finalStatus);
        if (finalSearch) params.append("search", finalSearch);

        console.log("Fetching reports with params:", params.toString());

        const response = await fetch(`/api/reports?${params}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
          },
          cache: "no-store",
        });

        if (response.status === 401) {
          localStorage.removeItem("healthwallet-token");
          router.push("/login");
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch reports");
        }

        const data = await response.json();
        console.log("Fetched reports:", data.length);

        const formattedReports = data.map(
          (report: any): Report => ({
            id: report.id || 0,
            title: report.title || "Untitled Report",
            type: report.type || "General",
            category: report.category || "Other",
            date: report.date ? new Date(report.date) : new Date(),
            uploadDate: report.uploadDate
              ? new Date(report.uploadDate)
              : new Date(),
            status:
              (report.status as
                | "Normal"
                | "Abnormal"
                | "Critical"
                | "Pending") || "Pending",
            vitals: report.vitals || [],
            fileUrl: report.fileUrl || "",
            fileName: report.fileName || "unknown",
            fileType: report.fileType || "application/octet-stream",
            fileSize: report.fileSize || 0,
            notes: report.notes || "",
            extractedText: report.extractedText || "",
            patientName: report.patientName || "User",
            publicId: report.publicId || "",
          })
        );

        setReports(formattedReports);
      } catch (error: any) {
        console.error("Fetch reports error:", error);
        setError(error.message || "Failed to load reports. Please try again.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [router, selectedCategory, selectedStatus, searchQuery]
  );

  // Initial fetch on mount
  useEffect(() => {
    fetchReports();
  }, []);

  // Debounced search handler
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);

      // Clear existing timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Set new timeout for debouncing
      searchTimeoutRef.current = setTimeout(() => {
        fetchReports(value);
      }, 500); // Increased debounce time for better UX
    },
    [fetchReports]
  );

  // Debounced filter handlers
  const handleCategoryChange = useCallback(
    (value: string) => {
      setSelectedCategory(value);

      if (filterTimeoutRef.current) {
        clearTimeout(filterTimeoutRef.current);
      }

      filterTimeoutRef.current = setTimeout(() => {
        fetchReports(undefined, value);
      }, 300);
    },
    [fetchReports]
  );

  const handleStatusChange = useCallback(
    (value: string) => {
      setSelectedStatus(value);

      if (filterTimeoutRef.current) {
        clearTimeout(filterTimeoutRef.current);
      }

      filterTimeoutRef.current = setTimeout(() => {
        fetchReports(undefined, undefined, value);
      }, 300);
    },
    [fetchReports]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedStatus("All");

    // Clear timeouts
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (filterTimeoutRef.current) clearTimeout(filterTimeoutRef.current);

    // Fetch with cleared filters
    fetchReports("", "All", "All");
  }, [fetchReports]);

  // Manual refresh
  const handleRefresh = useCallback(() => {
    fetchReports();
  }, [fetchReports]);

  const handleUploadReport = useCallback(() => {
    router.push("/reports/upload");
  }, [router]);

  const handleViewReport = useCallback((report: Report) => {
    setSelectedReport(report);
    setShowReportModal(true);
  }, []);

  const handleDownloadReport = useCallback(
    async (reportId: number, fileName?: string, fileUrl?: string) => {
      if (!fileUrl) {
        alert("No file available for download");
        return;
      }

      try {
        const a = document.createElement("a");
        a.href = fileUrl;
        a.download = fileName || `report-${reportId}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (error) {
        console.error("Download error:", error);
        alert("Failed to download file. Please try again.");
      }
    },
    []
  );

  const handleDeleteReport = useCallback(
    async (reportId: number) => {
      if (
        !confirm(
          "Are you sure you want to delete this report? This action cannot be undone."
        )
      )
        return;

      try {
        const token = localStorage.getItem("healthwallet-token");
        const response = await fetch(`/api/reports/${reportId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete report");
        }

        // Remove from local state
        setReports((prev) => prev.filter((report) => report.id !== reportId));

        // Close modal if the deleted report was open
        if (selectedReport?.id === reportId) {
          setShowReportModal(false);
          setSelectedReport(null);
        }
      } catch (error: any) {
        alert(error.message || "Failed to delete report. Please try again.");
      }
    },
    [selectedReport]
  );

  const handleUpdateReport = useCallback((updatedReport: Report) => {
    setReports((prev) =>
      prev.map((report) =>
        report.id === updatedReport.id ? updatedReport : report
      )
    );
    setSelectedReport(updatedReport);
  }, []);

  // Client-side filtering for instant UI response
  const filteredReports = useMemo(() => {
    return reports
      .filter((report) => {
        const matchesSearch =
          searchQuery === "" ||
          report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          report.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          report.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
          report.extractedText
            .toLowerCase()
            .includes(searchQuery.toLowerCase());

        const matchesCategory =
          selectedCategory === "All" || report.category === selectedCategory;
        const matchesStatus =
          selectedStatus === "All" || report.status === selectedStatus;

        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [reports, searchQuery, selectedCategory, selectedStatus]);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case "Normal":
        return "bg-green-100 text-green-800 border-green-200";
      case "Abnormal":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "Pending":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  }, []);

  const getFileIcon = useCallback((fileType: string) => {
    if (fileType.includes("pdf")) return "📄";
    if (fileType.includes("image")) return "🖼️";
    if (
      fileType.includes("csv") ||
      fileType.includes("excel") ||
      fileType.includes("spreadsheet")
    )
      return "📊";
    if (fileType.includes("text")) return "📝";
    return "📁";
  }, []);

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }, []);



  return (
    <>
      <div className="space-y-6">
        {/* Header with refresh button */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Medical Reports
            </h1>
            <p className="text-gray-600 mt-1">
              Manage and view all your health documents
            </p>
          </div>

          <div className="flex justify-end sm:justify-start">
            <Button
              className="gap-2 bg-blue-600 hover:bg-blue-700"
              onClick={handleUploadReport}
            >
              <Upload className="h-4 w-4" />
              Upload Report
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-red-600 font-medium mb-1">
                Error Loading Reports
              </p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError("")}
              className="text-red-600 hover:text-red-800"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search reports by title, type, or notes..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9 pr-10"
                  disabled={isRefreshing}
                />
                {searchQuery && (
                  <button
                    onClick={() => handleSearchChange("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    type="button"
                    disabled={isRefreshing}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Filters */}
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 w-full">
                  {/* Category */}
                  <div className="space-y-2 min-w-0">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Filter className="h-3 w-3" />
                      Category
                    </label>
                    <Select
                      value={selectedCategory}
                      onValueChange={handleCategoryChange}
                      disabled={isRefreshing}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status */}
                  <div className="space-y-2 min-w-0">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Filter className="h-3 w-3" />
                      Status
                    </label>
                    <Select
                      value={selectedStatus}
                      onValueChange={handleStatusChange}
                      disabled={isRefreshing}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {(selectedCategory !== "All" ||
                  selectedStatus !== "All" ||
                  searchQuery) && (
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      disabled={isRefreshing}
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Summary */}
        {reports.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Card className="bg-linear-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-blue-700">
                  {reports.length}
                </p>
                <p className="text-sm text-blue-600">Total Reports</p>
              </CardContent>
            </Card>
            <Card className="bg-linear-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-green-700">
                  {reports.filter((r) => r.status === "Normal").length}
                </p>
                <p className="text-sm text-green-600">Normal</p>
              </CardContent>
            </Card>
            <Card className="bg-linear-to-br from-yellow-50 to-yellow-100 border-yellow-200">
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-yellow-700">
                  {reports.filter((r) => r.status === "Abnormal").length}
                </p>
                <p className="text-sm text-yellow-600">Abnormal</p>
              </CardContent>
            </Card>
            <Card className="bg-linear-to-br from-red-50 to-red-100 border-red-200">
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-red-700">
                  {reports.filter((r) => r.status === "Critical").length}
                </p>
                <p className="text-sm text-red-600">Critical</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reports Grid */}
        {filteredReports.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredReports.map((report) => (
              <Card
                key={report.id}
                className="hover:shadow-lg transition-shadow duration-300 group border-gray-200"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex gap-3 flex-1 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-200 transition-colors">
                        <span className="text-lg">
                          {getFileIcon(report.fileType)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base truncate group-hover:text-blue-600 transition-colors">
                          {report.title}
                        </CardTitle>
                        <CardDescription className="mt-1 truncate">
                          {report.type} • {report.category}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge
                      className={`${getStatusColor(report.status)} border`}
                    >
                      {report.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span title={format(report.date, "PPP")}>
                        {formatDistanceToNow(report.date, { addSuffix: true })}
                      </span>
                      {report.fileName && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {report.fileName.split(".").pop()?.toUpperCase() ||
                            "FILE"}
                        </Badge>
                      )}
                    </div>

                    {report.notes && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Notes:</p>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {report.notes}
                        </p>
                      </div>
                    )}

                    {report.vitals.length > 0 && (
                      <div className="space-y-1 mt-2">
                        <p className="text-xs text-gray-500">Key Results:</p>
                        {report.vitals.slice(0, 2).map((vital, idx) => (
                          <p
                            key={idx}
                            className="text-sm text-gray-700 truncate"
                          >
                            {vital}
                          </p>
                        ))}
                        {report.vitals.length > 2 && (
                          <p className="text-xs text-gray-500">
                            +{report.vitals.length - 2} more
                          </p>
                        )}
                      </div>
                    )}

                    <div className="pt-2 border-t border-gray-200 mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>File: {formatFileSize(report.fileSize)}</span>
                        <span>
                          Uploaded:{" "}
                          {formatDistanceToNow(report.uploadDate, {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleViewReport(report)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() =>
                        handleDownloadReport(
                          report.id,
                          report.fileName,
                          report.fileUrl
                        )
                      }
                      disabled={!report.fileUrl}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      onClick={() => handleDeleteReport(report.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No reports found
              </h3>
              <p className="text-sm text-gray-600 text-center max-w-sm mb-4">
                {searchQuery ||
                selectedCategory !== "All" ||
                selectedStatus !== "All"
                  ? "Try adjusting your search or filter criteria"
                  : "Upload your first health report to get started"}
              </p>
              <div className="flex gap-2">
                {(searchQuery ||
                  selectedCategory !== "All" ||
                  selectedStatus !== "All") && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
                <Button onClick={handleUploadReport}>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Report
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading overlay for refreshing */}
        {isRefreshing && (
          <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
              <p className="text-gray-700">Updating reports...</p>
            </div>
          </div>
        )}
      </div>

      {/* Report Modal for Viewing/Editing */}
      {showReportModal && selectedReport && (
        <ReportModal
          report={selectedReport}
          isOpen={showReportModal}
          onClose={() => {
            setShowReportModal(false);
            setSelectedReport(null);
          }}
          onUpdate={handleUpdateReport}
          onDelete={handleDeleteReport}
        />
      )}
    </>
  );
}
