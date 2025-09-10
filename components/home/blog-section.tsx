"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DateFormatter } from "@/lib/utils";
import { BlogPost } from "@prisma/client";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function BlogSection({ blogPosts }: { blogPosts: BlogPost[] }) {
  return (
    <section className="w-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Our Latest Blog
          </h2>
          <p className="text-muted-foreground">
            Lorem Ipsum is simply dummy text of the printing
          </p>
        </div>
        <Link href={"/blog"}>
          <Button
            variant="ghost"
            className="hidden md:flex text-black font-medium text-sm tracking-wide transition-colors self-start border-none hover:underline hover:underline-offset-4">
            See All Articles <ArrowRight className="ml-2 my-auto h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {blogPosts.map((post) => (
          <Card
            key={post.id}
            className="overflow-hidden border-0 shadow-sm bg-card">
            <div className="flex h-[200px]">
              <div className="w-1/2 relative">
                <Image
                  src={post.featuredImage || "/placeholder.svg"}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="w-1/2 p-3 md:p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span className="text-sm font-medium text-black uppercase tracking-wide">
                      {DateFormatter(post.publishedAt)}
                    </span>
                  </div>

                  <h3 className="md:text-lg font-semibold text-foreground mb-3 leading-tight">
                    {post.title}
                  </h3>

                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                </div>

                <Button
                  variant="outline"
                  className="text-black font-medium text-sm uppercase tracking-wide transition-colors self-start border-none hover:underline hover:underline-offset-4">
                  <Link href={`/blog/${post.slug}`}>READ MORE</Link>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-center md:hidden">
        <Button variant="outline">See All Articles</Button>
      </div>
    </section>
  );
}
