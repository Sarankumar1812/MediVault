import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function EmptyState() {
  return (
    <div className="text-center py-20 space-y-4">
      <p className="text-muted-foreground">
        No medical reports uploaded yet.
      </p>
      <Link href="/dashboard/reports/upload">
        <Button>Upload Your First Report</Button>
      </Link>
    </div>
  )
}
