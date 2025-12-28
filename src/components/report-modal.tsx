// components/report-modal.tsx
"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  X,
  Calendar,
  Save,
  Edit,
  Download,
  Loader2,
  AlertCircle,
  Trash2,
  User,
  FileType,
  Plus,
  ChevronRight,
  Hash,
  Ruler,
  BarChart3,
  Pencil,
  Check,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";

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

interface ReportModalProps {
  report: Report;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedReport: Report) => void;
  onDelete: (reportId: number) => void;
}

interface TestData {
  id: number;
  testName: string;
  result: string;
  unit: string;
  referenceRange: string;
}

export function ReportModal({
  report,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}: ReportModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingTable, setIsEditingTable] = useState(false);
  const [editedReport, setEditedReport] = useState<Report>({ ...report });
  const [testData, setTestData] = useState<TestData[]>(() =>
    parseTestData(report.extractedText)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>("");

  // Parse extracted text into structured test data
  function parseTestData(extractedText: string): TestData[] {
    if (!extractedText) return [];

    const tests: TestData[] = [];
    const lines = extractedText.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Look for CSV format: Test Name,Result,Unit,Reference Range
      if (line.includes(",")) {
        const parts = line.split(",").map((p) => p.trim().replace(/"/g, ""));
        if (parts.length >= 4 && parts[0] && parts[1]) {
          // Skip header rows
          if (
            parts[0].toLowerCase().includes("test") &&
            parts[1].toLowerCase().includes("result")
          ) {
            continue;
          }
          tests.push({
            id: i,
            testName: parts[0] || "",
            result: parts[1] || "",
            unit: parts[2] || "",
            referenceRange: parts[3] || "",
          });
        }
      }
    }

    return tests;
  }

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError("");

      const token = localStorage.getItem("healthwallet-token");
      if (!token) {
        throw new Error("Please log in to update report");
      }

      // Prepare update data
      const updateData: any = {
        title: editedReport.title,
        notes: editedReport.notes,
        status: editedReport.status,
        type: editedReport.type,
        category: editedReport.category,
        reportDate: format(editedReport.date, "yyyy-MM-dd"),
      };

      const response = await fetch(`/api/reports/${report.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update report");
      }

      const result = await response.json();

      if (result.success && result.report) {
        onUpdate(result.report);
        setIsEditing(false);
        setIsEditingTable(false);
      } else {
        throw new Error("Update failed");
      }
    } catch (error: any) {
      console.error("Update error:", error);
      setError(error.message || "Failed to update report. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    if (!report.fileUrl) {
      alert("No file available for download");
      return;
    }

    try {
      const a = document.createElement("a");
      a.href = report.fileUrl;
      a.download = report.fileName || `report-${report.id}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download file. Please try again.");
    }
  };

  const handleDelete = () => {
    if (
      confirm(
        "Are you sure you want to delete this report? This action cannot be undone."
      )
    ) {
      onDelete(report.id);
      onClose();
    }
  };

  const handleAddTest = () => {
    setTestData((prev) => [
      ...prev,
      {
        id: Date.now(),
        testName: "",
        result: "",
        unit: "",
        referenceRange: "",
      },
    ]);
  };

  const handleDeleteTest = (id: number) => {
    setTestData((prev) => prev.filter((test) => test.id !== id));
  };

  const handleUpdateTest = (
    id: number,
    field: keyof TestData,
    value: string
  ) => {
    setTestData((prev) =>
      prev.map((test) => (test.id === id ? { ...test, [field]: value } : test))
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Normal":
        return "bg-green-100 text-green-800 border border-green-200";
      case "Abnormal":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "Critical":
        return "bg-red-100 text-red-800 border border-red-200";
      case "Pending":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const reportTypes = [
    "General",
    "CBC",
    "Lipid Profile",
    "Liver Function",
    "Kidney Function",
    "Thyroid",
    "X-Ray",
    "MRI",
    "CT Scan",
    "Ultrasound",
    "ECG",
    "Blood Test",
  ];
  const categories = [
    "Blood Test",
    "Radiology",
    "Cardiac",
    "Imaging",
    "Biochemistry",
    "Hematology",
    "Microbiology",
    "Pathology",
    "Other",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh]  overflow-y-auto p-0 px-2 sm:px-4">
        {/* Header with action buttons */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-12 mb-2 ">
          <div className="flex-1 min-w-0">
            <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
              {isEditing ? (
                <Input
                  value={editedReport.title}
                  onChange={(e) =>
                    setEditedReport((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className="text-xl sm:text-2xl font-bold border-0 p-0 focus-visible:ring-0 h-8 sm:h-10"
                />
              ) : (
                report.title
              )}
            </DialogTitle>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {!isEditing ? (
              <>
                <Button
                  onClick={() => setIsEditing(true)}
                  size="sm"
                  variant="outline"
                  className="gap-2 flex-1 sm:flex-none"
                >
                  <Edit className="h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button
                  onClick={handleDownload}
                  size="sm"
                  disabled={!report.fileUrl}
                  className="gap-2 flex-1 sm:flex-none"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Button>
                <Button
                  onClick={handleDelete}
                  size="sm"
                  variant="destructive"
                  className="gap-2 flex-1 sm:flex-none"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleSave}
                  size="sm"
                  disabled={isSaving}
                  className="gap-2 flex-1 sm:flex-none"
                >
                  {isSaving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  Save
                </Button>
                <Button
                  onClick={() => {
                    setEditedReport(report);
                    setTestData(parseTestData(report.extractedText));
                    setIsEditing(false);
                    setIsEditingTable(false);
                    setError("");
                  }}
                  size="sm"
                  variant="outline"
                  className="gap-2 flex-1 sm:flex-none"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Report metadata */}
        <div className="mb-6 space-y-3 p-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge
                variant="secondary"
                className="flex items-center gap-1 px-2 py-0.5 text-[11px] sm:text-xs"
              >
                <FileType className="h-3 w-3" />
                {report.type}
              </Badge>

              <ChevronRight className="h-3 w-3 text-gray-400 hidden sm:block" />

              <Badge
                variant="outline"
                className="px-2 py-0.5 text-[11px] sm:text-xs"
              >
                {report.category}
              </Badge>
            </div>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{format(report.date, "PPP")}</span>
              </div>

              {report.patientName && report.patientName !== "User" && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{report.patientName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            {isEditing ? (
              <Select
                value={editedReport.status}
                onValueChange={(value) =>
                  setEditedReport((prev) => ({
                    ...prev,
                    status: value as Report["status"],
                  }))
                }
              >
                <SelectTrigger className="w-32 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="Abnormal">Abnormal</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Badge className={`${getStatusColor(report.status)} px-3 py-1`}>
                <span className="font-medium">{report.status}</span>
              </Badge>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
            <p className="text-sm text-red-600 flex-1">{error}</p>
            <button
              onClick={() => setError("")}
              className="text-red-600 hover:text-red-800 shrink-0"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        <div className="space-y-6">
          {/* Type & Category (editable) - Only show when editing */}
          {isEditing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <Label className="text-sm font-semibold mb-2  text-blue-800 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Report Type
                </Label>
                <Select
                  value={editedReport.type}
                  onValueChange={(value) =>
                    setEditedReport((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-semibold mb-2  text-blue-800 flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Category
                </Label>
                <Select
                  value={editedReport.category}
                  onValueChange={(value) =>
                    setEditedReport((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select category" />
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
            </div>
          )}

          {/* Test Results Table */}
          {(testData.length > 0 || isEditingTable) && (
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                <div className="flex items-center gap-2">
                  <Ruler className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Test Results</h3>
                </div>
                {isEditing && (
                  <Button
                    onClick={() => setIsEditingTable(!isEditingTable)}
                    size="sm"
                    variant="outline"
                    className="gap-2"
                  >
                    {isEditingTable ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Done Editing
                      </>
                    ) : (
                      <>
                        <Pencil className="h-3.5 w-3.5" />
                        Edit Table
                      </>
                    )}
                  </Button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="py-3 px-4 text-left font-medium text-gray-700 text-sm">
                        Test Name
                      </th>
                      <th className="py-3 px-4 text-left font-medium text-gray-700 text-sm">
                        Result
                      </th>
                      <th className="py-3 px-4 text-left font-medium text-gray-700 text-sm">
                        Unit
                      </th>
                      <th className="py-3 px-4 text-left font-medium text-gray-700 text-sm">
                        Reference Range
                      </th>
                      {isEditingTable && (
                        <th className="py-3 px-4 text-left font-medium text-gray-700 text-sm">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {testData.map((test) => (
                      <tr key={test.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          {isEditingTable ? (
                            <Input
                              value={test.testName}
                              onChange={(e) =>
                                handleUpdateTest(
                                  test.id,
                                  "testName",
                                  e.target.value
                                )
                              }
                              className="border-gray-300 text-sm h-8"
                              placeholder="Test name"
                            />
                          ) : (
                            <span className="text-gray-800">
                              {test.testName}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {isEditingTable ? (
                            <Input
                              value={test.result}
                              onChange={(e) =>
                                handleUpdateTest(
                                  test.id,
                                  "result",
                                  e.target.value
                                )
                              }
                              className="border-gray-300 text-sm h-8 font-medium"
                              placeholder="Result"
                            />
                          ) : (
                            <span className="font-medium text-gray-900">
                              {test.result}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {isEditingTable ? (
                            <Input
                              value={test.unit}
                              onChange={(e) =>
                                handleUpdateTest(
                                  test.id,
                                  "unit",
                                  e.target.value
                                )
                              }
                              className="border-gray-300 text-sm h-8"
                              placeholder="Unit"
                            />
                          ) : (
                            <span className="text-gray-600">{test.unit}</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {isEditingTable ? (
                            <Input
                              value={test.referenceRange}
                              onChange={(e) =>
                                handleUpdateTest(
                                  test.id,
                                  "referenceRange",
                                  e.target.value
                                )
                              }
                              className="border-gray-300 text-sm h-8"
                              placeholder="Reference range"
                            />
                          ) : (
                            <span className="text-gray-600">
                              {test.referenceRange}
                            </span>
                          )}
                        </td>
                        {isEditingTable && (
                          <td className="py-3 px-4">
                            <Button
                              onClick={() => handleDeleteTest(test.id)}
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {isEditingTable && (
                <div className="p-3 border-t bg-gray-50">
                  <Button
                    onClick={handleAddTest}
                    size="sm"
                    variant="outline"
                    className="gap-2"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add New Test
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* File Information Card - Now below Test Results on desktop */}
          <div className="space-y-6">
            {/* File Information */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold mb-3 text-gray-900">
                File Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">File Name:</span>
                  <span
                    className="font-medium text-gray-900 truncate max-w-32"
                    title={report.fileName}
                  >
                    {report.fileName}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">File Type:</span>
                  <span className="font-medium text-gray-900">
                    {report.fileType.split("/")[1]?.toUpperCase() || "UNKNOWN"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">File Size:</span>
                  <span className="font-medium text-gray-900">
                    {formatFileSize(report.fileSize)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Upload Date:</span>
                  <span className="font-medium text-gray-900">
                    {format(report.uploadDate, "PPP")}
                  </span>
                </div>
                <div className="pt-2 border-t">
                  <Button
                    onClick={handleDownload}
                    className="w-full gap-2"
                    disabled={!report.fileUrl}
                  >
                    <Download className="h-4 w-4" />
                    Download Original File
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div>
            {/* Notes Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Notes */}
              <div className="bg-white border rounded-lg p-4">
                <Label className="text-sm font-semibold mb-3 block text-gray-900">
                  Notes
                </Label>
                {isEditing ? (
                  <Textarea
                    value={editedReport.notes}
                    onChange={(e) =>
                      setEditedReport((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    rows={4}
                    placeholder="Add notes about this report..."
                    className="resize-none border-gray-300"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded border">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {report.notes || "No notes added"}
                    </p>
                  </div>
                )}
              </div>

              {/* Raw Extracted Data */}
              {report.extractedText &&
                report.extractedText.trim() &&
                !report.extractedText.includes(",") && (
                  <div className="bg-white border rounded-lg p-4">
                    <Label className="text-sm font-semibold mb-3 block text-gray-900">
                      Raw Data
                    </Label>
                    <div className="p-3 bg-gray-50 rounded border max-h-60 overflow-y-auto">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                        {report.extractedText}
                      </pre>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
