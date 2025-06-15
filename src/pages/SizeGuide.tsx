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
  const regular24sSizes = [
    { size: 'S', width: '47', height: '67' },
    { size: 'M', width: '50', height: '70' },
    { size: 'L', width: '53', height: '73' },
    { size: 'XL', width: '56', height: '75' },
    { size: 'XXL', width: '59', height: '77' },
    { size: 'XXXL', width: '62', height: '80' },
  ];

  const oversize24sSizes = [
    { size: 'M', width: '53', height: '72', sleeve: '26.5' },
    { size: 'L', width: '57', height: '74', sleeve: '27' },
    { size: 'XL', width: '60', height: '75', sleeve: '28.5' },
    { size: 'XXL', width: '63', height: '77', sleeve: '19.5' },
  ];

  const boxycut24sSizes = [
    { size: 'M', width: '54', height: '63', sleeve: '17', armLength: '25' },
    { size: 'L', width: '57', height: '66', sleeve: '19', armLength: '25' },
    { size: 'XL', width: '60', height: '68', sleeve: '19', armLength: '26' },
    { size: 'XXL', width: '63', height: '69', sleeve: '20', armLength: '27' },
  ];

  const measurementTips = [
    {
      icon: <Ruler className="h-5 w-5" />,
      title: "Lebar (Width)",
      description: "Ukur pada bagian terlebar kaos"
    },
    {
      icon: <User className="h-5 w-5" />,
      title: "Tinggi (Height)",
      description: "Ukur dari leher hingga ujung bawah kaos"
    },
    {
      icon: <Shirt className="h-5 w-5" />,
      title: "Panjang Lengan (Sleeve)",
      description: "Ukur dari bahu hingga ujung lengan"
    },
    {
      icon: <Info className="h-5 w-5" />,
      title: "Lingkar Bahu (Arm Length)",
      description: "Ukur keliling bagian atas lengan"
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
          <Tabs defaultValue="regular" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="regular" className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-900">
                <Shirt className="h-4 w-4" />
                Regular 24s
              </TabsTrigger>
              <TabsTrigger value="oversize" className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-900">
                <Shirt className="h-4 w-4" />
                Oversize 24s
              </TabsTrigger>
              <TabsTrigger value="boxycut" className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-900">
                <Shirt className="h-4 w-4" />
                Boxycut 24s
              </TabsTrigger>
            </TabsList>

            <TabsContent value="regular">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="outline">Regular 24s</Badge>
                    <span>Size Chart</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    <div className="flex justify-center mb-8">
                      <img 
                        src="/images/tshirt-regular.jpg" 
                        alt="Regular T-Shirt" 
                        className="w-full max-w-sm rounded-lg shadow-lg"
                      />
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Size</th>
                            <th className="text-left py-2">Width (cm)</th>
                            <th className="text-left py-2">Height (cm)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {regular24sSizes.map((size) => (
                            <tr key={size.size} className="border-b">
                              <td className="py-2">{size.size}</td>
                              <td className="py-2">{size.width}</td>
                              <td className="py-2">{size.height}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-semibold">Measurement Tips</h3>
                      {measurementTips.map((tip) => (
                        <div key={tip.title} className="flex items-start gap-3">
                          {tip.icon}
                          <div>
                            <h4 className="font-medium">{tip.title}</h4>
                            <p className="text-sm text-gray-600">{tip.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Sizing Tips</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {sizingTips.map((tip, index) => (
                          <li key={index} className="text-sm text-gray-600">{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="oversize">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="outline">Oversize 24s</Badge>
                    <span>Size Chart</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    <div className="flex justify-center mb-8">
                      <img 
                        src="/images/tshirt-oversize.jpg" 
                        alt="Oversize T-Shirt" 
                        className="w-full max-w-sm rounded-lg shadow-lg"
                      />
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Size</th>
                            <th className="text-left py-2">Width (cm)</th>
                            <th className="text-left py-2">Height (cm)</th>
                            <th className="text-left py-2">Sleeve Length (cm)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {oversize24sSizes.map((size) => (
                            <tr key={size.size} className="border-b">
                              <td className="py-2">{size.size}</td>
                              <td className="py-2">{size.width}</td>
                              <td className="py-2">{size.height}</td>
                              <td className="py-2">{size.sleeve}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-semibold">Measurement Tips</h3>
                      {measurementTips.map((tip) => (
                        <div key={tip.title} className="flex items-start gap-3">
                          {tip.icon}
                          <div>
                            <h4 className="font-medium">{tip.title}</h4>
                            <p className="text-sm text-gray-600">{tip.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Sizing Tips</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {sizingTips.map((tip, index) => (
                          <li key={index} className="text-sm text-gray-600">{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="boxycut">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="outline">Boxycut 24s</Badge>
                    <span>Size Chart</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    <div className="flex justify-center mb-8">
                      <img 
                        src="/images/tshirt-boxycut.jpg" 
                        alt="Boxycut T-Shirt" 
                        className="w-full max-w-sm rounded-lg shadow-lg"
                      />
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Size</th>
                            <th className="text-left py-2">Width (cm)</th>
                            <th className="text-left py-2">Height (cm)</th>
                            <th className="text-left py-2">Sleeve Length (cm)</th>
                            <th className="text-left py-2">Arm Length (cm)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {boxycut24sSizes.map((size) => (
                            <tr key={size.size} className="border-b">
                              <td className="py-2">{size.size}</td>
                              <td className="py-2">{size.width}</td>
                              <td className="py-2">{size.height}</td>
                              <td className="py-2">{size.sleeve}</td>
                              <td className="py-2">{size.armLength}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-semibold">Measurement Tips</h3>
                      {measurementTips.map((tip) => (
                        <div key={tip.title} className="flex items-start gap-3">
                          {tip.icon}
                          <div>
                            <h4 className="font-medium">{tip.title}</h4>
                            <p className="text-sm text-gray-600">{tip.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Sizing Tips</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {sizingTips.map((tip, index) => (
                          <li key={index} className="text-sm text-gray-600">{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Contact Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">WhatsApp</h3>
                <p className="text-gray-600 mb-4">Chat langsung dengan customer service</p>
                <a
                  href="https://wa.me/6282111321173"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full"
                >
                  <Button variant="outline" className="w-full">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat WhatsApp
                  </Button>
                </a>
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
                  0821-1132-1173
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SizeGuide;