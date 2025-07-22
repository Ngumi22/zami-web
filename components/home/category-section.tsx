import Link from "next/link"
import type { Category } from "@/lib/types"

interface CategorySectionProps {
  categories: Category[]
}

export function CategorySection({ categories }: CategorySectionProps) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.id}`}
              className="group bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
              <p className="text-gray-600">{category.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
