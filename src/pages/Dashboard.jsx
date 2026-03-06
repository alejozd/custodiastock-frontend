import { Card } from "primereact/card";

const stats = [
  { title: "Active Users", value: "128", icon: "pi pi-users" },
  { title: "Products", value: "542", icon: "pi pi-box" },
  { title: "Open Deliveries", value: "34", icon: "pi pi-truck" },
];

function Dashboard() {
  return (
    <div className="flex flex-column gap-4">
      <div>
        <h1 className="text-900 mt-0 mb-2 text-2xl">Dashboard</h1>
        <p className="text-600 m-0">Welcome to CustodiaStock management panel.</p>
      </div>

      <div className="grid">
        {stats.map((stat) => (
          <div className="col-12 md:col-4" key={stat.title}>
            <Card className="h-full">
              <div className="flex justify-content-between align-items-center">
                <div>
                  <p className="m-0 text-600">{stat.title}</p>
                  <h2 className="m-0 text-900 mt-2">{stat.value}</h2>
                </div>
                <i className={`${stat.icon} text-3xl text-primary`} />
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
