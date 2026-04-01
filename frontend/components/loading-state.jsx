import Loader from "@/components/ui/loader";

export default function LoadingState({ label = "Loading..." }) {
  return <Loader label={label} />;
}
