export default function Dashboard() {
  return (
    <div>
      {[...Array(100).keys()].map((i) => (
        <div>Dashboard</div>
      ))}
    </div>
  );
}
