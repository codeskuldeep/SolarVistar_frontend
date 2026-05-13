import React from "react";

const QuotationPDFTemplate = ({ quote }) => {
  const lead = quote.lead || {};
  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const netPrice = (quote.quotationValue || 0) - (quote.subsidy || 0);

  return (
    <div className="bg-white text-gray-900 font-sans max-w-[210mm] mx-auto shadow-2xl print:shadow-none print:w-full print:max-w-none">
      
      {/* ================= PAGE 1: COVER ================= */}
      <div className="p-10 min-h-[297mm] flex flex-col justify-between break-after-page relative border-x border-b border-gray-100">
        {/* Top Indian Tricolor Accent Bar */}
        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-orange-500 via-white to-green-600"></div>
        {/* Secondary decorative border */}
        <div className="absolute top-3 left-0 w-full h-1 bg-blue-900"></div>

        <div className="mt-16 text-center">
          {/* Logo Placeholder */}
          <div className="w-64 h-32 mx-auto mb-8 flex items-center justify-center">
            {/* Replace this with an actual <img src="/logo.png" /> later */}
            <img src="/logo.PNG"></img>
          </div>

          <p className="text-sm font-bold text-orange-600 tracking-widest uppercase mb-4">
            Quotation & Proposal
          </p>
          <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight leading-snug">
            {quote.loadKw || "X"} KW ON-Grid <br />
            <span className="text-orange-500">Solar Power System</span>
          </h1>
          <div className="w-24 h-1 bg-orange-500 mx-auto mt-6 rounded-full"></div>
        </div>

        <div className="space-y-10 mt-16 px-8">
          <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-blue-900 shadow-sm">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-2">
              To / Prepared For:
            </p>
            <h2 className="text-2xl font-bold text-gray-900 uppercase mb-1">
              {lead.customerName || "Customer Name"}
            </h2>
            <p className="text-md text-gray-700 font-medium">
              {lead.address || "Address Not Provided"}
            </p>
            {lead.phone && (
              <p className="text-md text-gray-700 mt-1">Ph: +91 {lead.phone}</p>
            )}
          </div>

          <div className="flex justify-between items-center border-b border-gray-200 pb-4">
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">
                Quotation Date
              </p>
              <p className="text-lg font-bold text-gray-800">{today}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">
                Ref No.
              </p>
              <p className="text-lg font-bold text-gray-800">
                SPV/{new Date().getFullYear()}/{(Math.random() * 10000).toFixed(0).padStart(4, '0')}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-auto bg-blue-900 text-white p-8 rounded-t-xl flex justify-between items-start shadow-lg">
          <div className="text-left w-1/2">
            <p className="text-lg font-bold text-orange-400 mb-1">
              सोलर पॉवर विस्तार सहकारी संस्था खरगोन
            </p>
            <p className="text-sm text-gray-200 italic mb-3">
              "Solar - A Need For Future Alternative Energy"
            </p>
            <p className="text-sm text-gray-200">GSTIN: <span className="font-semibold">23XXXXX1234X1ZX</span></p>
            <p className="text-sm text-gray-200">Phone: +91 [PHONE NUMBER]</p>
          </div>
          <div className="text-right w-1/2">
            <p className="text-xs text-orange-400 uppercase font-bold tracking-wider mb-2">
              Bank Details for RTGS/NEFT
            </p>
            <p className="text-sm text-gray-100 font-medium">Bank: <span className="text-white font-bold">[BANK NAME]</span></p>
            <p className="text-sm text-gray-100 font-medium">A/C: <span className="text-white font-bold">[000000000000]</span></p>
            <p className="text-sm text-gray-100 font-medium">IFSC: <span className="text-white font-bold">[ABCD0000123]</span></p>
          </div>
        </div>
      </div>

      {/* ================= PAGE 2: TECH SPECS & COMMERCIALS ================= */}
      <div className="p-12 min-h-[297mm] break-after-page relative border-x border-b border-gray-100">
        {/* Tricolor Accent Bar */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 via-white to-green-600"></div>

        <h2 className="text-2xl font-bold text-blue-900 border-b-2 border-orange-500 pb-2 mb-6 mt-4 uppercase tracking-wide">
          Technical Specifications
        </h2>

        <table className="w-full text-left border-collapse mb-10 shadow-sm">
          <thead>
            <tr className="bg-blue-900 text-white">
              <th className="border border-blue-950 p-3 font-semibold text-sm w-1/3 rounded-tl-md">
                Component
              </th>
              <th className="border border-blue-950 p-3 font-semibold text-sm rounded-tr-md">
                Make & Specification
              </th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-800">
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="border border-gray-200 p-3 font-bold bg-gray-100 text-gray-700">
                System Capacity
              </td>
              <td className="border border-gray-200 p-3 font-black text-orange-600 text-base">
                {quote.loadKw || "-"} KW
              </td>
            </tr>
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="border border-gray-200 p-3 font-bold bg-gray-100 text-gray-700">
                Solar PV Modules
              </td>
              <td className="border border-gray-200 p-3">
                <span className="font-bold">{quote.panelName || "-"}</span> - {quote.panelType || "-"} ({quote.panelSizeWatt || "-"}W)
                <br />
                <span className="inline-block mt-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-medium">
                  {quote.numberOfPanels || "0"} Panels • {quote.panelWarrantyYears || "0"} Yrs Performance Warranty
                </span>
              </td>
            </tr>
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="border border-gray-200 p-3 font-bold bg-gray-100 text-gray-700">
                Solar Inverter
              </td>
              <td className="border border-gray-200 p-3">
                <span className="font-bold">{quote.inverterSizeKw || "-"} KW String Inverter</span>
                <br />
                <span className="inline-block mt-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-medium">
                  {quote.inverterWarrantyYears || "0"} Yrs Manufacturer Warranty
                </span>
              </td>
            </tr>
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="border border-gray-200 p-3 font-bold bg-gray-100 text-gray-700">
                Mounting Structure
              </td>
              <td className="border border-gray-200 p-3 font-medium">
                {quote.structure || "Hot Dip Galvanised Iron (GI)"}
              </td>
            </tr>
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="border border-gray-200 p-3 font-bold bg-gray-100 text-gray-700">
                Cabling (AC/DC)
              </td>
              <td className="border border-gray-200 p-3">
                <span className="font-semibold text-orange-600">DC:</span> {quote.dcCableSqMm || "-"} Sq.mm ({quote.dcWire?.replace(/_/g, " ")})<br />
                <span className="font-semibold text-blue-600">AC:</span> {quote.acCableSqMm || "-"} Sq.mm ({quote.acWire?.replace(/_/g, " ")})
              </td>
            </tr>
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="border border-gray-200 p-3 font-bold bg-gray-100 text-gray-700">
                Protection (ACDB/DCDB)
              </td>
              <td className="border border-gray-200 p-3">
                <span className="font-semibold">ACDB:</span> {quote.acdbCompany?.replace(/_/g, " ")} | <span className="font-semibold">DCDB:</span> {quote.dcdbCompany?.replace(/_/g, " ")}
              </td>
            </tr>
          </tbody>
        </table>

        <h2 className="text-2xl font-bold text-blue-900 border-b-2 border-orange-500 pb-2 mb-6 uppercase tracking-wide">
          Commercial Investment
        </h2>

        <table className="w-full text-left border-collapse shadow-sm mb-6">
          <tbody className="text-sm">
            <tr>
              <td className="border border-gray-200 p-4 font-bold bg-gray-100 text-gray-700 w-1/2">
                Gross Project Value (Incl. GST)
              </td>
              <td className="border border-gray-200 p-4 text-lg font-bold text-gray-900 text-right">
                ₹ {Number(quote.quotationValue || 0).toLocaleString("en-IN")}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-200 p-4 font-bold bg-orange-50 text-orange-800">
                Expected MNRE Subsidy<br/>
                <span className="text-xs font-normal text-orange-600">(Credited directly to customer's bank A/C)</span>
              </td>
              <td className="border border-gray-200 p-4 text-lg font-bold text-green-600 text-right bg-orange-50">
                - ₹ {Number(quote.subsidy || 0).toLocaleString("en-IN")}
              </td>
            </tr>
            <tr>
              <td className="border border-blue-900 p-4 font-bold bg-blue-900 text-white text-lg uppercase tracking-wider">
                Net Effective Cost
              </td>
              <td className="border border-blue-900 p-4 text-2xl font-black text-blue-900 bg-blue-50 text-right">
                ₹ {Number(netPrice).toLocaleString("en-IN")}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Indian Business Standard: Terms and Signatory */}
        <div className="mt-8 grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <h3 className="text-sm font-bold text-gray-800 border-b border-gray-300 pb-1 mb-2 uppercase">Terms & Conditions</h3>
            <ul className="text-xs text-gray-600 list-disc pl-4 space-y-1">
              <li><strong>Validity:</strong> This quotation is valid for 15 days from the date of issue.</li>
              <li><strong>Inclusions:</strong> Price includes material, transportation, and standard installation.</li>
              <li><strong>Timeline:</strong> Expected execution time is 6-8 weeks from the date of advance payment.</li>
              <li><strong>Payment Terms:</strong> 70% Advance, 20% on material delivery, 10% post-installation.</li>
              <li>Subject to Khargone jurisdiction.</li>
            </ul>
          </div>
          
          <div className="col-span-1 flex flex-col items-center justify-end border-t border-gray-400 pt-16 relative">
            <span className="absolute top-2 text-xs text-gray-400 italic">Company Seal & Signature</span>
            <p className="text-sm font-bold text-blue-900 text-center">Authorized Signatory</p>
            <p className="text-xs text-gray-600 text-center">सोलर पॉवर विस्तार</p>
          </div>
        </div>
      </div>

      {/* ================= PAGE 3: COMPONENT PHOTOS ================= */}
      {(quote.panelPhotoUrl || quote.inverterPhotoUrl) && (
        <div className="p-12 min-h-[297mm] break-after-page relative border-x border-b border-gray-100 bg-gray-50">
          {/* Tricolor Accent Bar */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 via-white to-green-600"></div>

          <h2 className="text-2xl font-bold text-blue-900 border-b-2 border-orange-500 pb-2 mb-10 mt-4 uppercase tracking-wide">
            Proposed System Components
          </h2>

          <div className="grid grid-cols-2 gap-10">
            {quote.panelPhotoUrl && (
              <div className="flex flex-col items-center bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="h-64 w-full mb-6 flex items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                  <img src={quote.panelPhotoUrl} alt="Solar Panel" className="max-h-full max-w-full object-contain drop-shadow-sm" />
                </div>
                <h3 className="font-extrabold text-blue-900 text-xl text-center">{quote.panelName || "Solar PV Module"}</h3>
                <div className="w-12 h-1 bg-orange-500 my-2 rounded-full"></div>
                <p className="text-gray-600 text-sm text-center font-medium">High-efficiency {quote.panelType || "Tier-1 PV"} Panel</p>
              </div>
            )}
            
            {quote.inverterPhotoUrl && (
              <div className="flex flex-col items-center bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="h-64 w-full mb-6 flex items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                  <img src={quote.inverterPhotoUrl} alt="Solar Inverter" className="max-h-full max-w-full object-contain drop-shadow-sm" />
                </div>
                <h3 className="font-extrabold text-blue-900 text-xl text-center">Solar Inverter Unit</h3>
                <div className="w-12 h-1 bg-orange-500 my-2 rounded-full"></div>
                <p className="text-gray-600 text-sm text-center font-medium">{quote.numberOfInverters || 1}x {quote.inverterSizeKw || "0"}KW Smart String Inverter</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationPDFTemplate;