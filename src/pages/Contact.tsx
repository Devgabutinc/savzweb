import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Contact = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Header />
    <main className="flex-1 container mx-auto px-4 py-12 max-w-lg space-y-6">
      <h1 className="text-3xl font-bold text-center">Hubungi Kami</h1>
      <p className="text-muted-foreground text-center">
        Formulir dummy – silakan isi pesan, namun data tidak akan dikirim.
      </p>
      <form className="space-y-4">
        <Input placeholder="Nama" required />
        <Input placeholder="Email" type="email" required />
        <textarea className="w-full border rounded p-2" rows={4} placeholder="Pesan" required />
        <Button className="w-full" onClick={(e)=>{e.preventDefault(); alert('Terima kasih, pesan dummy diterima.');}}>Kirim</Button>
      </form>
    </main>
    <Footer />
  </div>
);

export default Contact;
