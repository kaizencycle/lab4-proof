import dynamic from "next/dynamic";

const ForestClient = dynamic(() => import("./ForestClient"), {
  ssr: false,
  loading: () => <div>Loading Forest...</div>
});

export default function Forest() {
  return <ForestClient />;
}