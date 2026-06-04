## 1. Toast System

- [x] 1.1 Create `useToast` composable with reactive toast array (success/error/info, auto-dismiss)
- [x] 1.2 Create `ToastContainer.vue` component to render active toasts
- [x] 1.3 Create `ConfirmDialog.vue` component returning a Promise
- [x] 1.4 Register toast container in `DefaultLayout.vue` or `App.vue`

## 2. Replace alert/confirm in ShoppingListView

- [x] 2.1 Replace `alert()` calls with error toasts in `ShoppingListView.vue`
- [x] 2.2 Replace `confirm()` calls with `ConfirmDialog` in `ShoppingListView.vue`

## 3. Replace alert/confirm in InventoryView

- [x] 3.1 Replace `alert()` calls with error toasts in `InventoryView.vue`
- [x] 3.2 Replace `confirm()` calls with `ConfirmDialog` in `InventoryView.vue`

## 4. Shopping List Filter Counts

- [x] 4.1 Add computed `openCount`, `doneCount`, `allCount` in `ShoppingListView.vue`
- [x] 4.2 Update filter tab labels to show counts (e.g. "Offen (5)")

## 5. Inventory Expiry Border

- [x] 5.1 Add CSS classes `expiry-ok`, `expiry-soon`, `expiry-danger` to `.item-card` in `InventoryView.vue`
- [x] 5.2 Add left-border styles for each class in `InventoryView.vue` `<style>`

## 6. Undo After Liste Leeren

- [x] 6.1 In `clearDoneItems()`, store deleted items in a local ref before deletion
- [x] 6.2 Show undo toast with 5s timeout after bulk delete
- [x] 6.3 Implement undo handler that re-POSTs deleted items and reloads list
- [x] 6.4 Show error toast if undo re-POST fails

## 7. Inline Quantity on Shopping List

- [x] 7.1 Add `changeQuantity()` method to `ShoppingListView.vue` calling `updateQuantity` (delete if hits 0)
- [x] 7.2 Add inline +/- controls to shopping list card template
