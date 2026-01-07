import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function PlayersPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Spillere</h1>
        <p className="text-muted-foreground mt-2">
          Administrer klubbens spillere
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Spilleroversigt</CardTitle>
          <CardDescription>
            Under udvikling - funktionalitet kommer snart
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Her vil du kunne se alle spillere, tilføje nye, og importere fra Holdsport.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
