import { type RouteConfig, index, route } from "@react-router/dev/routes";
import type { LinksFunction } from 'react-router';
import leafletStyles from 'leaflet/dist/leaflet.css?url';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: leafletStyles },
];

export default [
  index("routes/home.tsx"),
  
  route("dashboard", "routes/dashboard/layout.tsx", [
    index("routes/dashboard/index.tsx"),
    route("users", "routes/dashboard/users/index.tsx"),
    route("users/list", "routes/dashboard/users/list.tsx"),
    route("users/new", "routes/dashboard/users/new.tsx"),
    route("users/preregisters", "routes/dashboard/users/preregisters.tsx"),
    route("hostels", "routes/dashboard/hostels/index.tsx"),
    route("hostels/list", "routes/dashboard/hostels/list.tsx"),
    route("hostels/new", "routes/dashboard/hostels/new.tsx"),
    route("hostels/edit/:id", "routes/dashboard/hostels/edit.tsx"),
    route("hostels/detail/:id", "routes/dashboard/hostels/detail.tsx"),
    route("hostels/reservations", "routes/dashboard/hostels/reservations.tsx"),
    route("hostels/reservations/detail/:id", "routes/dashboard/hostels/reservations/detail.tsx"),
    route("hostels/statistics", "routes/dashboard/hostels/statistics.tsx"),
    route("admins", "routes/dashboard/admins/index.tsx"),
    route("admins/list", "routes/dashboard/admins/list.tsx"),
    route("admins/new", "routes/dashboard/admins/new.tsx"),
    route("admins/edit/:id", "routes/dashboard/admins/edit.tsx"),
    route("admins/detail/:id", "routes/dashboard/admins/detail.tsx"),
    route("services", "routes/dashboard/services/index.tsx"),
    route("services/list", "routes/dashboard/services/list.tsx"),
    route("services/new", "routes/dashboard/services/new.tsx"),
    route("services/edit/:id", "routes/dashboard/services/edit.tsx"),
    route("services/detail/:id", "routes/dashboard/services/detail.tsx"),
    route("services/hostel-services", "routes/dashboard/services/hostel-services.tsx"),
    route("services/hostel-services/detail/:id", "routes/dashboard/services/hostel-services/detail.tsx"),
    route("services/hostel-services/new", "routes/dashboard/services/hostel-services/new.tsx"),
    route("services/hostel-services/edit/:id", "routes/dashboard/services/hostel-services/edit.tsx"),
    route("services/reservations", "routes/dashboard/services/reservations.tsx"),
    route("services/reservations/new", "routes/dashboard/services/reservations/new.tsx"),
    route("services/reservations/detail/:id", "routes/dashboard/services/reservations/detail.tsx"),
    route("inventory", "routes/dashboard/inventory/index.tsx"),
    route("inventory/list", "routes/dashboard/inventory/list.tsx"),
    route("inventory/new", "routes/dashboard/inventory/new.tsx"),
    route("inventory/detail/:id", "routes/dashboard/inventory/detail.tsx"),
    route("inventory/edit/:id", "routes/dashboard/inventory/edit.tsx"),
    route("inventory/items", "routes/dashboard/inventory/items.tsx"),
    route("inventory/items/new", "routes/dashboard/inventory/items/new.tsx"),
    route("inventory/items/new-item", "routes/dashboard/inventory/items/new-item.tsx"),
    route("inventory/items/edit/:id", "routes/dashboard/inventory/items/edit.tsx"),
    route("inventory/low-stock", "routes/dashboard/inventory/low-stock.tsx"),
    route("reservations", "routes/dashboard/reservations/index.tsx"),
  ]),
  
  route("404", "routes/404.tsx"),
] satisfies RouteConfig;