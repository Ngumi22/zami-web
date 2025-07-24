import { Card, CardContent } from "@/components/ui/card"

export default function ProductsLoading() {
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header Skeleton */}
      <div className="bg-card rounded-lg border p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="h-10 bg-muted rounded-md w-full max-w-md animate-pulse" />
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="h-6 bg-muted rounded w-20 animate-pulse" />
            <div className="h-10 bg-muted rounded w-[180px] animate-pulse" />
            <div className="hidden md:flex items-center gap-1 border rounded-md p-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-8 h-8 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Skeleton */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="space-y-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-5 bg-muted rounded w-24 animate-pulse" />
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="h-4 bg-muted rounded w-full animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Products Grid Skeleton */}
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="aspect-square bg-muted rounded-lg mb-3" />
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="h-4 bg-muted rounded w-1/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
