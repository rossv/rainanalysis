import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { SettingsPanel } from './components/SettingsPanel';
import { DataIngestion } from './components/DataIngestion';

function App() {
  return (
    <Layout sidebarContent={
      <div className="space-y-6">
        <SettingsPanel />
        <DataIngestion />
      </div>
    }>
      <Dashboard />
    </Layout>
  );
}

export default App;
