import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { BlogPost } from "@prisma/client";

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="bg-white border border-gray-300 rounded-none overflow-hidden hover:shadow-md transition-shadow duration-300 p-2">
      <div className="flex items-center justify-between">
        {/* Image Section - Left Side */}
        <div className="relative w-1/3 h-48  flex-shrink-0">
          <Image
            src={post.featuredImage || "/placeholder.svg?height=192&width=256"}
            alt={post.title}
            fill
            className="object-cover my-auto"
          />
        </div>

        {/* Content Section - Right Side */}
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <time className="text-sm text-gray-500 mb-2 block">
              {post.publishedAt ? post.publishedAt.toLocaleDateString() : ""}
            </time>

            <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight">
              {post.title}
            </h2>

            <p className="text-gray-600 mb-4 line-clamp-2 text-sm leading-relaxed">
              {post.excerpt}
            </p>
          </div>

          <Link
            href={`/blog/${post.slug}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors text-sm">
            Read More
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </article>
  );
}
