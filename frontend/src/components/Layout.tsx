import { Outlet } from "react-router-dom";
import Header from "./Header";
import MobileNav from "./MobileNav";

const Layout = () => {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      <main>
        <Outlet />
      </main>
      <MobileNav />
    </div>
  );
};

export default Layout;
