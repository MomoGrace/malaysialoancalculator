function fmt(n){
  if(!isFinite(n)) return "RM0.00";
  return new Intl.NumberFormat("en-MY",{style:"currency",currency:"MYR",minimumFractionDigits:2}).format(n);
}
function num(id){
  const el = document.getElementById(id);
  if(!el) return 0;
  return parseFloat(el.value) || 0;
}
function setText(id, value){
  const el = document.getElementById(id);
  if(el) el.textContent = value;
}
function updateBars(principal, interest){
  const total = principal + interest;
  const p = total > 0 ? Math.max(0, Math.min(100, principal / total * 100)) : 70;
  const i = 100 - p;
  document.querySelectorAll(".bar-principal").forEach(el => el.style.width = p + "%");
  document.querySelectorAll(".bar-interest").forEach(el => el.style.width = i + "%");
}
function amortizedPayment(principal, annualRate, years){
  const months = years * 12;
  const r = annualRate / 100 / 12;
  if(principal <= 0 || months <= 0) return 0;
  if(r === 0) return principal / months;
  return principal * r * Math.pow(1+r, months) / (Math.pow(1+r, months) - 1);
}
function calculateGeneral(){
  const amount = num("loanAmount");
  const rate = num("interestRate");
  const years = num("loanYears");
  const type = document.getElementById("loanType")?.value || "reducing";
  const months = years * 12;
  let monthly = 0, total = 0, interest = 0;
  if(type === "flat"){
    interest = amount * (rate/100) * years;
    total = amount + interest;
    monthly = months > 0 ? total / months : 0;
  }else{
    monthly = amortizedPayment(amount, rate, years);
    total = monthly * months;
    interest = total - amount;
  }
  setText("monthlyResult", fmt(monthly));
  setText("interestResult", fmt(Math.max(0, interest)));
  setText("totalResult", fmt(Math.max(0, total)));
  updateBars(amount, Math.max(0, interest));
}
function calculateCar(){
  const price = num("carPrice");
  const down = num("carDown");
  const rate = num("carRate");
  const years = num("carYears");
  const amount = Math.max(0, price - down);
  const months = years * 12;
  const interest = amount * (rate/100) * years;
  const total = amount + interest;
  const monthly = months > 0 ? total / months : 0;
  setText("carLoanAmount", fmt(amount));
  setText("carMonthly", fmt(monthly));
  setText("carInterest", fmt(interest));
  setText("carTotal", fmt(total));
  updateBars(amount, interest);
}
function calculateHome(){
  const amount = num("homeAmount");
  const rate = num("homeRate");
  const years = num("homeYears");
  const months = years * 12;
  const monthly = amortizedPayment(amount, rate, years);
  const total = monthly * months;
  const interest = total - amount;
  setText("homeMonthly", fmt(monthly));
  setText("homeInterest", fmt(Math.max(0, interest)));
  setText("homeTotal", fmt(Math.max(0, total)));
  updateBars(amount, Math.max(0, interest));
}
function calculatePersonal(){
  const amount = num("personalAmount");
  const rate = num("personalRate");
  const years = num("personalYears");
  const months = years * 12;
  const monthly = amortizedPayment(amount, rate, years);
  const total = monthly * months;
  const interest = total - amount;
  setText("personalMonthly", fmt(monthly));
  setText("personalInterest", fmt(Math.max(0, interest)));
  setText("personalTotal", fmt(Math.max(0, total)));
  updateBars(amount, Math.max(0, interest));
}
function calculateDSR(){
  const income = num("income");
  const existing = num("existingDebt");
  const newLoan = num("newLoanPayment");
  const totalDebt = existing + newLoan;
  const dsr = income > 0 ? totalDebt / income * 100 : 0;
  setText("dsrResult", dsr.toFixed(2) + "%");
  setText("totalDebtResult", fmt(totalDebt));
  let status = "Enter your income and debt to estimate DSR.";
  if(dsr > 0 && dsr <= 40) status = "Low to moderate debt level based on this simple estimate.";
  if(dsr > 40 && dsr <= 60) status = "Higher debt level. Approval may depend on lender rules, income stability and credit profile.";
  if(dsr > 60) status = "Very high debt level. You may need to reduce debt or increase income before applying.";
  setText("dsrStatus", status);
}
function calculateEarly(){
  const balance = num("earlyBalance");
  const rate = num("earlyRate");
  const yearsLeft = num("earlyYearsLeft");
  const monthly = amortizedPayment(balance, rate, yearsLeft);
  const totalFuture = monthly * yearsLeft * 12;
  const estimatedInterest = totalFuture - balance;
  setText("earlyMonthly", fmt(monthly));
  setText("earlyFutureInterest", fmt(Math.max(0, estimatedInterest)));
  setText("earlyApproxSettlement", fmt(balance));
}
function addJsonLd(schema){
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.text = JSON.stringify(schema);
  document.head.appendChild(script);
}
function buildBreadcrumbSchema(){
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  const slug = path === "/" ? "Home" : path.split("/").pop().replace(".html", "").split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const currentUrl = path === "/" ? "https://www.malaysialoancalculator.com/" : `https://www.malaysialoancalculator.com${path}`;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.malaysialoancalculator.com/" },
      ...(path === "/" ? [] : [{ "@type": "ListItem", position: 2, name: slug, item: currentUrl }])
    ]
  };
}

function initGuideFilters(){
  const buttons = Array.from(document.querySelectorAll('.guide-filter-btn[data-category]'));
  const cards = Array.from(document.querySelectorAll('.cards .card[data-category]'));
  const emptyState = document.getElementById('guidesEmptyState');
  if(!buttons.length || !cards.length || !emptyState) return;

  const categoryMap = {
    'car-loan': 'car',
    'home-loan': 'home',
    'personal-loan': 'personal',
    'general-finance': 'general',
    'all': 'all',
    'car': 'car',
    'home': 'home',
    'personal': 'personal',
    'general': 'general'
  };

  function applyFilter(rawCategory){
    const selected = categoryMap[rawCategory] || 'all';
    let visibleCount = 0;
    cards.forEach((card) => {
      const show = selected === 'all' || card.getAttribute('data-category') === selected;
      card.style.display = show ? '' : 'none';
      if(show) visibleCount += 1;
    });
    emptyState.style.display = visibleCount ? 'none' : 'block';

    buttons.forEach((button) => {
      const active = button.getAttribute('data-category') === selected;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-current', active ? 'page' : 'false');
    });
  }

  function readCategoryFromUrl(){
    return new URLSearchParams(window.location.search).get('category') || 'all';
  }

  applyFilter(readCategoryFromUrl());
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      applyFilter(button.getAttribute('data-category'));
    });
  });
}
function injectSchemas(){
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  const currentUrl = path === "/" ? "https://www.malaysialoancalculator.com/" : `https://www.malaysialoancalculator.com${path}`;
  const title = document.querySelector("h1")?.textContent?.trim() || document.title;
  const description = document.querySelector('meta[name="description"]')?.getAttribute("content") || "";
  const isCalculatorPage = path.includes("calculator");
  const nonArticlePages = ["/", "/about.html", "/contact.html", "/privacy.html", "/terms-of-use.html", "/disclaimer.html", "/404.html", "/guides.html", "/sitemap.xml"];
  const isGuideOrArticlePage = !isCalculatorPage && !nonArticlePages.includes(path);
  addJsonLd({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Malaysia Loan Calculator",
    url: "https://www.malaysialoancalculator.com/",
    inLanguage: "en-MY"
  });
  addJsonLd({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Malaysia Loan Calculator",
    url: "https://www.malaysialoancalculator.com/"
  });
  addJsonLd(buildBreadcrumbSchema());
  if(isCalculatorPage){
    addJsonLd({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: title,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      url: currentUrl,
      description
    });
  }
  if(isGuideOrArticlePage){
    addJsonLd({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title,
      description,
      mainEntityOfPage: currentUrl,
      author: {
        "@type": "Organization",
        name: "Malaysia Loan Calculator"
      },
      publisher: {
        "@type": "Organization",
        name: "Malaysia Loan Calculator"
      }
    });
  }
  const faqItems = Array.from(document.querySelectorAll(".faq-list details")).map((item) => {
    const q = item.querySelector("summary")?.textContent?.trim();
    const a = item.querySelector("p")?.textContent?.trim();
    if(!q || !a) return null;
    return { "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } };
  }).filter(Boolean);
  if(faqItems.length > 0){
    addJsonLd({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems
    });
  }
}
document.addEventListener("DOMContentLoaded", () => {
  ["loanAmount","interestRate","loanYears","loanType"].forEach(id => document.getElementById(id)?.addEventListener("input", calculateGeneral));
  ["carPrice","carDown","carRate","carYears"].forEach(id => document.getElementById(id)?.addEventListener("input", calculateCar));
  ["homeAmount","homeRate","homeYears"].forEach(id => document.getElementById(id)?.addEventListener("input", calculateHome));
  ["personalAmount","personalRate","personalYears"].forEach(id => document.getElementById(id)?.addEventListener("input", calculatePersonal));
  ["income","existingDebt","newLoanPayment"].forEach(id => document.getElementById(id)?.addEventListener("input", calculateDSR));
  ["earlyBalance","earlyRate","earlyYearsLeft"].forEach(id => document.getElementById(id)?.addEventListener("input", calculateEarly));
  calculateGeneral();
  calculateCar();
  calculateHome();
  calculatePersonal();
  calculateDSR();
  calculateEarly();
  injectSchemas();
  initGuideFilters();
});
