export const polycetPriorityTopics = {
  Maths: [
    "Linear Equations",
    "Quadratic Equations",
    "Trigonometry",
    "Applications of Trigonometry",
    "Arithmetic Progression",
    "Polynomials",
    "Probability",
    "Statistics",
    "Circles",
    "Similar Triangles",
    "Sets",
    "Logarithm"
  ],
  Physics: [
    "Electricity",
    "Heating Effect of Current",
    "Magnetism",
    "Reflection of Light",
    "Refraction",
    "Human Eye and Colourful World",
    "Sources of Energy",
    "Metallurgy"
  ],
  Chemistry: [
    "Carbon and its Compounds",
    "Acids Bases and Salts",
    "Atomic Structure",
    "Classification of Elements",
    "Redox Reactions",
    "States of Matter",
    "Equilibrium",
    "Polymers",
    "Nuclear Chemistry"
  ]
} as const;

export const tsrjcMpcSubjects = [
  { name: "English", marks: 50, weight: 2 },
  { name: "Mathematics", marks: 50, weight: 3 },
  { name: "Physical Science", marks: 50, weight: 2 }
] as const;

export const primaryTracks = [
  { label: "POLYCET", href: "/exam/polycet", note: "Maths first, Physics second, Chemistry third" },
  { label: "TSRJC/TGRJC MPC", href: "/exam/tgrjc/mpc", note: "English, Mathematics, Physical Science only" }
] as const;

export function getPolycetTopicQueue() {
  return [
    ...polycetPriorityTopics.Maths.map((topic) => ({ subject: "Maths", topic, priority: "High" as const })),
    ...polycetPriorityTopics.Physics.map((topic) => ({ subject: "Physics", topic, priority: "Medium" as const })),
    ...polycetPriorityTopics.Chemistry.map((topic) => ({ subject: "Chemistry", topic, priority: "Foundation" as const }))
  ];
}
