import Layout from "@/components/Layout";
import ContentGrid from "@/components/ContentGrid";
import { useXtreamQuery } from "@/hooks/useXtream";
import { proxyImage } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const { data: movies, isLoading: loadingMovies } = useXtreamQuery("get_vod_streams");
  const { data: series, isLoading: loadingSeries } = useXtreamQuery("get_series");

  const movieItems = movies?.data?.slice(0, 15).map((m: any) => ({
    id: m.stream_id,
    title: m.name,
    imageUrl: proxyImage(m.stream_icon)
  })) || [];

  const seriesItems = series?.data?.slice(0, 15).map((s: any) => ({
    id: s.series_id,
    title: s.name,
    imageUrl: proxyImage(s.last_modified ? s.series_icon : s.cover)
  })) || [];

  return (
    <Layout>
      <div className="space-y-12">
        <section className="relative h-[40vh] rounded-3xl overflow-hidden bg-gradient-to-r from-zinc-950 to-zinc-900 border border-white/5 flex items-center p-12">
          <div className="z-10 max-w-2xl space-y-4">
            <h1 className="text-6xl font-black italic tracking-tighter">AURA <span className="text-primary not-italic">TV</span></h1>
            <p className="text-zinc-400 text-lg font-medium">Tu prueba de 36 horas está activa. Disfruta de todo el contenido en 4K y canales en vivo sin interrupciones.</p>
            <div className="flex gap-4">
               <button onClick={() => navigate('/live-tv')} className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform">VER TV EN VIVO</button>
               <button onClick={() => navigate('/movies')} className="bg-white/10 text-white px-8 py-3 rounded-xl font-bold hover:bg-white/20 transition-all">EXPLORAR CINE</button>
            </div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-primary/20 to-transparent opacity-50"></div>
        </section>

        {loadingMovies || loadingSeries ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <ContentGrid title="Estrenos en Cine" items={movieItems} />
            <ContentGrid title="Series del Momento" items={seriesItems} />
          </>
        )}
      </div>
    </Layout>
  );
};

export default Index;