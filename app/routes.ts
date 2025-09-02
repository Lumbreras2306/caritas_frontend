import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  
  route("dashboard", "routes/dashboard/layout.tsx", [
    index("routes/dashboard/index.tsx"),
    route("users", "routes/dashboard/users/index.tsx"),
    route("users/preregisters", "routes/dashboard/users/preregisters.tsx"),
    route("hostels", "routes/dashboard/hostels/index.tsx"),
    route("hostels/new", "routes/dashboard/hostels/new.tsx"),
    route("hostels/:id", "routes/dashboard/hostels/detail.tsx"),
    route("services", "routes/dashboard/services/index.tsx"),
    route("services/new", "routes/dashboard/services/new.tsx"),
    route("inventory", "routes/dashboard/inventory/index.tsx"),
    route("inventory/items", "routes/dashboard/inventory/items.tsx"),
    route("reservations", "routes/dashboard/reservations/index.tsx"),
  ]),
] satisfies RouteConfig;