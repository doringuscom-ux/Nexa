import { useEffect } from "react";
import NotFoundSection from "../Component/sections/NotfoundSection";
import { markNotFound } from "../hooks/useSEO";

function NotFound() {
  useEffect(() => {
    markNotFound();
  }, []);

  return (
    <>

      <NotFoundSection />
    </>
  );
}

export default NotFound;
