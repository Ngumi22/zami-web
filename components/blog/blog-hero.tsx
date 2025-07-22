import Image from "next/image";

export function BlogHero() {
  return (
    <div className="relative h-32 md:h-40 lg:h-52 overflow-hidden">
      <Image
        src="/placeholder.jpg"
        alt="Modern kitchen and dining area"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 flex items-center justify-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
          Blogs
        </h1>
      </div>
    </div>
  );
}
