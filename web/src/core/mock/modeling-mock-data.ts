// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import type { ModelingScenario } from "./types";

// Mock scenario for the mathematical modeling workflow MVP.
export const DISTRIBUTION_CENTER_SCENARIO: ModelingScenario = {
  id: "dist-center-001",
  title: "Optimal Location for a Distribution Center",
  problemStatement: `
A logistics company needs to optimize its distribution network in a region comprising 5 major cities (A, B, C, D, E). The goal is to determine the optimal location(s) to build new distribution centers (DCs) to minimize the total operational costs, which include fixed costs for opening a DC and variable transportation costs to satisfy the demand of all cities.

Key Data Provided:
- Monthly demand for each city.
- Fixed cost to open a DC in each potential location.
- Transportation cost per unit between every pair of cities.

The company must satisfy 100% of the demand.
`,
  stage1: {
    extractedElements: {
      goal:
        "Minimize the total operational costs (fixed DC costs + variable transportation costs).",
      constraints: [
        "100% of demand for all cities must be satisfied.",
        "Supply cannot exceed the capacity of opened DCs (assuming unlimited capacity for this MVP).",
        "A city can only be supplied by an opened DC.",
      ],
      variables: [
        "Decision Variable: Which locations to open DCs in (Binary).",
        "Decision Variable: How much product to ship from opened DCs to each city (Continuous/Integer).",
      ],
    },
    initialAssumptions: [
      { id: "a1", text: "Transportation costs are linear and symmetric between cities." },
      { id: "a2", text: "Distribution centers have unlimited capacity once opened." },
      { id: "a3", text: "Demand is deterministic and known in advance." },
      { id: "a4", text: "All potential DC locations are viable options." },
    ],
    strategies: [
      {
        id: "milp",
        name: "Mixed-Integer Linear Programming (MILP)",
        description:
          "A mathematical optimization approach that guarantees finding the global optimum solution by formulating the problem as a set of linear equations with integer constraints.",
        pros: [
          "Guarantees global optimality.",
          "Handles complex constraints well.",
        ],
        cons: [
          "Can be computationally expensive for large datasets.",
          "Requires precise linear formulation.",
        ],
        flowchartSvg: `
\`\`\`svg
<svg width="200" height="150" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="180" height="30" rx="5" fill="#e0f2fe" stroke="#0369a1"/>
  <text x="100" y="30" text-anchor="middle" font-size="12" fill="#0369a1">Define Decision Variables</text>
  <line x1="100" y1="40" x2="100" y2="60" stroke="#0369a1" stroke-dasharray="2"/>
  <rect x="10" y="60" width="180" height="30" rx="5" fill="#e0f2fe" stroke="#0369a1"/>
  <text x="100" y="80" text-anchor="middle" font-size="12" fill="#0369a1">Formulate Objective Function</text>
  <line x1="100" y1="90" x2="100" y2="110" stroke="#0369a1" stroke-dasharray="2"/>
  <rect x="10" y="110" width="180" height="30" rx="5" fill="#ccfbf1" stroke="#047857"/>
  <text x="100" y="130" text-anchor="middle" font-size="12" fill="#047857">Solve using MILP Solver</text>
</svg>
\`\`\`
`,
      },
      {
        id: "heuristic",
        name: "Heuristic Algorithm (Greedy Search)",
        description:
          "A practical approach that finds a good, but not necessarily optimal, solution quickly. It makes locally optimal choices at each stage.",
        pros: ["Fast and computationally efficient.", "Easier to implement."],
        cons: [
          "Does not guarantee global optimality.",
          "Solution quality depends heavily on the initial state.",
        ],
        flowchartSvg: `
\`\`\`svg
<svg width="200" height="150" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="180" height="30" rx="5" fill="#fef3c7" stroke="#d97706"/>
  <text x="100" y="30" text-anchor="middle" font-size="12" fill="#d97706">Initialize Solution (e.g., Open All)</text>
  <line x1="100" y1="40" x2="100" y2="60" stroke="#d97706" stroke-dasharray="2"/>
  <rect x="10" y="60" width="180" height="30" rx="5" fill="#fef3c7" stroke="#d97706"/>
  <text x="100" y="80" text-anchor="middle" font-size="12" fill="#d97706">Iteratively Improve (Greedy)</text>
  <line x1="100" y1="90" x2="100" y2="110" stroke="#d97706" stroke-dasharray="2"/>
  <rect x="10" y="110" width="180" height="30" rx="5" fill="#ccfbf1" stroke="#047857"/>
  <text x="100" y="130" text-anchor="middle" font-size="12" fill="#047857">Evaluate Final Cost</text>
</svg>
\`\`\`
`,
      },
    ],
  },
  stage2: {
    models: {
      milp: {
        notationTable: [
          { symbol: "$I$", definition: "Set of potential distribution center locations (indices $i$)." },
          { symbol: "$J$", definition: "Set of customer cities (indices $j$)." },
          { symbol: "$f_i$", definition: "Fixed cost of opening a DC at location $i$." },
          { symbol: "$c_{ij}$", definition: "Transportation cost per unit from DC $i$ to city $j$." },
          { symbol: "$d_j$", definition: "Demand of city $j$." },
          { symbol: "$y_i$", definition: "Binary decision variable: 1 if DC $i$ is opened, 0 otherwise." },
          { symbol: "$x_{ij}$", definition: "Amount shipped from DC $i$ to city $j$." },
        ],
        formulationLatex: `
\\begin{aligned}
\\text{Minimize } Z &= \\sum_{i \\in I} f_i y_i + \\sum_{i \\in I} \\sum_{j \\in J} c_{ij} x_{ij} \\\\
\\text{Subject to:} \\\\
\\sum_{i \\in I} x_{ij} &= d_j, \\quad \\forall j \\in J \\quad (\\text{Demand satisfaction}) \\\\
x_{ij} &\\leq M y_i, \\quad \\forall i \\in I, j \\in J \\quad (\\text{Linking constraint, M is a large number}) \\\\
y_i &\\in \\{0, 1\\}, \\quad \\forall i \\in I \\\\
x_{ij} &\\geq 0, \\quad \\forall i \\in I, j \\in J
\\end{aligned}
`,
        implementationCode: `
import pulp

def solve_facility_location(I, J, f, c, d, cost_multiplier=1.0):
    # Initialize the problem
    prob = pulp.LpProblem("FacilityLocation", pulp.LpMinimize)

    # Decision Variables
    y = pulp.LpVariable.dicts("Open", I, cat=pulp.LpBinary)
    x = pulp.LpVariable.dicts("Ship", (I, J), lowBound=0, cat=pulp.LpContinuous)

    # Apply cost multiplier (example adjustment)
    # c_adj = ...

    # Objective Function
    # prob += (pulp.lpSum(...) + pulp.lpSum(...))

    # Constraints
    # ... (implementation details) ...

    # Solve the problem
    prob.solve()

    # Output results
    results = {
        "total_cost": pulp.value(prob.objective),
        "opened_dcs": [i for i in I if y[i].varValue > 0.5]
    }
    return results

# Example Usage (Mock Data)
# ...
`,
        parameters: [
          {
            id: "cost_multiplier",
            name: "Transportation Cost Multiplier",
            type: "slider",
            defaultValue: 1.0,
            range: [0.5, 2.0],
            step: 0.1,
          },
        ],
        results: [
          {
            parameterSet: { cost_multiplier: 1.0 },
            visualizationSvg: `
\`\`\`svg
<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
  <text x="20" y="40" font-size="14">A</text>
  <text x="150" y="40" font-size="14">B</text>
  <text x="100" y="100" font-size="14">C (DC)</text>
  <circle cx="105" cy="105" r="15" fill="#10b981" stroke="#047857" stroke-width="2"/>
  <text x="50" y="160" font-size="14">D</text>
  <text x="250" y="140" font-size="14">E</text>
  <line x1="105" y1="105" x2="25" y2="45" stroke="#9ca3af" stroke-dasharray="4"/>
  <line x1="105" y1="105" x2="155" y2="45" stroke="#9ca3af" stroke-dasharray="4"/>
  <line x1="105" y1="105" x2="55" y2="165" stroke="#9ca3af" stroke-dasharray="4"/>
  <line x1="105" y1="105" x2="255" y2="145" stroke="#9ca3af" stroke-dasharray="4"/>
</svg>
\`\`\`
`,
            analysisText:
              "With the standard transportation costs (Multiplier 1.0), the optimal strategy is to open a single Distribution Center in City C. This central location minimizes the combined fixed and variable costs, resulting in a total cost of $15,200/month.",
            keyMetrics: {
              "Total Cost": "$15,200",
              "DCs Opened": 1,
              "Optimal Location": "City C",
            },
          },
          {
            parameterSet: { cost_multiplier: 1.8 },
            visualizationSvg: `
\`\`\`svg
<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
  <text x="20" y="40" font-size="14">A</text>
  <text x="150" y="40" font-size="14">B (DC)</text>
  <circle cx="155" cy="45" r="15" fill="#10b981" stroke="#047857" stroke-width="2"/>
  <text x="100" y="100" font-size="14">C</text>
  <text x="50" y="160" font-size="14">D</text>
  <text x="250" y="140" font-size="14">E</text>
  <line x1="155" y1="45" x2="25" y2="45" stroke="#9ca3af" stroke-dasharray="4"/>
  <line x1="155" y1="45" x2="105" y2="105" stroke="#9ca3af" stroke-dasharray="4"/>
  <line x1="155" y1="45" x2="55" y2="165" stroke="#9ca3af" stroke-dasharray="4"/>
  <line x1="155" y1="45" x2="255" y2="145" stroke="#9ca3af" stroke-dasharray="4"/>
</svg>
\`\`\`
`,
            analysisText:
              "When the transportation costs are significantly increased (Multiplier 1.8), the model favors reducing travel distance over minimizing fixed costs. The optimal strategy shifts to opening a DC in City B, which is closer to the high-demand areas E. The total cost increases to $21,500/month.",
            keyMetrics: {
              "Total Cost": "$21,500",
              "DCs Opened": 1,
              "Optimal Location": "City B",
            },
          },
        ],
      },
      heuristic: {
        notationTable: [],
        formulationLatex: "Heuristic approach details omitted.",
        implementationCode: "# Heuristic implementation omitted.",
        parameters: [],
        results: [],
      },
    },
  },
  stage3: {
    reportMarkdown: `
# Optimal Distribution Center Location Analysis

## 1. Introduction
This report analyzes the logistics network optimization problem for a company operating in 5 major cities. The objective is to determine the optimal locations for new distribution centers (DCs) to minimize total operational costs while satisfying all demands.

## 2. Problem Analysis and Assumptions
We identified the core problem as a Facility Location Problem. 

**Assumptions:**
- Transportation costs are linear and symmetric between cities.
- Distribution centers have unlimited capacity once opened.
- Demand is deterministic and known in advance.
- All potential DC locations are viable options.

## 3. Model Formulation (MILP Approach)
We adopted a Mixed-Integer Linear Programming (MILP) approach to ensure global optimality.

### Notation
| Symbol | Definition |
|--------|------------|
| $I$ | Set of potential distribution center locations (indices $i$). |
| $J$ | Set of customer cities (indices $j$). |
| $f_i$ | Fixed cost of opening a DC at location $i$. |
| $c_{ij}$ | Transportation cost per unit from DC $i$ to city $j$. |
| $d_j$ | Demand of city $j$. |
| $y_i$ | Binary decision variable: 1 if DC $i$ is opened, 0 otherwise. |
| $x_{ij}$ | Amount shipped from DC $i$ to city $j$. |

### Mathematical Model
$$
\\begin{aligned}
\\text{Minimize } Z &= \\sum_{i \\in I} f_i y_i + \\sum_{i \\in I} \\sum_{j \\in J} c_{ij} x_{ij} \\\\
\\text{Subject to:} \\\\
\\sum_{i \\in I} x_{ij} &= d_j, \\quad \\forall j \\in J \\quad (\\text{Demand satisfaction}) \\\\
x_{ij} &\\leq M y_i, \\quad \\forall i \\in I, j \\in J \\quad (\\text{Linking constraint, M is a large number}) \\\\
y_i &\\in \\{0, 1\\}, \\quad \\forall i \\in I \\\\
x_{ij} &\\geq 0, \\quad \\forall i \\in I, j \\in J
\\end{aligned}
$$

## 4. Results and Sensitivity Analysis
We analyzed the model under varying transportation costs.

### Baseline Scenario (Cost Multiplier 1.0)
With the standard transportation costs (Multiplier 1.0), the optimal strategy is to open a single Distribution Center in City C. This central location minimizes the combined fixed and variable costs, resulting in a total cost of $15,200/month.

\`\`\`svg
<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
  <text x="20" y="40" font-size="14">A</text>
  <text x="150" y="40" font-size="14">B</text>
  <text x="100" y="100" font-size="14">C (DC)</text>
  <circle cx="105" cy="105" r="15" fill="#10b981" stroke="#047857" stroke-width="2"/>
  <text x="50" y="160" font-size="14">D</text>
  <text x="250" y="140" font-size="14">E</text>
  <line x1="105" y1="105" x2="25" y2="45" stroke="#9ca3af" stroke-dasharray="4"/>
  <line x1="105" y1="105" x2="155" y2="45" stroke="#9ca3af" stroke-dasharray="4"/>
  <line x1="105" y1="105" x2="55" y2="165" stroke="#9ca3af" stroke-dasharray="4"/>
  <line x1="105" y1="105" x2="255" y2="145" stroke="#9ca3af" stroke-dasharray="4"/>
</svg>
\`\`\`

### High Transportation Cost Scenario (Cost Multiplier 1.8)
When the transportation costs are significantly increased (Multiplier 1.8), the model favors reducing travel distance over minimizing fixed costs. The optimal strategy shifts to opening a DC in City B, which is closer to the high-demand areas E. The total cost increases to $21,500/month.

\`\`\`svg
<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
  <text x="20" y="40" font-size="14">A</text>
  <text x="150" y="40" font-size="14">B (DC)</text>
  <circle cx="155" cy="45" r="15" fill="#10b981" stroke="#047857" stroke-width="2"/>
  <text x="100" y="100" font-size="14">C</text>
  <text x="50" y="160" font-size="14">D</text>
  <text x="250" y="140" font-size="14">E</text>
  <line x1="155" y1="45" x2="25" y2="45" stroke="#9ca3af" stroke-dasharray="4"/>
  <line x1="155" y1="45" x2="105" y2="105" stroke="#9ca3af" stroke-dasharray="4"/>
  <line x1="155" y1="45" x2="55" y2="165" stroke="#9ca3af" stroke-dasharray="4"/>
  <line x1="155" y1="45" x2="255" y2="145" stroke="#9ca3af" stroke-dasharray="4"/>
</svg>
\`\`\`

## 5. Conclusion
The MILP model provides a robust framework for optimizing the distribution network. The optimal location is highly sensitive to transportation costs. We recommend implementing the solution based on the baseline scenario (City C) but remaining agile to market fluctuations in transportation pricing.
`,
    summaries: [
      {
        id: "s1",
        text: "This study optimizes a 5-city logistics network using Mixed-Integer Linear Programming (MILP) to minimize total costs. We formulated the facility location problem and conducted sensitivity analysis on transportation costs. Results show City C is optimal under baseline conditions, but the solution shifts if costs increase significantly. The model provides a data-driven strategy for DC placement.",
      },
      {
        id: "s2",
        text: "We developed an optimization model for determining the best locations for distribution centers in a regional network. By employing MILP, we guarantee a globally optimal solution. The analysis highlights the trade-off between fixed setup costs and variable transportation expenses. Sensitivity analysis reveals critical thresholds where the optimal configuration changes, emphasizing the need for adaptive logistics planning.",
      },
    ],
  },
};
