import { useAuthStore } from "../../store/authStore";

const Overview = () => {
  const { user } = useAuthStore();

  return (
    <div>
      <h2>Welcome, {user?.full_name}</h2>
      <p className="text-muted">
        Signed in as <strong>{user?.role}</strong>. Compliance calendar, signing queue and billing
        will appear here once those modules are built.
      </p>
    </div>
  );
};

export default Overview;
