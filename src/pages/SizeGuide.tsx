import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Ruler, 
  User, 
  Shirt, 
  Info, 
  Download, 
  Phone,
  MessageCircle,
  ChevronRight,
  Check
} from "lucide-react";

const SizeGuide = () => {
  const shirtSizes = [
    { size: 'XS', chest: '44-46', length: '64', shoulder: '40', sleeve: '19' },
    { size: 'S', chest: '46-48', length: '66', shoulder: '42', sleeve: '20' },
    { size: 'M', chest: '48-50', length: '68', shoulder: '44', sleeve: '21' },
    { size: 'L', chest: '50-52', length: '70', shoulder: '46', sleeve: '22' },
    { size: 'XL', chest: '52-54', length: '72', shoulder: '48', sleeve: '23' },
    { size: 'XXL', chest: '54-56', length: '74', shoulder: '50', sleeve: '24' },
  ];

  const hoodieSizes = [
    { size: 'XS', chest: '48-50', length: '60', shoulder: '44', sleeve: '58' },
    { size: 'S', chest: '50-52', length: '62', shoulder: '46', sleeve: '60' },
    { size: 'M', chest: '52-54', length: '64', shoulder: '48', sleeve: '62' },
    { size: 'L', chest: '54-56', length: '66', shoulder: '50', sleeve: '64' },
    { size: 'XL', chest: '56-58', length: '68', shoulder: '52', sleeve: '66' },
    { size: 'XXL', chest: '58-60', length: '70', shoulder: '54', sleeve: '68' },
  ];

  const measurementTips = [
    {
      icon: <Ruler className="h-5 w-5" />,
      title: "Lingkar Dada",
      description: "Ukur pada bagian terlebar dada, tepat di bawah ketiak"
    },
    {
      icon: <User className="h-5 w-5" />,
      title: "Panjang Badan",
      description: "Ukur dari bahu tertinggi hingga ujung bawah kaos"
    },
    {
      icon: <Shirt className="h-5 w-5" />,
      title: "Lebar Bahu",
      description: "Ukur dari ujung bahu kiri ke ujung bahu kanan"
    }
  ];

  const sizingTips = [
    "Semua ukuran dalam satuan centimeter (cm)",
    "Toleransi ukuran ±1-2 cm karena proses produksi",
    "Untuk hasil terbaik, bandingkan dengan pakaian yang sudah pas",
    "Jika ragu antara 2 ukuran, pilih yang lebih besar",
    "Hubungi customer service untuk konsultasi sizing"
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-500 rounded-full mb-6">
            <Ruler className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Size Guide</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Temukan ukuran yang tepat untuk produk SAVZ Official. 
            Panduan lengkap untuk memastikan kenyamanan maksimal.
          </p>
        </div>

        {/* Size Chart Tabs */}
        <div className="mb-12">
          <Tabs defaultValue="shirts" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="shirts" className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-900">
                <Shirt className="h-4 w-4" />
                T-Shirt & Polo
              </TabsTrigger>
              <TabsTrigger value="hoodies" className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-900">
                <Shirt className="h-4 w-4" />
                Hoodie & Sweater
              </TabsTrigger>
            </TabsList>

            <TabsContent value="shirts">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shirt className="h-5 w-5 text-yellow-500" />
                    Ukuran T-Shirt & Polo Shirt
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Size</th>
                          <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Lingkar Dada (cm)</th>
                          <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Panjang Badan (cm)</th>
                          <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Lebar Bahu (cm)</th>
                          <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Panjang Lengan (cm)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shirtSizes.map((size, index) => (
                          <tr key={size.size} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="border border-gray-200 px-4 py-3">
                              <Badge variant="outline" className="font-semibold">
                                {size.size}
                              </Badge>
                            </td>
                            <td className="border border-gray-200 px-4 py-3 font-medium">{size.chest}</td>
                            <td className="border border-gray-200 px-4 py-3 font-medium">{size.length}</td>
                            <td className="border border-gray-200 px-4 py-3 font-medium">{size.shoulder}</td>
                            <td className="border border-gray-200 px-4 py-3 font-medium">{size.sleeve}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="hoodies">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shirt className="h-5 w-5 text-yellow-500" />
                    Ukuran Hoodie & Sweater
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Size</th>
                          <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Lingkar Dada (cm)</th>
                          <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Panjang Badan (cm)</th>
                          <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Lebar Bahu (cm)</th>
                          <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Panjang Lengan (cm)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {hoodieSizes.map((size, index) => (
                          <tr key={size.size} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="border border-gray-200 px-4 py-3">
                              <Badge variant="outline" className="font-semibold">
                                {size.size}
                              </Badge>
                            </td>
                            <td className="border border-gray-200 px-4 py-3 font-medium">{size.chest}</td>
                            <td className="border border-gray-200 px-4 py-3 font-medium">{size.length}</td>
                            <td className="border border-gray-200 px-4 py-3 font-medium">{size.shoulder}</td>
                            <td className="border border-gray-200 px-4 py-3 font-medium">{size.sleeve}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Measurement Guide */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-yellow-500" />
                Cara Mengukur
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {measurementTips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                    <div className="text-yellow-500 mt-0.5">
                      {tip.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{tip.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{tip.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-yellow-500" />
                Tips Memilih Size
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-gray-50">
              <div className="space-y-3">
                {sizingTips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{tip}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Visual Guide */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-center">Panduan Visual Pengukuran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <img 
                  src="https://images.unsplash.com/photo-1583743814966-8936f37f4570?w=400&h=300&fit=crop" 
                  alt="Measurement guide" 
                  className="w-full rounded-lg shadow-lg"
                />
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Petunjuk Pengukuran:</h3>
                <div className="space-y-4 bg-white p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">1</div>
                    <p className="text-gray-600">Gunakan meteran kain untuk hasil akurat</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">2</div>
                    <p className="text-gray-600">Ukur dalam posisi berdiri tegak</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">3</div>
                    <p className="text-gray-700">Pastikan meteran tidak terlalu ketat</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">4</div>
                    <p className="text-gray-700">Catat semua ukuran dengan teliti</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Alert className="mb-8">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Masih ragu dengan ukuran?</strong> Tim customer service kami siap membantu Anda memilih ukuran yang tepat.
          </AlertDescription>
        </Alert>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">WhatsApp</h3>
                <p className="text-gray-600 mb-4">Chat langsung dengan customer service</p>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat WhatsApp
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Telepon</h3>
                <p className="text-gray-600 mb-4">Hubungi langsung via telepon</p>
                <Button variant="outline" className="w-full">
                  <Phone className="h-4 w-4 mr-2" />
                  (021) 1234-5678
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Download Section */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="inline-flex items-center gap-2">
            <Download className="h-5 w-5" />
            Download Size Chart PDF
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SizeGuide;