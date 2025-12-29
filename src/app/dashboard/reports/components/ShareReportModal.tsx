// app/dashboard/reports/components/ShareReportModal.tsx - UPDATE THIS FILE
"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Copy, Mail, Link as LinkIcon, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getAuthToken } from "@/lib/auth-client"

interface ShareReportModalProps {
  open: boolean;
  onClose: () => void;
  reportId: string;
}

export default function ShareReportModal({ open, onClose, reportId }: ShareReportModalProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('user')
  const [isLoading, setIsLoading] = useState(false)
  const [generatedLink, setGeneratedLink] = useState<string>('')
  const [formData, setFormData] = useState({
    email: '',
    permission: 'view',
    role: 'doctor',
    expiresAt: '',
    generateLink: false,
    linkExpires: '7d'
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleShareWithUser = async () => {
    if (!formData.email) {
      toast({
        title: "Email required",
        description: "Please enter an email address",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const token = getAuthToken()
      if (!token) throw new Error('Not authenticated')

      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Report shared",
        description: `Report shared with ${formData.email}`,
      })
      
      onClose()
    } catch (error) {
      console.error('Share failed:', error)
      toast({
        title: "Share failed",
        description: "Failed to share report. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateLink = async () => {
    setIsLoading(true)
    try {
      const token = getAuthToken()
      if (!token) throw new Error('Not authenticated')

      // Generate a mock link (in real app, this would come from API)
      const mockLink = `https://medivault.com/share/${reportId}/${Math.random().toString(36).substring(7)}`
      setGeneratedLink(mockLink)
      
      toast({
        title: "Link generated",
        description: "Shareable link created successfully",
      })
    } catch (error) {
      console.error('Generate link failed:', error)
      toast({
        title: "Failed to generate link",
        description: "Please try again",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyLink = () => {
    if (!generatedLink) return
    
    navigator.clipboard.writeText(generatedLink)
    toast({
      title: "Link copied",
      description: "Shareable link copied to clipboard",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Report</DialogTitle>
          <DialogDescription>
            Share this medical report with doctors, family members, or generate a shareable link.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="user" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Share with User
            </TabsTrigger>
            <TabsTrigger value="link" className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Generate Link
            </TabsTrigger>
          </TabsList>

          {/* Share with User */}
          <TabsContent value="user" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="doctor@hospital.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="permission">Permission</Label>
                <Select
                  value={formData.permission}
                  onValueChange={(value) => handleInputChange('permission', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select permission" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">View Only</SelectItem>
                    <SelectItem value="edit">Can Edit</SelectItem>
                    <SelectItem value="admin">Full Access</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleInputChange('role', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="family">Family Member</SelectItem>
                    <SelectItem value="friend">Friend</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="expiresAt">Set Expiration</Label>
                <Switch
                  checked={!!formData.expiresAt}
                  onCheckedChange={(checked) => 
                    handleInputChange('expiresAt', checked ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : '')
                  }
                  disabled={isLoading}
                />
              </div>
              {formData.expiresAt && (
                <Input
                  id="expiresAt"
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => handleInputChange('expiresAt', e.target.value)}
                  disabled={isLoading}
                />
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleShareWithUser} disabled={isLoading || !formData.email}>
                {isLoading ? 'Sharing...' : 'Share Report'}
              </Button>
            </div>
          </TabsContent>

          {/* Generate Link */}
          <TabsContent value="link" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Link Settings</Label>
                <div className="flex items-center gap-3">
                  <Select
                    value={formData.linkExpires}
                    onValueChange={(value) => handleInputChange('linkExpires', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Expires in" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1d">1 Day</SelectItem>
                      <SelectItem value="7d">7 Days</SelectItem>
                      <SelectItem value="30d">30 Days</SelectItem>
                      <SelectItem value="never">Never Expires</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {generatedLink ? (
                <div className="space-y-2">
                  <Label>Shareable Link</Label>
                  <div className="flex gap-2">
                    <Input
                      value={generatedLink}
                      readOnly
                      className="flex-1 font-mono text-sm"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={handleCopyLink}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Anyone with this link can view the report
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border p-4 text-center">
                  <LinkIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Generate a shareable link for this report
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={onClose} disabled={isLoading}>
                  Cancel
                </Button>
                {generatedLink ? (
                  <Button variant="outline" onClick={() => setGeneratedLink('')}>
                    Generate New Link
                  </Button>
                ) : (
                  <Button onClick={handleGenerateLink} disabled={isLoading}>
                    {isLoading ? 'Generating...' : 'Generate Link'}
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}