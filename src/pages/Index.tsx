import Layout from "@/components/Layout";
import ContentGrid from "@/components/ContentGrid";
import { useXtreamQuery } from "@/hooks/useXtream";
import { proxyImage } from "@/lib/utils";
import { Loader2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();
  const { data: movies, isLoading: loadingMovies, error: moviesError } = useXtreamQuery("get_vod_streams");
  const { data: series, isLoading: loadingSeries, error: seriesError } = useXtreamQuery("get_series");

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

  const hasError = moviesError || seriesError;

  return (
    <Layout>
      <div className="space-y-12">
        <section className="relative h-[40vh] rounded-3xl overflow-hidden bg-gradient-to-r from-zinc-950 to-zinc-900 border border-white/5 flex items-center p-12">
          <div className="z-10 max-w-2xl space-y-4">
            <h1 className="text-6xl font-black italic tracking-tighter">AURA <span className="text-primary not-italic">TV</span></h1>
            <p className="text-zinc-400 text-lg font-medium">Tu prueba de 36 horas está activa. Disfruta de todo el contenido en 4K y canales en vivo sin interrupciones.</p>
            <div className="flex gap-4">
               <Button onClick={() => navigate('/live-tv')} className="bg-primary text-primary-foreground px-8 py-6 rounded-xl font-bold hover:scale-105 transition-transform text-lg">VER TV EN VIVO</Button>
               <Button onClick={() => navigate('/movies')} variant="outline" className="bg-white/10 text-white px-8 py-6 rounded-xl font-bold hover:bg-white/20 transition-all text-lg border-white/10">EXPLORAR CINE</Button>
            </div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-primary/20 to-transparent opacity-50"></div>
        </section>

        {loadingMovies || loadingSeries ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Sincronizando catálogo...</p>
          </div>
        ) : hasError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white/5 rounded-3xl border border-white/5">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div className="space-y-1">
              <h2 className="text-xl font-bold">Error de Conexión</h2>
              <p className="text-zinc-400 max-w-md mx-auto">No pudimos conectar con el servidor de Aura TV. Por favor, verifica tu conexión a internet.</p>
            </div>
            <Button onClick={() => window.location.reload()} variant="outline">Reintentar Conexión</Button>
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