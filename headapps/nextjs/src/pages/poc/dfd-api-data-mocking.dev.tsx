import { JSX, useState } from 'react';

import ApiTestingForm from 'components/DataMockingComponent/UKG/ApiTestingForm/ApiTestingForm';
import DataMockingForm from 'components/DataMockingComponent/UKG/DataMockingForm/DataMockingForm';
import OracleDataMocking from 'components/DataMockingComponent/Oracle/OracleDataMocking';

type DataSource = 'UKG' | 'Oracle';

const DfdApiDataMocking = (): JSX.Element => {
  const [selected, setSelected] = useState<DataSource>('UKG');

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>DFD API Data Mocking</h1>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <label htmlFor="data-source-select" style={{ marginRight: '0.5rem', fontWeight: 500 }}>
          Data Source:
        </label>
        <select
          id="data-source-select"
          value={selected}
          onChange={(e) => setSelected(e.target.value as DataSource)}
          style={{
            padding: '0.4rem 0.75rem',
            borderRadius: 4,
            border: '1px solid #ccc',
            fontSize: '0.875rem',
          }}
        >
          <option value="UKG">UKG</option>
          <option value="Oracle">Oracle</option>
        </select>
      </div>

      {selected === 'UKG' && (
        <>
          <DataMockingForm />
          <ApiTestingForm />
        </>
      )}
      {selected === 'Oracle' && <OracleDataMocking />}
    </div>
  );
};

export default DfdApiDataMocking;
