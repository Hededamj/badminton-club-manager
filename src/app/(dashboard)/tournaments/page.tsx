import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function TournamentsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Turneringer</h1>
        <p className="text-muted-foreground mt-2">
          Opret og administrer klubturneringer
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Turneringsoversigt</CardTitle>
          <CardDescription>
            Under udvikling - funktionalitet kommer snart
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Her vil du kunne oprette turneringer, lave brackets, og følge resultater.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
