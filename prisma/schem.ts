// generator client {
//   provider = "prisma-client-js"
// }

// datasource db {
//   provider  = "mongodb"
//   url       = env("DATABASE_URL")
//   directUrl = env("DIRECT_DATABASE_URL")
// }

// enum CustomerStatus {
//   ACTIVE
//   INACTIVE
//   SUSPENDED
//   PENDING_VERIFICATION
// }

// enum OrderStatus {
//   PENDING
//   PROCESSING
//   SHIPPED
//   DELIVERED
//   COMPLETED
//   CANCELLED
//   REFUNDED
// }

// enum PaymentStatus {
//   PENDING
//   PAID
//   REFUNDED
//   OVERDUE
//   CANCELLED
// }

// enum DiscountType {
//   PERCENTAGE
//   FIXED
// }

// enum BlogPostStatus {
//   DRAFT
//   PUBLISHED
//   ARCHIVED
// }

// enum CategorySpecificationType {
//   TEXT
//   NUMBER
//   SELECT
//   BOOLEAN
// }

// enum CollectionType {
//   STATIC
//   DYNAMIC
//   FLASH_SALE
// }

// type ProductVariant {
//   id            String
//   name          String
//   type          String
//   value         String
//   priceModifier Float   @default(0)
//   stock         Int
//   sku           String?
// }

// type CategorySpecification {
//   id       String
//   name     String
//   type     CategorySpecificationType
//   required Boolean                   @default(false)
//   options  String[]
//   unit     String?
// }

// type CartItem {
//   productId String  @db.ObjectId
//   variantId String?
//   quantity  Int
//   price     Float
// }

// type OrderItem {
//   productId   String  @db.ObjectId
//   productName String
//   variantId   String?
//   variantName String?
//   quantity    Int
//   price       Float
//   total       Float
//   sku         String?
// }

// type ShippingAddress {
//   fullName     String
//   addressLine1 String
//   addressLine2 String?
//   city         String
//   state        String
//   postalCode   String
//   country      String
//   phone        String?
// }

// type InvoiceCustomer {
//   id      String @db.ObjectId
//   name    String
//   email   String
//   address String
//   phone   String
// }

// type InvoiceItem {
//   description String
//   quantity    Int
//   unitPrice   Float
//   total       Float
//   sku         String?
// }

// enum AuthProvider {
//   EMAIL
//   GOOGLE
// }

// enum Role {
//   ADMIN
//   USER
// }

// model User {
//   id              String   @id @default(auto()) @map("_id") @db.ObjectId
//   email           String   @unique
//   name            String
//   passwordHash    String
//   role            Role     @default(USER)
//   emailVerified   Boolean
//   image           String?
//   userLastLogin    DateTime?

//   twoFactorEnabled Boolean @default(false)
//   twoFactorSecret  String?

//   createdAt       DateTime @default(now())
//   updatedAt       DateTime @updatedAt

//   sessions        UserSession[]
//   verificationTokens UserVerificationToken[]

//   products      Product[]  @relation("ProductsByUser")
//   posts     BlogPost[] @relation("BlogAuthor")

//   @@map("users")
// }

// model UserSession {
//   id           String   @id @default(auto()) @map("_id") @db.ObjectId
//   sessionToken String   @unique
//   userId       String   @db.ObjectId
//   user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
//   expires      DateTime

//   ipAddress    String?
//   userAgent    String?

//   createdAt    DateTime @default(now())
//   updatedAt    DateTime @updatedAt

//   @@map("user_sessions")
// }

// model Customer {
//   id           String         @id @default(auto()) @map("_id") @db.ObjectId
//   name         String
//   phone        String?
//   email        String         @unique
//   password     String?
//   status       CustomerStatus @default(PENDING_VERIFICATION)
//   joinDate     DateTime       @default(now())
//   customerLastLogin    DateTime?
//   totalSpent   Float          @default(0)

//   accounts        CustomerAccount[]
//   sessions        CustomerSession[]
//   verificationTokens CustomerVerificationToken[]

//   orders       Order[]
//   reviews      Review[]
//   cart         Cart?
//   addresses    CustomerAddress[]
//   socialAccounts CustomerSocialAccount[]
//   wishlist     Wishlist?

//   authProvider AuthProvider   @default(EMAIL)
//   providerId   String?
//   emailVerified Boolean       @default(false)
//   verificationToken String?
//   verificationTokenExpires DateTime?
//   resetToken     String?
//   resetTokenExpires DateTime?
//   loginAttempts  Int          @default(0)
//   lockedUntil    DateTime?

//   avatar       String?

//   createdAt    DateTime       @default(now())
//   updatedAt    DateTime       @updatedAt

//   @@index([status])
//   @@index([createdAt])
//   @@unique([authProvider, providerId])
// }

// model CustomerAccount {
//   id                String   @id @default(auto()) @map("_id") @db.ObjectId
//   customerId        String   @db.ObjectId
//   customer          Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)

//   provider          String
//   providerAccountId String

//   passwordHash      String?

//   access_token      String?
//   refresh_token     String?
//   expires_at        Int?
//   id_token          String?
//   scope             String?
//   token_type        String?

//   @@unique([provider, providerAccountId])
//   @@map("customer_accounts")
// }

// model CustomerSession {
//   id           String   @id @default(auto()) @map("_id") @db.ObjectId
//   sessionToken String   @unique
//   customerId   String   @db.ObjectId
//   customer     Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
//   expires      DateTime

//   ipAddress    String?
//   userAgent    String?

//   createdAt    DateTime @default(now())
//   updatedAt    DateTime @updatedAt

//   @@map("customer_sessions")
// }

// model UserVerificationToken {
//   id        String   @id @default(auto()) @map("_id") @db.ObjectId
//   token     String   @unique
//   expires   DateTime
//   purpose   String
//   createdAt DateTime @default(now())

//   userId    String   @db.ObjectId
//   user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

//   @@map("user_verification_tokens")
// }

// model CustomerVerificationToken {
//   id         String   @id @default(auto()) @map("_id") @db.ObjectId
//   token      String   @unique
//   expires    DateTime
//   purpose    String
//   createdAt  DateTime @default(now())

//   customerId String   @db.ObjectId
//   customer   Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)

//   @@map("customer_verification_tokens")
// }

// model Wishlist {
//   id         String         @id @default(auto()) @map("_id") @db.ObjectId
//   customerId String         @unique @db.ObjectId
//   customer   Customer       @relation(fields: [customerId], references: [id])
//   items      WishlistItem[]
//   createdAt  DateTime       @default(now())
//   updatedAt  DateTime       @updatedAt
// }

// model WishlistItem {
//   id         String     @id @default(auto()) @map("_id") @db.ObjectId
//   wishlistId String     @db.ObjectId
//   wishlist   Wishlist   @relation(fields: [wishlistId], references: [id])
//   productId  String     @db.ObjectId
//   product    Product    @relation(fields: [productId], references: [id])
//   addedAt    DateTime   @default(now())

//   @@unique([wishlistId, productId])
//   @@index([wishlistId])
//   @@index([productId])
// }

// model CustomerSocialAccount {
//   id           String      @id @default(auto()) @map("_id") @db.ObjectId
//   customerId   String      @db.ObjectId
//   customer     Customer    @relation(fields: [customerId], references: [id], onDelete: Cascade)
//   provider     AuthProvider
//   providerId   String
//   email        String?
//   name         String?
//   avatar       String?
//   accessToken  String?
//   refreshToken String?
//   expiresAt    DateTime?
//   createdAt    DateTime    @default(now())
//   updatedAt    DateTime    @updatedAt

//   @@unique([provider, providerId])
//   @@index([customerId])
// }

// model CustomerAddress {
//   id               String   @id @default(auto()) @map("_id") @db.ObjectId
//   customerId       String   @db.ObjectId
//   customer         Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
//   fullName         String
//   addressLine1     String
//   addressLine2     String?
//   city             String
//   state            String
//   postalCode       String
//   country          String
//   phone            String?
//   isDefault        Boolean  @default(false)
//   preferredCourier String?
//   createdAt        DateTime @default(now())
//   updatedAt        DateTime @updatedAt

//   @@index([customerId])
// }

// model Brand {
//   id          String    @id @default(auto()) @map("_id") @db.ObjectId
//   name        String
//   slug        String    @unique
//   logo        String?
//   description String?
//   isActive    Boolean   @default(true)
//   productCount   Int    @default(0)
//   products    Product[]
//   createdAt   DateTime  @default(now())
//   updatedAt   DateTime  @updatedAt

//   @@index([isActive, createdAt])
//   @@index([isActive])
//   @@index([name])
// }

// model Category {
//   id             String                  @id @default(auto()) @map("_id") @db.ObjectId
//   name           String
//   slug           String                  @unique
//   description    String?
//   image          String?
//   isActive       Boolean?                @default(true)
//   specifications CategorySpecification[]
//   productCount   Int                     @default(0)
//   products       Product[]
//   parentId       String?                 @db.ObjectId
//   parent         Category?               @relation("CategoryChildren", fields: [parentId], references: [id], onDelete: NoAction, onUpdate: NoAction)
//   children       Category[]              @relation("CategoryChildren")
//   createdAt      DateTime                @default(now())
//   updatedAt      DateTime                @updatedAt

//  @@index([parentId, name])
//   @@index([parentId])
//   @@index([name])
// }

// model Product {
//   id               String           @id @default(auto()) @map("_id") @db.ObjectId
//   name             String
//   slug             String           @unique
//   shortDescription String
//   description      String
//   price            Float
//   originalPrice    Float?
//   mainImage        String
//   thumbnailImages  String[]
//   stock            Int              @default(0)
//   featured         Boolean          @default(false)
//   variants         ProductVariant[]
//   specifications   Json
//   tags             String[]
//   averageRating    Float            @default(0)
//   reviewCount      Int              @default(0)
//   categoryId       String           @db.ObjectId
//   category         Category         @relation(fields: [categoryId], references: [id])
//   brandId          String           @db.ObjectId
//   brand            Brand            @relation(fields: [brandId], references: [id])
//   reviews          Review[]
//   sales            Int?             @default(0)
//   collections      ProductsOnCollections[]

//   createdById      String?   @db.ObjectId
//   createdBy        User?     @relation("ProductsByUser", fields: [createdById], references: [id])

//   createdAt        DateTime         @default(now())
//   updatedAt        DateTime         @updatedAt

//   @@index([categoryId])
//   @@index([brandId])
//   @@index([price])
//   @@index([averageRating])
//   @@fulltext([name, shortDescription, description, tags])
//   @@index([featured])
//   @@index([createdAt])
//   @@index([stock])
//   @@index([sales])
//   @@index([originalPrice])
//   @@index([featured, createdAt])

//   @@index([categoryId, createdAt])
//   @@index([categoryId, brandId])
//   @@index([categoryId, price])
//   @@index([categoryId, averageRating])
//   @@index([brandId, createdAt])
//   @@index([brandId, price])
//   @@index([originalPrice, createdAt])
//   @@index([sales, createdAt])

//   WishlistItem WishlistItem[]
// }

// model Collection {
//   id          String                   @id @default(auto()) @map("_id") @db.ObjectId
//   name        String
//   slug        String                   @unique
//   description String?
//   type        CollectionType           @default(STATIC)
//   isActive    Boolean                  @default(true)

//   startDate   DateTime?
//   endDate     DateTime?

//   products    ProductsOnCollections[]
//   createdAt   DateTime                 @default(now())
//   updatedAt   DateTime                 @updatedAt

//   @@index([isActive])
//   @@index([createdAt])
//   @@index([type, isActive])
//   @@index([startDate, endDate])
// }

// model ProductsOnCollections {
//   id           String      @id @default(auto()) @map("_id") @db.ObjectId
//   product      Product     @relation(fields: [productId], references: [id], onDelete: Cascade)
//   productId    String      @db.ObjectId
//   collection   Collection  @relation(fields: [collectionId], references: [id], onDelete: Cascade)
//   collectionId String      @db.ObjectId
//   order        Int         @default(0)
//   addedAt      DateTime    @default(now())

//   @@unique([productId, collectionId])
//   @@index([productId])
//   @@index([collectionId])
//   @@index([collectionId, order])
// }

// model Review {
//   id                 String   @id @default(auto()) @map("_id") @db.ObjectId
//   rating             Float
//   title              String?
//   comment            String
//   isVerifiedPurchase Boolean  @default(false)
//   customerId         String   @db.ObjectId
//   customer           Customer @relation(fields: [customerId], references: [id])
//   productId          String   @db.ObjectId
//   product            Product  @relation(fields: [productId], references: [id])
//   createdAt          DateTime @default(now())
//   updatedAt          DateTime @updatedAt

//   @@unique([customerId, productId])
//   @@index([productId])
//   @@index([rating])
//   @@index([createdAt])
//   @@index([productId, createdAt])
// }

// model Cart {
//   id         String     @id @default(auto()) @map("_id") @db.ObjectId
//   customerId String     @unique @db.ObjectId
//   customer   Customer   @relation(fields: [customerId], references: [id])
//   items      CartItem[]
//   createdAt  DateTime   @default(now())
//   updatedAt  DateTime   @updatedAt
// }

// model Order {
//   id              String          @id @default(auto()) @map("_id") @db.ObjectId
//   orderNumber     String          @unique

//   status          OrderStatus     @default(PENDING)
//   paymentStatus   PaymentStatus   @default(PENDING)

//   items           OrderItem[]

//   shippingAddress ShippingAddress
//   addressId       String?         @db.ObjectId
//   billingAddress  ShippingAddress?

//   subtotal        Float
//   tax             Float
//   shipping        Float
//   discount        Float
//   total           Float

//   couponId        String?         @db.ObjectId
//   couponCode      String?
//   coupon          Coupon?         @relation(fields: [couponId], references: [id])

//   paymentMethod   String
//   payments        Payment[]

//   customerId      String?         @db.ObjectId
//   customer        Customer?       @relation(fields: [customerId], references: [id])
//   customerName    String
//   customerEmail   String
//   guest           Boolean         @default(false)

//   notes           String?
//   trackingNumber  String?
//   cancelReason    String?
//   createdByAdmin  Boolean     @default(false)

//   createdAt       DateTime        @default(now())
//   updatedAt       DateTime        @updatedAt
//   shippedAt       DateTime?
//   deliveredAt     DateTime?
//   completedAt     DateTime?
//   cancelledAt     DateTime?

//   @@index([customerId])
//   @@index([status])
//   @@index([createdAt])
//   @@index([items.productId])
// }

// model Coupon {
//   id            String    @id @default(auto()) @map("_id") @db.ObjectId
//   code          String    @unique
//   description   String?
//   discountType  DiscountType
//   discountValue Float
//   maxUsage      Int?
//   usedCount     Int           @default(0)
//   minOrderValue Float?
//   expiresAt     DateTime?
//   active        Boolean?

//   orders        Order[]

//   createdAt     DateTime @default(now())
//   updatedAt     DateTime @updatedAt

//   @@index([expiresAt])
// }

// model Payment {
//   id            String        @id @default(auto()) @map("_id") @db.ObjectId
//   orderId       String        @db.ObjectId
//   order         Order         @relation(fields: [orderId], references: [id])

//   provider      String
//   reference     String?
//   amount        Float
//   status        PaymentStatus @default(PENDING)
//   method        String?
//   refunded      Boolean       @default(false)

//   createdAt     DateTime      @default(now())
//   updatedAt     DateTime      @updatedAt

//   @@index([orderId])
//   @@index([status])
// }

// model Invoice {
//   id            String          @id @default(auto()) @map("_id") @db.ObjectId
//   invoiceNumber String          @unique
//   orderNumber   String          @unique
//   customer      InvoiceCustomer
//   items         InvoiceItem[]
//   invoiceDate   DateTime
//   dueDate       DateTime
//   subtotal      Float
//   tax           Float
//   shipping      Float
//   discount      Float
//   total         Float
//   paymentStatus PaymentStatus   @default(PENDING)
//   paymentTerms  String?
//   notes         String?
//   createdAt     DateTime        @default(now())
//   updatedAt     DateTime        @updatedAt

//   @@index([paymentStatus])
// }

// model BlogCategory {
//   id          String     @id @default(auto()) @map("_id") @db.ObjectId
//   name        String
//   slug        String     @unique
//   description String?
//   postCount   Int        @default(0)
//   posts       BlogPost[]

//   @@index([name])
// }

// model BlogPost {
//   id              String         @id @default(auto()) @map("_id") @db.ObjectId
//   title           String
//   slug            String         @unique
//   excerpt         String
//   content         String
//   status          BlogPostStatus @default(DRAFT)
//   featuredImage   String?
//   tags            String[]
//   metaTitle       String?
//   metaDescription String?
//   featured        Boolean        @default(false)
//   views           Int            @default(0)
//   publishedAt     DateTime?
//   authorId        String         @db.ObjectId
//   author          User           @relation("BlogAuthor", fields: [authorId], references: [id], onDelete: Cascade)
//   categoryId      String         @db.ObjectId
//   category        BlogCategory   @relation(fields: [categoryId], references: [id])
//   createdAt       DateTime       @default(now())
//   updatedAt       DateTime       @updatedAt

//   @@index([authorId])
//   @@index([status])
//   @@index([publishedAt])
//   @@fulltext([title, excerpt, content, tags])
// }

// model AllowedAdmin {
//   id        String   @id @default(auto()) @map("_id") @db.ObjectId
//   email     String   @unique
//   tokenHash String   @unique
//   used      Boolean  @default(false)
//   expiresAt DateTime
//   createdAt DateTime @default(now())
//   sentAt    DateTime?

//   @@map("allowed_admins")
// }

// model Verification {
//   id        String     @id @default(auto()) @map("_id") @db.ObjectId
//   identifier String
//   value      String
//   expiresAt  DateTime
//   createdAt  DateTime?
//   updatedAt  DateTime?

//   @@map("verification")
// }

// model rateLimit {
//   id           String  @id @default(auto()) @map("_id") @db.ObjectId
//   key          String  @unique
//   count        Int
//   lastRequest  BigInt
// }

// model BlockedIp {
//   id        String    @id @default(auto()) @map("_id") @db.ObjectId
//   ip        String    @unique
//   reason    String?
//   expiresAt DateTime?

//   @@map("blocked_ips")
// }

// model SeedLog {
//   id        String   @id @default(auto()) @map("_id") @db.ObjectId
//   name      String   @unique
//   createdAt DateTime @default(now())

//   @@map("seed_logs")
// }
