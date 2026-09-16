import { AboutProcessList } from "@/components/AboutProcessList";

const expertiseColumns = [
  {
    id: "competence",
    title: "Competence",
    items: [
      "China Sourcing Specialist",
      "Procurement Specialist",
      "Manufacturing Consultant",
      "Product Development Specialist",
      "Supplier Management",
      "Quality Control Specialist",
      "Factory Audit",
      "Custom Packaging Development",
      "China Representative",
    ],
  },
  {
    id: "product-categories",
    title: "Product Categories",
    items: [
      "Collectibles",
      "Licensed Products",
      "Gift Sets",
      "Promotional Items",
      "Custom Consumer Products",
    ],
  },
  {
    id: "process",
    title: "Process",
    items: [
      "Embossing",
      "Creasing",
      "Foil Stamping",
      "Digital Printing",
      "Laser Engraving",
      "Laser Cutting",
      "CNC Machining",
      "Electroplating",
      "Injection Molding",
      "Spray Coating",
      "Embroidery",
    ],
  },
  {
    id: "material",
    title: "Material",
    items: [
      "Wood",
      "Leather",
      "Metal",
      "Resin",
      "Fabric",
      "Paper",
      "EVA",
      "Foam",
      "ABS",
      "Plastic",
    ],
  },
] as const;

export function AboutExpertise() {
  return (
    <section
      id="expertise"
      className="about-boua__expertise about-boua__container"
      aria-labelledby="about-expertise-heading"
    >
      <div className="about-boua__expertise-grid">
        <div className="about-boua__rail">
          <h2
            id="about-expertise-heading"
            className="about-boua__label about-boua__sticky"
          >
            Expertise
          </h2>
        </div>
        <div className="about-boua__expertise-cols">
          {expertiseColumns.map((column) => (
            <div key={column.id} className="about-boua__expertise-col">
              <h3 className="about-boua__expertise-col-title">{column.title}</h3>
              {column.id === "process" ? (
                <AboutProcessList items={column.items} />
              ) : (
                <ul className="about-boua__expertise-list">
                  {column.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
