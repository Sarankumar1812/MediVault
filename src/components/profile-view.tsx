// components/profile-view.tsx
"use client";

import { useState, useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import {
  Mail,
  Phone,
  Calendar,
  MapPin,
  Save,
  Edit,
  X,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ProfileViewProps {
  profileData: any;
  onSave: (data: any) => Promise<{ success: boolean; message: string }>;
  isLoading: boolean;
  isSetupMode?: boolean;
}

// Define proper types for form fields
interface FormField {
  id: string;
  label: string;
  icon: LucideIcon | null;
  type: string;
  required?: boolean;
  disabled?: boolean;
}

interface FormSection {
  title: string;
  description: string;
  fields: FormField[];
}

export function ProfileView({
  profileData,
  onSave,
  isLoading,
  isSetupMode = false,
}: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(isSetupMode);
  const [formData, setFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (profileData) {
      setFormData(profileData);
    }
  }, [profileData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    const result = await onSave(formData);

    if (result.success) {
      setSaveMessage({ type: "success", text: result.message });
      if (!isSetupMode) {
        setIsEditing(false);
      }
    } else {
      setSaveMessage({ type: "error", text: result.message });
    }
    setIsSaving(false);
  };

  const handleSkipSetup = () => {
    router.push("/dashboard");
  };

  const sections: FormSection[] = [
    {
      title: "Personal Information",
      description: "Update your personal details",
      fields: [
        {
          id: "full_name",
          label: "Full Name",
          icon: null,
          type: "text",
          required: true,
        },
        {
          id: "email",
          label: "Email",
          icon: Mail,
          type: "email",
          disabled: true,
        },
        {
          id: "phone",
          label: "Phone Number",
          icon: Phone,
          type: "tel",
          required: true,
        },
        {
          id: "date_of_birth",
          label: "Date of Birth",
          icon: Calendar,
          type: "date",
          required: true,
        },
        {
          id: "gender",
          label: "Gender",
          icon: null,
          type: "text",
          required: true,
        },
        { id: "address", label: "Address", icon: MapPin, type: "text" },
      ],
    },
    {
      title: "Medical Information",
      description: "Important health details for your records",
      fields: [
        {
          id: "blood_type",
          label: "Blood Type",
          icon: null,
          type: "text",
          required: true,
        },
        { id: "height", label: "Height (cm)", icon: null, type: "number" },
        { id: "weight", label: "Weight (kg)", icon: null, type: "number" },
        { id: "allergies", label: "Known Allergies", icon: null, type: "text" },
        {
          id: "conditions",
          label: "Chronic Conditions",
          icon: null,
          type: "text",
        },
        {
          id: "medications",
          label: "Current Medications",
          icon: null,
          type: "text",
        },
      ],
    },
    {
      title: "Emergency Contact",
      description: "Person to contact in case of emergency",
      fields: [
        { id: "emergency_name", label: "Full Name", icon: null, type: "text" },
        {
          id: "emergency_relation",
          label: "Relationship",
          icon: null,
          type: "text",
        },
        {
          id: "emergency_phone",
          label: "Phone Number",
          icon: Phone,
          type: "tel",
        },
      ],
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isSetupMode ? "Complete Your Profile" : "Profile Settings"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isSetupMode
              ? "Please complete your profile information to get started"
              : "Manage your personal information and preferences"}
          </p>
        </div>
        {!isSetupMode && (
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? "destructive" : "outline"}
            className="gap-2"
          >
            {isEditing ? (
              <>
                <X className="h-4 w-4" />
                Cancel
              </>
            ) : (
              <>
                <Edit className="h-4 w-4" />
                Edit Profile
              </>
            )}
          </Button>
        )}
      </div>

      {isSetupMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="font-medium text-blue-900">
                Profile Setup Required
              </h3>
              <p className="text-sm text-blue-700">
                Please complete your profile information to unlock all features
                of HealthWallet. This information helps provide you with better
                health insights.
              </p>
            </div>
          </div>
        </div>
      )}

      {saveMessage && (
        <div
          className={`p-4 rounded-lg flex items-center gap-2 ${
            saveMessage.type === "success"
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          {saveMessage.type === "success" ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600" />
          )}
          <p
            className={
              saveMessage.type === "success" ? "text-green-600" : "text-red-600"
            }
          >
            {saveMessage.text}
          </p>
        </div>
      )}

      {sections.map((section, sectionIndex) => (
        <Card key={sectionIndex}>
          <CardHeader>
            <CardTitle className="text-gray-900">{section.title}</CardTitle>
            <CardDescription>{section.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {section.fields.map((field, fieldIndex) => (
                <div
                  key={fieldIndex}
                  className={`space-y-2 ${
                    field.required ? "required-field" : ""
                  }`}
                >
                  <Label htmlFor={field.id} className="text-gray-700">
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </Label>
                  <div className="relative">
                    {field.icon && (
                      <field.icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    )}
                    <Input
                      id={field.id}
                      type={field.type}
                      value={formData?.[field.id] || ""}
                      onChange={(e) =>
                        handleInputChange(field.id, e.target.value)
                      }
                      className={field.icon ? "pl-9" : ""}
                      disabled={!isEditing || (field.disabled ?? false)}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      required={field.required ?? false}
                    />
                  </div>
                </div>
              ))}
            </div>

            {sectionIndex === sections.length - 1 && isEditing && (
              <div className="flex justify-end">
                <Button
                  onClick={handleSave}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {isSetupMode ? "Complete Setup" : "Save Changes"}
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
