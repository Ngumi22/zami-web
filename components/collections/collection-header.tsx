export default function CollectionsHeader() {
  return (
    <header className="bg-card border-b border-border">
      <div className="container mx-auto px-4 py-6 text-center">
        <h1 className="text-xl md:text-5xl font-bold text-foreground mb-4 text-balance">
          Featured Collection
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
          Discover our carefully curated selection of premium products designed
          specifically for you
        </p>
      </div>
    </header>
  );
}
