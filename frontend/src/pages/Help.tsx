import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const Help = () => {
  return (
    <>
      <Header />
      <main className="container py-24 sm:py-32">
        <h1 className="text-3xl font-bold">Help Center</h1>
        <p className="mt-4 text-muted-foreground">This is a placeholder page for the Help Center page.</p>
      </main>
      <Footer />
    </>
  );
};

export default Help;
