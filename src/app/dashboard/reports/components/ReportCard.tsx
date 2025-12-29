import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ReportCard({ report }: any) {
  return (
    <Card className="hover:shadow-md transition">
      <CardContent className="space-y-3 pt-6">
        <div>
          <h3 className="font-medium">{report.name}</h3>
          <p className="text-sm text-muted-foreground">{report.type}</p>
        </div>

        <p className="text-sm">Date: {report.date}</p>

        {report.vitals.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {report.vitals.map((v: string) => (
              <span
                key={v}
                className="text-xs bg-muted px-2 py-1 rounded"
              >
                {v}
              </span>
            ))}
          </div>
        )}

        <div className="flex justify-between pt-2">
          <Link href={`/dashboard/reports/${report.id}`}>
            <Button size="sm" variant="outline">
              View
            </Button>
          </Link>
          <Button size="sm" variant="ghost">
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
