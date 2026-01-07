import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function StatisticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Statistik</h1>
        <p className="text-muted-foreground mt-2">
          Se detaljeret statistik og rankings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Statistikoversigt</CardTitle>
          <CardDescription>
            Under udvikling - funktionalitet kommer snart
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Her vil du kunne se spillerstatistikker, rankings, og performance over tid.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
