// app/dashboard/reports/upload/review/ReviewExtractedData.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle, XCircle, Edit, Save, Loader2, ArrowLeft, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { getAuthToken } from "@/lib/auth-client"

interface ExtractedParameter {
  name: string;
  value: string;
  unit: string;
  normalRange: string;
  status: string;
  isEditing?: boolean;
  editedValue?: string;
}

export default function ReviewExtractedData() {
  const { toast } = useToast()
  const router = useRouter()
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [reviewData, setReviewData] = useState<any>(null)
  const [extractedParameters, setExtractedParameters] = useState<ExtractedParameter[]>([])
  const [notes, setNotes] = useState("")

  useEffect(() => {
    const loadReviewData = () => {
      try {
        const dataStr = localStorage.getItem('report_extraction_review_data')
        
        if (!dataStr) {
          toast({
            title: "No data found",
            description: "Please upload a report first",
            variant: "destructive"
          })
          router.push('/dashboard/reports/upload')
          return
        }

        const data = JSON.parse(dataStr)
        setReviewData(data)
        
        if (data.extractedData?.parameters) {
          setExtractedParameters(data.extractedData.parameters)
        }
        
        if (data.formData?.notes) {
          setNotes(data.formData.notes)
        }
        
        setIsLoading(false)
      } catch (error) {
        console.error('Error loading review data:', error)
        toast({
          title: "Error",
          description: "Failed to load extracted data. Please upload again.",
          variant: "destructive"
        })
        router.push('/dashboard/reports/upload')
      }
    }

    loadReviewData()
  }, [])

  const handleEditParameter = (index: number) => {
    const newParams = [...extractedParameters]
    newParams[index] = {
      ...newParams[index],
      isEditing: true,
      editedValue: newParams[index].value
    }
    setExtractedParameters(newParams)
  }

  const handleSaveParameter = (index: number) => {
    const newParams = [...extractedParameters]
    newParams[index] = {
      ...newParams[index],
      value: newParams[index].editedValue || newParams[index].value,
      isEditing: false
    }
    setExtractedParameters(newParams)
  }

  const handleParameterChange = (index: number, value: string) => {
    const newParams = [...extractedParameters]
    newParams[index] = {
      ...newParams[index],
      editedValue: value
    }
    setExtractedParameters(newParams)
  }

  const handleConfirmSave = async () => {
    if (!reviewData) return
    
    setIsSaving(true)
    
    try {
      const token = getAuthToken()
      if (!token) {
        toast({
          title: "Authentication required",
          description: "Please login to save report",
          variant: "destructive"
        })
        return
      }

      // Prepare final data
      const finalData = {
        reportId: reviewData.reportId,
        extractedData: {
          ...reviewData.extractedData,
          parameters: extractedParameters
        },
        notes: notes || reviewData.formData?.notes
      }

      // Save the report with reviewed data
      const response = await fetch('/api/reports/mv2001savereport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(finalData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save report')
      }

      // Clear localStorage
      localStorage.removeItem('report_extraction_review_data')

      toast({
        title: "Report saved successfully!",
        description: "Your medical report has been stored.",
      })
      
      // Redirect to reports list
      setTimeout(() => {
        router.push('/dashboard/reports')
      }, 1500)
      
    } catch (error: any) {
      console.error('Save error:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to save report. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading extracted data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/dashboard/reports/upload')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Review Extracted Data</h1>
          <p className="text-muted-foreground">
            Verify and edit the extracted medical data before saving
          </p>
        </div>
      </div>

      {/* Report Info */}
      {reviewData && (
        <Card>
          <CardHeader>
            <CardTitle>Report Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Report Name</Label>
                <p className="font-medium">{reviewData.formData?.name || reviewData.fileName}</p>
              </div>
              <div>
                <Label>File Type</Label>
                <p className="font-medium">{reviewData.fileType?.split('/')[1]?.toUpperCase() || 'File'}</p>
              </div>
              <div>
                <Label>Extraction Confidence</Label>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(reviewData.extractedData?.metadata?.confidence || 0.5) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {Math.round((reviewData.extractedData?.metadata?.confidence || 0.5) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Extracted Parameters Table */}
      <Card>
        <CardHeader>
          <CardTitle>Extracted Medical Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          {extractedParameters.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Data Extracted</h3>
              <p className="text-muted-foreground mb-6">
                The system could not extract medical data from this report.
                You can still save the report and add data manually later.
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parameter</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Normal Range</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {extractedParameters.map((param, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{param.name}</TableCell>
                      <TableCell>
                        {param.isEditing ? (
                          <Input
                            value={param.editedValue || param.value}
                            onChange={(e) => handleParameterChange(index, e.target.value)}
                            className="w-32"
                          />
                        ) : (
                          param.value
                        )}
                      </TableCell>
                      <TableCell>{param.unit}</TableCell>
                      <TableCell>{param.normalRange}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {param.status === 'normal' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className={
                            param.status === 'normal' ? 'text-green-600' : 'text-red-600'
                          }>
                            {param.status.charAt(0).toUpperCase() + param.status.slice(1)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {param.isEditing ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSaveParameter(index)}
                          >
                            <Save className="h-3 w-3 mr-1" />
                            Save
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditParameter(index)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {reviewData?.extractedData?.metadata && (
                <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
                  <p>Extracted via: {reviewData.extractedData.metadata.extractionMethod}</p>
                  <p>Confidence: {Math.round(reviewData.extractedData.metadata.confidence * 100)}%</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            className="w-full min-h-[100px] border rounded-lg p-3"
            placeholder="Add any additional notes or comments about this report..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Information Alert */}
      <Alert className="bg-blue-50 border-blue-200">
        <CheckCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          Please verify all extracted values. Incorrect data may affect health monitoring accuracy.
          Once confirmed, the report will be saved to your medical vault.
        </AlertDescription>
      </Alert>

      {/* Actions */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/reports/upload')}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirmSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Confirm & Save Report'
          )}
        </Button>
      </div>
    </div>
  )
}