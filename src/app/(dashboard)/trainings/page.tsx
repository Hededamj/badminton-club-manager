import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function TrainingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Træninger</h1>
        <p className="text-muted-foreground mt-2">
          Planlæg og administrer træningssessioner
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Træningsoversigt</CardTitle>
          <CardDescription>
            Under udvikling - funktionalitet kommer snart
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Her vil du kunne oprette træninger, tilmelde spillere, og generere kampfordeling.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
