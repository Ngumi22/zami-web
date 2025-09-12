// import AccountPage, {
//   NotificationPreferences,
// } from "@/components/account/account-page";
// import { getCustomer, getCustomerOrdersWithItems } from "@/data/customer";
// import { Customer, CustomerAddress } from "@prisma/client";

// export default async function Page() {
//   const customerId = ""; // TODO: Replace with real auth ID

//   // ✅ Fetch the actual customer with relations
//   const customer = await getCustomer(customerId);
//   if (!customer) {
//     throw new Error("Customer not found");
//   }

//   // ✅ Now fetch the customer's orders
//   const orders = await getCustomerOrdersWithItems(customerId);

//   // 📨 Mock notification preferences
//   const notificationPreferencesData: NotificationPreferences = {
//     orderUpdates: true,
//     promotions: true,
//     newsletter: false,
//     productUpdates: true,
//   };

//   return (
//     <AccountPage
//       customer={customer}
//       orders={orders}
//       notificationPreferences={notificationPreferencesData}
//       onCustomerUpdate={(customer: Customer) => {
//         console.log("Customer updated:", customer);
//       }}
//       onAddressUpdate={(addresses: CustomerAddress[]) => {
//         console.log("Addresses updated:", addresses);
//       }}
//       onNotificationUpdate={(preferences: NotificationPreferences) => {
//         console.log("Notification preferences updated:", preferences);
//       }}
//     />
//   );
// }
