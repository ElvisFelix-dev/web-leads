import PropertiesCard from "./PropertiesCard";

export default function PropertiesSection({ region, properties }) {
  return (
    <section className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">{region}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map(property => (
          <PropertiesCard key={property._id} property={property} />
        ))}
      </div>
    </section>
  );
}
