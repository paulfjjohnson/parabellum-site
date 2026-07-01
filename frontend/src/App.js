import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Home from "@/pages/Home";
import Services from "@/pages/Services";
import ServiceDetail from "@/pages/ServiceDetail";
import { TeeParty, DigitalProducts, AIAutomation } from "@/pages/Pillars";
import Tools from "@/pages/Tools";
import TeamStoreWizard from "@/pages/TeamStoreWizard";
import GangSheetBuilder from "@/pages/GangSheetBuilder";
import Configurator from "@/pages/Configurator";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import RequestLaunch from "@/pages/RequestLaunch";
import Partners from "@/pages/Partners";
import Drops from "@/pages/Drops";
import Legal from "@/pages/Legal";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:slug" element={<ServiceDetail />} />
          <Route path="/tee-party" element={<TeeParty />} />
          <Route path="/digital-products" element={<DigitalProducts />} />
          <Route path="/ai-automation" element={<AIAutomation />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/tools/team-store-wizard" element={<TeamStoreWizard />} />
          <Route path="/tools/gang-sheet-builder" element={<GangSheetBuilder />} />
          <Route path="/tools/configurator" element={<Configurator />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/request-a-launch" element={<RequestLaunch />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/drops" element={<Drops />} />
          <Route path="/legal/:doc" element={<Legal />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
      <Toaster position="bottom-right" theme="dark" toastOptions={{ style: { background: "#131313", border: "1px solid rgba(216,168,95,0.3)", color: "#F0EDE8", fontFamily: "'Cormorant Garamond', serif" } }} />
    </BrowserRouter>
  );
}

export default App;
