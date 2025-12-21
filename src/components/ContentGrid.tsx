import ContentCard from "./ContentCard";

interface ContentItem {
  id: number;
  title: string;
  imageUrl: string;
}

interface ContentGridProps {
  title: string;
  items: ContentItem[];
}

const ContentGrid = ({ title, items }: ContentGridProps) => {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-4 text-left">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {items.map((item) => (
          <ContentCard key={item.id} title={item.title} imageUrl={item.imageUrl} />
        ))}
      </div>
    </section>
  );
};

export default ContentGrid;