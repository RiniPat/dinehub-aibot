import { DashboardLayout } from "@/components/layout";
import { useRestaurants } from "@/hooks/use-restaurants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";

export default function DashboardQR() {
  const { data: restaurants } = useRestaurants();
  const restaurant = restaurants?.[0];
  const [tableCount, setTableCount] = useState(restaurant?.tableCount || 10);
  const [generated, setGenerated] = useState(false);

  if (!restaurant) return null;

  const tables = generated ? Array.from({ length: tableCount }, (_, i) => i + 1) : [];

  const getTableUrl = (table: number) =>
    `${window.location.protocol}//${window.location.host}/menu/${restaurant.slug}?table=${table}`;

  const downloadQR = (table: number) => {
    const svgEl = document.getElementById(`qr-table-${table}`) as unknown as SVGSVGElement;
    if (!svgEl) return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const img = new Image();
    canvas.width = 400;
    canvas.height = 480;
    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 400, 480);
        ctx.drawImage(img, 50, 30, 300, 300);
        ctx.fillStyle = "#111";
        ctx.font = "bold 28px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`Table ${table}`, 200, 390);
        ctx.font = "16px sans-serif";
        ctx.fillStyle = "#666";
        ctx.fillText(restaurant.name, 200, 420);
        ctx.fillText("Scan to view menu", 200, 450);
        const link = document.createElement("a");
        link.download = `${restaurant.slug}-table-${table}-qr.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      }
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const downloadAll = () => {
    tables.forEach((t, i) => setTimeout(() => downloadQR(t), i * 200));
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">QR Codes</h1>
        <p className="text-gray-500 mb-8">Generate a unique QR code for each table in your restaurant.</p>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-end gap-4">
            <div className="flex-1 w-full">
              <Label className="text-sm font-semibold text-gray-700">Number of Tables</Label>
              <Input
                type="number"
                min={1}
                max={200}
                value={tableCount}
                onChange={e => setTableCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="mt-1.5 h-12 text-lg"
              />
            </div>
            <Button onClick={() => setGenerated(true)} className="gap-2 h-12 px-8">
              <QrCode className="w-4 h-4" /> Generate {tableCount} QR Code{tableCount !== 1 ? "s" : ""}
            </Button>
          </div>
        </div>

        {generated && tables.length > 0 && (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-gray-500">{tables.length} QR codes generated</p>
              <Button variant="outline" onClick={downloadAll} className="gap-2">
                <Download className="w-4 h-4" /> Download All
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {tables.map(table => (
                <div key={table} className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col items-center gap-3 group hover:shadow-lg hover:border-primary/20 transition-all">
                  <span className="font-bold text-sm text-gray-700">Table {table}</span>
                  <QRCodeSVG id={`qr-table-${table}`} value={getTableUrl(table)} size={140} level="H" includeMargin={false} />
                  <Button variant="ghost" size="sm" className="w-full text-xs h-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => downloadQR(table)}>
                    <Download className="w-3 h-3 mr-1" /> Save
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
