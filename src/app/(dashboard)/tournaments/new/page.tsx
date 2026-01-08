'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, Trophy } from 'lucide-react'

export default function NewTournamentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    format: 'SINGLE_ELIMINATION',
    matchTypes: ['MENS_DOUBLES', 'WOMENS_DOUBLES', 'MIXED_DOUBLES'] as string[],
    description: '',
  })

  const toggleMatchType = (type: string) => {
    setFormData(prev => {
      const currentTypes = prev.matchTypes
      const hasSingles = type === 'SINGLES' || currentTypes.includes('SINGLES')
      const isDoubles = type !== 'SINGLES'

      // If trying to toggle singles
      if (type === 'SINGLES') {
        // If singles is already selected, uncheck it
        if (currentTypes.includes('SINGLES')) {
          return { ...prev, matchTypes: [] }
        }
        // Otherwise, set only singles
        return { ...prev, matchTypes: ['SINGLES'] }
      }

      // If trying to toggle a doubles type while singles is selected
      if (currentTypes.includes('SINGLES')) {
        // Replace singles with this doubles type
        return { ...prev, matchTypes: [type] }
      }

      // Normal toggle for doubles types
      if (currentTypes.includes(type)) {
        const newTypes = currentTypes.filter(t => t !== type)
        return { ...prev, matchTypes: newTypes.length > 0 ? newTypes : prev.matchTypes }
      } else {
        return { ...prev, matchTypes: [...currentTypes, type] }
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const submitData: any = {
        name: formData.name,
        startDate: formData.startDate,
        format: formData.format,
        matchTypes: formData.matchTypes,
      }

      if (formData.endDate) {
        submitData.endDate = formData.endDate
      }

      if (formData.description) {
        submitData.description = formData.description
      }

      const res = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Kunne ikke oprette turnering')
      }

      router.push('/tournaments')
    } catch (err) {
      console.error('Error creating tournament:', err)
      setError(err instanceof Error ? err.message : 'Der opstod en fejl')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/tournaments')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">Ny Turnering</h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            Opret en ny turnering for klubben
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Turneringsoplysninger
          </CardTitle>
          <CardDescription>
            Udfyld oplysninger om turneringen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Navn *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Hareskov Club Championship 2026"
                required
                disabled={loading}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Startdato *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Slutdato (valgfri)</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="format">Turneringsformat *</Label>
              <Select
                value={formData.format}
                onValueChange={(value) => setFormData({ ...formData, format: value })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SINGLE_ELIMINATION">Single Elimination</SelectItem>
                  <SelectItem value="DOUBLE_ELIMINATION">Double Elimination</SelectItem>
                  <SelectItem value="ROUND_ROBIN">Round Robin</SelectItem>
                  <SelectItem value="SWISS">Swiss</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Match types selection */}
            <div className="space-y-3">
              <Label>Kamptype *</Label>
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="mens_doubles"
                    checked={formData.matchTypes.includes('MENS_DOUBLES')}
                    onCheckedChange={() => toggleMatchType('MENS_DOUBLES')}
                    disabled={loading || formData.matchTypes.includes('SINGLES')}
                  />
                  <label
                    htmlFor="mens_doubles"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Herre Double (HD)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="womens_doubles"
                    checked={formData.matchTypes.includes('WOMENS_DOUBLES')}
                    onCheckedChange={() => toggleMatchType('WOMENS_DOUBLES')}
                    disabled={loading || formData.matchTypes.includes('SINGLES')}
                  />
                  <label
                    htmlFor="womens_doubles"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Dame Double (DD)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="mixed_doubles"
                    checked={formData.matchTypes.includes('MIXED_DOUBLES')}
                    onCheckedChange={() => toggleMatchType('MIXED_DOUBLES')}
                    disabled={loading || formData.matchTypes.includes('SINGLES')}
                  />
                  <label
                    htmlFor="mixed_doubles"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Mix Double (MD)
                  </label>
                </div>
                <div className="border-t pt-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="singles"
                      checked={formData.matchTypes.includes('SINGLES')}
                      onCheckedChange={() => toggleMatchType('SINGLES')}
                      disabled={loading}
                    />
                    <label
                      htmlFor="singles"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Single
                    </label>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Du kan vælge flere double-typer (HD, DD, MD), men Single kan ikke kombineres med double-typer
              </p>
            </div>

            {/* Tournament format descriptions */}
            <div className="space-y-3">
              {formData.format === 'SINGLE_ELIMINATION' && (
                <div className="rounded-lg border bg-blue-50 border-blue-200 p-3 md:p-4">
                  <h3 className="font-semibold text-blue-900 mb-2 text-sm md:text-base">Single Elimination</h3>
                  <p className="text-xs md:text-sm text-blue-800 mb-2">
                    Klassisk cup-turnering hvor spillere slås ud ved nederlag.
                  </p>
                  <ul className="text-xs md:text-sm text-blue-700 space-y-1 list-disc list-inside">
                    <li>Tab én kamp = ude af turneringen</li>
                    <li>Vindere går videre til næste runde</li>
                    <li>Hurtig afvikling - færrest kampe</li>
                    <li>Klar struktur: Første runde → Kvartfinale → Semifinale → Finale</li>
                  </ul>
                </div>
              )}

              {formData.format === 'DOUBLE_ELIMINATION' && (
                <div className="rounded-lg border bg-purple-50 border-purple-200 p-3 md:p-4">
                  <h3 className="font-semibold text-purple-900 mb-2 text-sm md:text-base">Double Elimination</h3>
                  <p className="text-xs md:text-sm text-purple-800 mb-2">
                    To-sporet turnering hvor man får en ekstra chance.
                  </p>
                  <ul className="text-xs md:text-sm text-purple-700 space-y-1 list-disc list-inside">
                    <li>Spillere skal tabe 2 kampe for at være ude</li>
                    <li>Winners bracket (aldrig tabt) og Losers bracket (tabt én gang)</li>
                    <li>Mere retfærdig - ingen slås ud af en enkelt dårlig kamp</li>
                    <li>Længere turneringstid end Single Elimination</li>
                  </ul>
                </div>
              )}

              {formData.format === 'ROUND_ROBIN' && (
                <div className="rounded-lg border bg-green-50 border-green-200 p-3 md:p-4">
                  <h3 className="font-semibold text-green-900 mb-2 text-sm md:text-base">Round Robin</h3>
                  <p className="text-xs md:text-sm text-green-800 mb-2">
                    Alle spillere møder forskellige modstandere og partnere.
                  </p>
                  <ul className="text-xs md:text-sm text-green-700 space-y-1 list-disc list-inside">
                    <li>Intelligent matchmaking sikrer variation i partnere og modstandere</li>
                    <li>Alle spillere får lige mange kampe (typisk 6-8 kampe)</li>
                    <li>Point tildeles efter sejre - vindere kåres på samlet pointtal</li>
                    <li>Ideel til sociale turneringer hvor alle skal spille meget</li>
                    <li>Kan håndtere mange spillere (systemet laver max 200 kampe)</li>
                  </ul>
                </div>
              )}

              {formData.format === 'SWISS' && (
                <div className="rounded-lg border bg-orange-50 border-orange-200 p-3 md:p-4">
                  <h3 className="font-semibold text-orange-900 mb-2 text-sm md:text-base">Swiss System</h3>
                  <p className="text-xs md:text-sm text-orange-800 mb-2">
                    Spillere matches efter aktuel placering i et fast antal runder.
                  </p>
                  <ul className="text-xs md:text-sm text-orange-700 space-y-1 list-disc list-inside">
                    <li>Fast antal runder (typisk 5-7)</li>
                    <li>Spillere med samme score møder hinanden</li>
                    <li>Ingen bliver slået ud - alle spiller alle runder</li>
                    <li>Vindere kåres på samlet point efter alle runder</li>
                    <li>God balance mellem retfærdighed og turneringslængde</li>
                  </ul>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Beskrivelse (valgfri)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Beskrivelse af turneringen, regler, præmier osv."
                rows={4}
                disabled={loading}
              />
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/tournaments')}
                disabled={loading}
              >
                Annuller
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Opretter...' : 'Opret Turnering'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
