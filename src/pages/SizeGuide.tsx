import Header from "@/components/Header";
import Footer from "@/components/Footer";

const SizeGuide = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Header />
    <main className="flex-1 container mx-auto px-4 py-12 max-w-2xl text-center space-y-6">
      <h1 className="text-3xl font-bold">Size Guide</h1>
      <p className="text-muted-foreground">
        Halaman ini akan menampilkan panduan ukuran lengkap untuk produk SAVZ Official.
        Konten masih dalam pengembangan, silakan kembali lagi nanti.
      </p>
      <img src="https://placehold.co/400x300?text=Size+Chart" alt="Size chart placeholder" className="mx-auto rounded border" />
    </main>
    <Footer />
  </div>
);

export default SizeGuide;
