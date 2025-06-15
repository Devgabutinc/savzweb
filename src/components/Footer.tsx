
import { Instagram, Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">
              SAVZ <span className="text-accent">OFFICIAL</span>
            </h3>
            <p className="text-primary-foreground/80 mb-6 max-w-md">
              Brand fashion lokal yang menghadirkan desain premium dengan kualitas terbaik. 
              Bergabunglah dengan komunitas fashion enthusiast Indonesia.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/savz.ofc/" className="text-primary-foreground/80 hover:text-accent transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="mailto:info@savzofc.store" className="text-primary-foreground/80 hover:text-accent transition-colors">
                <Mail className="h-5 w-5" />
              </a>
              <a href="https://wa.me/6282111321173" className="text-primary-foreground/80 hover:text-accent transition-colors">
                <Phone className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors">Pre-Order</a></li>
              <li><a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors">Size Guide</a></li>
              <li><a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors">FAQ</a></li>
              <li><a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors">Track Order</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-primary-foreground/80">
              <li>WhatsApp: +62 821-1132-1173</li>
              <li>Email: info@savzofc.store</li>
              <li>Instagram: @savzofc</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center">
          <p className="text-primary-foreground/60">
            © 2024 SAVZ Official. All rights reserved. Made with ❤️ for Indonesian Fashion.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
