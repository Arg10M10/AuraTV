import Layout from "@/components/Layout";
import ContentGrid from "@/components/ContentGrid";
import { movies, series, liveChannels } from "@/data/mock";

const Index = () => {
  return (
    <Layout>
      <ContentGrid title="Películas Populares" items={movies} />
      <ContentGrid title="Series Recomendadas" items={series} />
      <ContentGrid title="Canales en Vivo" items={liveChannels} />
    </Layout>
  );
};

export default Index;