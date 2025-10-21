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
    route("services", "routes/dashboard/services/index.tsx"),
    route("services/new", "routes/dashboard/services/new.tsx"),
    route("inventory", "routes/dashboard/inventory/index.tsx"),
    route("inventory/items", "routes/dashboard/inventory/items.tsx"),
    route("reservations", "routes/dashboard/reservations/index.tsx"),
  ]),
  
  route("404", "routes/404.tsx"),
] satisfies RouteConfig;