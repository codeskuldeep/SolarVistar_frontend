import React from "react";

const QuotationPDFTemplate = ({ quote = {} }) => {
  const lead = quote.lead || {};
  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const netPrice = (quote.quotationValue || 0) - (quote.subsidy || 0);
  
  // ⚡ Stable Quotation ID: Uses the real DB record UUID chunk, with React.useMemo fallback if missing
  const stableId = React.useMemo(() => {
    if (quote.id) {
      return quote.id.split("-")[0].toUpperCase();
    }
    return String(Math.floor(1000 + Math.random() * 9000));
  }, [quote.id]);
  const quotationId = `SPVQ-${stableId}`;

  // ⚡ Dynamic page count: 4 pages if any component photo is uploaded, 3 pages otherwise
  const totalPages = (quote.panelPhotoUrl || quote.inverterPhotoUrl) ? 4 : 3;

  const TriColorBar = () => (
    <div className="flex h-1 w-full rounded-full overflow-hidden">
      <div className="h-full w-1/3 bg-[#4CAF50]"></div>
      <div className="h-full w-1/3 bg-[#E8650A]"></div>
      <div className="h-full w-1/3 bg-[#031634]"></div>
    </div>
  );

  const PageHeader = ({ title, subtitle }) => (
    <header className="bg-[#031634] text-white py-6 px-[18mm] flex justify-between items-center border-b-4 border-[#E8650A]">
      <div className="flex items-center gap-3">
        <div className="bg-white p-1 rounded-full shadow-md">
          <span className="material-symbols-outlined text-[#E8650A] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            wb_sunny
          </span>
        </div>
        <div>
          <h1 className="font-serif text-2xl font-bold leading-tight tracking-wide">Solar Vistar</h1>
          <p className="text-[0.65rem] uppercase tracking-widest text-[#ffddb4]">Renewable Energy Solutions</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-[0.85rem] font-bold tracking-wider text-[#ffddb4]">{title}</p>
        {subtitle && <p className="text-[0.65rem] opacity-80 mt-0.5">{subtitle}</p>}
      </div>
    </header>
  );

  const PageFooter = ({ pageNum, totalPages }) => (
    <footer className="bg-[#031634] text-white py-3 px-[18mm] mt-auto flex justify-between items-center text-[0.7rem] border-t-2 border-[#4CAF50]">
      <span className="opacity-90">© {new Date().getFullYear()} Solar Vistar. All Rights Reserved.</span>
      <span className="font-bold text-[#ffddb4] bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">Page {pageNum} of {totalPages}</span>
      <span className="opacity-90 font-mono tracking-wider">ID: {quotationId}</span>
    </footer>
  );

  return (
    <div id="quotation-pdf-print-root" className="bg-[#f5f3f6] text-gray-900 font-sans flex flex-col items-center py-8 print:py-0 print:bg-white">
      
      <style dangerouslySetInnerHTML={{ __html: `
        @page {
          size: A4 portrait;
          margin: 0 !important;
        }
        @media print {
          /* Hide parent dashboard layout components & non-print elements */
          aside,
          header,
          .print\\:hidden,
          .no-print,
          button,
          nav {
            display: none !important;
          }
          
          /* Override all parent wrapper styles for perfect A4 document placement */
          html, body {
            width: 210mm !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Reset all potential wrapping div spacings */
          div, main, section {
            box-shadow: none !important;
            border-radius: 0 !important;
          }

          /* Force dashboard layout layers to fill the printed area without clipping */
          .flex-1,
          .overflow-y-auto,
          main,
          .max-w-7xl,
          .p-4,
          .sm\\:p-6,
          .lg\\:p-8,
          .py-8 {
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            max-width: none !important;
            width: 100% !important;
            height: auto !important;
            background: transparent !important;
          }

          /* Position print root absolutely to align with A4 boundaries */
          #quotation-pdf-print-root {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            display: block !important;
          }

          /* Enforce exact A4 viewport dimensions and clean page breaking */
          .pdf-page-section {
            width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
            max-height: 297mm !important;
            page-break-after: always !important;
            break-after: page !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            box-sizing: border-box !important;
            position: relative !important;
          }

          /* Preserve background styling on all browsers */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      ` }} />

      {/* ================= PAGE 1: COVER & LETTER ================= */}
      <section className="pdf-page-section w-[210mm] h-[297mm] bg-white relative shadow-2xl print:shadow-none break-after-page flex flex-col overflow-hidden mb-8 print:mb-0">
        <div className="relative h-[36%] w-full">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDxsa85YFrwtDf5eHOEPKaGGt3VZY5xNIRhLDbATH3o8P18wFC1Yp0MzlA6uWCUPOT4fLNcC-MV-cNHqf3MTh8zkHvK_rJFdAEBqmguH80vSHFMNDs5v-ElbRMCxJTIbkVIsCUzHqMIUqpSJIEYop1we5yX6l-iG00Iv9V5vYEQh5cP_xLzK6lIXqWtQdaKHUzrOdaLBs_yS6D31KC6sS4LGk_SBgoWap7TuLe-dbeIkQzP8n_u1J0vjF31fhK5C1B_u7HWeyG-bLk')",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#031634]/60 to-transparent"></div>
          </div>
          <div className="relative z-10 p-[18mm] py-[8mm] h-full flex flex-col justify-between">
            <div className="bg-white p-2 shadow-lg rounded-xl w-fit flex items-center justify-center ring-4 ring-white/20">
              <span className="material-symbols-outlined text-[#031634] text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                solar_power
              </span>
            </div>
            <div className="max-w-2xl">
              <h1 className="font-serif text-white drop-shadow-lg mb-2">
                <span className="text-[#ffb955] text-[3.2rem] font-bold block mb-1 leading-none">
                  {quote.loadKw || "X"} KW
                </span>
                <span className="text-2xl font-semibold">Solar Power Solution</span>
              </h1>
              <p className="text-white/90 font-sans text-xs uppercase tracking-widest border-l-4 border-[#E8650A] pl-3 pb-3">
                Custom Solar Proposal {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>

        {/* Client Info Card */}
        <div className="mx-[18mm] -mt-10 relative z-20">
          <div className="bg-white p-5 rounded-xl shadow-xl border-l-8 border-[#E8650A] flex justify-between items-center">
            <div>
              <p className="text-[0.65rem] font-semibold text-gray-500 uppercase tracking-widest mb-0.5">Prepared For</p>
              <h2 className="font-serif text-xl text-[#031634] font-bold mb-0.5">
                {lead.customerName || "Customer Name"}
              </h2>
              <p className="text-gray-600 text-xs">Residential Project - Grid Connected</p>
              {lead.address && <p className="text-gray-500 text-xs mt-0.5">{lead.address}</p>}
              {lead.phone && <p className="text-gray-500 text-xs">Ph: +91 {lead.phone}</p>}
            </div>
            <div className="text-right">
              <p className="text-[0.65rem] font-semibold text-gray-500 uppercase tracking-widest mb-0.5">Quotation ID</p>
              <p className="font-serif text-lg font-bold text-[#031634]">{quotationId}</p>
              <p className="text-gray-500 text-xs font-medium mt-0.5">Date: {today}</p>
            </div>
          </div>
        </div>

        {/* Introduction Letter */}
        <div className="flex-grow flex flex-col pt-5">
          <div className="px-[18mm] mb-4">
            <h3 className="text-[#031634] font-serif text-lg font-bold mb-1">Proposal Letter</h3>
            <TriColorBar />
          </div>
          <div className="px-[18mm] flex-grow">
            <div className="bg-[#f5f3f6] p-5 rounded-xl border border-gray-200">
              <h4 className="font-serif text-lg font-bold text-[#031634] mb-3">Dear {lead.customerName || "Valued Customer"},</h4>
              <div className="space-y-2.5 text-gray-700 text-sm">
                <p className="leading-relaxed">
                  A warm welcome to the Solar Vistar family. We are delighted that you have chosen clean and sustainable solar energy for your home. This choice will not only significantly reduce your electricity bills but also represent a major contribution toward a greener environment.
                </p>
                <p className="leading-relaxed">
                  We are pleased to present this personalized proposal for a <strong>{quote.loadKw || "X"} KW</strong> Solar Power System. Our solution is designed using Tier-1 components to ensure maximum efficiency and long-term reliability.
                </p>
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="p-3 border-l-4 border-[#4CAF50] bg-white shadow-sm rounded-r-lg">
                    <span className="material-symbols-outlined text-[#4CAF50] mb-1 text-2xl">trending_down</span>
                    <p className="text-[0.6rem] text-gray-500 uppercase font-bold tracking-wider">Bill Reduction</p>
                    <p className="font-bold text-[#031634] text-base">Up to 90%</p>
                  </div>
                  <div className="p-3 border-l-4 border-[#E8650A] bg-white shadow-sm rounded-r-lg">
                    <span className="material-symbols-outlined text-[#E8650A] mb-1 text-2xl">workspace_premium</span>
                    <p className="text-[0.6rem] text-gray-500 uppercase font-bold tracking-wider">Warranty</p>
                    <p className="font-bold text-[#031634] text-base">25 Years</p>
                  </div>
                  <div className="p-3 border-l-4 border-[#031634] bg-white shadow-sm rounded-r-lg">
                    <span className="material-symbols-outlined text-[#031634] mb-1 text-2xl">eco</span>
                    <p className="text-[0.6rem] text-gray-500 uppercase font-bold tracking-wider">Green Energy</p>
                    <p className="font-bold text-[#031634] text-base">100% Clean</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <PageFooter pageNum={1} totalPages={totalPages} />
      </section>

      {/* ================= PAGE 2: TECH SPECS ================= */}
      <section className="pdf-page-section w-[210mm] h-[297mm] bg-white relative shadow-2xl print:shadow-none break-after-page flex flex-col overflow-hidden mb-8 print:mb-0">
        <PageHeader title="Technical Specifications" subtitle={`Ref: ${quotationId}`} />
        
        <div className="px-[18mm] py-6 flex-grow relative">
          {/* Subtle Watermark */}
          <div className="absolute top-20 right-10 opacity-[0.03] pointer-events-none">
            <span className="material-symbols-outlined text-[260px]" style={{ fontVariationSettings: "'FILL' 1" }}>solar_power</span>
          </div>

          <h3 className="text-[#031634] font-serif text-lg font-bold mb-1">System Component Details</h3>
          <TriColorBar />
          
          <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-[#031634] text-white">
                <tr>
                  <th className="px-4 py-2.5 font-bold text-xs uppercase tracking-wider w-1/3">Component</th>
                  <th className="px-4 py-2.5 font-bold text-xs uppercase tracking-wider">Specifications & Make</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-xs">
                <tr className="bg-white hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2 font-bold text-[#031634]">System Capacity</td>
                  <td className="px-4 py-2 font-bold text-[#E8650A] text-sm">{quote.loadKw || "-"} KW On-Grid</td>
                </tr>
                <tr className="bg-[#F0F4FF] hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-2.5 font-bold text-[#031634]">Solar PV Modules</td>
                  <td className="px-4 py-2.5 text-gray-700">
                    <span className="font-bold text-[#031634]">{quote.panelName || "Tier-1 Mono PERC"}</span> - {quote.panelType || "Half-Cut"} ({quote.panelSizeWatt || "540"}W)
                    <br />
                    <span className="inline-block mt-1 bg-green-100 text-green-800 text-[10px] px-1.5 py-0.5 rounded font-semibold">
                      {quote.numberOfPanels || "0"} Panels • {quote.panelWarrantyYears || "25"} Yrs Performance Warranty
                    </span>
                  </td>
                </tr>
                <tr className="bg-white hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2.5 font-bold text-[#031634]">Solar Inverter</td>
                  <td className="px-4 py-2.5 text-gray-700">
                    <span className="font-bold text-[#031634]">{quote.inverterSizeKw || "-"} KW Smart String Inverter</span> (Wi-Fi Enabled)
                    <br />
                    <span className="inline-block mt-1 bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.5 rounded font-semibold">
                      {quote.inverterWarrantyYears || "0"} Yrs Manufacturer Warranty
                    </span>
                  </td>
                </tr>
                <tr className="bg-[#F0F4FF] hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-2 font-bold text-[#031634]">Mounting Structure</td>
                  <td className="px-4 py-2 text-gray-700">{quote.structure || "Hot-Dipped Galvanized Iron (GI) - High Wind Resistance"}</td>
                </tr>
                <tr className="bg-white hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2.5 font-bold text-[#031634]">Cabling (DC/AC)</td>
                  <td className="px-4 py-2.5 text-gray-700">
                    <span className="font-semibold text-[#E8650A]">DC Cable:</span> {quote.dcCableSqMm || "-"} sq mm UV Protected ({quote.dcWire?.replace(/_/g, " ")})<br />
                    <span className="font-semibold text-[#031634]">AC Cable:</span> {quote.acCableSqMm || "-"} sq mm Armored ({quote.acWire?.replace(/_/g, " ")})
                  </td>
                </tr>
                <tr className="bg-[#F0F4FF] hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-2.5 font-bold text-[#031634]">Balance of System</td>
                  <td className="px-4 py-2.5 text-gray-700">
                    <span className="font-semibold">ACDB:</span> {quote.acdbCompany?.replace(/_/g, " ") || "Standard IP65"} | <span className="font-semibold">DCDB:</span> {quote.dcdbCompany?.replace(/_/g, " ") || "Standard IP65"}
                    <br />
                    Includes Earthing Kit & Lightning Arrestor (ESE Type)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-[#f5f3f6] p-4 rounded-xl border-t-4 border-[#4CAF50] shadow-sm">
              <h4 className="font-bold text-[#031634] mb-2 font-serif text-base">Key Features</h4>
              <ul className="text-xs space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[#4CAF50] text-xs mt-0.5">check_circle</span>
                  Remote monitoring via mobile app
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[#4CAF50] text-xs mt-0.5">check_circle</span>
                  Anti-reflective, dirt-resistant module glass
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[#4CAF50] text-xs mt-0.5">check_circle</span>
                  IP65 rated weather protection for components
                </li>
              </ul>
            </div>
            <div className="bg-[#f5f3f6] p-4 rounded-xl border-t-4 border-[#E8650A] shadow-sm flex flex-col justify-center">
              <h4 className="font-bold text-[#031634] mb-2 font-serif text-base">Performance Est.</h4>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-serif font-bold text-[#E8650A]">~{(quote.loadKw * 120).toFixed(0)}</p>
                  <p className="text-[0.65rem] uppercase text-gray-500 font-bold tracking-wider mt-0.5">Units/Month</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-[#031634]">{(quote.loadKw * 1440).toFixed(0)}</p>
                  <p className="text-[0.65rem] uppercase text-gray-500 font-bold tracking-wider mt-0.5">Units/Year</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <PageFooter pageNum={2} totalPages={totalPages} />
      </section>

      {/* ================= PAGE 3: COMMERCIALS & TERMS ================= */}
      <section className="pdf-page-section w-[210mm] h-[297mm] bg-white relative shadow-2xl print:shadow-none break-after-page flex flex-col overflow-hidden mb-8 print:mb-0">
        <PageHeader title="Commercial Proposal" subtitle="Pricing & Payment Terms" />
        
        <div className="px-[18mm] py-5 flex-grow flex flex-col justify-between">
          <div>
            <h3 className="text-[#031634] font-serif text-lg font-bold mb-1">Investment Summary</h3>
            <TriColorBar />
          </div>
          
          <div className="mt-4 bg-[#f5f3f6] p-5 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#E8650A] text-white px-4 py-1 rounded-bl-2xl font-bold text-xs shadow-md">
              Custom Quote
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-700 font-medium">Gross Project Value (Incl. GST & Install)</span>
                <span className="font-bold text-gray-900">₹ {Number(quote.quotationValue || 0).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-[#2E7D32] bg-[#E8F5E9] p-2.5 rounded-lg border border-[#A5D6A7] shadow-inner shadow-[#A5D6A7]/20">
                <span className="font-semibold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">verified</span>
                  Estimated Govt. Subsidy (PM Surya Ghar)
                </span>
                <span className="font-bold">- ₹ {Number(quote.subsidy || 0).toLocaleString("en-IN")}</span>
              </div>
              <div className="border-t border-dashed border-gray-300 my-2 pt-2.5 flex justify-between items-center">
                <span className="text-lg font-serif text-[#031634] font-bold">Net Effective Cost</span>
                <span className="text-2xl font-serif text-[#031634] font-black">₹ {Number(netPrice).toLocaleString("en-IN")}</span>
              </div>
            </div>
            <div className="mt-4 flex items-start gap-2 text-[10px] text-gray-500 leading-normal">
               <span className="material-symbols-outlined text-[14px] text-[#E8650A] shrink-0">info</span>
               <p>Subsidy amount is subject to government verification and will be credited directly to the customer's bank account (Direct Benefit Transfer) post-commissioning.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-5">
            {/* Payment Schedule */}
            <div>
              <h4 className="font-bold text-[#031634] mb-2 text-base border-b border-gray-200 pb-1">Payment Schedule</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-white border border-gray-200 p-2 rounded-lg shadow-sm">
                  <div>
                    <p className="font-bold text-[#031634] text-xs">Advance Booking</p>
                    <p className="text-[9px] text-gray-500 uppercase leading-none">On confirmation</p>
                  </div>
                  <p className="font-black text-[#E8650A] text-base">50%</p>
                </div>
                <div className="flex justify-between items-center bg-[#F0F4FF] border border-blue-100 p-2 rounded-lg shadow-sm">
                  <div>
                    <p className="font-bold text-[#031634] text-xs">Material Delivery</p>
                    <p className="text-[9px] text-gray-500 uppercase leading-none">Hardware at site</p>
                  </div>
                  <p className="font-black text-[#E8650A] text-base">30%</p>
                </div>
                <div className="flex justify-between items-center bg-white border border-gray-200 p-2 rounded-lg shadow-sm">
                  <div>
                    <p className="font-bold text-[#031634] text-xs">Commissioning</p>
                    <p className="text-[9px] text-gray-500 uppercase leading-none">Post installation</p>
                  </div>
                  <p className="font-black text-[#E8650A] text-base">20%</p>
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div>
              <h4 className="font-bold text-[#031634] mb-2 text-base border-b border-gray-200 pb-1">Bank Details</h4>
              <div className="bg-[#f5f3f6] p-3.5 rounded-xl border-t-4 border-[#031634] shadow-sm">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="material-symbols-outlined text-[#031634] text-lg">account_balance</span>
                  <p className="font-bold text-[#031634] text-xs">Account Information</p>
                </div>
                <div className="space-y-1.5 text-xs text-gray-700">
                  <div className="flex justify-between border-b border-gray-200 pb-0.5">
                    <span className="text-gray-500">Bank Name:</span>
                    <span className="font-bold text-[#031634]">State Bank of India</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-0.5">
                    <span className="text-gray-500">A/C Name:</span>
                    <span className="font-bold text-[#031634]">Solar Vistar Pvt Ltd</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-0.5">
                    <span className="text-gray-500">A/C Number:</span>
                    <span className="font-mono font-bold tracking-wider text-[#E8650A]">39876543210</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">IFSC Code:</span>
                    <span className="font-mono font-bold tracking-wider">SBIN0001234</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Terms Footer */}
          <div className="mt-6 pt-3 border-t border-gray-200 flex justify-between items-end">
            <div className="w-1/2 pr-4">
              <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Terms & Conditions</h4>
              <ul className="text-[9px] text-gray-500 list-disc pl-3.5 space-y-0.5 leading-snug">
                <li>Quote is valid for 15 days from issuance.</li>
                <li>Roof strength responsibility lies solely with the customer.</li>
                <li>Net metering process timeline depends strictly on DISCOM.</li>
                <li>Damage by natural disasters is not covered under warranty.</li>
              </ul>
            </div>
            <div className="flex gap-8">
              <div className="text-center">
                <div className="h-10 w-28 border-b border-gray-400 mb-1"></div>
                <p className="text-[9px] font-bold text-[#031634] uppercase">Customer Signature</p>
              </div>
              <div className="text-center">
                <div className="h-10 w-28 border-b border-gray-400 mb-1"></div>
                <p className="text-[9px] font-bold text-[#031634] uppercase">Authorized Signatory</p>
              </div>
            </div>
          </div>

        </div>
        <PageFooter pageNum={3} totalPages={totalPages} />
      </section>

      {/* ================= PAGE 4: COMPONENT PHOTOS (Conditional) ================= */}
      {(quote.panelPhotoUrl || quote.inverterPhotoUrl) && (
        <section className="pdf-page-section w-[210mm] h-[297mm] bg-white relative shadow-2xl print:shadow-none break-after-page flex flex-col overflow-hidden mb-8 print:mb-0">
          <PageHeader title="Hardware Portfolio" subtitle="Tier-1 Proposed Components" />
          
          <div className="px-[18mm] py-6 flex-grow">
            <h3 className="text-[#031634] font-serif text-lg font-bold mb-1">Proposed System Components</h3>
            <TriColorBar />

            <div className={`grid gap-6 mt-6 ${quote.panelPhotoUrl && quote.inverterPhotoUrl ? "grid-cols-2" : "grid-cols-1 max-w-md mx-auto"}`}>
              {quote.panelPhotoUrl && (
                <div className="flex flex-col items-center bg-white p-4 rounded-xl shadow-md border border-gray-200">
                  <div className="h-52 w-full mb-4 flex items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-[#f5f3f6]">
                    <img src={quote.panelPhotoUrl} alt="Solar Panel" className="max-h-full max-w-full object-contain drop-shadow-sm p-3" />
                  </div>
                  <h3 className="font-black text-[#031634] text-base text-center uppercase tracking-wide">
                    {quote.panelName || "Solar PV Module"}
                  </h3>
                  <div className="w-12 h-0.5 bg-[#E8650A] my-2 rounded-full"></div>
                  <p className="text-gray-500 text-xs text-center font-medium">
                    High-efficiency {quote.panelType || "Tier-1 PV"} Technology
                  </p>
                </div>
              )}
              
              {quote.inverterPhotoUrl && (
                <div className="flex flex-col items-center bg-white p-4 rounded-xl shadow-md border border-gray-200">
                  <div className="h-52 w-full mb-4 flex items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-[#f5f3f6]">
                    <img src={quote.inverterPhotoUrl} alt="Solar Inverter" className="max-h-full max-w-full object-contain drop-shadow-sm p-3" />
                  </div>
                  <h3 className="font-black text-[#031634] text-base text-center uppercase tracking-wide">
                    Smart Inverter Unit
                  </h3>
                  <div className="w-12 h-0.5 bg-[#E8650A] my-2 rounded-full"></div>
                  <p className="text-gray-500 text-xs text-center font-medium">
                    {quote.numberOfInverters || 1}x {quote.inverterSizeKw || "0"}KW Highly Efficient String Inverter
                  </p>
                </div>
              )}
            </div>
          </div>
          <PageFooter pageNum={4} totalPages={totalPages} />
        </section>
      )}

    </div>
  );
};

export default QuotationPDFTemplate;