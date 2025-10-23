// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import type { ModelingScenario } from "./types";

// Mock scenario for the mathematical modeling workflow MVP, based on 2024 MCM Problem B.
export const SUBMERSIBLE_SEARCH_SCENARIO: ModelingScenario = {
  id: "submersible-search-001",
  title: "Predictive Modeling and Search Strategy for a Lost Submersible",
  problemStatement: `
Maritime Cruises Mini-Submersibles (MCMS), a company based in Greece, builds submersibles capable of carrying humans to the deepest parts of the ocean. A submersible is moved to the location and deployed untethered from a host ship. MCMS now wishes to use their submersible to take tourists on adventures exploring the bottom of the Ionian Sea for sunken shipwrecks.

Before they can do this, however, they need to win approval from regulators by developing safety procedures in case of a loss of communication to the host ship and possible mechanical defects including a loss of propulsion of the submersible. In particular, they would like you to develop a model to predict the location of the submersible over time. Unlike in a typical search and rescue on land or on the surface of a sea, the defective submersible could potentially find itself positioned on the sea floor or at some point of neutral buoyancy underwater. Its position could further be affected by currents, differing densities in the sea, and/or the geography of the sea floor.

Your tasks are to:
- **Locate:** Develop a model(s) that predicts the location of the submersible over time. What are the uncertainties associated with these predictions? What information can the submersible periodically send to the host ship to decrease these uncertainties prior to an incident?
- **Prepare:** What, if any, additional search equipment would you recommend the company carry on the host ship to deploy if necessary?
- **Search:** Develop a model that will use information from your location model(s) to recommend initial points of deployment and search patterns for the equipment so as to minimize the time to location of a lost submersible. Determine the probability of finding the submersible as a function of time and accumulated search results.
- **Extrapolate:** How might your model be expanded to account for other tourist destinations such as the Caribbean Sea?
`,
  stage1: {
    extractedElements: {
      goal:
        "Develop a predictive model for a lost submersible's location over time and create an optimal search strategy to minimize rescue time and maximize the probability of discovery.",
      constraints: [
        "The submersible has lost propulsion and communication.",
        "The submersible's movement is passively dictated by environmental forces (currents, buoyancy, gravity).",
        "The submersible may be at a neutral buoyancy depth or on the sea floor.",
        "The search is conducted in the complex underwater environment of the Ionian Sea.",
        "Search resources (vessels, equipment) are limited and have associated costs and operational characteristics.",
      ],
      variables: [
        "Decision Variable: Submersible's position (x, y, z) as a function of time.",
        "Decision Variable: Optimal initial search points for rescue teams.",
        "Decision Variable: Dynamic search patterns for rescue equipment.",
        "Outcome Variable: Probability of finding the submersible as a function of time and search effort.",
      ],
    },
    initialAssumptions: [
      { id: "a1", text: "Upon failure, the submersible loses all propulsion and ability to control its buoyancy." },
      { id: "a2", text: "The submersible's mass and volume remain constant post-failure." },
      { id: "a3", text: "The initial state (position and velocity=0) at the time of incident is known." },
      { id: "a4", text: "Ocean currents, while complex, can be modeled and predicted using historical and real-time data (e.g., using time-series models like ARIMA)." },
      { id: "a5", text: "The sea floor topography is known and acts as a hard boundary for the submersible's movement." },
    ],
    strategies: [
      {
        id: "dynamic-bayesian",
        name: "Physics-Based Dynamic Modeling + Bayesian Search",
        description:
          "This hybrid approach first predicts the submersible's most likely trajectory using a dynamical model based on Newtonian mechanics, considering forces like gravity, buoyancy, drag, and ocean currents. It then creates a probabilistic search grid and uses Bayesian inference to update the probability of the submersible's location as search operations provide new information (i.e., ruling out searched areas).",
        pros: [
          "High fidelity, grounded in physical principles.",
          "Search strategy is adaptive and becomes more efficient over time.",
          "Quantifies uncertainty in predictions.",
        ],
        cons: [
          "Computationally intensive.",
          "Highly sensitive to the accuracy of environmental data (currents, density).",
          "Requires complex formulation and implementation.",
        ],
        flowchartSvg: `
\`\`\`svg
<svg width="220" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="200" height="30" rx="5" fill="#e0f2fe" stroke="#0369a1"/>
  <text x="110" y="30" text-anchor="middle" font-size="12" fill="#0369a1">Define Physical Forces</text>
  <line x1="110" y1="40" x2="110" y2="60" stroke="#0369a1" stroke-dasharray="2"/>
  <rect x="10" y="60" width="200" height="30" rx="5" fill="#e0f2fe" stroke="#0369a1"/>
  <text x="110" y="80" text-anchor="middle" font-size="12" fill="#0369a1">Simulate Trajectory (ODE Solver)</text>
  <line x1="110" y1="90" x2="110" y2="110" stroke="#0369a1" stroke-dasharray="2"/>
  <rect x="10" y="110" width="200" height="30" rx="5" fill="#fef3c7" stroke="#d97706"/>
  <text x="110" y="130" text-anchor="middle" font-size="12" fill="#d97706">Create Probabilistic Search Grid</text>
  <line x1="110" y1="140" x2="110" y2="160" stroke="#d97706" stroke-dasharray="2"/>
  <rect x="10" y="160" width="200" height="30" rx="5" fill="#ccfbf1" stroke="#047857"/>
  <text x="110" y="180" text-anchor="middle" font-size="12" fill="#047857">Update Grid with Bayesian Inference</text>
</svg>
\`\`\`
`,
      },
      {
        id: "monte-carlo",
        name: "Monte Carlo Simulation (Random Walk)",
        description:
          "A simpler, stochastic approach that models the submersible's movement as a random walk. It simulates thousands of possible trajectories based on a general drift direction (from average currents) and a degree of randomness (uncertainty). The final output is a probability heatmap of the submersible's location.",
        pros: ["Easier and faster to implement.", "Effectively captures the spread of uncertainty over time."],
        cons: [
          "Lacks physical realism; less accurate than a dynamics model.",
          "May overestimate the search area, reducing search efficiency.",
          "Search pattern is typically static, based on the initial heatmap.",
        ],
        flowchartSvg: `
\`\`\`svg
<svg width="200" height="150" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="180" height="30" rx="5" fill="#fef3c7" stroke="#d97706"/>
  <text x="100" y="30" text-anchor="middle" font-size="12" fill="#d97706">Define Drift &amp; Variance</text>
  <line x1="100" y1="40" x2="100" y2="60" stroke="#d97706" stroke-dasharray="2"/>
  <rect x="10" y="60" width="180" height="30" rx="5" fill="#fef3c7" stroke="#d97706"/>
  <text x="100" y="80" text-anchor="middle" font-size="12" fill="#d97706">Run N Random Walk Simulations</text>
  <line x1="100" y1="90" x2="100" y2="110" stroke="#d97706" stroke-dasharray="2"/>
  <rect x="10" y="110" width="180" height="30" rx="5" fill="#ccfbf1" stroke="#047857"/>
  <text x="100" y="130" text-anchor="middle" font-size="12" fill="#047857">Generate Probability Heatmap</text>
</svg>
\`\`\`
`,
      },
    ],
  },
  stage2: {
    models: {
      "dynamic-bayesian": {
        notationTable: [
          { symbol: "$\\vec{F}_{net}$", definition: "Net force vector on the submersible." },
          { symbol: "$\\vec{F}_G, \\vec{F}_B, \\vec{F}_R$", definition: "Forces of Gravity, Buoyancy, and Hydrodynamic Resistance." },
          { symbol: "$m, V$", definition: "Mass and Volume of the submersible." },
          { symbol: "$\\rho(\\vec{p})$", definition: "Seawater density at position $\\vec{p}$." },
          { symbol: "$\\vec{v}_s, \\vec{v}_c$", definition: "Velocity of the submersible and the ocean current." },
          { symbol: "$P(L_i | S_j)$", definition: "Posterior probability of the submersible being in grid cell $L_i$ given search result $S_j$." },
          { symbol: "$P(L_i)$", definition: "Prior probability of the submersible being in cell $L_i$, derived from the trajectory model and Poisson distribution." },
          { symbol: "$\\lambda$", definition: "Intensity parameter of the Poisson distribution, related to time and uncertainty." },
        ],
        formulationLatex: `
\\begin{aligned}
\\text{1. Trajectory Dynamics (Newton's Second Law):} \\\\
m \\frac{d\\vec{v}_s}{dt} &= \\vec{F}_{net} = \\vec{F}_G + \\vec{F}_B(\\vec{p}) + \\vec{F}_R(\\vec{v}_s, \\vec{v}_c, \\vec{p}) \\\\
\\text{where:} \\\\
\\vec{F}_G &= (0, 0, -mg) \\\\
\\vec{F}_B(\\vec{p}) &= (0, 0, \\rho(\\vec{p})gV) \\\\
\\vec{F}_R &= -\\frac{1}{2} C_d A \\rho(\\vec{p}) |\\vec{v}_s - \\vec{v}_c| (\\vec{v}_s - \\vec{v}_c) \\\\
\\\\
\\text{2. Search Probability (Bayesian Update):} \\\\
P(L_i | S_{\\neg j}) &= \\frac{P(S_{\\neg j} | L_i) P(L_i)}{P(S_{\\neg j})} \\\\
\\text{Given } S_{\\neg j} \\text{ is 'not found in cell j'}, P(S_{\\neg j} | L_i) = 1 \\text{ for } i \\neq j. \\\\
P(L_i | S_{\\neg j}) &= \\frac{P(L_i)}{1 - P(L_j)} \\quad (\\text{for } i \\neq j) \\\\
\\text{The prior probability } P(L_i) \\text{ is modeled using a Poisson distribution based on the predicted trajectory:} \\\\
P(L_i) &\\propto \\frac{e^{-\\lambda} \\lambda^k}{k!} \\text{, where } k \\text{ is the Manhattan distance from the predicted location.}
\\end{aligned}
`,
        implementationCode: `
import numpy as np
from scipy.integrate import solve_ivp

def submersible_dynamics(t, state, current_model, density_model):
    # state = [x, y, z, vx, vy, vz]
    pos = state[:3]
    vel = state[3:]
    
    # Get environmental data at current position
    current_vel = current_model.get_velocity(pos)
    density = density_model.get_density(pos)
    
    # Constants
    m = 25000  # mass in kg
    V = 24.5   # volume in m^3
    g = 9.81
    Cd = 0.8   # Drag coefficient
    A = 6.0    # Frontal area in m^2

    # Forces
    Fg = np.array([0, 0, -m * g])
    Fb = np.array([0, 0, density * g * V])
    v_relative = vel - current_vel
    Fr = -0.5 * Cd * A * density * np.linalg.norm(v_relative) * v_relative
    
    F_net = Fg + Fb + Fr
    
    # Check for sea floor collision
    # if pos[2] <= seafloor_depth(pos[0], pos[1]): ...
    
    ax, ay, az = F_net / m
    return [vel[0], vel[1], vel[2], ax, ay, az]

def update_probability_grid(grid, searched_cell_index):
    # Get probability of the searched cell
    p_searched = grid.flatten()[searched_cell_index]
    
    # Set searched cell probability to zero
    grid.flat[searched_cell_index] = 0
    
    # Renormalize the remaining probabilities
    if p_searched < 1.0:
        renormalization_factor = 1.0 / (1.0 - p_searched)
        grid *= renormalization_factor
        
    return grid

# Example Usage:
# sol = solve_ivp(submersible_dynamics, ...)
# prob_grid = create_poisson_grid(sol.y[:3, -1])
# prob_grid = update_probability_grid(prob_grid, ...)
`,
        parameters: [
          {
            id: "current_uncertainty_factor",
            name: "Ocean Current Uncertainty",
            type: "slider",
            defaultValue: 1.0,
            range: [1.0, 3.0],
            step: 0.25,
            description: "Multiplier for the random component of the ocean current model. Higher values lead to a wider spread of possible trajectories."
          },
        ],
        results: [
          {
            parameterSet: { current_uncertainty_factor: 1.0 },
            visualizationSvg: `
\`\`\`svg
<svg width="300" height="200" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
      <stop offset="0%" style="stop-color:rgb(255,0,0);stop-opacity:0.8" />
      <stop offset="100%" style="stop-color:rgb(255,255,0);stop-opacity:0" />
    </radialGradient>
  </defs>
  <path d="M 30,30 Q 100,80 200,120 T 260,130" stroke="#0ea5e9" stroke-width="2" fill="none" stroke-dasharray="4"/>
  <circle cx="30" cy="30" r="4" fill="#1d4ed8" />
  <text x="35" y="25" font-size="10">Start</text>
  <circle cx="260" cy="130" r="4" fill="#ef4444" />
  <text x="210" y="145" font-size="10">Predicted End (3h)</text>
  <ellipse cx="260" cy="130" rx="30" ry="20" fill="url(#grad1)" />
  <text x="150" y="20" font-size="12" fill="#333" text-anchor="middle">Low Uncertainty Trajectory</text>
</svg>
\`\`\`
`,
            analysisText:
              "With baseline ocean current data (Uncertainty Factor 1.0), the dynamical model predicts a relatively tight and well-defined trajectory. The resulting probability distribution for the search area is highly concentrated, allowing for an efficient search. The cumulative probability of discovery rises sharply in the initial hours.",
            keyMetrics: {
              "Predicted Location (3h)": "(10.34km, 5.55km, -4062m)",
              "Initial Search Area (95% CI)": "4.5 km²",
              "5h Search Success Probability": "88%",
            },
          },
          {
            parameterSet: { current_uncertainty_factor: 2.5 },
            visualizationSvg: `
\`\`\`svg
<svg width="300" height="200" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="grad2" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
      <stop offset="0%" style="stop-color:rgb(255,100,0);stop-opacity:0.6" />
      <stop offset="100%" style="stop-color:rgb(255,255,0);stop-opacity:0" />
    </radialGradient>
  </defs>
  <path d="M 30,30 Q 100,80 200,120 T 260,130" stroke="#9ca3af" stroke-width="2" fill="none" stroke-dasharray="4"/>
  <path d="M 30,30 Q 90,60 180,140 T 240,160" stroke="#e5e7eb" stroke-width="1" fill="none" stroke-dasharray="3"/>
  <path d="M 30,30 Q 110,90 220,100 T 280,110" stroke="#e5e7eb" stroke-width="1" fill="none" stroke-dasharray="3"/>
  <circle cx="30" cy="30" r="4" fill="#1d4ed8" />
  <text x="35" y="25" font-size="10">Start</text>
  <ellipse cx="245" cy="135" rx="80" ry="50" fill="url(#grad2)" />
  <text x="150" y="20" font-size="12" fill="#333" text-anchor="middle">High Uncertainty Trajectory Cone</text>
</svg>
\`\`\`
`,
            analysisText:
              "With a high uncertainty factor (2.5), the model generates a wide 'cone' of possible trajectories. The initial probability distribution is diffuse, covering a much larger area. This significantly reduces the efficiency of the initial search, and the cumulative probability of discovery grows much more slowly, highlighting the critical need for accurate environmental data.",
            keyMetrics: {
              "Predicted Location (3h)": "Center of probability mass",
              "Initial Search Area (95% CI)": "22.0 km²",
              "5h Search Success Probability": "45%",
            },
          },
        ],
      },
      "monte-carlo": {
        notationTable: [],
        formulationLatex: "Monte Carlo approach details omitted.",
        implementationCode: "# Monte Carlo implementation omitted.",
        parameters: [],
        results: [],
      },
    },
  },
  stage3: {
    reportMarkdown: `
# Predictive Modeling and Search Strategy for a Lost Submersible

## 1. Introduction
This report details a safety procedure for Maritime Cruises Mini-Submersibles (MCMS) in the event of a lost submersible in the Ionian Sea. The core of this procedure is a robust mathematical model designed to predict the submersible's location over time and optimize the subsequent search and rescue operation, thereby minimizing time-to-discovery and maximizing safety.

## 2. Problem Analysis and Assumptions
The problem is a complex interplay of underwater dynamics and search theory. We have decomposed it into two main components: trajectory prediction and adaptive search planning.

**Key Assumptions:**
- The submersible is a passive agent after failure, with no propulsion.
- The submersible's physical properties (mass, volume) are constant.
- The failure's initial time and location are known.
- Environmental data (currents, density, bathymetry) are available and can be modeled.

## 3. Model Formulation (Dynamic-Bayesian Approach)
We adopted a high-fidelity, physics-based model combined with an intelligent, adaptive search strategy to ensure the best possible outcome.

### Notation
| Symbol | Definition |
|--------|------------|
| $\\vec{F}_{net}$ | Net force vector on the submersible. |
| $\\vec{F}_G, \\vec{F}_B, \\vec{F}_R$ | Forces of Gravity, Buoyancy, and Hydrodynamic Resistance. |
| $m, V$ | Mass and Volume of the submersible. |
| $\\rho(\\vec{p})$ | Seawater density at position $\\vec{p}$. |
| $\\vec{v}_s, \\vec{v}_c$ | Velocity of the submersible and the ocean current. |
| $P(L_i | S_j)$ | Posterior probability of the submersible being in grid cell $L_i$ given search result $S_j$. |
| $P(L_i)$ | Prior probability of the submersible being in cell $L_i$. |

### Mathematical Model
The model is comprised of two core components:

**1. Trajectory Dynamics (Newton's Second Law):**
$$
\\begin{aligned}
m \\frac{d\\vec{v}_s}{dt} &= \\vec{F}_{net} = \\vec{F}_G + \\vec{F}_B(\\vec{p}) + \\vec{F}_R(\\vec{v}_s, \\vec{v}_c, \\vec{p}) \\\\
\\end{aligned}
$$
This system of ordinary differential equations is solved numerically to predict the submersible's path.

**2. Search Probability (Bayesian Update):**
The search area is rasterized into a grid. The initial probability of the submersible's location in each cell is derived from the trajectory model's output. As cells are searched and found empty, their probability is set to zero, and the probabilities of all other cells are increased proportionally using Bayes' theorem.
$$
P(L_i | S_{\\neg j}) = \\frac{P(L_i)}{1 - P(L_j)} \\quad (\\text{for } i \\neq j)
$$

## 4. Results and Sensitivity Analysis
We analyzed the model's performance under different levels of uncertainty in the ocean current data, a key environmental factor.

### Baseline Scenario (Low Current Uncertainty)
With low uncertainty, the model predicts a clear trajectory. The search area is small and well-defined, leading to a high probability of rapid success.

\`\`\`svg
<svg width="300" height="200" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
      <stop offset="0%" style="stop-color:rgb(255,0,0);stop-opacity:0.8" />
      <stop offset="100%" style="stop-color:rgb(255,255,0);stop-opacity:0" />
    </radialGradient>
  </defs>
  <path d="M 30,30 Q 100,80 200,120 T 260,130" stroke="#0ea5e9" stroke-width="2" fill="none" stroke-dasharray="4"/>
  <circle cx="30" cy="30" r="4" fill="#1d4ed8" />
  <text x="35" y="25" font-size="10">Start</text>
  <circle cx="260" cy="130" r="4" fill="#ef4444" />
  <text x="210" y="145" font-size="10">Predicted End (3h)</text>
  <ellipse cx="260" cy="130" rx="30" ry="20" fill="url(#grad1)" />
  <text x="150" y="20" font-size="12" fill="#333" text-anchor="middle">Low Uncertainty Trajectory</text>
</svg>
\`\`\`

*   **Analysis:** The search can be concentrated in a 4.5 km² area, with an estimated 88% chance of finding the submersible within 5 hours.

### High Uncertainty Scenario
When the ocean current data is less reliable, the model's predictive power diminishes, resulting in a much larger area of uncertainty.

\`\`\`svg
<svg width="300" height="200" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="grad2" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
      <stop offset="0%" style="stop-color:rgb(255,100,0);stop-opacity:0.6" />
      <stop offset="100%" style="stop-color:rgb(255,255,0);stop-opacity:0" />
    </radialGradient>
  </defs>
  <path d="M 30,30 Q 100,80 200,120 T 260,130" stroke="#9ca3af" stroke-width="2" fill="none" stroke-dasharray="4"/>
  <path d="M 30,30 Q 90,60 180,140 T 240,160" stroke="#e5e7eb" stroke-width="1" fill="none" stroke-dasharray="3"/>
  <path d="M 30,30 Q 110,90 220,100 T 280,110" stroke="#e5e7eb" stroke-width="1" fill="none" stroke-dasharray="3"/>
  <circle cx="30" cy="30" r="4" fill="#1d4ed8" />
  <text x="35" y="25" font-size="10">Start</text>
  <ellipse cx="245" cy="135" rx="80" ry="50" fill="url(#grad2)" />
  <text x="150" y="20" font-size="12" fill="#333" text-anchor="middle">High Uncertainty Trajectory Cone</text>
</svg>
\`\`\`

*   **Analysis:** The search area expands to over 22 km², and the 5-hour success probability drops to 45%. This drastically increases the time and resources required for a successful rescue.

## 5. Conclusion
Our model provides a powerful, data-driven framework for handling a lost submersible incident. The sensitivity analysis underscores a critical operational recommendation: **invest in high-quality, real-time environmental monitoring equipment**. The submersible should be equipped with sensors (like ADCP and CTD) to periodically transmit local current and density data to the host ship. This data will dramatically reduce the uncertainty in our predictive model, shrinking the search area and significantly increasing the chances of a swift and successful rescue.
`,
    summaries: [
      {
        id: "s1",
        text: "We developed a two-part model for locating a lost submersible and optimizing the search. A Newtonian dynamics model predicts the trajectory based on physical forces, while a Bayesian search model adaptively refines the search area. Sensitivity analysis shows that the model's effectiveness is critically dependent on the quality of ocean current data, highlighting the need for advanced onboard sensors.",
      },
      {
        id: "s2",
        text: "This study presents a safety framework for submersible tourism. By simulating the underwater drift of a disabled submersible with a physics-based model, we generate a probability map for its location. This map guides an adaptive search strategy using Bayesian updates, which directs rescue assets to the highest probability areas. The results prove that minimizing environmental data uncertainty is the single most important factor for reducing rescue time.",
      },
    ],
  },
};