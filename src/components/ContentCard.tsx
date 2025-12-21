interface ContentCardProps {
  title: string;
  imageUrl: string;
}

const ContentCard = ({ title, imageUrl }: ContentCardProps) => {
  return (
    <div className="group cursor-pointer">
      <div className="aspect-[2/3] w-full overflow-hidden rounded-lg bg-muted">
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <h3 className="mt-2 text-sm font-medium text-foreground">{title}</h3>
    </div>
  );
};

export default ContentCard;