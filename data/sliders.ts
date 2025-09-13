interface CarouselSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  imageUrl: string;
}

export const slides: CarouselSlide[] = [
  {
    id: 1,
    title: "Smartphones That Power Your Life",
    subtitle: "TOP PICKS",
    description:
      "Discover the latest iPhone, Samsung, and Pixel smartphones with cutting-edge performance.",
    buttonText: "SHOP SMARTPHONES",
    imageUrl: "ipho.png",
  },
  {
    id: 2,
    title: "Laptops Built for Every Lifestyle",
    subtitle: "NEW ARRIVALS",
    description:
      "From business-ready ultrabooks to gaming beasts — find the laptop that works for you.",
    buttonText: "EXPLORE LAPTOPS",
    imageUrl: "promo.webp",
  },
  {
    id: 3,
    title: "Powerful Desktop Computers",
    subtitle: "FEATURED",
    description:
      "Unleash performance with high-speed computers for creators, developers, and businesses.",
    buttonText: "SHOP COMPUTERS",
    imageUrl: "promo.webp",
  },
];
