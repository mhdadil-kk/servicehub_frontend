import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Booking } from "../api/booking.service";
import {
  isPopulatedProvider,
  isPopulatedService,
  isPopulatedUser,
  type PopulatedUser,
} from "../types/domain.types";

type JsPdfWithAutoTable = jsPDF & {
  lastAutoTable?: { finalY: number };
};

function providerDisplayName(booking: Booking): string {
  if (!isPopulatedProvider(booking.providerId)) return "Provider";
  const user = booking.providerId.userId;
  if (isPopulatedUser(user)) return user.name;
  return "Provider";
}

function customerDisplayName(booking: Booking): string {
  if (isPopulatedUser(booking.userId)) return booking.userId.name;
  return "Customer";
}

function serviceDisplayName(booking: Booking): string {
  if (isPopulatedService(booking.serviceId)) return booking.serviceId.name;
  return "Service";
}

export const generateInvoicePDF = (booking: Booking) => {
  const doc = new jsPDF() as JsPdfWithAutoTable;

  doc.setFontSize(22);
  doc.setTextColor(37, 99, 235);
  doc.text("ServiceHub Invoice", 14, 22);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Booking ID: ${booking._id}`, 14, 30);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 35);

  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text("Service Details", 14, 45);

  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text(`Provider: ${providerDisplayName(booking)}`, 14, 52);
  doc.text(`Customer: ${customerDisplayName(booking)}`, 14, 57);
  doc.text(`Service: ${serviceDisplayName(booking)}`, 14, 62);
  doc.text(`Service Date: ${booking.date}`, 14, 67);

  const tableBody: string[][] = [];

  if (booking.finalInvoice) {
    tableBody.push(["Base Charge", `Rs. ${booking.finalInvoice.baseCharge}`]);
    booking.finalInvoice.extraCharges?.forEach((charge) => {
      tableBody.push([
        charge.description || charge.reason || "Extra charge",
        `Rs. ${charge.amount}`,
      ]);
    });
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

  const finalY = doc.lastAutoTable?.finalY ?? 75;
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text(`Total Paid: Rs. ${booking.totalAmount || 0}`, 14, finalY + 15);

  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text("Thank you for using ServiceHub!", 14, finalY + 30);

  doc.save(`Invoice_${booking._id}.pdf`);
};

export type { PopulatedUser };
