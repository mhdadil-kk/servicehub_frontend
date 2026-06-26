import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateInvoicePDF = (booking: any) => {
  const doc = new jsPDF();
  
  doc.setFontSize(22);
  doc.setTextColor(37, 99, 235); // Blue-600
  doc.text("ServiceHub Invoice", 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Booking ID: ${booking._id}`, 14, 30);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 35);
  
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text("Service Details", 14, 45);
  
  const providerName = typeof booking.providerId === "object" ? booking.providerId?.userId?.name || "Provider" : "Provider";
  const customerName = typeof booking.userId === "object" ? booking.userId?.name || "Customer" : "Customer";
  const serviceName = typeof booking.serviceId === "object" ? booking.serviceId?.name || "Service" : "Service";
  
  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text(`Provider: ${providerName}`, 14, 52);
  doc.text(`Customer: ${customerName}`, 14, 57);
  doc.text(`Service: ${serviceName}`, 14, 62);
  doc.text(`Service Date: ${booking.date}`, 14, 67);
  
  const tableBody = [];
  
  if (booking.finalInvoice) {
    tableBody.push(["Base Charge", `Rs. ${booking.finalInvoice.baseCharge}`]);
    if (booking.finalInvoice.extraCharges && booking.finalInvoice.extraCharges.length > 0) {
      booking.finalInvoice.extraCharges.forEach((charge: any) => {
        tableBody.push([charge.reason, `Rs. ${charge.amount}`]);
      });
    }
  } else {
    tableBody.push(["Total Amount", `Rs. ${booking.totalAmount || 0}`]);
  }
  
  autoTable(doc, {
    startY: 75,
    head: [["Description", "Amount"]],
    body: tableBody,
    theme: "striped",
    headStyles: { fillColor: [37, 99, 235] },
  });
  
  const finalY = (doc as any).lastAutoTable.finalY || 75;
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text(`Total Paid: Rs. ${booking.totalAmount || 0}`, 14, finalY + 15);
  
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text("Thank you for using ServiceHub!", 14, finalY + 30);
  
  doc.save(`Invoice_${booking._id}.pdf`);
};
