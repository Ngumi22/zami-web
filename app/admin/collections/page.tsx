import Link from "next/link";
import type { Collection, Product } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Package } from "lucide-react";
import { DeleteCollectionButton } from "@/components/admin/forms/collection/delete-collection-button";
import {
  getCollections,
  getCollectionsWithProducts,
} from "@/data/collections/collectionsPage";

interface CollectionWithProducts extends Collection {
  products: {
    product: Product;
  }[];
}

enum CollectionType {
  STATIC = "STATIC",
  DYNAMIC = "DYNAMIC",
  FLASH_SALE = "FLASH_SALE",
}

export default async function CollectionsPage() {
  const collections: CollectionWithProducts[] =
    await getCollectionsWithProducts();

  const staticCollections = collections.filter(
    (c) => c.type === CollectionType.STATIC
  );
  const dynamicCollections = collections.filter(
    (c) => c.type === CollectionType.DYNAMIC
  );
  const flashSaleCollections = collections.filter(
    (c) => c.type === CollectionType.FLASH_SALE
  );

  const CollectionsList = ({
    collections,
  }: {
    collections: CollectionWithProducts[];
  }) => (
    <>
      {collections.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="pt-6">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No collections found</h3>
            <p className="text-muted-foreground mb-6">
              No collections of this type exist yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="hidden lg:block">
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">Collection</th>
                      <th className="text-left p-4 font-medium">Type</th>
                      <th className="text-left p-4 font-medium">Products</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {collections.map((collection) => (
                      <tr
                        key={collection.id}
                        className="border-b last:border-0">
                        <td className="p-4">
                          <div>
                            <div className="font-medium">{collection.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {collection.slug}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm">{collection.type}</td>
                        <td className="p-4 text-sm">
                          {collection.products.length} products
                        </td>
                        <td className="p-4">
                          <Badge
                            variant={
                              collection.isActive ? "default" : "secondary"
                            }>
                            {collection.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/admin/collections/${collection.id}/edit`}
                              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input  hover:bg-accent hover:text-accent-foreground h-9 px-3">
                              <Edit className="h-4 w-4" />
                            </Link>
                            <DeleteCollectionButton id={collection.id} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          <div className="grid gap-4 lg:hidden">
            {collections.map((collection) => (
              <Card key={collection.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        {collection.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {collection.slug}
                      </p>
                    </div>
                    <Badge
                      variant={collection.isActive ? "outline" : "secondary"}>
                      {collection.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        Type: {collection.type}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {collection.products.length} products
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/collections/${collection.id}/edit`}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input  hover:bg-accent hover:text-accent-foreground h-9 px-3">
                        <Edit className="h-4 w-4" />
                      </Link>
                      <DeleteCollectionButton id={collection.id} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </>
  );

  return (
    <div className="md:container mx-auto p-2 md:p-4 md:max-w-7xl">
      <div className="flex flex-row items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Collections</h1>
          <p className="text-muted-foreground">
            Manage product collections and flash sales
          </p>
        </div>
        <Link
          href="/admin/collections/new"
          className="inline-flex items-center justify-end rounded-md text-sm w-fit font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-black text-white hover:bg-black/90 h-10 px-4 py-2">
          <Plus className="h-4 w-4 mr-2" />
          Create Collection
        </Link>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({collections.length})</TabsTrigger>
          <TabsTrigger value="static">
            Static ({staticCollections.length})
          </TabsTrigger>
          <TabsTrigger value="dynamic">
            Dynamic ({dynamicCollections.length})
          </TabsTrigger>
          <TabsTrigger value="flash-sale">
            Flash Sale ({flashSaleCollections.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <CollectionsList collections={collections} />
        </TabsContent>

        <TabsContent value="static" className="mt-6">
          <CollectionsList collections={staticCollections} />
        </TabsContent>

        <TabsContent value="dynamic" className="mt-6">
          <CollectionsList collections={dynamicCollections} />
        </TabsContent>

        <TabsContent value="flash-sale" className="mt-6">
          <CollectionsList collections={flashSaleCollections} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
