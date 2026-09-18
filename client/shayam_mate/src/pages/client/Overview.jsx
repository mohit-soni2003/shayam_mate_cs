import { useAuthStore } from "../../store/authStore";

const Overview = () => {
  const { user } = useAuthStore();

  return (
    <div>
      <h2>Welcome, {user?.full_name}</h2>
      <p className="text-muted">
        Your compliance calendar, documents and invoices will appear here once those modules are
        built.
      </p>
    </div>
  );
};

export default Overview;
