# TanStack Query Hooks

Comprehensive React Query hooks for SwiftShip Courier Management System.

## Installation

All hooks are already set up. Import from `@/hooks/queries`:

```tsx
import { useGetMe, useGetAllShipments, useCreateShipment } from "@/hooks/queries";
```

## Authentication Hooks

### useGetMe()
Get current authenticated user profile.

```tsx
const { data, isLoading, error } = useGetMe();
```

### useLogin()
Login mutation.

```tsx
const loginMutation = useLogin();

loginMutation.mutate({
  email: "user@example.com",
  password: "password123"
});
```

### useRegister()
Register new user or merchant.

```tsx
const registerMutation = useRegister();

registerMutation.mutate({
  name: "John Doe",
  email: "john@example.com",
  password: "password123",
  phone: "+1234567890",
  role: "USER" // or "MERCHANT"
});
```

### useRegisterCourier()
Register new courier with vehicle details.

```tsx
const registerCourierMutation = useRegisterCourier();

registerCourierMutation.mutate({
  name: "Courier Name",
  email: "courier@example.com",
  password: "password123",
  vehicleType: "BIKE",
  licenseNumber: "DL123456789"
});
```

### useChangePassword()
Change current user password.

```tsx
const changePasswordMutation = useChangePassword();

changePasswordMutation.mutate({
  oldPassword: "oldpass",
  newPassword: "newpass"
});
```

### useLogout()
Logout and clear all queries.

```tsx
const logoutMutation = useLogout();

logoutMutation.mutate();
```

## User Management Hooks (Admin)

### useGetAllUsers(params?)
Get paginated list of users with filters.

```tsx
const { data, isLoading } = useGetAllUsers({
  searchTerm: "john",
  role: "USER",
  status: "ACTIVE",
  page: 1,
  limit: 10
});
```

### useGetUserById(id, enabled?)
Get user by ID.

```tsx
const { data } = useGetUserById(userId);
```

### useUpdateUser()
Update user details.

```tsx
const updateUserMutation = useUpdateUser();

updateUserMutation.mutate({
  id: userId,
  payload: { name: "Updated Name", phone: "+9876543210" }
});
```

### useUpdateUserStatus()
Update user status.

```tsx
const updateStatusMutation = useUpdateUserStatus();

updateStatusMutation.mutate({
  id: userId,
  payload: { status: "SUSPENDED" }
});
```

### useUpdateUserRole()
Update user role (SuperAdmin only).

```tsx
const updateRoleMutation = useUpdateUserRole();

updateRoleMutation.mutate({
  id: userId,
  payload: { role: "ADMIN" }
});
```

### useDeleteUser()
Delete user.

```tsx
const deleteUserMutation = useDeleteUser();

deleteUserMutation.mutate(userId);
```

## Courier Management Hooks

### useGetAllCouriers(params?)
Get all couriers with filters.

```tsx
const { data } = useGetAllCouriers({
  vehicleType: "BIKE",
  availability: true,
  searchTerm: "courier"
});
```

### useGetMyCourierProfile(enabled?)
Get current courier's profile.

```tsx
const { data } = useGetMyCourierProfile();
```

### useGetCourierById(id, enabled?)
Get courier by ID.

```tsx
const { data } = useGetCourierById(courierId);
```

### useCreateCourierProfile()
Create courier profile.

```tsx
const createCourierMutation = useCreateCourierProfile();

createCourierMutation.mutate({
  userId: "user-uuid",
  vehicleType: "BIKE",
  licenseNumber: "DL123456789"
});
```

### useUpdateCourier()
Update courier details.

```tsx
const updateCourierMutation = useUpdateCourier();

updateCourierMutation.mutate({
  id: courierId,
  payload: { vehicleType: "CAR", availability: false }
});
```

### useApproveCourier()
Approve or reject courier.

```tsx
const approveMutation = useApproveCourier();

approveMutation.mutate({
  id: courierId,
  payload: { approvalStatus: "APPROVED" }
});
```

### useToggleAvailability()
Toggle courier availability.

```tsx
const toggleMutation = useToggleAvailability();

toggleMutation.mutate();
```

### useDeleteCourier()
Delete courier.

```tsx
const deleteCourierMutation = useDeleteCourier();

deleteCourierMutation.mutate(courierId);
```

## Merchant Management Hooks

### useGetAllMerchants(params?)
Get all merchants.

```tsx
const { data } = useGetAllMerchants({ searchTerm: "company" });
```

### useGetMyMerchantProfile(enabled?)
Get current merchant's profile.

```tsx
const { data } = useGetMyMerchantProfile();
```

### useGetMerchantById(id, enabled?)
Get merchant by ID.

```tsx
const { data } = useGetMerchantById(merchantId);
```

### useCreateMerchant()
Create merchant profile.

```tsx
const createMerchantMutation = useCreateMerchant();

createMerchantMutation.mutate({
  userId: "user-uuid",
  companyName: "ABC Logistics",
  address: "123 Business St"
});
```

### useUpdateMerchant()
Update merchant details.

```tsx
const updateMerchantMutation = useUpdateMerchant();

updateMerchantMutation.mutate({
  id: merchantId,
  payload: { companyName: "XYZ Logistics" }
});
```

### useDeleteMerchant()
Delete merchant.

```tsx
const deleteMerchantMutation = useDeleteMerchant();

deleteMerchantMutation.mutate(merchantId);
```

## Shipment Hooks

### useGetMyShipments(params?)
Get current user's shipments.

```tsx
const { data } = useGetMyShipments({
  status: "DELIVERED",
  priority: "EXPRESS",
  page: 1
});
```

### useGetAllShipments(params?)
Get all shipments (Admin).

```tsx
const { data } = useGetAllShipments({
  searchTerm: "TRK-",
  status: "PENDING",
  paymentStatus: "PAID"
});
```

### useGetAvailableShipments(params?)
Get available shipments for courier.

```tsx
const { data } = useGetAvailableShipments();
```

### useGetAssignedShipments(params?)
Get courier's assigned shipments.

```tsx
const { data } = useGetAssignedShipments({ status: "IN_TRANSIT" });
```

### useGetShipmentById(id, enabled?)
Get shipment by ID.

```tsx
const { data } = useGetShipmentById(shipmentId);
```

### useTrackShipment(trackingNumber, enabled?)
Track shipment by tracking number (Public).

```tsx
const { data } = useTrackShipment("TRK-A1B2C3D4-1710745532000");
```

### useCreateShipment()
Create new shipment.

```tsx
const createShipmentMutation = useCreateShipment();

createShipmentMutation.mutate({
  pickupAddress: "123 Pickup St",
  pickupCity: "Dhaka",
  deliveryAddress: "456 Delivery Ave",
  deliveryCity: "Chittagong",
  packageType: "Electronics",
  weight: 2.5,
  priority: "EXPRESS",
  paymentMethod: "COD",
  note: "Handle with care"
});
```

### useAssignCourier()
Assign courier to shipment (Admin).

```tsx
const assignMutation = useAssignCourier();

assignMutation.mutate({
  id: shipmentId,
  payload: { courierId: "courier-uuid" }
});
```

### useAcceptShipment()
Accept shipment (Courier).

```tsx
const acceptMutation = useAcceptShipment();

acceptMutation.mutate(shipmentId);
```

### useUpdateShipmentStatus()
Update shipment status (Courier).

```tsx
const updateStatusMutation = useUpdateShipmentStatus();

updateStatusMutation.mutate({
  id: shipmentId,
  payload: {
    status: "DELIVERED",
    note: "Delivered to recipient",
    proofOfDelivery: "https://cloudinary.com/proof.jpg"
  }
});
```

## Pricing Hooks

### useGetAllPricing()
Get all pricing tiers (Public).

```tsx
const { data } = useGetAllPricing();
```

### useCalculatePrice(payload, enabled?)
Calculate price quote (Public).

```tsx
const { data, isLoading } = useCalculatePrice({
  pickupCity: "Dhaka",
  deliveryCity: "Chittagong",
  weight: 5,
  priority: "EXPRESS"
}, true);
```

### useUpsertPricing()
Create or update pricing tier (Admin).

```tsx
const upsertPricingMutation = useUpsertPricing();

upsertPricingMutation.mutate({
  regionType: "NATIONAL",
  basePrice: 100,
  perKgPrice: 30,
  expressMult: 1.25
});
```

## Payment Hooks

### useGetAllPayments(params?)
Get all payments (Admin).

```tsx
const { data } = useGetAllPayments({
  status: "PAID",
  method: "STRIPE"
});
```

### useGetPaymentByShipmentId(shipmentId, enabled?)
Get payment by shipment ID.

```tsx
const { data } = useGetPaymentByShipmentId(shipmentId);
```

### useInitiateStripePayment()
Initiate Stripe payment.

```tsx
const initiateMutation = useInitiateStripePayment();

initiateMutation.mutate({
  shipmentId: "shipment-uuid",
  payload: { amount: 500 }
});
```

### useConfirmStripePayment()
Confirm Stripe payment.

```tsx
const confirmMutation = useConfirmStripePayment();

confirmMutation.mutate({
  paymentIntentId: "pi_xxx"
});
```

### useMarkPaymentAsPaid()
Mark payment as paid (Admin).

```tsx
const markPaidMutation = useMarkPaymentAsPaid();

markPaidMutation.mutate(shipmentId);
```

## Notification Hooks

### useGetMyNotifications(params?)
Get current user's notifications.

```tsx
const { data } = useGetMyNotifications({
  readStatus: false,
  page: 1
});
```

### useMarkNotificationAsRead()
Mark notification as read.

```tsx
const markReadMutation = useMarkNotificationAsRead();

markReadMutation.mutate(notificationId);
```

### useMarkAllNotificationsAsRead()
Mark all notifications as read.

```tsx
const markAllReadMutation = useMarkAllNotificationsAsRead();

markAllReadMutation.mutate();
```

## Query Keys

All hooks export their query keys for manual cache manipulation:

```tsx
import { shipmentKeys, userKeys, authKeys } from "@/hooks/queries";

// Invalidate specific queries
queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() });
queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
queryClient.invalidateQueries({ queryKey: authKeys.me() });
```

## Best Practices

1. **Use enabled parameter** to conditionally fetch data:
```tsx
const { data } = useGetUserById(userId, !!userId);
```

2. **Handle loading and error states**:
```tsx
const { data, isLoading, error } = useGetAllShipments();

if (isLoading) return <Spinner />;
if (error) return <Error message={error.message} />;
```

3. **Use mutation callbacks**:
```tsx
const createMutation = useCreateShipment();

createMutation.mutate(payload, {
  onSuccess: (data) => {
    toast.success("Shipment created!");
    router.push(`/shipments/${data.data.id}`);
  },
  onError: (error) => {
    toast.error(error.message);
  }
});
```

4. **Optimistic updates**:
```tsx
const updateMutation = useUpdateUser();

updateMutation.mutate({ id, payload }, {
  onMutate: async (variables) => {
    await queryClient.cancelQueries({ queryKey: userKeys.detail(id) });
    const previous = queryClient.getQueryData(userKeys.detail(id));
    queryClient.setQueryData(userKeys.detail(id), variables.payload);
    return { previous };
  },
  onError: (err, variables, context) => {
    queryClient.setQueryData(userKeys.detail(id), context?.previous);
  }
});
```
