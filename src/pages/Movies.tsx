import Layout from "@/components/Layout";
import ContentGrid from "@/components/ContentGrid";
import { movies } from "@/data/mock";

const Movies = () => {
  return (
    <Layout>
      <ContentGrid title="Películas" items={movies} />
    </Layout>
  );
};

export default Movies;