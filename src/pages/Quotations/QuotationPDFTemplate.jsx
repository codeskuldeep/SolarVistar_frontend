import React from "react";

const QuotationPDFTemplate = ({ quote = {} }) => {
  const lead = quote.lead || {};
  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // Base Data Mapping & Calculations with Stitch Fallbacks
  const loadKw = Number(quote.loadKw || 5);
  const quotationValue = Number(quote.quotationValue || 325000);
  const subsidy = Number(quote.subsidy || 78000);
  const netPrice = quotationValue - subsidy;

  // Real-time Solar Performance Estimates
  const dailyGenerationMin = (loadKw * 4.4).toFixed(0);
  const dailyGenerationMax = (loadKw * 5.0).toFixed(0);
  const avgMonthlyUnits = Math.round(loadKw * 120);
  const avgYearlyUnits = Math.round(loadKw * 1440);
  const monthlySavingsMin = Math.round(avgMonthlyUnits * 7.1);
  const monthlySavingsMax = Math.round(avgMonthlyUnits * 8.5);
  const annualSavingsMin = Math.round(avgYearlyUnits * 7.1);
  const annualSavingsMax = Math.round(avgYearlyUnits * 8.5);
  const carbonSaved = (loadKw * 1.34).toFixed(1);

  // Stable ID Generation using DB Context fallback
  const stableId = React.useMemo(() => {
    if (quote.id) {
      return quote.id.split("-")[0].toUpperCase();
    }
    return String(Math.floor(1000 + Math.random() * 9000));
  }, [quote.id]);
  const quotationId = `SPVQ-${stableId}`;

  // Rigorous Multi-Page Accounting
  const hasHardwarePhotos = !!(quote.panelPhotoUrl || quote.inverterPhotoUrl);
  const totalPages = hasHardwarePhotos ? 5 : 4;

  // Shared Presentation Sub-components
  const TriColorBar = () => (
    <div className="flex h-1 w-full rounded-full overflow-hidden shrink-0">
      <div className="h-full w-1/3 bg-[#4CAF50]"></div>
      <div className="h-full w-1/3 bg-[#E8650A]"></div>
      <div className="h-full w-1/3 bg-[#031634]"></div>
    </div>
  );

  const PageHeader = ({ title, subtitle }) => (
    <header className="bg-[#031634] text-white py-4 px-[18mm] flex justify-between items-center border-b-4 border-[#E8650A] shrink-0">
      <div className="flex items-center gap-3">
        <div className="bg-white p-1 rounded-full shadow-md flex items-center justify-center">
          <span
            className="material-symbols-outlined text-[#E8650A] text-xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            wb_sunny
          </span>
        </div>
        <div>
          <h1 className="font-serif text-xl font-bold leading-tight tracking-wide">
            Solar Power Vistar Co-operative Society
          </h1>
          <p className="text-[0.55rem] uppercase tracking-widest text-[#ffddb4]">
            Renewable Energy Solutions
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-[0.75rem] font-bold tracking-wider text-[#ffddb4] uppercase">
          {title}
        </p>
        {subtitle && (
          <p className="text-[0.55rem] opacity-80 mt-0.5">{subtitle}</p>
        )}
      </div>
    </header>
  );

  const PageFooter = ({ pageNum, totalPages }) => (
    <footer className="bg-[#031634] text-white py-2.5 px-[18mm] mt-auto flex justify-between items-center text-[0.65rem] border-t-2 border-[#4CAF50] shrink-0">
      <span className="opacity-90">
        © {new Date().getFullYear()} Solar Power Vistar Co-operative Society. All Rights Reserved.
      </span>
      <span className="font-bold text-[#ffddb4] bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
        Page {pageNum} of {totalPages}
      </span>
      <span className="opacity-90 font-mono tracking-wider">
        ID: {quotationId}
      </span>
    </footer>
  );

  return (
    <div
      id="quotation-pdf-print-root"
      className="bg-[#f5f3f6] text-gray-900 font-sans flex flex-col items-center py-8 print:py-0 print:bg-white select-none"
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @page {
          size: A4 portrait;
          margin: 0 !important;
        }
        @media print {
          aside, .print\\:hidden, .no-print, button, nav {
            display: none !important;
          }
          
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

          /* Reset only outer app layout wrappers — never PDF internals */
          .flex-1, .overflow-y-auto, main, .max-w-7xl {
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            max-width: none !important;
            width: 100% !important;
            height: auto !important;
            background: transparent !important;
          }

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
            display: flex !important;
            flex-direction: column !important;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `,
        }}
      />

      {/* ================= PAGE 1: COVER & LETTER ================= */}
      <section className="pdf-page-section w-[210mm] h-[297mm] bg-white relative shadow-2xl print:shadow-none break-after-page flex flex-col justify-between overflow-hidden mb-8 print:mb-0">
        <div className="z-0 relative h-[35%] w-full shrink-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDxsa85YFrwtDf5eHOEPKaGGt3VZY5xNIRhLDbATH3o8P18wFC1Yp0MzlA6uWCUPOT4fLNcC-MV-cNHqf3MTh8zkHvK_rJFdAEBqmguH80vSHFMNDs5v-ElbRMCxJTIbkVIsCUzHqMIUqpSJIEYop1we5yX6l-iG00Iv9V5vYEQh5cP_xLzK6lIXqWtQdaKHUzrOdaLBs_yS6D31KC6sS4LGk_SBgoWap7TuLe-dbeIkQzP8n_u1J0vjF31fhK5C1B_u7HWeyG-bLk')",
            }}
          >
            <img src='/logo.PNG' alt="Logo" className="h-full w-full object-contain" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#031634]/70 to-transparent"></div>
          </div>
         
        </div>

        {/* Client Info Card */}
        <div className="mx-[18mm] -mt-8 relative z-20 shrink-0">
          <div className="bg-white p-5 rounded-xl shadow-xl border border-gray-100 border-l-8 border-l-[#E8650A] grid grid-cols-[1fr_auto] gap-6 items-start">
            <div className="overflow-hidden">
              <p className="text-[0.65rem] font-semibold text-gray-500 uppercase tracking-widest mb-0.5">
                Prepared For
              </p>
              <h2 className="font-serif text-xl text-[#031634] font-bold mb-0.5 wrap-break-word">
                {lead.customerName || "Valued Customer"}
              </h2>
              <p className="text-gray-600 text-xs">
                Residential Project - Grid Connected
              </p>
              {lead.address && (
                <p className="text-gray-500 text-xs mt-0.5 leading-relaxed" style={{ overflowWrap: "anywhere" }}>{lead.address}</p>
              )}
              {lead.phoneNumber && (
                <p className="text-gray-500 text-xs mt-0.5">
                  Ph: +91 {lead.phoneNumber}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-[0.65rem] font-semibold text-gray-500 uppercase tracking-widest mb-0.5">
                Wattage
              </p>
              <p className="font-serif text-lg font-bold text-[#031634]">
                  {loadKw} KW
              </p>
              <p className="text-gray-500 text-xs font-medium mt-0.5">
                Date: {today}
              </p>
            </div>
          </div>
        </div>

        {/* Introduction Letter */}
        <div className="flex-grow flex flex-col pt-6 justify-between">
          <div className="px-[18mm]">
            <div className="mb-4">
              <h3 className="text-[#031634] font-serif text-lg font-bold mb-1">
                Proposal Letter
              </h3>
              <TriColorBar />
            </div>
            <div className="bg-[#f5f3f6] p-6 rounded-xl border border-gray-200">
              <h4 className="font-serif text-lg font-bold text-[#031634] mb-3">
                Dear {lead.customerName || "Customer"},
              </h4>
              <div className="space-y-3.5 text-gray-700 text-sm leading-relaxed">
                <p>
                  A warm welcome to the Solar Power Vistar Co-operative Society family. We are delighted
                  that you are transition-planning to clean, modern, and
                  autonomous solar energy configurations for your home. This
                  tactical implementation actively limits reliance on escalating
                  DISCOM grid tariffs while making a lasting green footprint.
                </p>
                <p>
                  We are pleased to present this personalized proposal for a
                  structural <strong>{loadKw} KW</strong> Solar Power System
                  setup. Our engineering framework mandates purely Tier-1
                  components to maximize daily energy conversion values even
                  throughout high-temperature parameters.
                </p>
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="p-3 border-l-4 border-[#4CAF50] bg-white shadow-sm rounded-r-lg">
                    <span className="material-symbols-outlined text-[#4CAF50] mb-1 text-2xl">
                      trending_down
                    </span>
                    <p className="text-[0.6rem] text-gray-500 uppercase font-bold tracking-wider">
                      Bill Reduction
                    </p>
                    <p className="font-bold text-[#031634] text-base">
                      Up to 90%
                    </p>
                  </div>
                  <div className="p-3 border-l-4 border-[#E8650A] bg-white shadow-sm rounded-r-lg">
                    <span className="material-symbols-outlined text-[#E8650A] mb-1 text-2xl">
                      workspace_premium
                    </span>
                    <p className="text-[0.6rem] text-gray-500 uppercase font-bold tracking-wider">
                      Warranty
                    </p>
                    <p className="font-bold text-[#031634] text-base">
                      25 Years
                    </p>
                  </div>
                  <div className="p-3 border-l-4 border-[#031634] bg-white shadow-sm rounded-r-lg">
                    <span className="material-symbols-outlined text-[#031634] mb-1 text-2xl">
                      eco
                    </span>
                    <p className="text-[0.6rem] text-gray-500 uppercase font-bold tracking-wider">
                      Green Energy
                    </p>
                    <p className="font-bold text-[#031634] text-base">
                      100% Clean
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <PageFooter pageNum={1} totalPages={totalPages} />
        </div>
      </section>

      {/* ================= PAGE 2: SITE ANALYSIS & BENEFITS ================= */}
      <section className="pdf-page-section w-[210mm] h-[297mm] bg-white relative shadow-2xl print:shadow-none break-after-page flex flex-col overflow-hidden mb-8 print:mb-0">
        <PageHeader
          title="Site Survey & Analysis"
          subtitle={`Ref: ${quotationId}`}
        />
        <div className="px-[18mm] py-5 flex-grow flex flex-col justify-between">
          {/* Site Survey Details Block */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[#031634] font-serif text-base font-bold">
                Rooftop Structural Assessment
              </h3>
              <span className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest">
                Site Survey
              </span>
            </div>
            <TriColorBar />

            <div className="grid grid-cols-2 gap-4 mt-3 items-stretch">
              <div className="bg-white p-4 rounded-xl border border-gray-200 border-l-4 border-[#E8650A] flex flex-col justify-center">
                <table className="w-full text-xs">
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="py-2 font-bold text-[#031634]">
                        Installation Site Location
                      </td>
                      <td className="py-2 text-right text-gray-700">
                        {quote.city || "—"}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 font-bold text-[#031634]">
                        Rooftop Structural Profile
                      </td>
                      <td className="py-2 text-right text-gray-700">
                        {quote.roofType || "Concrete Flat Roof"}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 font-bold text-[#031634]">
                        Net Solar Cleared Footprint
                      </td>
                      <td className="py-2 text-right text-gray-700">
                        {quote.availableAreaSqFt || `${loadKw * 90} sq. ft.`}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 font-bold text-[#031634]">
                        Shading Obstruction Vector
                      </td>
                      <td className="py-2 text-right text-gray-700">
                        {quote.shadingAnalysis ||
                          "Unobstructed (True South Max)"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-gray-200 min-h-[140px] bg-gray-50 flex items-center justify-center">
                <img
                  alt="Satellite View"
                  className="w-full h-full object-cover"
                  src={
                    quote.siteSurveyPhotoUrl ||
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuCM5_XBLCLg9unM2LQCviKvSXVNxmkiAJpafzW6b5eYyvtDA1O_PE9tWMJbF_dRd42AIL7dEOERlOsgWCLaDrEHovVYDubMbiDjzCfEHPVlOT53nZy4VEynFb44LpXa8YAGE0etyaGSFBCCvk-gmkXuPEPi-08cbeQBtKt6kIcuoz5zookF_xZXROVdEa4ldsgx42wsHIhgMh_YvAEq3CxCHQ4Dn5kSUbDj7VfTusncKZMVlQr8w-eI4xR4NX7c2BDsl7I_LB0uryw"
                  }
                />
                <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded text-[0.6rem] font-bold text-[#031634] uppercase tracking-wider border border-gray-200">
                  Satellite Layout Anchor
                </div>
              </div>
            </div>
          </div>

          {/* Key Financial and Generation Highlights Block */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[#031634] font-serif text-base font-bold">
                Yield Estimates Matrix
              </h3>
              <span className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest">
                Performance KPIs
              </span>
            </div>
            <TriColorBar />

            <div className="grid grid-cols-3 gap-3 mt-3">
              <div className="bg-gradient-to-br from-[#031634] to-[#1a2b4a] p-3.5 rounded-xl text-white relative overflow-hidden shadow-sm">
                <p className="text-white/70 text-[0.6rem] font-bold uppercase tracking-wider mb-1">
                  Daily Generation
                </p>
                <div className="flex items-baseline gap-1">
                  <h4 className="text-xl font-serif font-black text-[#ffb955]">
                    {dailyGenerationMin} - {dailyGenerationMax}
                  </h4>
                  <span className="text-[0.65rem] font-medium opacity-90">
                    Units/Day
                  </span>
                </div>
                <span className="material-symbols-outlined text-[48px] text-white/5 absolute -right-2 -bottom-2 pointer-events-none">
                  solar_power
                </span>
              </div>

              <div className="bg-gradient-to-br from-[#031634] to-[#1a2b4a] p-3.5 rounded-xl text-white relative overflow-hidden shadow-sm">
                <p className="text-white/70 text-[0.6rem] font-bold uppercase tracking-wider mb-1">
                  Avg Monthly Savings
                </p>
                <div className="flex items-baseline gap-1">
                  <h4 className="text-xl font-serif font-black text-[#ffb955]">
                    ₹{monthlySavingsMin.toLocaleString("en-IN")}
                  </h4>
                  <span className="text-[0.65rem] font-medium opacity-90">
                    Avg
                  </span>
                </div>
                <span className="material-symbols-outlined text-[48px] text-white/5 absolute -right-2 -bottom-2 pointer-events-none">
                  payments
                </span>
              </div>

              <div className="bg-gradient-to-br from-[#031634] to-[#1a2b4a] p-3.5 rounded-xl text-white relative overflow-hidden shadow-sm">
                <p className="text-white/70 text-[0.6rem] font-bold uppercase tracking-wider mb-1">
                  Carbon Mitigation
                </p>
                <div className="flex items-baseline gap-1">
                  <h4 className="text-xl font-serif font-black text-[#ffb955]">
                    {carbonSaved}
                  </h4>
                  <span className="text-[0.65rem] font-medium opacity-90">
                    Tons/Year
                  </span>
                </div>
                <span className="material-symbols-outlined text-[48px] text-white/5 absolute -right-2 -bottom-2 pointer-events-none">
                  eco
                </span>
              </div>
            </div>

            <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <table className="w-full text-left text-[0.7rem]">
                <thead className="bg-[#031634] text-white">
                  <tr>
                    <th className="py-2 px-4 font-bold uppercase tracking-wider">
                      Metric Parameter
                    </th>
                    <th className="py-2 px-4 text-center font-bold uppercase tracking-wider">
                      Estimated Scaling
                    </th>
                    <th className="py-2 px-4 text-right font-bold uppercase tracking-wider">
                      Remarks / Conditions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="bg-white">
                    <td className="py-2 px-4 font-bold text-[#031634]">
                      Monthly System Generation
                    </td>
                    <td className="py-2 px-4 text-center text-gray-700 font-medium">
                      {avgMonthlyUnits} - {Math.round(avgMonthlyUnits * 1.1)}{" "}
                      Units
                    </td>
                    <td className="py-2 px-4 text-right italic text-gray-500">
                      Subject to clear seasonal sunburst indices
                    </td>
                  </tr>
                  <tr className="bg-[#F0F4FF]">
                    <td className="py-2 px-4 font-bold text-[#031634]">
                      Targeted Monthly Savings
                    </td>
                    <td className="py-2 px-4 text-center font-bold text-[#4CAF50]">
                      ₹{monthlySavingsMin} - ₹{monthlySavingsMax}
                    </td>
                    <td className="py-2 px-4 text-right italic text-gray-500">
                      Computed via local baseline tariff parameters
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="py-2 px-4 font-bold text-[#031634]">
                      Projected First Year Yield
                    </td>
                    <td className="py-2 px-4 text-center text-gray-700 font-medium">
                      ₹{annualSavingsMin.toLocaleString("en-IN")} - ₹
                      {annualSavingsMax.toLocaleString("en-IN")}
                    </td>
                    <td className="py-2 px-4 text-right italic text-gray-500">
                      Asset capitalization baseline target
                    </td>
                  </tr>
                  <tr className="bg-[#E8F5E9] border-l-4 border-[#4CAF50]">
                    <td className="py-2 px-4 font-bold text-[#2E7D32]">
                      Central Capital Subsidy Advantage
                    </td>
                    <td className="py-2 px-4 text-center font-bold text-[#2E7D32]">
                      ₹{subsidy.toLocaleString("en-IN")} (Lumpsum)
                    </td>
                    <td className="py-2 px-4 text-right font-medium text-[#2E7D32]">
                      MNRE Authorized PM Surya Ghar Scheme
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Advantages Grid */}
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-[#031634] font-serif text-base font-bold shrink-0">
                System Deployment Advantages
              </h3>
              <div className="flex-grow h-px bg-gray-200"></div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-2">
              {[
                {
                  icon: "eco",
                  title: "Clean Environment",
                  desc: "Carbon footprint mitigation",
                },
                {
                  icon: "savings",
                  title: "Up to 90% Savings",
                  desc: "Protects from tariff spikes",
                },
                {
                  icon: "verified",
                  title: "25-Yr Performance",
                  desc: "Long-range cell integrity",
                },
                {
                  icon: "auto_graph",
                  title: "Property Appreciation",
                  desc: "Increases valuation assets",
                },
                {
                  icon: "construction",
                  title: "Low Operational Overhead",
                  desc: "Minimal service cycles required",
                },
                {
                  icon: "thunderstorm",
                  title: "Energy Autonomy",
                  desc: "Protects against standard blackout profiles",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white p-3 rounded-lg border border-gray-200 border-l-4 border-[#E8650A] shadow-sm"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-1 bg-[#F0F4FF] rounded text-[#031634] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-lg">
                        {item.icon}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-[0.72rem] text-[#031634] leading-tight mb-0.5">
                        {item.title}
                      </h4>
                      <p className="text-[0.6rem] text-gray-500 leading-none">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <PageHeader title="" subtitle="" />{" "}
        {/* Tiny aesthetic spacer footer boundary */}
        <PageFooter pageNum={2} totalPages={totalPages} />
      </section>

      {/* ================= PAGE 3: TECHNICAL SPECIFICATIONS ================= */}
      <section className="pdf-page-section w-[210mm] h-[297mm] bg-white relative shadow-2xl print:shadow-none break-after-page flex flex-col overflow-hidden mb-8 print:mb-0">
        <PageHeader
          title="Technical Specifications"
          subtitle={`Ref: ${quotationId}`}
        />

        <div className="px-[18mm] py-5 flex-grow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[#031634] font-serif text-base font-bold">
                Bill of Materials (BOM) Matrix
              </h3>
              <span className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest">
                Hardware Architecture
              </span>
            </div>
            <TriColorBar />

            <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <table className="w-full text-left text-[0.7rem]">
                <thead className="bg-[#031634] text-white">
                  <tr>
                    <th className="py-2.5 px-4 font-bold uppercase tracking-wider w-1/3">
                      Core System Item
                    </th>
                    <th className="py-2.5 px-4 font-bold uppercase tracking-wider">
                      Technical Specifications & Make
                    </th>
                    <th className="py-2.5 px-4 font-bold uppercase tracking-wider text-right">
                      Remarks
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="bg-white">
                    <td className="py-2 px-4 font-bold text-[#031634]">
                      System Capacity
                    </td>
                    <td className="py-2 px-4 font-bold text-[#E8650A]">
                      {loadKw} KW Active Grid-Tied Configuration
                    </td>
                    <td className="py-2 px-4 text-right italic font-medium text-gray-500">
                      Engineered Target
                    </td>
                  </tr>
                  <tr className="bg-[#F0F4FF]">
                    <td className="py-2.5 px-4 font-bold text-[#031634]">
                      Solar PV Array Architecture
                    </td>
                    <td className="py-2.5 px-4 text-gray-700">
                      <span className="font-bold text-[#031634]">
                        {quote.panelName || "Tier-1 Monocrystalline"}
                      </span>{" "}
                      - {quote.panelType || "Mono PERC Half-Cut"} Configuration
                      ({quote.panelSizeWatt || "550"}Wp+)
                      <br />
                      <span className="inline-block mt-1 bg-green-100 text-green-800 text-[9px] px-1.5 py-0.5 rounded font-semibold">
                        {quote.numberOfPanels ||
                          Math.round((loadKw * 1000) / 550)}{" "}
                        Modules Elements • {quote.panelWarrantyYears || "25"}
                        -Year Linear Output Insurance
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right italic text-gray-500">
                      Tier-1 Bloomberg Rated
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="py-2.5 px-4 font-bold text-[#031634]">
                      Power Conversion Unit (Inverter)
                    </td>
                    <td className="py-2.5 px-4 text-gray-700">
                      <span className="font-bold text-[#031634]">
                        {quote.inverterSizeKw || loadKw} KW High Frequency
                        String Inverter
                      </span>{" "}
                      with Dual MPPT tracking & Integrated WiFi telemetry links
                      <br />
                      <span className="inline-block mt-1 bg-blue-100 text-blue-800 text-[9px] px-1.5 py-0.5 rounded font-semibold">
                        {quote.inverterWarrantyYears || "10"}-Year Standard
                        Equipment Replacement Warranty
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right italic text-gray-500">
                      98.4% Peak Efficiency
                    </td>
                  </tr>
                  <tr className="bg-[#F0F4FF]">
                    <td className="py-2.5 px-4 font-bold text-[#031634]">
                      Module Mounting Structure
                    </td>
                    <td className="py-2.5 px-4 text-gray-700 font-medium">
                      {quote.structure ||
                        "Hot-Dipped Galvanized Iron Structure (80-100 Microns structural coating density)"}
                    </td>
                    <td className="py-2.5 px-4 text-right italic text-gray-500">
                      Wind Rating up to 150 km/h
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="py-2.5 px-4 font-bold text-[#031634]">
                      Cabling Systems (DC/AC)
                    </td>
                    <td className="py-2.5 px-4 text-gray-700 leading-relaxed">
                      <span className="font-semibold text-[#E8650A]">
                        DC Cabling Infrastructure:
                      </span>{" "}
                      {quote.dcCableSqMm || "4/6"} sq mm Cross-Linked Polyolefin
                      UV Protected Cables (
                      {quote.dcWire?.replace(/_/g, " ") ||
                        "Polycab Tier-1 Make"}
                      ) <br />
                      <span className="font-semibold text-[#031634]">
                        AC Interconnect System:
                      </span>{" "}
                      {quote.acCableSqMm || "6"} sq mm Heavy-Duty Weatherproof
                      Armored Cables (
                      {quote.acWire?.replace(/_/g, " ") || "Havells Heavy Duty"}
                      )
                    </td>
                    <td className="py-2.5 px-4 text-right italic text-gray-500">
                      TUV Certified Elements
                    </td>
                  </tr>
                  <tr className="bg-[#F0F4FF]">
                    <td className="py-2.5 px-4 font-bold text-[#031634]">
                      Balance of System & Surge Safety
                    </td>
                    <td className="py-2.5 px-4 text-gray-700">
                      <span className="font-semibold">ACDB:</span> Dual-element
                      IP65 Polycarbonate Enclosures |{" "}
                      <span className="font-semibold">DCDB:</span> Integrated
                      SPD Type-II Protection matrices. Includes complete Solid
                      Copper Chemical Earthing kits & Early Streamer Emission
                      (ESE) Lightning Arrestors.
                    </td>
                    <td className="py-2.5 px-4 text-right italic text-gray-500">
                      Dedicated Protection Lines
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="py-2.5 px-4 font-bold text-[#031634]">
                      Operational Maintenance Bundle
                    </td>
                    <td className="py-2.5 px-4 text-gray-700">
                      <span className="font-bold text-[#031634]">
                        {quote.freeMaintenanceYears || "5"}-Year Comprehensive
                        Free Annual Maintenance Contract (AMC)
                      </span>
                      <br />
                      <span className="inline-block mt-1 bg-purple-100 text-purple-800 text-[9px] px-1.5 py-0.5 rounded font-semibold">
                        Includes ongoing dynamic remote performance monitoring
                        assessments
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right italic text-gray-500">
                      All Inclusive Care
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Phase-by-Phase Project Execution Milestones */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[#031634] font-serif text-base font-bold">
                Project Execution Phasing Matrix
              </h3>
              <span className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest">
                Milestones
              </span>
            </div>
            <TriColorBar />

            <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <table className="w-full text-left text-[0.7rem] border-collapse">
                <thead className="bg-[#031634] text-white">
                  <tr>
                    <th className="py-2 px-4 font-bold uppercase tracking-wider">
                      Project Execution Phase
                    </th>
                    <th className="py-2 px-4 font-bold uppercase tracking-wider">
                      Structural Deliverables & Milestone Scope
                    </th>
                    <th className="py-2 px-4 text-right font-bold uppercase tracking-wider">
                      Ratio Value
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="bg-white">
                    <td className="p-3 font-bold text-[#031634]">
                      Phase 01: Engineering & Intake Planning
                    </td>
                    <td className="p-3 text-gray-700">
                      Advance transactional deployment processing upon formal
                      contract execution and completion of local structural site
                      surveys.
                    </td>
                    <td className="p-3 text-right font-black text-[#E8650A] text-sm">
                      50%
                    </td>
                  </tr>
                  <tr className="bg-[#F0F4FF]">
                    <td className="p-3 font-bold text-[#031634]">
                      Phase 02: Logistics & Material Freight Delivery
                    </td>
                    <td className="p-3 text-gray-700">
                      On-site delivery confirmation of primary raw
                      bill-of-materials elements including PV Arrays, Inverter
                      block, and Galvanized Iron mounting frames.
                    </td>
                    <td className="p-3 text-right font-black text-[#E8650A] text-sm">
                      30%
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="p-3 font-bold text-[#031634]">
                      Phase 03: Mechanical Handover & Net Metering
                    </td>
                    <td className="p-3 text-gray-700">
                      Final operational validation, systemic arrays string
                      compliance matching, and formal packaging filing
                      processing for DISCOM net metering connectivity.
                    </td>
                    <td className="p-3 text-right font-black text-[#E8650A] text-sm">
                      20%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <PageFooter pageNum={3} totalPages={totalPages} />
      </section>

      {/* ================= PAGE 4: COMMERCIAL INVESTMENT SUMMARY ================= */}
      <section className="pdf-page-section w-[210mm] h-[297mm] bg-white relative shadow-2xl print:shadow-none break-after-page flex flex-col overflow-hidden mb-8 print:mb-0">
        <PageHeader
          title="Commercial Framework & Validation"
          subtitle={`Ref: ${quotationId}`}
        />

        <div className="px-[18mm] py-5 flex-grow flex flex-col justify-between">

          {/* ── SECTION 1: Financial Investment ── */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="text-[#031634] font-serif text-base font-bold">
                Financial Investment Specification
              </h3>
              <span className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest">
                Commercial Summary
              </span>
            </div>
            <TriColorBar />

            {/* Step 1: Gross Capital Outlay */}
            <div className="mt-3 bg-[#f5f3f6] p-4 rounded-xl border border-gray-200 flex justify-between items-center shadow-sm">
              <div>
                <span className="text-gray-400 text-[0.58rem] font-bold uppercase tracking-widest block mb-0.5">
                  Total — Gross Capital Outlay (incl. all Taxes)
                </span>
                <span className="text-gray-500 font-serif text-xl font-semibold">
                  ₹ {quotationValue.toLocaleString("en-IN")}.00
                </span>
              </div>
              <span className="text-[0.58rem] text-gray-400 font-medium italic shrink-0 ml-4">All-Inclusive Pack</span>
            </div>

            {/* Step 2: Govt Subsidy */}
            <div className="mt-2 bg-[#f0faf0] p-4 rounded-xl border border-[#c8e6c9] flex justify-between items-center shadow-sm">
              <div>
                <span className="text-[#4caf50] text-[0.58rem] font-bold uppercase tracking-widest block mb-0.5">
                  Discount — Govt Subsidy (PM Surya Ghar Scheme · MNRE Approved)
                </span>
                <span className="text-[#2e7d32] font-serif text-xl font-semibold">
                  − ₹ {subsidy.toLocaleString("en-IN")}.00
                </span>
              </div>
              <span className="text-[0.58rem] text-[#4caf50] font-medium italic shrink-0 ml-4">Direct Benefit Transfer</span>
            </div>

            {/* Step 3: Net Investment — Hero in brand blue */}
            <div className="mt-2 bg-gradient-to-r from-[#031634] to-[#1a2b4a] p-6 rounded-xl shadow-lg flex justify-between items-center border-l-4 border-[#E8650A]">
              <div>
                <span className="text-[#ffddb4] text-[0.62rem] font-bold uppercase tracking-widest block mb-1">
                  Final Price — Net Investment Target
                </span>
                <span className="text-white font-serif text-4xl font-black tracking-tight">
                  ₹ {netPrice.toLocaleString("en-IN")}.00
                </span>
                <p className="text-white/60 text-[0.6rem] mt-1.5">
                  Post-subsidy actual deployment cost · Inclusive of all taxes & execution
                </p>
              </div>
              <div className="text-right shrink-0 ml-6">
                <span className="inline-block bg-[#E8650A] text-white text-[0.65rem] font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                  Your Final Price
                </span>
              </div>
            </div>
          </div>

          {/* ── SECTION 2: Banking + QR ── */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="text-[#031634] font-serif text-base font-bold">
                Authorized Banking Remittance Gateway
              </h3>
              <span className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest">
                Bank Credentials
              </span>
            </div>
            <TriColorBar />

            <div className="mt-3 bg-[#f5f3f6] p-5 border-t-4 border-[#031634] rounded-b-xl shadow-sm border border-gray-200 flex gap-6 items-center">
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-[#031634] text-xl">account_balance</span>
                  <h4 className="font-bold text-[#031634] text-sm font-serif uppercase tracking-wide">
                    Union Bank of India — Khargone Branch
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-x-8 text-[0.72rem] text-gray-700">
                  <div className="space-y-2">
                    <div className="flex justify-between border-b border-gray-200 pb-1">
                      <span className="text-gray-500">Account Name:</span>
                      <span className="font-bold text-[#031634]">SOLAR POWER VISTAR CO-OPERATIVE SOCIETY</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-1">
                      <span className="text-gray-500">Account No.:</span>
                      <span className="font-mono font-bold text-[#E8650A]">553101010050704</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-1">
                      <span className="text-gray-500">IFSC Code:</span>
                      <span className="font-mono font-bold uppercase tracking-wider">UBIN0555312</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between border-b border-gray-200 pb-1">
                      <span className="text-gray-500">PAN:</span>
                      <span className="font-mono font-bold text-[#031634]">AAAJS9366D</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-1">
                      <span className="text-gray-500">GSTIN:</span>
                      <span className="font-mono font-bold text-[#031634]">23AAAJS9366D1Z0</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="shrink-0 flex flex-col items-center gap-1.5">
                <div className="w-32 h-32 bg-white border border-gray-200 p-1 rounded-lg flex items-center justify-center shadow-inner">
                  <img alt="UPI QR Code" className="w-full h-full object-contain" src="/QR.jpeg" />
                </div>
                <p className="text-[0.55rem] text-gray-400 font-medium uppercase tracking-wider">Scan to Pay</p>
              </div>
            </div>
          </div>

          {/* ── SECTION 3: Terms & Conditions ── */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="text-[#031634] font-serif text-base font-bold">
                Terms of Compliance
              </h3>
              <span className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest">
                Legal Binding
              </span>
            </div>
            <TriColorBar />

            <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-3 text-[0.65rem] text-gray-600 leading-relaxed">
              {[
                "Quotation pricing is valid for 15 calendar days from date of issuance.",
                "50% advance payment is required at booking confirmation.",
                "40% payment is due upon on-site material delivery.",
                "Remaining 10% balance within 48 hours of installation completion.",
                "Subsidy disbursement is subject to MNRE administrative clearances.",
                "Warranty applies to manufacturer hardware defects only.",
                "Periodic panel cleaning and maintenance is the customer's responsibility.",
                "Legal disputes will be resolved under applicable local judicial jurisdiction.",
              ].map((text, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <span className="shrink-0 w-4 h-4 bg-[#031634] text-[#ffddb4] rounded-full flex items-center justify-center text-[0.52rem] font-bold mt-0.5">
                    {idx + 1}
                  </span>
                  <p>{text}</p>
                </div>
              ))}
            </div>

            <div className="bg-[#f5f3f6] px-4 py-3 rounded-xl border border-gray-200 mt-3 flex gap-2.5 items-start">
              <span className="material-symbols-outlined text-[#E8650A] text-lg mt-0.5">gavel</span>
              <p className="text-[0.6rem] text-gray-500 leading-normal">
                <strong>Notice of Acknowledgement:</strong> By processing the advance booking payment, you explicitly authenticate the system design, component specifications, and all terms itemized within this agreement.
              </p>
            </div>
          </div>

          {/* ── SECTION 4: Signatures — always last ── */}
          <div className="flex justify-around items-end border-t-2 border-gray-200 pt-4">
            <div className="text-center">
              <div className="h-10 w-36 border-b-2 border-gray-400 mb-1.5"></div>
              <p className="text-[0.58rem] font-bold text-[#031634] uppercase tracking-wider">
                Customer Endorsed Signature
              </p>
            </div>
            <div className="text-center">
              <div className="h-10 w-36 border-b-2 border-gray-400 mb-1.5"></div>
              <p className="text-[0.58rem] font-bold text-[#031634] uppercase tracking-wider">
                Authorized Management Signature
              </p>
            </div>
          </div>
        </div>
        <PageFooter pageNum={4} totalPages={totalPages} />
      </section>

      {/* ================= PAGE 6: HARDWARE PORTFOLIO (Conditional) ================= */}
      {hasHardwarePhotos && (
        <section className="pdf-page-section w-[210mm] h-[297mm] bg-white relative shadow-2xl print:shadow-none break-after-page flex flex-col overflow-hidden mb-8 print:mb-0">
          <PageHeader
            title="Hardware Portfolio"
            subtitle="Tier-1 Proposed Components"
          />

          <div className="px-[18mm] py-6 flex-grow flex flex-col justify-between">
            <div>
              <h3 className="text-[#031634] font-serif text-lg font-bold mb-1">
                Proposed System Components
              </h3>
              <TriColorBar />

              <div
                className={`grid gap-6 mt-6 ${quote.panelPhotoUrl && quote.inverterPhotoUrl ? "grid-cols-2" : "grid-cols-1 max-w-md mx-auto"}`}
              >
                {quote.panelPhotoUrl && (
                  <div className="flex flex-col items-center bg-white p-4 rounded-xl shadow-md border border-gray-200">
                    <div className="h-52 w-full mb-4 flex items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-[#f5f3f6]">
                      <img
                        src={quote.panelPhotoUrl}
                        alt="Solar Panel"
                        className="max-h-full max-w-full object-contain drop-shadow-sm p-3"
                      />
                    </div>
                    <h3 className="font-black text-[#031634] text-base text-center uppercase tracking-wide">
                      {quote.panelName || "Solar PV Module"}
                    </h3>
                    <div className="w-12 h-0.5 bg-[#E8650A] my-2 rounded-full"></div>
                    <p className="text-gray-500 text-xs text-center font-medium">
                      High-efficiency {quote.panelType || "Tier-1 PV"}{" "}
                      Technology
                    </p>
                  </div>
                )}

                {quote.inverterPhotoUrl && (
                  <div className="flex flex-col items-center bg-white p-4 rounded-xl shadow-md border border-gray-200">
                    <div className="h-52 w-full mb-4 flex items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-[#f5f3f6]">
                      <img
                        src={quote.inverterPhotoUrl}
                        alt="Solar Inverter"
                        className="max-h-full max-w-full object-contain drop-shadow-sm p-3"
                      />
                    </div>
                    <h3 className="font-black text-[#031634] text-base text-center uppercase tracking-wide">
                      Smart Inverter Unit
                    </h3>
                    <div className="w-12 h-0.5 bg-[#E8650A] my-2 rounded-full"></div>
                    <p className="text-gray-500 text-xs text-center font-medium">
                      {quote.numberOfInverters || 1}x{" "}
                      {quote.inverterSizeKw || loadKw}KW Highly Efficient String
                      Inverter
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <PageFooter pageNum={5} totalPages={totalPages} />
        </section>
      )}
    </div>
  );
};

export default QuotationPDFTemplate;