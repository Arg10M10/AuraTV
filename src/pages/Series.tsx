import Layout from "@/components/Layout";
import ContentGrid from "@/components/ContentGrid";
import { series } from "@/data/mock";

const Series = () => {
  return (
    <Layout>
      <ContentGrid title="Series" items={series} />
    </Layout>
  );
};

export default Series;