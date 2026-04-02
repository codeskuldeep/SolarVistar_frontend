const QuotationPDFTemplate = ({ quote }) => {
  const lead = quote.lead || {};
  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="bg-white text-black max-w-[210mm] mx-auto shadow-2xl print:shadow-none print:w-full print:max-w-none">
      {/* ================= PAGE 1: COVER ================= */}
      <div className="p-12 min-h-[297mm] flex flex-col justify-between break-after-page relative">
        {/* Top Accent Bar (Brand Orange) */}
        <div className="absolute top-0 left-0 w-full h-4 bg-orange-600"></div>

        <div className="mt-12 text-center">
          {/* Logo Placeholder */}
          <div className="w-64 h-32 mx-auto mb-10 flex items-center justify-center">
            {/* Replace this with an actual <img src="/logo.png" /> later */}
            <img src="/logo.PNG"></img>
          </div>

          <h1 className="text-4xl font-bold text-blue-900 tracking-tight leading-snug">
            Proposal of{" "}
            <span className="text-orange-600">{quote.loadKw || "X"} KW</span>
            <br />
            ON-Grid Solar Power System
          </h1>
        </div>

        <div className="space-y-8 text-center mt-16">
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-widest mb-1">
              Prepared For
            </p>
            <h2 className="text-2xl font-bold text-gray-900 uppercase">
              {lead.customerName || "Customer Name"}
            </h2>
            <p className="text-lg text-gray-600">
              {lead.address || "Address Not Provided"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 uppercase tracking-widest mb-1">
              Date
            </p>
            <p className="text-xl font-medium text-gray-800">{today}</p>
          </div>
        </div>

        <div className="mt-auto border-t-2 border-orange-600 pt-6 flex justify-between items-end">
          <div className="text-left">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">
              Company Information
            </p>
            <p className="text-sm font-semibold text-blue-900">
              सोलर पॉवर विस्तार सहकारी संस्था खरगोन
            </p>
            <p className="text-sm text-gray-600">
              Solar A Need For Future Alternative Energy
            </p>
            <p className="text-sm text-gray-600">+91 [PHONE NUMBER]</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">
              Bank Details
            </p>
            <p className="text-sm text-gray-600">A/C: [000000000000]</p>
            <p className="text-sm text-gray-600">IFSC: [ABCD0000123]</p>
            <p className="text-sm text-gray-600">Bank: [BANK NAME]</p>
          </div>
        </div>
      </div>

      {/* ================= PAGE 2: TECH SPECS & COMMERCIALS ================= */}
      <div className="p-12 min-h-[297mm] break-after-page relative">
        {/* Brand Blue Accent Bar */}
        <div className="absolute top-0 left-0 w-full h-4 bg-blue-800"></div>

        <h2 className="text-2xl font-bold text-blue-900 border-b-2 border-orange-600 pb-2 mb-8 mt-8">
          Technical Specifications
        </h2>

        <table className="w-full text-left border-collapse mb-12">
          <thead>
            <tr className="bg-blue-50">
              <th className="border border-blue-200 p-3 font-semibold text-blue-900 text-sm w-1/3">
                Item
              </th>
              <th className="border border-blue-200 p-3 font-semibold text-blue-900 text-sm">
                Specification
              </th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-800">
            <tr>
              <td className="border border-gray-200 p-3 font-medium bg-gray-50">
                System Capacity
              </td>
              <td className="border border-gray-200 p-3 font-bold text-orange-600">
                {quote.loadKw || "-"} KW
              </td>
            </tr>
            <tr>
              <td className="border border-gray-200 p-3 font-medium bg-gray-50">
                Solar Panels
              </td>
              <td className="border border-gray-200 p-3">
                {quote.panelName || "-"} - {quote.panelType || "-"} (
                {quote.panelSizeWatt || "-"}W)
                <br />
                <span className="text-xs text-gray-500">
                  {quote.numberOfPanels || "0"} Panels •{" "}
                  {quote.panelWarrantyYears || "0"} Yrs Warranty
                </span>
              </td>
            </tr>
            <tr>
              <td className="border border-gray-200 p-3 font-medium bg-gray-50">
                Inverter
              </td>
              <td className="border border-gray-200 p-3">
                {quote.inverterSizeKw || "-"} KW String Inverter
                <br />
                <span className="text-xs text-gray-500">
                  {quote.inverterWarrantyYears || "0"} Yrs Warranty
                </span>
              </td>
            </tr>
            <tr>
              <td className="border border-gray-200 p-3 font-medium bg-gray-50">
                Mounting Structure
              </td>
              <td className="border border-gray-200 p-3">
                {quote.structure || "Galvanised Iron"}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-200 p-3 font-medium bg-gray-50">
                Cabling (AC/DC)
              </td>
              <td className="border border-gray-200 p-3">
                DC: {quote.dcCableSqMm || "-"} Sq.mm (
                {quote.dcWire?.replace(/_/g, " ")})<br />
                AC: {quote.acCableSqMm || "-"} Sq.mm (
                {quote.acWire?.replace(/_/g, " ")})
              </td>
            </tr>
            <tr>
              <td className="border border-gray-200 p-3 font-medium bg-gray-50">
                ACDB / DCDB
              </td>
              <td className="border border-gray-200 p-3">
                ACDB: {quote.acdbCompany?.replace(/_/g, " ")} | DCDB:{" "}
                {quote.dcdbCompany?.replace(/_/g, " ")}
              </td>
            </tr>
          </tbody>
        </table>

        <h2 className="text-2xl font-bold text-blue-900 border-b-2 border-orange-600 pb-2 mb-8">
          Commercial Details
        </h2>

        <table className="w-full text-left border-collapse">
          <tbody className="text-sm">
            <tr>
              <td className="border border-gray-200 p-4 font-medium bg-gray-50 w-1/2">
                Gross Quotation Value
              </td>
              <td className="border border-gray-200 p-4 text-lg font-bold text-gray-900">
                ₹{Number(quote.quotationValue || 0).toLocaleString("en-IN")}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-200 p-4 font-medium bg-gray-50">
                Expected MNRE Subsidy (Direct to A/C)
              </td>
              <td className="border border-gray-200 p-4 text-lg font-bold text-orange-600">
                - ₹{Number(quote.subsidy || 0).toLocaleString("en-IN")}
              </td>
            </tr>
            <tr>
              <td className="border border-blue-900 p-4 font-bold bg-blue-900 text-white text-lg">
                Net Effective Price
              </td>
              <td className="border border-blue-900 p-4 text-xl font-black text-blue-900 bg-blue-50">
                ₹
                {Number(
                  (quote.quotationValue || 0) - (quote.subsidy || 0),
                ).toLocaleString("en-IN")}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="mt-16 pt-8 border-t border-gray-300">
          <p className="text-xs text-gray-500 leading-relaxed">
            * This quotation is valid for 15 days from the date of issue. Price
            includes transportation and labor. Any delay in payments will affect
            the project timeline. Expected execution time is 6-8 weeks from the
            date of advance payment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuotationPDFTemplate;
