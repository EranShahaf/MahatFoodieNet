import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { FavoritesProvider } from "@/hooks/useFavorites";
import { FollowingProvider } from "@/hooks/useFollowing";
import { ProfileProvider } from "@/hooks/useProfile";
import { FeedProvider } from "@/hooks/useFeed";
import { NotificationsProvider } from "@/hooks/useNotifications";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Search from "./pages/Search";
import AddReview from "./pages/AddReview";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";
import RestaurantDetails from "./pages/RestaurantDetails";
import Notifications from "./pages/Notifications";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function RequireAuth() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function GuestOnly() {
  const { user } = useAuth();
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
      <ProfileProvider>
      <FeedProvider>
      <NotificationsProvider>
      <FavoritesProvider>
        <FollowingProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route element={<GuestOnly />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>
              <Route element={<RequireAuth />}>
                <Route element={<Layout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/add-review" element={<AddReview />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/restaurant/:placeId" element={<RestaurantDetails />} />
                  <Route path="/notifications" element={<Notifications />} />
                </Route>
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </FollowingProvider>
      </FavoritesProvider>
      </NotificationsProvider>
      </FeedProvider>
      </ProfileProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
