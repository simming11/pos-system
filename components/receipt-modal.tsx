"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Printer, X, Award } from "lucide-react"
import { useSettings } from "@/contexts/settings-context"
import type { Sale } from "@/app/page"

interface ReceiptModalProps {
  sale: Sale
  onClose: () => void
}

export function ReceiptModal({ sale, onClose }: ReceiptModalProps) {
  const { storeSettings } = useSettings()

  const handlePrint = () => {
    const printContent = document.getElementById("receipt-content")
    if (printContent) {
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Receipt - ${sale.id}</title>
              <style>
                @media print {
                  @page {
                    size: 80mm auto;
                    margin: 5mm;
                  }
                  body {
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                  }
                }
                
                body { 
                  font-family: 'Courier New', monospace; 
                  margin: 0;
                  padding: 10px;
                  font-size: 12px;
                  line-height: 1.4;
                  color: #000;
                  background: white;
                }
                
                .receipt { 
                  max-width: 280px; 
                  margin: 0 auto;
                  background: white;
                  padding: 10px;
                }
                
                .store-header {
                  text-align: center;
                  margin-bottom: 15px;
                  border-bottom: 2px solid #000;
                  padding-bottom: 10px;
                }
                
                .store-name {
                  font-size: 16px;
                  font-weight: bold;
                  margin-bottom: 5px;
                }
                
                .store-info {
                  font-size: 10px;
                  margin: 2px 0;
                }
                
                .receipt-info {
                  margin: 10px 0;
                  font-size: 11px;
                }
                
                .info-row {
                  display: flex;
                  justify-content: space-between;
                  margin: 3px 0;
                }
                
                .items-section {
                  margin: 15px 0;
                  border-top: 1px dashed #000;
                  border-bottom: 1px dashed #000;
                  padding: 10px 0;
                }
                
                .item {
                  margin: 8px 0;
                }
                
                .item-name {
                  font-weight: bold;
                  margin-bottom: 2px;
                }
                
                .item-details {
                  display: flex;
                  justify-content: space-between;
                  font-size: 11px;
                }
                
                .totals-section {
                  margin: 10px 0;
                }
                
                .total-row {
                  display: flex;
                  justify-content: space-between;
                  margin: 5px 0;
                  font-size: 11px;
                }
                
                .discount-row {
                  color: #008000;
                }
                
                .points-row {
                  color: #0066cc;
                }
                
                .final-total {
                  font-weight: bold;
                  font-size: 14px;
                  border-top: 2px solid #000;
                  padding-top: 8px;
                  margin-top: 8px;
                }
                
                .member-section {
                  margin: 10px 0;
                  border: 1px solid #000;
                  padding: 8px;
                  background: #f9f9f9;
                }
                
                .member-header {
                  font-weight: bold;
                  text-align: center;
                  margin-bottom: 5px;
                  border-bottom: 1px solid #000;
                  padding-bottom: 3px;
                }
                
                .footer {
                  text-align: center;
                  margin-top: 15px;
                  font-size: 10px;
                  border-top: 1px dashed #000;
                  padding-top: 10px;
                }
                
                .separator {
                  border-bottom: 1px dashed #000;
                  margin: 8px 0;
                }
              </style>
            </head>
            <body>
              <div class="receipt">
                <div class="store-header">
                  <div class="store-name">${storeSettings.storeName}</div>
                  <div class="store-info">${storeSettings.address}</div>
                  <div class="store-info">โทร: ${storeSettings.phone}</div>
                </div>

                <div class="receipt-info">
                  <div class="info-row">
                    <span>เลขที่:</span>
                    <span>${sale.id}</span>
                  </div>
                  <div class="info-row">
                    <span>วันที่:</span>
                    <span>${sale.timestamp.toLocaleDateString("th-TH")}</span>
                  </div>
                  <div class="info-row">
                    <span>เวลา:</span>
                    <span>${sale.timestamp.toLocaleTimeString("th-TH")}</span>
                  </div>
                  <div class="info-row">
                    <span>การชำระ:</span>
                    <span>${sale.paymentMethod === "cash" ? "เงินสด" : sale.paymentMethod === "card" ? "บัตร" : "Mobile Banking"}</span>
                  </div>
                  ${
                    sale.memberInfo
                      ? `
                  <div class="info-row">
                    <span>สมาชิก:</span>
                    <span>${sale.memberInfo.member.name}</span>
                  </div>
                  <div class="info-row">
                    <span>รหัส:</span>
                    <span>${sale.memberInfo.member.memberCode}</span>
                  </div>
                  `
                      : sale.memberDiscount
                        ? `
                  <div class="info-row">
                    <span>สมาชิก:</span>
                    <span>${sale.memberDiscount.name}</span>
                  </div>
                  `
                        : ""
                  }
                </div>

                <div class="items-section">
                  ${sale.items
                    .map(
                      (item) => `
                    <div class="item">
                      <div class="item-name">${item.name}</div>
                      <div class="item-details">
                        <span>${item.quantity} x ฿${item.price.toFixed(2)}</span>
                        <span>฿${(item.quantity * item.price).toFixed(2)}</span>
                      </div>
                    </div>
                  `,
                    )
                    .join("")}
                </div>

                <div class="totals-section">
                  <div class="total-row">
                    <span>ยอดรวม:</span>
                    <span>฿${sale.originalSubtotal ? sale.originalSubtotal.toFixed(2) : sale.subtotal.toFixed(2)}</span>
                  </div>
                  ${
                    sale.discountAmount && sale.discountAmount > 0
                      ? `
                  <div class="total-row discount-row">
                    <span>ส่วนลด (${sale.memberDiscount?.name}):</span>
                    <span>-฿${sale.discountAmount.toFixed(2)}</span>
                  </div>
                  `
                      : ""
                  }
                  ${
                    sale.memberInfo && sale.memberInfo.pointsUsed > 0
                      ? `
                    <div class="total-row points-row">
                    <span>ใช้แต้ม (${sale.memberInfo.pointsUsed} แต้ม):</span>
                    <span>-฿${(sale.memberInfo.pointsUsed * (storeSettings.pointsValue ?? storeSettings.pointsRedeemValue)).toFixed(2)}</span>
                  </div>
                  `
                      : ""
                  }
                  <div class="total-row">
                    <span>ภาษี (${storeSettings.taxRate}%):</span>
                    <span>฿${sale.tax.toFixed(2)}</span>
                  </div>
                  <div class="total-row final-total">
                    <span>รวมทั้งสิ้น:</span>
                    <span>฿${sale.total.toFixed(2)}</span>
                  </div>
                </div>

                ${
                  sale.memberInfo
                    ? `
                <div class="member-section">
                  <div class="member-header">ข้อมูลสมาชิก</div>
                  <div class="info-row">
                    <span>แต้มที่ได้รับ:</span>
                    <span>+${sale.memberInfo.pointsEarned} แต้ม</span>
                  </div>
                  ${
                    sale.memberInfo.pointsUsed > 0
                      ? `
                  <div class="info-row">
                    <span>แต้มที่ใช้:</span>
                    <span>-${sale.memberInfo.pointsUsed} แต้ม</span>
                  </div>
                  `
                      : ""
                  }
                  <div class="info-row">
                    <span>แต้มคงเหลือ:</span>
                    <span>${sale.memberInfo.member.points + sale.memberInfo.pointsEarned - sale.memberInfo.pointsUsed} แต้ม</span>
                  </div>
                </div>
                `
                    : ""
                }

                <div class="footer">
                  <div>ขอบคุณที่ใช้บริการ</div>
                  <div>โปรดเก็บใบเสร็จไว้เป็นหลักฐาน</div>
                  ${sale.memberInfo ? `<div>สะสมแต้มเพื่อรับสิทธิพิเศษ</div>` : ""}
                </div>
              </div>
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
      }
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            ใบเสร็จรับเงิน
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div id="receipt-content" className="space-y-4 font-mono text-sm">
          <div className="store-header">
            <h2 className="store-name">{storeSettings.storeName}</h2>
            <p className="store-info">{storeSettings.address}</p>
            <p className="store-info">โทร: {storeSettings.phone}</p>
          </div>

          <Separator className="separator" />

          {/* Sale Info */}
          <div className="receipt-info">
            <div className="info-row">
              <span>เลขที่:</span>
              <span>{sale.id}</span>
            </div>
            <div className="info-row">
              <span>วันที่:</span>
              <span>{sale.timestamp.toLocaleDateString("th-TH")}</span>
            </div>
            <div className="info-row">
              <span>เวลา:</span>
              <span>{sale.timestamp.toLocaleTimeString("th-TH")}</span>
            </div>
            <div className="info-row">
              <span>การชำระ:</span>
              <span>
                {sale.paymentMethod === "cash" ? "เงินสด" : sale.paymentMethod === "card" ? "บัตร" : "Mobile Banking"}
              </span>
            </div>
            {sale.memberInfo ? (
              <>
                <div className="info-row">
                  <span>สมาชิก:</span>
                  <span>{sale.memberInfo.member.name}</span>
                </div>
                <div className="info-row">
                  <span>รหัส:</span>
                  <span>{sale.memberInfo.member.memberCode}</span>
                </div>
              </>
            ) : sale.memberDiscount ? (
              <div className="info-row">
                <span>สมาชิก:</span>
                <span>{sale.memberDiscount.name}</span>
              </div>
            ) : null}
          </div>

          <Separator className="separator" />

          {/* Items */}
          <div className="items-section">
            {sale.items.map((item, index) => (
              <div key={index} className="item">
                <div className="item-name">{item.name}</div>
                <div className="item-details">
                  <span>
                    {item.quantity} x ฿{item.price.toFixed(2)}
                  </span>
                  <span>฿{(item.quantity * item.price).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          <Separator className="separator" />

          <div className="totals-section">
            <div className="total-row">
              <span>ยอดรวม:</span>
              <span>฿{(sale.originalSubtotal || sale.subtotal).toFixed(2)}</span>
            </div>
            {sale.discountAmount && sale.discountAmount > 0 && (
              <div className="total-row text-green-600">
                <span>ส่วนลด ({sale.memberDiscount?.name}):</span>
                <span>-฿{sale.discountAmount.toFixed(2)}</span>
              </div>
            )}
            {sale.memberInfo && sale.memberInfo.pointsUsed > 0 && (
              <div className="total-row text-blue-600">
                <span>ใช้แต้ม ({sale.memberInfo.pointsUsed} แต้ม):</span>
                <span>-฿{(sale.memberInfo.pointsUsed * (storeSettings.pointsValue ?? storeSettings.pointsRedeemValue)).toFixed(2)}</span>
              </div>
            )}
            <div className="total-row">
              <span>ภาษี ({storeSettings.taxRate}%):</span>
              <span>฿{sale.tax.toFixed(2)}</span>
            </div>
            <div className="total-row final-total">
              <span>รวมทั้งสิ้น:</span>
              <span>฿{sale.total.toFixed(2)}</span>
            </div>
          </div>

          {sale.memberInfo && (
            <>
              <Separator className="separator" />
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2 font-bold text-center mb-2 border-b border-green-300 pb-2">
                  <Award className="h-4 w-4 text-green-600" />
                  <span>ข้อมูลสมาชิก</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="info-row">
                    <span>แต้มที่ได้รับ:</span>
                    <span className="text-green-600 font-medium">+{sale.memberInfo.pointsEarned} แต้ม</span>
                  </div>
                  {sale.memberInfo.pointsUsed > 0 && (
                    <div className="info-row">
                      <span>แต้มที่ใช้:</span>
                      <span className="text-red-600 font-medium">-{sale.memberInfo.pointsUsed} แต้ม</span>
                    </div>
                  )}
                  <div className="info-row border-t border-green-300 pt-1">
                    <span>แต้มคงเหลือ:</span>
                    <span className="font-bold text-green-700">
                      {sale.memberInfo.member.points + sale.memberInfo.pointsEarned - sale.memberInfo.pointsUsed} แต้ม
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          <Separator className="separator" />

          <div className="footer text-xs text-muted-foreground">
            <p>ขอบคุณที่ใช้บริการ</p>
            <p>โปรดเก็บใบเสร็จไว้เป็นหลักฐาน</p>
            {sale.memberInfo && <p>สะสมแต้มเพื่อรับสิทธิพิเศษ</p>}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button onClick={handlePrint} className="flex-1">
            <Printer className="h-4 w-4 mr-2" />
            พิมพ์ใบเสร็จ
          </Button>
          <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
            ปิด
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
