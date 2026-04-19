from groq import Groq
from services.pdf_processor import extract_pdf
from dotenv import load_dotenv



load_dotenv()


pitch_deck1 = r"C:\Users\Administrator\Downloads\pitch_deck1.pdf"
financial_model1 = r"C:\Users\Administrator\Downloads\financial_model1.pdf"



import os

def get_groq_client():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY is currently missing in the .env file! Please add it.")
    return Groq(api_key=api_key)

SYSTEM_PROMPT = """
You are a Senior Associate at a Top-Tier VC firm specializing in Emerging Markets (MENA/Africa). 
You are cynical, brutally objective, and hyper-aware of regional capital efficiency.

STRICT REGIONAL EVALUATION RULES:
1. REGIONAL CAPITAL REALISM: You recognize that operational and engineering costs in emerging markets are significantly lower than in Silicon Valley. 
   - If an MVP/Seed stage project in this region asks for >$2M without a massive hardware/infrastructure requirement, penalize ROI score by 15 points.
   - If they ask for >$10M at MVP stage, it is a 'Fatal Strategic Flaw'. Recommendation must be PASS.
2. CURRENCY & SCALE SENSE: Analyze if the funding amount is proportional to the target market's purchasing power. $50M for an MVP in a regional market is considered a "hallucination."
3. TRACTION VS. CAPITAL: In this market, we value 'Lean' builders. High scores are reserved for founders who achieve more with less.
4. MOAT & LOCALIZATION: Does the startup have a "Local Moat"? If it's just a clone of a US startup with no regional optimization, score Impact below 10.
5. NO HALLUCINATIONS: Use ONLY the provided text. Return ONLY raw JSON.
"""




SECTOR_BENCHMARKS = {
    "fintech": {
        "avg_total": 66,
        "note": "Fintech is highly regulated — compliance strategy is critical"
    },
    "saas": {
        "avg_total": 68,
        "note": "SaaS investors expect clear MRR growth and churn metrics"
    },
    "healthtech": {
        "avg_total": 64,
        "note": "Healthtech requires a regulatory approval pathway to score well"
    },
    "edtech": {
        "avg_total": 62,
        "note": "Edtech struggles with monetization — revenue model must be airtight"
    },
    "ecommerce": {
        "avg_total": 63,
        "note": "Ecommerce is saturated — differentiation and unit economics are everything"
    },
}

def benchmark(sector: str, scores: dict) -> dict:
    sector_key = sector.lower().replace(" ", "")

    benchmark_data = None
    for key in SECTOR_BENCHMARKS:
        if key in sector_key:
            benchmark_data = SECTOR_BENCHMARKS[key]
            break

    if not benchmark_data:
        benchmark_data = {
            "avg_total": 65,
            "note": "No specific benchmark available for this sector"
        }

    total = scores.get("total_score", 0)
    avg = benchmark_data["avg_total"]
    diff = total - avg

    if diff > 10:
        comparison = "significantly above sector average"
    elif diff > 0:
        comparison = "slightly above sector average"
    elif diff == 0:
        comparison = "exactly at sector average"
    elif diff > -10:
        comparison = "slightly below sector average"
    else:
        comparison = "significantly below sector average"

    return {
        "sector_benchmark": {
            "sector_average_score": avg,
            "your_score": total,
            "difference": diff,
            "comparison": comparison,
            "sector_insight": benchmark_data["note"]
        }
    }










def build_prompt(company_name, project_type, sector, stage, funding_amount, pitch_text, financial_text):
    # --- ADD THE BRANCHING LOGIC HERE ---
    market_context = "This is an Emerging Market project. Budgets should reflect regional labor/operational costs, not US standards."
    if project_type.upper() == "SAAS":
        extra_instructions = """
- SAAS UNIT ECONOMICS PENALTY: If LTV/CAC is less than 3, you MUST deduct 10 points from ROI.
- RECURRING REVENUE REQUIREMENT: If MRR is below €10k, Viability cannot exceed 15.
- CHURN AUDIT: If churn is not mentioned, add a warning in the 'biggest_red_flag'."""
    else:
        extra_instructions = """
- STARTUP SPECIFIC FOCUS: Analyze the 'Moat' and competitive advantage. 
- Look for Intellectual Property, network effects, or unique strategic partnerships.
- Evaluate the scalability of the business model and the 'Exit' potential for investors."""

    # --- INJECT THE extra_instructions INTO THE PROMPT ---
    return f"""
Evaluate this {project_type} submission and return ONLY valid JSON.

STARTUP DATA:
- Company: {company_name} | Project type: {project_type} | Sector: {sector} | Stage: {stage} | Funding: {funding_amount}

PITCH DECK CONTENT:
{pitch_text}

FINANCIALS:
{financial_text}

EVALUATION CRITERIA FOR YOUR LOGIC:
{extra_instructions}
- Viability: Look for 'Product-Market Fit'. If no revenue/pilot exists, score < 12.
- Feasibility: Check 'Team-Skill Match'. If hardware is proposed but no engineer is on the team, score < 8.
- ROI/Financials: Check for 'Burn Rate vs Revenue'. If projections are 10x without cost increases, flag as 'Unrealistic'.
- Logic Check: If the solution violates laws of physics or common business sense, total_score must be < 30.

Return exactly this JSON structure:
{{
  "viability": {{ "score": 0-25, "evidence": "quote", "verdict": "string" }},
  "feasibility": {{ "score": 0-25, "evidence": "quote", "verdict": "string" }},
  "impact": {{ "score": 0-25, "evidence": "quote", "verdict": "string" }},
  "roi_financial_logic": {{ "score": 0-25, "evidence": "quote", "verdict": "string" }},
  "total_score": 0-100,
  "overall_summary": "5 sentences max.",
  "biggest_red_flag": "One specific threat.",
  "investor_recommendation": "PASS | CONSIDER | STRONG INTEREST"
}}


FINAL INSTRUCTIONS:
- If 'total_score' is > 70, but 'biggest_red_flag' is a fatal flaw (like unrealistic funding), you MUST lower the total_score to below 50.
- High scores are for companies with balanced Team, Traction, and realistic Ask.
- An unrealistic funding request overrides a good team score.


"""


def call_groq(prompt):
    client = get_groq_client()
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        temperature=0.02,
        max_tokens=1000
    )
    return response.choices[0].message.content


import json

def parse_response(raw):
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        # Try to extract JSON if there's extra text around it
        start = raw.find("{")
        end = raw.rfind("}") + 1
        if start != -1 and end != 0:
            try:
                return json.loads(raw[start:end])
            except:
                pass
        return {"error": "Failed to parse response", "raw": raw}
    

def evaluate_startup(company_name, project_type, sector, stage, funding_amount, pitch_path, financial_path):
    # Phase 1 — extract
    pitch_text = extract_pdf(pitch_path)
    financial_text = extract_pdf(financial_path)
    
    # Phase 2 — build prompt and call Groq
    prompt = build_prompt(company_name, project_type, sector, stage, funding_amount, pitch_text, financial_text)
    raw = call_groq(prompt)
    result = parse_response(raw)
    benchmark_result = benchmark(sector, result)
    result.update(benchmark_result)   
    return result

def main():

    result0 = evaluate_startup(
    company_name="TechVenture",
    sector="Fintech",
    project_type="SaaS",
    stage="MVP",
    funding_amount="$50,000,000",
    pitch_path=r"C:\Users\Administrator\Downloads\pitch_deck.pdf",
    financial_path=r"C:\Users\Administrator\Downloads\financial_projection.pdf"
)   
    return result0