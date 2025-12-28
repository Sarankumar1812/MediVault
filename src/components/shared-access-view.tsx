// components/shared-access-view.tsx
"use client";

import { useState, useEffect } from "react";
import { getAuthToken } from "@/lib/auth";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UserPlus,
  Mail,
  Shield,
  Trash2,
  Eye,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SharedUser {
  id: number;
  name: string;
  email: string;
  role: string;
  accessLevel: string;
  reportsShared: number;
  sharedDate: string;
  status: "Pending" | "Active" | "Revoked";
}

// Revoke Access Modal Component
function RevokeAccessModal({
  isOpen,
  onClose,
  onConfirm,
  userName,
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
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-red-900">Revoke Access</CardTitle>
              <CardDescription>
                Are you sure you want to revoke access?
              </CardDescription>
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
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function SharedAccessView() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [accessLevel, setAccessLevel] = useState("limited");
  const [isLoading, setIsLoading] = useState(false);
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
  const [stats, setStats] = useState({
    totalShared: 0,
    totalReports: 0,
    pendingInvites: 0,
  });
  const [revokeModal, setRevokeModal] = useState({
    isOpen: false,
    userId: null as number | null,
    userName: "",
  });

  useEffect(() => {
    fetchSharedAccess();
  }, []);

  const fetchSharedAccess = async () => {
    try {
      setIsLoading(true);
      const token = getAuthToken();
      if (!token) {
        console.error("No token found");
        toast({
          title: "Authentication Error",
          description: "Please login again",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch("/api/shared", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSharedUsers(data);

        // Calculate stats
        const totalShared = data.length;
        const totalReports = data.reduce(
          (sum: number, user: SharedUser) => sum + user.reportsShared,
          0
        );
        const pendingInvites = data.filter(
          (user: SharedUser) => user.status === "Pending"
        ).length;

        setStats({
          totalShared,
          totalReports,
          pendingInvites,
        });
      } else {
        console.error("Failed to fetch shared access data");
        toast({
          title: "Error",
          description: "Failed to load shared access data",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching shared access:", error);
      toast({
        title: "Error",
        description: "Failed to load shared access data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendInvitation = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!email || !email.includes("@")) {
    toast({
      title: "Invalid Email",
      description: "Please enter a valid email address",
      variant: "destructive",
    });
    return;
  }

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

    console.log("📤 Sending invitation to:", email);
    console.log("📤 Access level:", accessLevel);
    console.log("📤 Name:", name || email.split('@')[0]);

    // ✅ FIX: Send ONLY the fields backend expects
    const requestBody = {
      email: email.trim(),
      name: (name || email.split('@')[0]).trim(),
      access_level: accessLevel,  // ← Backend expects this exact field name
    };

    console.log("📤 Request body:", requestBody);

    const response = await fetch("/api/shared", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    
    console.log("📥 Response status:", response.status);
    console.log("📥 Response data:", data);

    if (response.ok) {
      toast({
        title: "Invitation Sent",
        description: `Invitation sent successfully to ${email}`,
      });

      // Reset form
      setEmail("");
      setName("");
      setAccessLevel("limited");

      // Refresh data
      fetchSharedAccess();
    } else {
      console.error("❌ Server error:", data);
      toast({
        title: "Failed to Send Invitation",
        description: data.error || data.details || "Please try again",
        variant: "destructive",
      });
    }
  } catch (error: any) {
    console.error("❌ Error sending invitation:", error);
    toast({
      title: "Error",
      description: "Failed to send invitation. Please try again.",
      variant: "destructive",
    });
  }
};
  // ✅ ADD THIS HELPER FUNCTION for role detection
  function getRoleFromEmail(email: string): string {
    if (
      email.includes("dr.") ||
      email.includes("doctor") ||
      email.includes("clinic")
    )
      return "Doctor";
    if (email.includes("cardio")) return "Cardiologist";
    if (email.includes("hospital") || email.includes("health"))
      return "Healthcare Provider";
    return "Family Member";
  }

  const handleRevokeClick = (id: number, name: string) => {
    setRevokeModal({
      isOpen: true,
      userId: id,
      userName: name,
    });
  };

  const handleRevokeConfirm = async () => {
    if (!revokeModal.userId) return;

    try {
      const token = getAuthToken();
      const response = await fetch(`/api/shared?id=${revokeModal.userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Access Revoked",
          description: `Access revoked from ${revokeModal.userName}`,
        });

        // Refresh data
        fetchSharedAccess();
      } else {
        const data = await response.json();
        toast({
          title: "Failed to Revoke Access",
          description: data.error || "Please try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error revoking access:", error);
      toast({
        title: "Error",
        description: "Failed to revoke access. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRevokeModal({ isOpen: false, userId: null, userName: "" });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active":
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case "Pending":
        return <AlertCircle className="h-3 w-3 text-yellow-500" />;
      case "Revoked":
        return <XCircle className="h-3 w-3 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border-green-200";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Revoked":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Revoke Access Modal */}
      <RevokeAccessModal
        isOpen={revokeModal.isOpen}
        onClose={() =>
          setRevokeModal({ isOpen: false, userId: null, userName: "" })
        }
        onConfirm={handleRevokeConfirm}
        userName={revokeModal.userName}
      />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Shared Access</h1>
        <p className="text-gray-600 mt-1">
          Manage who can view your health records
        </p>
      </div>

      {/* Add New User */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900">Grant Access</CardTitle>
          <CardDescription>
            Share your medical reports with doctors, family members, or friends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendInvitation} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="name">Recipient Name (Optional)</Label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="access-level">Access Level</Label>
                <Select value={accessLevel} onValueChange={setAccessLevel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="limited">Limited Access</SelectItem>
                    <SelectItem value="view_only">View Only</SelectItem>
                    <SelectItem value="full">Full Access</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <UserPlus className="h-4 w-4" />
                Send Invitation
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEmail("");
                  setName("");
                  setAccessLevel("limited");
                }}
              >
                Clear
              </Button>
            </div>

            <p className="text-xs text-gray-500">
              They'll receive an email invitation to access selected reports.
              Pending invitations expire in 7 days.
            </p>
          </form>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Shared With
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats.totalShared}
            </div>
            <p className="text-xs text-gray-500 mt-1">Active connections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Reports Shared
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats.totalReports}
            </div>
            <p className="text-xs text-gray-500 mt-1">Across all users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Pending Invites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats.pendingInvites}
            </div>
            <p className="text-xs text-gray-500 mt-1">Awaiting acceptance</p>
          </CardContent>
        </Card>
      </div>

      {/* Shared Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900">People with Access</CardTitle>
          <CardDescription>Manage permissions for shared users</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">
                Loading shared access data...
              </p>
            </div>
          ) : sharedUsers.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900 mb-1">
                No shared access yet
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Start sharing your health records by sending an invitation
                above.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sharedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col gap-4 rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12 border-2 border-gray-100">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-medium text-gray-900">
                          {user.name}
                        </h4>
                        <Badge
                          variant="outline"
                          className={`${getStatusColor(
                            user.status
                          )} flex items-center gap-1`}
                        >
                          {getStatusIcon(user.status)}
                          {user.status}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-gray-100 text-gray-800 border-gray-200"
                        >
                          {user.role}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          {user.accessLevel}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {user.reportsShared} reports
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {user.sharedDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 sm:flex-col sm:items-end">
                    {user.status === "Active" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="sm:w-full bg-transparent hover:bg-gray-100"
                      >
                        Manage
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="sm:w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleRevokeClick(user.id, user.name)}
                    >
                      <Trash2 className="h-4 w-4 mr-1 sm:mr-0" />
                      <span className="sm:hidden">Revoke</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Access Levels Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900">Access Levels</CardTitle>
          <CardDescription>
            Understanding different permission types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex gap-3 items-start p-3 rounded-lg bg-blue-50 border border-blue-100">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-medium text-gray-900 text-sm">
                  Full Access
                </h4>
                <p className="text-xs text-gray-600 mt-0.5">
                  Can view all your medical reports and health data, download
                  reports, and share with others.
                </p>
              </div>
            </div>
            <div className="flex gap-3 items-start p-3 rounded-lg bg-green-50 border border-green-100">
              <Shield className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-medium text-gray-900 text-sm">
                  Limited Access
                </h4>
                <p className="text-xs text-gray-600 mt-0.5">
                  Can only view reports you specifically share with them. Cannot
                  download or share reports.
                </p>
              </div>
            </div>
            <div className="flex gap-3 items-start p-3 rounded-lg bg-gray-50 border border-gray-100">
              <Shield className="h-5 w-5 text-gray-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-medium text-gray-900 text-sm">View Only</h4>
                <p className="text-xs text-gray-600 mt-0.5">
                  Can view but cannot download or share reports. Ideal for
                  consultations.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
