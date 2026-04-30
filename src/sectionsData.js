export const designBriefFields = [
  { id: "db_product", label: "Product / Project Title", placeholder: "e.g. Modular office chair", multiline: false },
  { id: "db_client", label: "Client / Company", placeholder: "Who is commissioning this design?", multiline: false },
  { id: "db_target", label: "Target User Group", placeholder: "Who is this product for?", multiline: true },
  { id: "db_market", label: "Market Context", placeholder: "Market segment, geography, competition...", multiline: true },
  { id: "db_problem", label: "Problem Statement", placeholder: "What problem does this product solve?", multiline: true },
  { id: "db_objectives", label: "Design Objectives", placeholder: "Key objectives the design must achieve...", multiline: true },
  { id: "db_constraints", label: "Constraints (cost, timeline, regulatory, technical)", placeholder: "Budget, deadlines, standards, technical limits...", multiline: true },
  { id: "db_sustainability", label: "Sustainability Ambitions", placeholder: "Environmental goals (e.g. CO2 reduction targets, circularity, certifications)...", multiline: true },
  { id: "db_success", label: "Success Criteria", placeholder: "How will success be measured?", multiline: true },
];

export const needAnalysisFields = [
  { id: "na_primary", label: "Primary User Needs", placeholder: "What does the user fundamentally need?", multiline: true },
  { id: "na_secondary", label: "Secondary / Latent Needs", placeholder: "Unstated, emotional, or contextual needs...", multiline: true },
  { id: "na_stakeholders", label: "Stakeholder Needs", placeholder: "Manufacturer, retailer, recycler, regulator...", multiline: true },
  { id: "na_environmental", label: "Environmental / Societal Needs", placeholder: "Wider needs the product must address (climate, resource scarcity, equity)...", multiline: true },
  { id: "na_painpoints", label: "Current Pain Points", placeholder: "What fails in existing solutions?", multiline: true },
  { id: "na_research", label: "Research Methods Used", placeholder: "Interviews, surveys, observation, literature review...", multiline: true },
  { id: "na_priorities", label: "Prioritised Need List", placeholder: "Top 3-5 needs in order of importance...", multiline: true },
];

export const functionDefinitionFields = [
  { id: "fd_main", label: "Main Function (verb + object)", placeholder: "e.g. Support seated person", multiline: false },
  { id: "fd_sub", label: "Sub-Functions", placeholder: "List supporting functions, one per line...", multiline: true },
  { id: "fd_aux", label: "Auxiliary / Supporting Functions", placeholder: "Functions that enable but don't define the product...", multiline: true },
  { id: "fd_unwanted", label: "Unwanted Functions / Side Effects", placeholder: "Things to minimise (waste heat, noise, emissions)...", multiline: true },
  { id: "fd_performance", label: "Performance Requirements", placeholder: "Quantitative targets (load, lifespan, efficiency)...", multiline: true },
  { id: "fd_boundaries", label: "System Boundaries", placeholder: "What is in/out of scope for the product system?", multiline: true },
  { id: "fd_interfaces", label: "Interfaces with Other Systems", placeholder: "Power source, network, accessories, infrastructure...", multiline: true },
];

export const newConceptFields = [
  { id: "nc_summary", label: "Concept Name & One-Line Summary", placeholder: "Concept name and a single-sentence pitch...", multiline: false },
  { id: "nc_description", label: "Full Concept Description", placeholder: "Describe the proposed product/service in detail — form, function, materials, behaviour...", multiline: true },
  { id: "nc_principle", label: "Working Principle", placeholder: "How does it work technically?", multiline: true },
  { id: "nc_materials", label: "Key Materials & Components", placeholder: "List principal materials and components...", multiline: true },
  { id: "nc_lifecycle", label: "Lifecycle Scenario", placeholder: "Production → distribution → use → end-of-life flow...", multiline: true },
  { id: "nc_eco_strategies", label: "Eco-Design Strategies Applied", placeholder: "Which Brezet strategies (1-8) does this concept embody, and how?", multiline: true },
  { id: "nc_benefits", label: "Environmental Benefits", placeholder: "Quantified or qualitative improvements vs. baseline...", multiline: true },
  { id: "nc_tradeoffs", label: "Trade-offs & Open Questions", placeholder: "What is sacrificed? What still needs validation?", multiline: true },
  { id: "nc_next", label: "Next Steps", placeholder: "Prototyping, testing, stakeholder review...", multiline: true },
];
