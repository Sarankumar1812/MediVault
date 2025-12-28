// components/vitals-view.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Calendar,
  Activity,
  Droplets,
  Heart,
  Weight,
  Edit,
  Trash2,
  Download,
  Save,
  X,
} from "lucide-react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Bar,
  BarChart,
} from "recharts";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal";

type TimeRange = "1M" | "3M" | "6M" | "1Y";

interface VitalEntry {
  id: number;
  type: string;
  value_systolic?: number;
  value_diastolic?: number;
  value_fasting?: number;
  value_post_meal?: number;
  value_resting?: number;
  value_active?: number;
  value_numeric?: number;
  unit: string;
  notes?: string;
  recorded_at: string;
  created_at: string;
  updated_at: string;
}

interface ChartDataPoint {
  date: string;
  systolic?: number;
  diastolic?: number;
  fasting?: number;
  postMeal?: number;
  resting?: number;
  active?: number;
  weight?: number;
}

// Edit Vital Modal Component
function EditVitalModal({
  isOpen,
  onClose,
  editingEntry,
  formData,
  setFormData,
  onSubmit
}: {
  isOpen: boolean;
  onClose: () => void;
  editingEntry: VitalEntry | null;
  formData: any;
  setFormData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-blue-900">
                {editingEntry ? "Edit Vital Entry" : "Add Vital Entry"}
              </CardTitle>
              <CardDescription>Record your health measurement</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => {
                      const unit = getDefaultUnit(value);
                      setFormData({ ...formData, type: value, unit });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blood_pressure">Blood Pressure</SelectItem>
                      <SelectItem value="blood_sugar">Blood Sugar</SelectItem>
                      <SelectItem value="heart_rate">Heart Rate</SelectItem>
                      <SelectItem value="weight">Weight</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="date"
                      value={formData.recorded_at}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          recorded_at: e.target.value,
                        })
                      }
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                {formData.type === "blood_pressure" && (
                  <>
                    <div className="space-y-2">
                      <Label>Systolic (mmHg)</Label>
                      <Input
                        type="number"
                        value={formData.value_systolic}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            value_systolic: e.target.value,
                          })
                        }
                        placeholder="120"
                        min="50"
                        max="250"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Diastolic (mmHg)</Label>
                      <Input
                        type="number"
                        value={formData.value_diastolic}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            value_diastolic: e.target.value,
                          })
                        }
                        placeholder="80"
                        min="30"
                        max="150"
                        required
                      />
                    </div>
                  </>
                )}

                {formData.type === "blood_sugar" && (
                  <>
                    <div className="space-y-2">
                      <Label>Fasting (mg/dL)</Label>
                      <Input
                        type="number"
                        value={formData.value_fasting}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            value_fasting: e.target.value,
                          })
                        }
                        placeholder="95"
                        min="50"
                        max="300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Post-meal (mg/dL)</Label>
                      <Input
                        type="number"
                        value={formData.value_post_meal}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            value_post_meal: e.target.value,
                          })
                        }
                        placeholder="140"
                        min="50"
                        max="400"
                      />
                    </div>
                  </>
                )}

                {formData.type === "heart_rate" && (
                  <>
                    <div className="space-y-2">
                      <Label>Resting (bpm)</Label>
                      <Input
                        type="number"
                        value={formData.value_resting}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            value_resting: e.target.value,
                          })
                        }
                        placeholder="72"
                        min="30"
                        max="200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Active (bpm)</Label>
                      <Input
                        type="number"
                        value={formData.value_active}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            value_active: e.target.value,
                          })
                        }
                        placeholder="110"
                        min="50"
                        max="250"
                      />
                    </div>
                  </>
                )}

                {formData.type === "weight" && (
                  <div className="space-y-2">
                    <Label>Weight (kg)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.value_numeric}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          value_numeric: e.target.value,
                        })
                      }
                      placeholder="71.0"
                      min="20"
                      max="200"
                      required
                    />
                  </div>
                )}

                <div className="md:col-span-2 space-y-2">
                  <Label>Notes (Optional)</Label>
                  <Input
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        notes: e.target.value,
                      })
                    }
                    placeholder="e.g., After exercise, before breakfast, etc."
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" className="gap-2 bg-blue-600 hover:bg-blue-700">
                  {editingEntry ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {editingEntry ? "Update Entry" : "Save Entry"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Revoke Access Modal Component
function RevokeAccessModal({
  isOpen,
  onClose,
  onConfirm,
  userName
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-900">Revoke Access</CardTitle>
            <CardDescription>Are you sure you want to revoke access?</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              You are about to revoke access from <strong>{userName}</strong>. 
              They will no longer be able to view your shared reports.
            </p>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={onConfirm}
                className="flex-1"
              >
                Revoke Access
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function VitalsView() {
  const [timeRange, setTimeRange] = useState<TimeRange>("3M");
  const [vitalsData, setVitalsData] = useState<{
    blood_pressure: VitalEntry[];
    blood_sugar: VitalEntry[];
    heart_rate: VitalEntry[];
    weight: VitalEntry[];
  }>({
    blood_pressure: [],
    blood_sugar: [],
    heart_rate: [],
    weight: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<VitalEntry | null>(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    entryId: null as number | null,
    entryType: "",
  });
  const [formData, setFormData] = useState({
    id: null as number | null,
    type: "blood_pressure",
    value_systolic: "",
    value_diastolic: "",
    value_fasting: "",
    value_post_meal: "",
    value_resting: "",
    value_active: "",
    value_numeric: "",
    unit: "mmHg",
    notes: "",
    recorded_at: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchVitalsData();
  }, [timeRange]);

  const fetchVitalsData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("healthwallet-token");

      if (!token) {
        console.error("No token found");
        toast({
          title: "Authentication Error",
          description: "Please login again",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`/api/vitals?range=${timeRange}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setVitalsData(data);
      } else {
        console.error("Failed to fetch vitals data");
        toast({
          title: "Error",
          description: "Failed to load vitals data",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching vitals:", error);
      toast({
        title: "Error",
        description: "Failed to load vitals data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("healthwallet-token");
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please login again",
          variant: "destructive",
        });
        return;
      }

      const method = editingEntry ? "PUT" : "POST";

      // Prepare payload based on type
      const payload: any = {
        type: formData.type,
        unit: formData.unit,
        notes: formData.notes,
        recorded_at: new Date(formData.recorded_at).toISOString(),
      };

      // Add values based on type
      if (formData.type === "blood_pressure") {
        payload.value_systolic = formData.value_systolic ? parseFloat(formData.value_systolic) : null;
        payload.value_diastolic = formData.value_diastolic ? parseFloat(formData.value_diastolic) : null;
      } else if (formData.type === "blood_sugar") {
        payload.value_fasting = formData.value_fasting ? parseFloat(formData.value_fasting) : null;
        payload.value_post_meal = formData.value_post_meal ? parseFloat(formData.value_post_meal) : null;
      } else if (formData.type === "heart_rate") {
        payload.value_resting = formData.value_resting ? parseFloat(formData.value_resting) : null;
        payload.value_active = formData.value_active ? parseFloat(formData.value_active) : null;
      } else if (formData.type === "weight") {
        payload.value_numeric = formData.value_numeric ? parseFloat(formData.value_numeric) : null;
      }

      // Add id for PUT requests
      if (editingEntry && formData.id) {
        payload.id = formData.id;
      }

      const response = await fetch('/api/vitals', {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast({
          title: editingEntry ? "Vital Updated" : "Vital Added",
          description: editingEntry 
            ? "Vital entry updated successfully"
            : "New vital entry added successfully",
        });
        
        resetForm();
        fetchVitalsData();
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.error || "Failed to save vital entry",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving vital:", error);
      toast({
        title: "Error",
        description: "Failed to save vital entry",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (entry: VitalEntry) => {
    console.log("Editing entry:", entry);
    setEditingEntry(entry);
    
    // Format the date correctly
    const recordDate = new Date(entry.recorded_at);
    const formattedDate = recordDate.toISOString().split("T")[0];
    
    setFormData({
      id: entry.id,
      type: entry.type,
      value_systolic: entry.value_systolic?.toString() || "",
      value_diastolic: entry.value_diastolic?.toString() || "",
      value_fasting: entry.value_fasting?.toString() || "",
      value_post_meal: entry.value_post_meal?.toString() || "",
      value_resting: entry.value_resting?.toString() || "",
      value_active: entry.value_active?.toString() || "",
      value_numeric: entry.value_numeric?.toString() || "",
      unit: entry.unit || getDefaultUnit(entry.type),
      notes: entry.notes || "",
      recorded_at: formattedDate,
    });
    
    setShowEditModal(true);
  };

  const handleDeleteClick = (id: number, type: string) => {
    setDeleteModal({
      isOpen: true,
      entryId: id,
      entryType: type,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.entryId) return;

    try {
      const token = localStorage.getItem("healthwallet-token");

      const response = await fetch(`/api/vitals?id=${deleteModal.entryId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Vital Deleted",
          description: "Vital entry deleted successfully",
        });
        fetchVitalsData();
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.error || "Failed to delete vital entry",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting vital:", error);
      toast({
        title: "Error",
        description: "Failed to delete vital entry",
        variant: "destructive",
      });
    } finally {
      setDeleteModal({ isOpen: false, entryId: null, entryType: "" });
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      type: "blood_pressure",
      value_systolic: "",
      value_diastolic: "",
      value_fasting: "",
      value_post_meal: "",
      value_resting: "",
      value_active: "",
      value_numeric: "",
      unit: "mmHg",
      notes: "",
      recorded_at: new Date().toISOString().split("T")[0],
    });
    setEditingEntry(null);
    setShowEditModal(false);
  };

  const calculateStats = () => {
    const bpEntries = vitalsData.blood_pressure || [];
    const sugarEntries = vitalsData.blood_sugar || [];
    const hrEntries = vitalsData.heart_rate || [];
    const weightEntries = vitalsData.weight || [];

    const latestBP = bpEntries[bpEntries.length - 1];
    const latestSugar = sugarEntries[sugarEntries.length - 1];
    const latestHR = hrEntries[hrEntries.length - 1];
    const latestWeight = weightEntries[weightEntries.length - 1];

    const previousBP = bpEntries[bpEntries.length - 2];
    const previousSugar = sugarEntries[sugarEntries.length - 2];
    const previousHR = hrEntries[hrEntries.length - 2];
    const previousWeight = weightEntries[weightEntries.length - 2];

    // Blood Pressure
    const bpSystolicCurrent = latestBP?.value_systolic || 120;
    const bpDiastolicCurrent = latestBP?.value_diastolic || 80;
    const bpSystolicPrevious = previousBP?.value_systolic || bpSystolicCurrent;
    const bpDiastolicPrevious = previousBP?.value_diastolic || bpDiastolicCurrent;
    
    const bpTrend = latestBP && previousBP && 
                    latestBP.value_systolic !== undefined && 
                    previousBP.value_systolic !== undefined
      ? (latestBP.value_systolic < previousBP.value_systolic ? "down" : "up")
      : "stable";

    // Blood Sugar
    const sugarCurrent = latestSugar?.value_fasting || latestSugar?.value_post_meal || 95;
    const sugarPrevious = previousSugar?.value_fasting || previousSugar?.value_post_meal || sugarCurrent;
    
    const sugarTrend = latestSugar && previousSugar && 
                       (latestSugar.value_fasting !== undefined || latestSugar.value_post_meal !== undefined) &&
                       (previousSugar.value_fasting !== undefined || previousSugar.value_post_meal !== undefined)
      ? (sugarCurrent < sugarPrevious ? "down" : "up")
      : "stable";

    // Heart Rate
    const hrCurrent = latestHR?.value_resting || latestHR?.value_active || 74;
    const hrPrevious = previousHR?.value_resting || previousHR?.value_active || hrCurrent;
    
    const hrTrend = latestHR && previousHR && 
                    (latestHR.value_resting !== undefined || latestHR.value_active !== undefined) &&
                    (previousHR.value_resting !== undefined || previousHR.value_active !== undefined)
      ? (hrCurrent < hrPrevious ? "down" : "up")
      : "stable";

    // Weight
    const weightCurrent = latestWeight?.value_numeric || 71.0;
    const weightPrevious = previousWeight?.value_numeric || weightCurrent;
    
    const weightTrend = latestWeight && previousWeight && 
                        latestWeight.value_numeric !== undefined && 
                        previousWeight.value_numeric !== undefined
      ? (latestWeight.value_numeric < previousWeight.value_numeric ? "down" : "up")
      : "stable";

    return {
      bloodPressure: {
        current: `${bpSystolicCurrent}/${bpDiastolicCurrent}`,
        trend: bpTrend,
        change: Math.abs(bpSystolicCurrent - bpSystolicPrevious),
      },
      bloodSugar: {
        current: sugarCurrent,
        trend: sugarTrend,
        change: Math.abs(sugarCurrent - sugarPrevious),
      },
      heartRate: {
        current: hrCurrent,
        trend: hrTrend,
        change: Math.abs(hrCurrent - hrPrevious),
      },
      weight: {
        current: weightCurrent,
        trend: weightTrend,
        change: Math.abs(weightCurrent - weightPrevious).toFixed(1),
      },
    };
  };

  const stats = calculateStats();

  // Format chart data
  const formatBloodPressureData = (): ChartDataPoint[] => {
    return (vitalsData.blood_pressure || []).map((entry) => ({
      date: format(new Date(entry.recorded_at), "MMM d"),
      systolic: entry.value_systolic,
      diastolic: entry.value_diastolic,
    }));
  };

  const formatBloodSugarData = (): ChartDataPoint[] => {
    return (vitalsData.blood_sugar || []).map((entry) => ({
      date: format(new Date(entry.recorded_at), "MMM d"),
      fasting: entry.value_fasting,
      postMeal: entry.value_post_meal,
    }));
  };

  const formatHeartRateData = (): ChartDataPoint[] => {
    return (vitalsData.heart_rate || []).map((entry) => ({
      date: format(new Date(entry.recorded_at), "MMM d"),
      resting: entry.value_resting,
      active: entry.value_active,
    }));
  };

  const formatWeightData = (): ChartDataPoint[] => {
    return (vitalsData.weight || []).map((entry) => ({
      date: format(new Date(entry.recorded_at), "MMM"),
      weight: entry.value_numeric,
    }));
  };

  const getTimeRangeDescription = (range: TimeRange): string => {
    switch (range) {
      case "1M": return "Track your last month's health journey";
      case "3M": return "View your quarterly health progress";
      case "6M": return "Monitor your half-year health trends";
      case "1Y": return "Analyze your yearly health patterns";
      default: return "Monitor your health metrics";
    }
  };

  const exportVitalsData = () => {
    const allVitals = [
      ...vitalsData.blood_pressure,
      ...vitalsData.blood_sugar,
      ...vitalsData.heart_rate,
      ...vitalsData.weight,
    ];
    
    if (allVitals.length === 0) {
      toast({
        title: "No Data",
        description: "There are no vitals to export",
        variant: "destructive",
      });
      return;
    }
    
    const csvData = allVitals.map(entry => ({
      Type: entry.type.replace('_', ' ').toUpperCase(),
      Date: new Date(entry.recorded_at).toLocaleDateString(),
      Time: new Date(entry.recorded_at).toLocaleTimeString(),
      Value: getDisplayValue(entry),
      Unit: entry.unit,
      Notes: entry.notes || '',
    }));

    const csv = convertToCSV(csvData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-vitals-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const convertToCSV = (data: any[]): string => {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const rows = data.map(row => 
      headers.map(header => JSON.stringify(row[header] || '')).join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  };

  return (
    <div className="space-y-6">
      {/* Edit Vital Modal */}
      <EditVitalModal
        isOpen={showEditModal}
        onClose={resetForm}
        editingEntry={editingEntry}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, entryId: null, entryType: "" })}
        onConfirm={handleDeleteConfirm}
        title="Delete Vital Entry"
        description={`Are you sure you want to delete this ${deleteModal.entryType.replace('_', ' ')} entry? This action cannot be undone.`}
      />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vitals Tracking</h1>
          <p className="text-gray-600 mt-1">{getTimeRangeDescription(timeRange)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-2 border border-gray-200 rounded-lg p-1 bg-gray-50">
            {(["1M", "3M", "6M", "1Y"] as TimeRange[]).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="min-w-12"
              >
                {range}
              </Button>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={exportVitalsData}
            className="gap-1"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              resetForm();
              setShowEditModal(true);
            }}
            className="gap-1 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Vital
          </Button>
        </div>
      </div>

      {/* Current Vitals Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Activity className="h-4 w-4 text-red-500" />
              Blood Pressure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats.bloodPressure.current}
            </div>
            <p className="text-xs text-gray-500 mt-1">mmHg • {vitalsData.blood_pressure.length} records</p>
            <div className="flex items-center gap-1 mt-2">
              {stats.bloodPressure.trend === "down" ? (
                <>
                  <TrendingDown className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-600">
                    {stats.bloodPressure.change} mmHg improvement
                  </span>
                </>
              ) : stats.bloodPressure.trend === "up" ? (
                <>
                  <TrendingUp className="h-3 w-3 text-red-500" />
                  <span className="text-xs text-red-600">
                    {stats.bloodPressure.change} mmHg increase
                  </span>
                </>
              ) : (
                <span className="text-xs text-gray-500">Stable</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-500" />
              Blood Sugar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats.bloodSugar.current}
            </div>
            <p className="text-xs text-gray-500 mt-1">mg/dL • {vitalsData.blood_sugar.length} records</p>
            <div className="flex items-center gap-1 mt-2">
              {stats.bloodSugar.trend === "down" ? (
                <>
                  <TrendingDown className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-600">
                    {stats.bloodSugar.change} mg/dL improvement
                  </span>
                </>
              ) : stats.bloodSugar.trend === "up" ? (
                <>
                  <TrendingUp className="h-3 w-3 text-red-500" />
                  <span className="text-xs text-red-600">
                    {stats.bloodSugar.change} mg/dL increase
                  </span>
                </>
              ) : (
                <span className="text-xs text-gray-500">Stable</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Heart className="h-4 w-4 text-purple-500" />
              Heart Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats.heartRate.current}
            </div>
            <p className="text-xs text-gray-500 mt-1">bpm • {vitalsData.heart_rate.length} records</p>
            <div className="flex items-center gap-1 mt-2">
              {stats.heartRate.trend === "down" ? (
                <>
                  <TrendingDown className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-600">
                    {stats.heartRate.change} bpm improvement
                  </span>
                </>
              ) : stats.heartRate.trend === "up" ? (
                <>
                  <TrendingUp className="h-3 w-3 text-red-500" />
                  <span className="text-xs text-red-600">
                    {stats.heartRate.change} bpm increase
                  </span>
                </>
              ) : (
                <span className="text-xs text-gray-500">Stable</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Weight className="h-4 w-4 text-yellow-500" />
              Weight
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats.weight.current}
            </div>
            <p className="text-xs text-gray-500 mt-1">kg • {vitalsData.weight.length} records</p>
            <div className="flex items-center gap-1 mt-2">
              {stats.weight.trend === "down" ? (
                <>
                  <TrendingDown className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-600">
                    {stats.weight.change} kg lost
                  </span>
                </>
              ) : stats.weight.trend === "up" ? (
                <>
                  <TrendingUp className="h-3 w-3 text-red-500" />
                  <span className="text-xs text-red-600">
                    {stats.weight.change} kg gained
                  </span>
                </>
              ) : (
                <span className="text-xs text-gray-500">Stable</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Entries with Edit/Delete */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900">Recent Vitals</CardTitle>
          <CardDescription>Manage your vital entries</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading vitals...</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
              {Object.entries(vitalsData).map(([type, entries]) => (
                entries.slice(-5).reverse().map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${getTypeColor(type)}`}>
                        {getTypeIcon(type)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 capitalize">
                          {type.replace('_', ' ')}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {format(new Date(entry.recorded_at), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium text-gray-900">
                          {getDisplayValue(entry)}
                        </div>
                        <div className="text-xs text-gray-500">{entry.unit}</div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(entry)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(entry.id, entry.type)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">
              Blood Pressure Trend
            </CardTitle>
            <CardDescription>Systolic and Diastolic readings</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formatBloodPressureData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  fontSize={12}
                  tick={{ fill: "#6b7280" }}
                />
                <YAxis
                  fontSize={12}
                  tick={{ fill: "#6b7280" }}
                  domain={[60, 140]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    color: "#111827",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="systolic"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Systolic"
                  dot={{ fill: "#3b82f6", r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="diastolic"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Diastolic"
                  dot={{ fill: "#10b981", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">Blood Sugar Levels</CardTitle>
            <CardDescription>Fasting and Post-meal readings</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formatBloodSugarData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  fontSize={12}
                  tick={{ fill: "#6b7280" }}
                />
                <YAxis
                  fontSize={12}
                  tick={{ fill: "#6b7280" }}
                  domain={[70, 150]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    color: "#111827",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="fasting"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Fasting"
                  dot={{ fill: "#10b981", r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="postMeal"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="Post-meal"
                  dot={{ fill: "#f59e0b", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">Heart Rate Monitor</CardTitle>
            <CardDescription>Resting and Active heart rate</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formatHeartRateData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  fontSize={12}
                  tick={{ fill: "#6b7280" }}
                />
                <YAxis
                  fontSize={12}
                  tick={{ fill: "#6b7280" }}
                  domain={[60, 130]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    color: "#111827",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="resting"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="Resting"
                  dot={{ fill: "#f59e0b", r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="active"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Active"
                  dot={{ fill: "#8b5cf6", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">Weight Progress</CardTitle>
            <CardDescription>Monthly weight tracking</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formatWeightData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  fontSize={12}
                  tick={{ fill: "#6b7280" }}
                />
                <YAxis
                  fontSize={12}
                  tick={{ fill: "#6b7280" }}
                  domain={['dataMin - 2', 'dataMax + 2']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    color: "#111827",
                  }}
                />
                <Bar
                  dataKey="weight"
                  fill="#ec4899"
                  radius={[8, 8, 0, 0]}
                  name="Weight (kg)"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper functions
function getTypeIcon(type: string) {
  switch (type) {
    case 'blood_pressure': return <Activity className="h-5 w-5 text-white" />;
    case 'blood_sugar': return <Droplets className="h-5 w-5 text-white" />;
    case 'heart_rate': return <Heart className="h-5 w-5 text-white" />;
    case 'weight': return <Weight className="h-5 w-5 text-white" />;
    default: return <Activity className="h-5 w-5 text-white" />;
  }
}

function getTypeColor(type: string) {
  switch (type) {
    case 'blood_pressure': return 'bg-red-500';
    case 'blood_sugar': return 'bg-blue-500';
    case 'heart_rate': return 'bg-purple-500';
    case 'weight': return 'bg-yellow-500';
    default: return 'bg-gray-500';
  }
}

function getDisplayValue(entry: VitalEntry): string {
  if (entry.type === 'blood_pressure') {
    return `${entry.value_systolic || '?'}/${entry.value_diastolic || '?'}`;
  } else if (entry.type === 'blood_sugar') {
    if (entry.value_fasting && entry.value_post_meal) {
      return `${entry.value_fasting}/${entry.value_post_meal}`;
    }
    return String(entry.value_fasting || entry.value_post_meal || 'N/A');
  } else if (entry.type === 'heart_rate') {
    if (entry.value_resting && entry.value_active) {
      return `${entry.value_resting}/${entry.value_active}`;
    }
    return String(entry.value_resting || entry.value_active || 'N/A');
  } else if (entry.type === 'weight') {
    return String(entry.value_numeric || 'N/A');
  }
  return 'N/A';
}

function getDefaultUnit(type: string): string {
  switch (type) {
    case 'blood_pressure': return 'mmHg';
    case 'blood_sugar': return 'mg/dL';
    case 'heart_rate': return 'bpm';
    case 'weight': return 'kg';
    default: return '';
  }
}