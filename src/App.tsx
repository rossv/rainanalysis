import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { SettingsPanel } from './components/SettingsPanel';
import { DataIngestion } from './components/DataIngestion';
import { EventHyetograph } from './components/EventHyetograph';
import { useStore } from './store';

function App() {
  const selectedEventId = useStore(s => s.selectedEventId);

  return (
    <>
      <Layout sidebarContent={
        <div className="space-y-5">
          <SettingsPanel />
          <DataIngestion />
        </div>
      }>
        <Dashboard />
      </Layout>

      {selectedEventId && <EventHyetograph />}
    </>
  );
}

export default App;
