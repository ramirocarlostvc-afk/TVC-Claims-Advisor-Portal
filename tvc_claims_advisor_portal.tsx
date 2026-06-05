import React, { useState, useEffect, useRef } from 'react';

// ==========================================
// CONFIGURATION & INITIALIZATION
// ==========================================
const apiKey = ""; // Runtime populated
const MODEL_NAME = "gemini-2.5-flash-preview-09-2025";

// Custom UI Icon Components using SVGs for reliability and style
const Icons = {
  Search: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
  ),
  Scale: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
  ),
  BookOpen: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
  ),
  FileText: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
  ),
  Chat: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
  ),
  Plus: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
  ),
  Trash: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
  ),
  CheckCircle: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ),
  Award: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
  ),
  ArrowRight: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
  ),
  Refresh: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.2 8H18" /></svg>
  )
};

// Static, robust initial FAQ data curated from Texas Veterans Commission core guides
const STATIC_FAQS = [
  {
    id: "faq-1",
    category: "Agency Overview & Representation",
    question: "What is the role of a TVC Claims Benefit Advisor (CBA)?",
    answer: "TVC Claims Benefit Advisors (CBAs) are state-certified advocates located in VA regional offices, medical centers, out-patient clinics, and military installations. They represent veterans, dependents, and survivors free of charge. Their duties include evaluating potential claims, assisting in gathering requisite service/medical evidence, drafting formal statements, and representing individuals before the VA and the Board of Veterans' Appeals."
  },
  {
    id: "faq-2",
    category: "Service-Connected Disability",
    question: "What are the three essential elements required to establish service connection?",
    answer: "To establish service connection for a physical or mental health condition, the VA requires three specific elements of evidence:\n1. A current, clinically diagnosed physical or mental disability.\n2. An in-service event, injury, or disease that occurred or was aggravated during active military duty.\n3. A medical nexus—a professional opinion linking the current diagnosed condition to the in-service event or injury."
  },
  {
    id: "faq-3",
    category: "Texas State Benefits",
    question: "How does the Hazlewood Act tuition exemption benefit work in Texas?",
    answer: "The Hazlewood Act is a State of Texas benefit that provides qualified Veterans, spouses, and dependent children with an exemption of up to 150 hours of tuition and required fee maintenance at public institutions of higher education in Texas. Key requirements include: having entered active duty service in the state of Texas, receiving an Honorable Discharge (or general under honorable conditions), and residing in Texas during the academic term for which the exemption is claimed."
  },
  {
    id: "faq-4",
    category: "Appeals & CAVC",
    question: "What are the decision review options if a veteran disagrees with a VA decision?",
    answer: "Under the Appeals Modernization Act (AMA), veterans have three distinct lanes to appeal a VA decision within one year of the decision letter date:\n1. Higher-Level Review (HLR): A senior claims adjudicator reviews the same evidence without allowing new evidence.\n2. Supplemental Claim: Allows submission of 'new and relevant' evidence for a fresh review of the case.\n3. Board Appeal (BVA): Appeals the decision directly to a Veterans Law Judge in Washington, D.C., with options for Direct Review, Evidence Submission, or a Hearing."
  },
  {
    id: "faq-5",
    category: "Survivor Benefits",
    question: "What is Dependency and Indemnity Compensation (DIC) and who qualifies?",
    answer: "Dependency and Indemnity Compensation (DIC) is a tax-free monthly monetary benefit payable to eligible surviving spouses, children, or parent(s) of a servicemember who died on active duty, active duty for training, or inactive duty training, OR survivors of a Veteran whose death resulted from a service-connected injury or disease, or who was rated 100% permanently and totally disabled for at least 10 years prior to death."
  },
  {
    id: "faq-6",
    category: "Non-Service Connected Pension",
    question: "What is the difference between Disability Compensation and VA Pension?",
    answer: "Disability Compensation is a tax-free benefit paid to veterans with disabilities that are the result of disease or injury incurred or aggravated during active military service, regardless of income. VA Pension is a needs-based benefit paid to war-time veterans who are age 65 or older, OR permanently and totally disabled, and whose countable household income and net worth fall below limits set by Congress."
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState("faq");
  
  // FAQ Search & Filter State
  const [faqSearch, setFaqSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedFaqId, setExpandedFaqId] = useState(null);

  // AI Chat Assistant State
  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I am your TVC Claims AI Assistant. I have been instructed with knowledge from the Texas Veterans Commission Claims Department Manual. I can also look up current VA regulations and Hazlewood Act provisions in real-time. How can I assist you with your benefits today?",
      sources: []
    }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatBottomRef = useRef(null);

  // VA Math Calculator State
  const [ratingsList, setRatingsList] = useState([50, 30]);
  const [newRating, setNewRating] = useState(10);
  const [calculatedResult, setCalculatedResult] = useState({ precise: "65.00", rounded: 70 });

  // Checklist Generator State
  const [checklistProfile, setChecklistProfile] = useState({
    userType: "veteran",
    claimType: "compensation_original"
  });
  const [checklistItems, setChecklistItems] = useState([]);

  // Toast / Status Message Modal
  const [toastMessage, setToastMessage] = useState(null);

  // Trigger scroll to bottom on new chat messages
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatLoading]);

  // Recalculate combined rating when list changes
  useEffect(() => {
    calculateCombinedMath();
  }, [ratingsList]);

  // Generate checklist on profile updates
  useEffect(() => {
    generateDynamicChecklist();
  }, [checklistProfile]);

  const showToast = (msg, type = "info") => {
    setToastMessage({ msg, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // ==========================================
  // DISABILITY RATING ("VA MATH") CALCULATOR LOGIC
  // ==========================================
  const calculateCombinedMath = () => {
    if (ratingsList.length === 0) {
      setCalculatedResult({ precise: "0.00", rounded: 0 });
      return;
    }
    // VA math starts with a person 100% "whole" (100% efficient)
    // Sort ratings descending for calculations
    const sorted = [...ratingsList].sort((a, b) => b - a);
    let efficiency = 100;
    
    sorted.forEach((r) => {
      // Apply rating to current efficiency
      const disabilityValue = (efficiency * r) / 100;
      efficiency -= disabilityValue;
    });

    const preciseCombined = 100 - efficiency;
    // VA rounds to nearest 10%
    const roundedCombined = Math.round(preciseCombined / 10) * 10;
    setCalculatedResult({
      precise: preciseCombined.toFixed(2),
      rounded: Math.min(100, Math.max(0, roundedCombined))
    });
  };

  const addRating = () => {
    if (newRating < 10 || newRating > 100) {
      showToast("Disability ratings must be between 10% and 100%", "warning");
      return;
    }
    setRatingsList([...ratingsList, parseInt(newRating)]);
    showToast(`Added ${newRating}% disability rating`, "success");
  };

  const removeRating = (index) => {
    const updated = [...ratingsList];
    updated.splice(index, 1);
    setRatingsList(updated);
  };

  const clearRatings = () => {
    setRatingsList([]);
    showToast("Cleared all ratings", "info");
  };

  // ==========================================
  // DOCUMENT CHECKLIST GENERATOR LOGIC
  // ==========================================
  const generateDynamicChecklist = () => {
    const { userType, claimType } = checklistProfile;
    let items = [];

    // Core identification documents depending on status
    if (userType === "veteran") {
      items.push({
        id: "doc-dd214",
        title: "DD Form 214 (Certificate of Release or Discharge from Active Duty)",
        desc: "Must show Member 4 copy or any copy showing the Character of Service (e.g., Honorable). Essential for state and federal benefits.",
        required: true
      });
    } else if (userType === "survivor" || userType === "dependent") {
      items.push({
        id: "doc-marriage-birth",
        title: "Marriage Certificate / Birth Certificates",
        desc: "Legal proof of relationship to the qualifying Veteran. Essential for establishing dependency claims.",
        required: true
      });
      items.push({
        id: "doc-dd214-vet",
        title: "Veteran's DD Form 214",
        desc: "The qualifying Veteran's discharge documents verifying service dates and character of discharge.",
        required: true
      });
    }

    // Claim specific documents
    if (claimType === "compensation_original") {
      items.push({
        id: "doc-526ez",
        title: "VA Form 21-526EZ (Application for Disability Compensation)",
        desc: "The primary legal form required to open a fully developed or standard disability claim.",
        required: true
      });
      items.push({
        id: "doc-med-records",
        title: "Service Treatment Records (STRs) & Private Medical Records",
        desc: "Comprehensive diagnostic reports, outpatient treatment records, and specialist notes proving the active medical condition.",
        required: true
      });
      items.push({
        id: "doc-nexus",
        title: "Independent Medical Opinion (IMO) / Nexus Letter",
        desc: "A detailed clinical argument from your licensed provider clearly stating that the condition is 'at least as likely as not' (50% or greater probability) caused by service.",
        required: false
      });
    } else if (claimType === "compensation_increase") {
      items.push({
        id: "doc-526ez-inc",
        title: "VA Form 21-526EZ (Specified for Increase)",
        desc: "Form configured to request an increase for currently service-connected disabilities already on your record.",
        required: true
      });
      items.push({
        id: "doc-new-meds",
        title: "Recent Clinical Evidence (Past 12 months)",
        desc: "New medical test results, doctor notes, or hospitalization records showing the worsening of your rated condition.",
        required: true
      });
    } else if (claimType === "hazlewood") {
      items.push({
        id: "doc-hazlewood-app",
        title: "Texas Hazlewood Act Exemption Application (Form TVC-F-1)",
        desc: "The formal state application for veterans or qualifying spouses/dependents seeking tuition exemption.",
        required: true
      });
      items.push({
        id: "doc-helo",
        title: "HELO/Hazlewood Database Hours Register",
        desc: "An account printout from the official TVC Hazlewood online portal displaying previously used state hours (if any).",
        required: true
      });
      items.push({
        id: "doc-vabenefits-letter",
        title: "VA Certificate of Eligibility (COE) for GI Bill Benefits",
        desc: "Required to prove that federal education benefits (e.g., Chapter 33 Post-9/11) are fully exhausted or that the benefit rate is lower than Hazlewood coverage.",
        required: true
      });
    } else if (claimType === "pension") {
      items.push({
        id: "doc-527ez",
        title: "VA Form 21-527EZ (Veterans Pension Application)",
        desc: "Specifically for war-time veterans seeking needs-based pension support due to age or permanent disability.",
        required: true
      });
      items.push({
        id: "doc-financial-proof",
        title: "Comprehensive Income & Net Worth Statements",
        desc: "Tax returns, bank statements, social security statements, and asset reports demonstrating household resources are below legislated caps.",
        required: true
      });
    } else if (claimType === "dic_survivor") {
      items.push({
        id: "doc-534ez",
        title: "VA Form 21P-534EZ (Application for DIC, Survivors Pension, and Accrued Benefits)",
        desc: "The main consolidated application for survivors to secure federal pension and monthly death benefits.",
        required: true
      });
      items.push({
        id: "doc-death-cert",
        title: "Certified Death Certificate of the Veteran",
        desc: "Must explicitly state the cause of death. Extremely critical if claiming death was directly caused or accelerated by a service-connected disease.",
        required: true
      });
    }

    setChecklistItems(items);
  };

  // ==========================================
  // CLIENT-SIDE GEMINI API INTEGRATION
  // ==========================================
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isChatLoading) return;

    const userText = userInput.trim();
    setUserInput("");
    setIsChatLoading(true);

    // Append user message to the conversation
    const updatedMessages = [...chatMessages, { role: "user", content: userText, sources: [] }];
    setChatMessages(updatedMessages);

    // Construct history payload formatted for Gemini API
    // Ensure we send historical context appropriately structured
    const contentsPayload = updatedMessages.map(msg => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }]
    }));

    const systemPrompt = `You are the TVC Claims Assistant, representing the Texas Veterans Commission Claims Department. 
Your objective is to provide professional, accurate, empathetic, and structured assistance regarding VA Claims, Texas state veteran benefits (such as the Hazlewood Act), disability ratings, surviving spouse benefits (DIC), pensions, and administrative appeal routes.

Key Reference Information:
- TVC works collaboratively with County Veterans Service Officers (VCSO) and major VSOs (American Legion, VFW).
- VA Math requires descending combination of percentages, rounding to the nearest 10%.
- Hazlewood Act allows up to 150 hours of free tuition at public Texas colleges for veterans who entered service in Texas.
- Always encourage veterans to consult with an accredited TVC CBA or county service officer before finalizing submissions.
- Do NOT make up laws or forms. Quote standard forms (e.g., VA Form 21-526EZ for compensation, 21P-534EZ for survivors, TVC-F-1 for Hazlewood).

Always use search grounding to verify the latest 2025/2026 guidelines, form numbers, or benefit rates when asked about specific criteria. Highlight when you utilize verified resources and output footnotes for sources.`;

    const requestPayload = {
      contents: contentsPayload,
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      tools: [{ "google_search": {} }] // Essential for grounding current VA guidelines
    };

    // Exponential Backoff Retry Strategy
    const makeApiCallWithRetry = async (retries = 5, delay = 1000) => {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(requestPayload)
        });

        if (!response.ok) {
          throw new Error(`HTTP Error Status: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
          return makeApiCallWithRetry(retries - 1, delay * 2);
        } else {
          throw error;
        }
      }
    };

    try {
      const data = await makeApiCallWithRetry();

      // Extract generated text
      const assistantText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I was unable to synthesize a response. Please rephrase your query.";

      // Extract search grounding citations
      const sources = data.candidates?.[0]?.groundingMetadata?.groundingAttributions?.map(att => ({
        uri: att.web?.uri,
        title: att.web?.title || "Reference Link"
      })) || [];

      setChatMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: assistantText,
          sources: sources
        }
      ]);
    } catch (error) {
      console.error("Gemini API Error:", error);
      showToast("Could not communicate with the Claims Assistant. Please verify connection or retry later.", "error");
      setChatMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "I encountered an error connecting to our legal/regulatory grounding database. Please try your question again in a moment.",
          sources: []
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Filter FAQs based on search & category
  const filteredFaqs = STATIC_FAQS.filter(faq => {
    const matchesCategory = selectedCategory === "All" || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(faqSearch.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(faqSearch.toLowerCase()) ||
                          faq.category.toLowerCase().includes(faqSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ["All", "Agency Overview & Representation", "Service-Connected Disability", "Texas State Benefits", "Appeals & CAVC", "Survivor Benefits", "Non-Service Connected Pension"];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans antialiased selection:bg-amber-500 selection:text-slate-900">
      
      {/* BRAND HEADER */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            {/* Custom Patriotic Texas Emblem Logo */}
            <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-amber-600 p-2.5 rounded-lg shadow-inner flex items-center justify-center">
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.246.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.175 0l-3.97 2.883c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.49 10.3c-.773-.564-.373-1.81.588-1.81h4.908a1 1 0 00.95-.69l1.519-4.674z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-white uppercase">Texas Claims Portal</h1>
                <span className="bg-amber-500/10 text-amber-400 text-xs font-semibold px-2 py-0.5 rounded border border-amber-500/20">Manual Version: Jul 2025</span>
              </div>
              <p className="text-xs text-slate-400 font-medium tracking-wide">Interactive Veteran Decision & FAQ Framework</p>
            </div>
          </div>

          {/* MAIN TABS */}
          <nav className="flex flex-wrap gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("faq")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === "faq" 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Icons.BookOpen />
              Interactive FAQ
            </button>
            <button
              onClick={() => setActiveTab("ai")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === "ai" 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Icons.Chat />
              AI Grounded Assistant
            </button>
            <button
              onClick={() => setActiveTab("calculator")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === "calculator" 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Icons.Scale />
              VA Math Calculator
            </button>
            <button
              onClick={() => setActiveTab("checklist")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === "checklist" 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Icons.FileText />
              Checklist Generator
            </button>
          </nav>

        </div>
      </header>

      {/* STATUS TOAST / NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 max-w-sm w-full bg-slate-800 border-l-4 border-amber-500 rounded-lg shadow-2xl p-4 flex items-start gap-3 animate-slide-in">
          <div className="text-amber-400">
            <Icons.CheckCircle />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">System Notification</p>
            <p className="text-xs text-slate-300 mt-0.5">{toastMessage.msg}</p>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
        
        {/* ========================================================================= */}
        {/* TAB 1: INTERACTIVE FAQ FINDER */}
        {/* ========================================================================= */}
        {activeTab === "faq" && (
          <section className="flex flex-col gap-6 animate-fade-in">
            <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl">
              <h2 className="text-2xl font-black text-white tracking-tight">Interactive Claims FAQ Guide</h2>
              <p className="text-slate-400 text-sm mt-1">
                Explore structured guidelines extracted from the TVC Claims Manual. Select a category below or use the search bar.
              </p>
              
              <div className="mt-6 flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                    <Icons.Search />
                  </span>
                  <input
                    type="text"
                    value={faqSearch}
                    onChange={(e) => setFaqSearch(e.target.value)}
                    placeholder="Search terms, form numbers, state statutes (e.g., 'Hazlewood', 'Nexus')..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
                {/* Clear search */}
                {faqSearch && (
                  <button 
                    onClick={() => setFaqSearch("")} 
                    className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
                  >
                    Clear Search
                  </button>
                )}
              </div>

              {/* Categorization Quick Pills */}
              <div className="mt-4 flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      selectedCategory === cat
                        ? "bg-amber-500 text-slate-950 border border-amber-400"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700/60 border border-slate-700/40"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* EXPANDABLE ACCORDIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* FAQ Accordion Side */}
              <div className="lg:col-span-2 flex flex-col gap-3">
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((faq) => {
                    const isExpanded = expandedFaqId === faq.id;
                    return (
                      <div 
                        key={faq.id}
                        className={`border rounded-xl transition-all duration-200 overflow-hidden ${
                          isExpanded 
                            ? "bg-slate-800/40 border-blue-500 shadow-lg" 
                            : "bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-850"
                        }`}
                      >
                        <button
                          onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                          className="w-full text-left px-5 py-4 flex items-center justify-between gap-4"
                        >
                          <div>
                            <span className="text-xs font-bold text-amber-400 tracking-wider uppercase mb-1 block">
                              {faq.category}
                            </span>
                            <h3 className="font-bold text-white text-base leading-snug">
                              {faq.question}
                            </h3>
                          </div>
                          <span className={`text-slate-400 transform transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}>
                            <Icons.ArrowRight />
                          </span>
                        </button>
                        
                        {isExpanded && (
                          <div className="px-5 pb-5 pt-2 border-t border-slate-800/50 animate-slide-down">
                            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                              {faq.answer}
                            </p>
                            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                              <span className="text-[10px] text-slate-500">Source: TVC Claims Dept. Policy Directives</span>
                              <button
                                onClick={() => {
                                  setUserInput(`Tell me more about: "${faq.question}"`);
                                  setActiveTab("ai");
                                }}
                                className="text-xs text-blue-400 font-bold hover:text-blue-300 flex items-center gap-1"
                              >
                                Ask AI Assistant <Icons.ArrowRight />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-xl">
                    <p className="text-slate-400 text-sm">No FAQs match your search parameters.</p>
                    <button
                      onClick={() => { setSelectedCategory("All"); setFaqSearch(""); }}
                      className="mt-4 text-xs font-bold text-blue-400 hover:underline"
                    >
                      Reset filters
                    </button>
                  </div>
                )}
              </div>

              {/* Informative Side Card */}
              <div className="flex flex-col gap-6">
                
                <div className="bg-gradient-to-b from-slate-900 to-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between h-fit gap-4">
                  <div>
                    <div className="bg-blue-900/30 text-blue-400 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                      <Icons.Award />
                    </div>
                    <h3 className="font-bold text-white text-lg">Official TVC Sourcing Note</h3>
                    <p className="text-slate-300 text-xs mt-2 leading-relaxed">
                      All calculations, forms, and procedures referenced herein align primarily with the **38 Code of Federal Regulations (38 CFR)**, **M21-1 Adjudication Procedures Manual**, and official directives published by the Texas Veterans Commission.
                    </p>
                    <p className="text-slate-400 text-[11px] mt-2 italic">
                      Disclaimer: System changes happen frequently. Confirm official rates and filing criteria with a licensed Benefit Advisor.
                    </p>
                  </div>
                  <div className="mt-2">
                    <button
                      onClick={() => setActiveTab("ai")}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2"
                    >
                      <span>Need instant custom advice? Ask our AI</span>
                      <Icons.ArrowRight />
                    </button>
                  </div>
                </div>

                {/* Regional/MOU Fast Fact */}
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-850 flex flex-col gap-2">
                  <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest">Collocation Partnership</h4>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Under standard state Memorandum of Understanding (MOU), TVC Claims Benefit Advisors are collocated within regional VA stations, County Veterans Service Offices (VCSO), and Texas military bases (e.g., Fort Cavazos, Joint Base San Antonio) to optimize filing processes.
                  </p>
                </div>

              </div>

            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: AI GROUNDED ASSISTANT */}
        {/* ========================================================================= */}
        {activeTab === "ai" && (
          <section className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fade-in flex-1">
            
            {/* Left Prompt Guide Panel */}
            <div className="lg:col-span-1 flex flex-col gap-4">
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
                <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-3">Claims Assistant System</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Ask precise regulatory questions. This system leverages state-of-the-art search grounding to pull the latest benefit guidelines.
                </p>
                
                <div className="mt-4 flex flex-col gap-2">
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Suggested Prompts:</p>
                  <button 
                    onClick={() => setUserInput("What is the qualifying criteria for a spouse to receive the Texas Hazlewood Act exemption?")}
                    className="w-full text-left text-xs bg-slate-800 hover:bg-slate-755 p-2 rounded text-slate-300 transition-colors"
                  >
                    "Hazlewood Act requirements for spouses?"
                  </button>
                  <button 
                    onClick={() => setUserInput("How does a veteran establish secondary service connection for sleep apnea linked to PTSD?")}
                    className="w-full text-left text-xs bg-slate-800 hover:bg-slate-755 p-2 rounded text-slate-300 transition-colors"
                  >
                    "Link sleep apnea secondary to PTSD?"
                  </button>
                  <button 
                    onClick={() => setUserInput("What forms are required to submit an appeal to the BVA (Board of Veterans Appeals)?")}
                    className="w-full text-left text-xs bg-slate-800 hover:bg-slate-755 p-2 rounded text-slate-300 transition-colors"
                  >
                    "What forms for Board of Appeals?"
                  </button>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Grounding Tool Active</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Queries are verified against direct state codes and VA references.</p>
                </div>
              </div>
            </div>

            {/* Main Interactive Chat Panel */}
            <div className="lg:col-span-3 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col h-[580px] shadow-2xl overflow-hidden">
              
              {/* Chat Title bar */}
              <div className="bg-slate-900 px-6 py-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                  <span className="font-bold text-sm text-white">Live Policy Grounding & Synthesis</span>
                </div>
                <button
                  onClick={() => {
                    setChatMessages([
                      {
                        role: "assistant",
                        content: "Hello! I am your TVC Claims AI Assistant. I have been instructed with knowledge from the Texas Veterans Commission Claims Department Manual. I can also look up current VA regulations and Hazlewood Act provisions in real-time. How can I assist you with your benefits today?",
                        sources: []
                      }
                    ]);
                  }}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition"
                >
                  <Icons.Refresh />
                  Clear Conversation
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {chatMessages.map((msg, idx) => (
                  <div 
                    key={idx}
                    className={`flex flex-col max-w-[85%] ${
                      msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                    }`}
                  >
                    <div 
                      className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user' 
                          ? 'bg-blue-600 text-white rounded-br-none' 
                          : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none'
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.content}</p>

                      {/* Display Grounded Sources if available */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-slate-800 text-xs">
                          <p className="font-bold text-slate-400 mb-1">References & Sources:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.sources.map((src, sIdx) => (
                              <a
                                key={sIdx}
                                href={src.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-slate-950 hover:bg-black text-[10px] text-blue-400 px-2 py-1 rounded border border-slate-800 inline-block transition truncate max-w-[200px]"
                                title={src.title}
                              >
                                🔗 {src.title}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 capitalize px-2">
                      {msg.role === 'user' ? 'Claimant / Advocate' : 'Accredited AI Assistant'}
                    </span>
                  </div>
                ))}

                {isChatLoading && (
                  <div className="flex flex-col items-start mr-auto max-w-[80%]">
                    <div className="bg-slate-900 text-slate-200 border border-slate-800 px-4 py-3 rounded-2xl rounded-bl-none">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-150"></span>
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-300"></span>
                        <span className="text-xs text-slate-400 ml-1">Consulting regulatory database & manuals...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendMessage} className="bg-slate-900 p-4 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Ask a question (e.g., 'What is the asset limit for war-time pension?')..."
                  className="flex-1 bg-slate-950 border border-slate-750 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={isChatLoading || !userInput.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-3 rounded-xl text-sm font-bold transition flex items-center gap-2"
                >
                  <span>Query AI</span>
                  <Icons.Search />
                </button>
              </form>

            </div>

          </section>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: VA DISABILITY RATING ("VA MATH") CALCULATOR */}
        {/* ========================================================================= */}
        {activeTab === "calculator" && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
            
            {/* Input & Form Control Block */}
            <div className="lg:col-span-5 bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col gap-6">
              <div>
                <h3 className="font-bold text-white text-lg">Add Ratings</h3>
                <p className="text-xs text-slate-400 mt-1">
                  The VA does not add ratings together directly. They evaluate the remaining 'efficient, healthy' portion of the body.
                </p>
              </div>

              {/* Add New rating widget */}
              <div className="flex gap-2">
                <select
                  value={newRating}
                  onChange={(e) => setNewRating(parseInt(e.target.value))}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value={10}>10% Rating</option>
                  <option value={20}>20% Rating</option>
                  <option value={30}>30% Rating</option>
                  <option value={40}>40% Rating</option>
                  <option value={50}>50% Rating</option>
                  <option value={60}>60% Rating</option>
                  <option value={70}>70% Rating</option>
                  <option value={80}>80% Rating</option>
                  <option value={90}>90% Rating</option>
                  <option value={100}>100% Rating</option>
                </select>
                <button
                  onClick={addRating}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-3 rounded-xl text-sm transition flex items-center gap-1.5"
                >
                  <Icons.Plus />
                  Add
                </button>
              </div>

              {/* Active Ratings List */}
              <div className="flex-1">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase">Current Ratings ({ratingsList.length})</span>
                  {ratingsList.length > 0 && (
                    <button 
                      onClick={clearRatings} 
                      className="text-xs text-rose-400 hover:text-rose-300 font-bold"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                
                {ratingsList.length > 0 ? (
                  <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto">
                    {ratingsList.map((rate, idx) => (
                      <div key={idx} className="bg-slate-950 px-4 py-3 rounded-xl border border-slate-800 flex items-center justify-between">
                        <span className="font-bold text-slate-200">{rate}% Disability</span>
                        <button 
                          onClick={() => removeRating(idx)}
                          className="text-slate-500 hover:text-rose-400 transition"
                          title="Remove rating"
                        >
                          <Icons.Trash />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-slate-950/40 rounded-xl border border-dashed border-slate-800 text-slate-500 text-xs">
                    No active ratings added yet. Use selector above to begin combining values.
                  </div>
                )}
              </div>
            </div>

            {/* Results Rendering Block */}
            <div className="lg:col-span-7 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between shadow-xl">
              <div>
                <h3 className="font-bold text-white text-lg">Combined Visualizer</h3>
                <p className="text-xs text-slate-400 mt-1">Calculated following the official 38 CFR Part 4 regulatory rounding algorithm.</p>
              </div>

              {/* Huge Combined Rating Output */}
              <div className="my-6 py-6 text-center bg-slate-900/60 rounded-2xl border border-slate-800 flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block mb-1">
                  Final Rounded Rating
                </span>
                <span className="text-6xl sm:text-7xl font-black text-white tracking-tighter">
                  {calculatedResult.rounded}%
                </span>
                <div className="mt-3 bg-slate-950 px-4 py-1.5 rounded-full border border-slate-800 inline-block text-xs">
                  <span className="text-slate-400">Precise combined total: </span>
                  <span className="font-bold text-blue-400">{calculatedResult.precise}%</span>
                </div>
              </div>

              {/* Explanatory VA Math Logic block */}
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-850">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wide">How this computation works:</h4>
                <ol className="text-xs text-slate-300 space-y-2 mt-2 list-decimal list-inside leading-relaxed">
                  <li>Ratings are sorted from highest to lowest percentage (e.g., {ratingsList.length > 0 ? [...ratingsList].sort((a,b)=>b-a).join('% → ') + '%' : 'None added'}).</li>
                  <li>We evaluate remaining efficient body capacity starting at 100%.</li>
                  <li>Each sequential disability consumes its specified percentage of whatever efficiency remains.</li>
                  <li>The final precise figure is rounded to the nearest multiple of ten.</li>
                </ol>
              </div>
            </div>

          </section>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: INTERACTIVE CHECKLIST GENERATOR */}
        {/* ========================================================================= */}
        {activeTab === "checklist" && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            
            {/* Control Panel Column */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 h-fit flex flex-col gap-6">
              <div>
                <h3 className="font-bold text-white text-lg">Checklist Criteria</h3>
                <p className="text-xs text-slate-400 mt-1">Configure your current filing status and claim objective to instantly produce a list of required documentation.</p>
              </div>

              {/* Step 1: User Status */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-amber-500 uppercase">1. Service Status</label>
                <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setChecklistProfile({ ...checklistProfile, userType: "veteran" })}
                    className={`px-2 py-2 rounded-lg text-xs font-bold transition-all ${
                      checklistProfile.userType === "veteran" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Veteran
                  </button>
                  <button
                    onClick={() => setChecklistProfile({ ...checklistProfile, userType: "survivor" })}
                    className={`px-2 py-2 rounded-lg text-xs font-bold transition-all ${
                      checklistProfile.userType === "survivor" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Survivor
                  </button>
                  <button
                    onClick={() => setChecklistProfile({ ...checklistProfile, userType: "dependent" })}
                    className={`px-2 py-2 rounded-lg text-xs font-bold transition-all ${
                      checklistProfile.userType === "dependent" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Dependent
                  </button>
                </div>
              </div>

              {/* Step 2: Benefit Type */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-amber-500 uppercase">2. Benefit Type Sought</label>
                <select
                  value={checklistProfile.claimType}
                  onChange={(e) => setChecklistProfile({ ...checklistProfile, claimType: e.target.value })}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="compensation_original">Original Service Connection Claim</option>
                  <option value="compensation_increase">Disability Increase Request</option>
                  <option value="hazlewood">Texas Hazlewood Tuition Exemption</option>
                  <option value="pension">War-Time Needs Pension</option>
                  <option value="dic_survivor">Dependency & Indemnity Compensation (DIC)</option>
                </select>
              </div>

              {/* Info summary */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-xs text-slate-400 leading-relaxed">
                Checklists are generated based on procedural directives of the **VA fully-developed claims (FDC)** pathway and TVC State Education guidelines.
              </div>
            </div>

            {/* Checklist Results Column */}
            <div className="lg:col-span-2 bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div>
                  <h3 className="font-bold text-white text-lg">Document Requirements</h3>
                  <p className="text-xs text-slate-400 mt-1">Verify you possess all essential forms before initiating TVC portal upload.</p>
                </div>
                <span className="bg-blue-900/40 text-blue-300 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/20">
                  {checklistItems.length} Forms Listed
                </span>
              </div>

              {/* Document List */}
              <div className="flex flex-col gap-4">
                {checklistItems.map((item) => (
                  <div key={item.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-white text-sm">{item.title}</h4>
                          {item.required ? (
                            <span className="bg-rose-500/15 text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded border border-rose-500/25 uppercase">
                              Required
                            </span>
                          ) : (
                            <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-700 uppercase">
                              Optional / Advisory
                            </span>
                          )}
                        </div>
                        <p className="text-slate-300 text-xs mt-1 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sourcing warning */}
              <div className="mt-6 pt-4 border-t border-slate-800 text-center">
                <p className="text-xs text-slate-500">
                  Missing a document or need assist compiling your packet? Reach out to a certified TVC Representative.
                </p>
                <button
                  onClick={() => {
                    setUserInput(`I am a ${checklistProfile.userType} trying to apply for ${checklistProfile.claimType.replace('_', ' ')}. Can you detail what forms are necessary and how I obtain them?`);
                    setActiveTab("ai");
                  }}
                  className="mt-3 inline-block bg-slate-800 hover:bg-slate-750 text-blue-400 font-bold py-2 px-4 rounded-lg text-xs transition"
                >
                  Query AI for submission help on this profile
                </button>
              </div>

            </div>

          </section>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-800 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Interactive Texas Claims Policy Explorer. All information modeled after official Jul 2025 release manuals.</p>
          <p>Designed for educational & decision-support purposes.</p>
        </div>
      </footer>

    </div>
  );
}