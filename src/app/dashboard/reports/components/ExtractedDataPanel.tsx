export default function ExtractedDataPanel() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Extracted Data</h2>

      <table className="w-full text-sm border">
        <thead className="bg-muted">
          <tr>
            <th className="p-2 text-left">Parameter</th>
            <th className="p-2 text-left">Value</th>
            <th className="p-2 text-left">Unit</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <td className="p-2">Blood Sugar</td>
            <td className="p-2">98</td>
            <td className="p-2">mg/dL</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
